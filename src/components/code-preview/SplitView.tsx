import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import {
  Columns,
  Rows,
  Maximize2,
  Code2,
  Image,
  Link2,
  Link2Off,
  Settings2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DesignPanel } from "./DesignPanel";
import { CodePanel } from "./CodePanel";
import { ResizeHandle } from "./ResizeHandle";
import type {
  SplitViewProps,
  PanelArrangement,
  HighlightState,
  ElementMapping,
} from "./types";

const MIN_PANEL_SIZE = 200;

/**
 * Side-by-side view showing Figma design and generated code
 * with synchronized scrolling and element highlighting
 */
export function SplitView({
  fileKey,
  nodeId,
  accountId,
  generatedFiles,
  elementMappings,
  initialArrangement = "side-by-side",
  initialSplitRatio = 0.5,
  minPanelSize = MIN_PANEL_SIZE,
  enableScrollSync = true,
  onArrangementChange,
}: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [arrangement, setArrangement] = useState<PanelArrangement>(initialArrangement);
  const [splitRatio, setSplitRatio] = useState(initialSplitRatio);
  const [isResizing, setIsResizing] = useState(false);
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(enableScrollSync);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Highlight state shared between panels
  const [highlightState, setHighlightState] = useState<HighlightState>({
    hoveredElementId: null,
    selectedElementId: null,
    source: null,
  });

  // Scroll synchronization state
  const [designScrollRatio, setDesignScrollRatio] = useState(0);
  const [codeScrollRatio, setCodeScrollRatio] = useState(0);
  const lastScrollSource = useRef<"design" | "code" | null>(null);

  // Line to scroll to in code panel when navigating from design
  const [scrollToLine, setScrollToLine] = useState<number | undefined>();

  // Handle arrangement change
  const handleArrangementChange = (newArrangement: PanelArrangement) => {
    setArrangement(newArrangement);
    onArrangementChange?.(newArrangement);
  };

  // Handle resize
  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResize = useCallback(
    (delta: number) => {
      if (!containerRef.current) return;
      const containerSize =
        arrangement === "side-by-side" || arrangement === "design-only" || arrangement === "code-only"
          ? containerRef.current.clientWidth
          : containerRef.current.clientHeight;

      setSplitRatio((prev) => {
        const newRatio = prev + delta / containerSize;
        const minRatio = minPanelSize / containerSize;
        const maxRatio = 1 - minRatio;
        return Math.max(minRatio, Math.min(maxRatio, newRatio));
      });
    },
    [arrangement, minPanelSize]
  );

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Handle element hover from design panel
  const handleDesignElementHover = (elementId: string | null) => {
    setHighlightState((prev) => ({
      ...prev,
      hoveredElementId: elementId,
      source: elementId ? "design" : prev.source,
    }));
  };

  // Handle element hover from code panel
  const handleCodeElementHover = (elementId: string | null) => {
    setHighlightState((prev) => ({
      ...prev,
      hoveredElementId: elementId,
      source: elementId ? "code" : prev.source,
    }));
  };

  // Handle element click from design panel - navigate to code
  const handleDesignElementClick = (elementId: string | null) => {
    setHighlightState((prev) => ({
      ...prev,
      selectedElementId: elementId,
      source: "design",
    }));

    // Find the element and scroll to its code location
    if (elementId) {
      const mapping = elementMappings.find((m) => m.id === elementId);
      if (mapping) {
        // Find and select the correct file
        const fileIndex = generatedFiles.findIndex(
          (f) => f.path === mapping.codeLocation.file
        );
        if (fileIndex !== -1) {
          setSelectedFileIndex(fileIndex);
        }
        // Scroll to the line
        setScrollToLine(mapping.codeLocation.startLine);
      }
    }
  };

  // Handle element click from code panel - highlight in design
  const handleCodeElementClick = (elementId: string | null) => {
    setHighlightState((prev) => ({
      ...prev,
      selectedElementId: elementId,
      source: "code",
    }));
  };

  // Handle scroll from design panel
  const handleDesignScroll = (scrollTop: number, scrollHeight: number) => {
    if (!scrollSyncEnabled) return;
    lastScrollSource.current = "design";
    const ratio = scrollTop / (scrollHeight - (containerRef.current?.clientHeight ?? 0));
    setDesignScrollRatio(Math.max(0, Math.min(1, ratio)));
  };

  // Handle scroll from code panel
  const handleCodeScroll = (scrollTop: number, scrollHeight: number) => {
    if (!scrollSyncEnabled) return;
    lastScrollSource.current = "code";
    const ratio = scrollTop / (scrollHeight - (containerRef.current?.clientHeight ?? 0));
    setCodeScrollRatio(Math.max(0, Math.min(1, ratio)));
  };

  // Get panel styles based on arrangement
  const getPanelStyles = () => {
    const isVertical = arrangement === "side-by-side";

    if (arrangement === "design-only") {
      return {
        design: { flex: 1 },
        code: { display: "none" },
        showHandle: false,
      };
    }

    if (arrangement === "code-only") {
      return {
        design: { display: "none" },
        code: { flex: 1 },
        showHandle: false,
      };
    }

    if (isVertical) {
      return {
        design: { width: `${splitRatio * 100}%` },
        code: { width: `${(1 - splitRatio) * 100}%` },
        showHandle: true,
      };
    }

    return {
      design: { height: `${splitRatio * 100}%` },
      code: { height: `${(1 - splitRatio) * 100}%` },
      showHandle: true,
    };
  };

  const styles = getPanelStyles();
  const isVertical = arrangement === "side-by-side";

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Code Preview</h3>
          {elementMappings.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {elementMappings.length} elements mapped
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Scroll sync toggle */}
          <Button
            variant={scrollSyncEnabled ? "secondary" : "ghost"}
            size="sm"
            className="h-7 gap-1.5"
            onClick={() => setScrollSyncEnabled(!scrollSyncEnabled)}
            title={scrollSyncEnabled ? "Disable scroll sync" : "Enable scroll sync"}
          >
            {scrollSyncEnabled ? (
              <Link2 className="h-3.5 w-3.5" />
            ) : (
              <Link2Off className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">Sync</span>
          </Button>

          {/* Arrangement dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5">
                <Settings2 className="h-3.5 w-3.5" />
                <span className="text-xs">Layout</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleArrangementChange("side-by-side")}>
                <Columns className="h-4 w-4 mr-2" />
                Side by side
                {arrangement === "side-by-side" && (
                  <span className="ml-auto text-primary">•</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArrangementChange("top-bottom")}>
                <Rows className="h-4 w-4 mr-2" />
                Top / bottom
                {arrangement === "top-bottom" && (
                  <span className="ml-auto text-primary">•</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleArrangementChange("design-only")}>
                <Image className="h-4 w-4 mr-2" />
                Design only
                {arrangement === "design-only" && (
                  <span className="ml-auto text-primary">•</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArrangementChange("code-only")}>
                <Code2 className="h-4 w-4 mr-2" />
                Code only
                {arrangement === "code-only" && (
                  <span className="ml-auto text-primary">•</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSplitRatio(0.5)}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Reset split
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Split panels */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 flex overflow-hidden",
          isVertical ? "flex-row" : "flex-col",
          isResizing && "select-none"
        )}
      >
        {/* Design panel */}
        <div style={styles.design} className="overflow-hidden">
          <DesignPanel
            fileKey={fileKey}
            nodeId={nodeId}
            accountId={accountId}
            elementMappings={elementMappings}
            highlightState={highlightState}
            onElementHover={handleDesignElementHover}
            onElementClick={handleDesignElementClick}
            onScroll={handleDesignScroll}
            syncScrollPosition={
              scrollSyncEnabled && lastScrollSource.current === "code"
                ? codeScrollRatio
                : undefined
            }
          />
        </div>

        {/* Resize handle */}
        {styles.showHandle && (
          <ResizeHandle
            orientation={isVertical ? "vertical" : "horizontal"}
            onResizeStart={handleResizeStart}
            onResize={handleResize}
            onResizeEnd={handleResizeEnd}
          />
        )}

        {/* Code panel */}
        <div style={styles.code} className="overflow-hidden">
          <CodePanel
            files={generatedFiles}
            selectedFileIndex={selectedFileIndex}
            onFileSelect={setSelectedFileIndex}
            elementMappings={elementMappings}
            highlightState={highlightState}
            onElementHover={handleCodeElementHover}
            onElementClick={handleCodeElementClick}
            onScroll={handleCodeScroll}
            syncScrollPosition={
              scrollSyncEnabled && lastScrollSource.current === "design"
                ? designScrollRatio
                : undefined
            }
            scrollToLine={scrollToLine}
          />
        </div>
      </div>
    </div>
  );
}
