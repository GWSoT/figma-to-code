import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { Loader2, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { DesignPanelProps, ElementMapping } from "./types";

/**
 * Panel for displaying Figma design with element highlighting
 */
export function DesignPanel({
  fileKey,
  nodeId,
  accountId,
  elementMappings,
  highlightState,
  onElementHover,
  onElementClick,
  onScroll,
  syncScrollPosition,
}: DesignPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const isSyncingRef = useRef(false);

  // Fetch Figma node image
  useEffect(() => {
    async function fetchImage() {
      setIsLoading(true);
      setError(null);
      try {
        // Construct the Figma API URL for node image
        const response = await fetch(
          `/api/figma/image?fileKey=${fileKey}&nodeId=${nodeId}${accountId ? `&accountId=${accountId}` : ""}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch design image");
        }
        const data = await response.json();
        setImageUrl(data.imageUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load design");
        // Use placeholder for demo
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (fileKey && nodeId) {
      fetchImage();
    }
  }, [fileKey, nodeId, accountId]);

  // Handle scroll sync from code panel
  useEffect(() => {
    if (syncScrollPosition !== undefined && containerRef.current && !isSyncingRef.current) {
      isSyncingRef.current = true;
      const container = containerRef.current;
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = syncScrollPosition * maxScroll;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    }
  }, [syncScrollPosition]);

  // Handle local scroll
  const handleScroll = useCallback(() => {
    if (containerRef.current && !isSyncingRef.current) {
      const container = containerRef.current;
      const scrollRatio = container.scrollTop / (container.scrollHeight - container.clientHeight);
      onScroll(container.scrollTop, container.scrollHeight);
    }
  }, [onScroll]);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.25));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      lastPanPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Find element at position
  const findElementAtPosition = (
    clientX: number,
    clientY: number
  ): ElementMapping | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / (rect.width * zoom);
    const y = (clientY - rect.top - pan.y) / (rect.height * zoom);

    // Find deepest matching element
    let match: ElementMapping | null = null;
    for (const mapping of elementMappings) {
      const { designBounds } = mapping;
      if (
        x >= designBounds.x &&
        x <= designBounds.x + designBounds.width &&
        y >= designBounds.y &&
        y <= designBounds.y + designBounds.height
      ) {
        // Prefer smaller (more specific) elements
        if (!match || designBounds.width * designBounds.height <
            match.designBounds.width * match.designBounds.height) {
          match = mapping;
        }
      }
    }
    return match;
  };

  const handleElementHover = (e: React.MouseEvent) => {
    if (isPanning) return;
    const element = findElementAtPosition(e.clientX, e.clientY);
    onElementHover(element?.id ?? null);
  };

  const handleElementClick = (e: React.MouseEvent) => {
    if (isPanning) return;
    const element = findElementAtPosition(e.clientX, e.clientY);
    onElementClick(element?.id ?? null);
  };

  // Render element overlay boxes
  const renderElementOverlays = () => {
    return elementMappings.map((mapping) => {
      const isHovered = highlightState.hoveredElementId === mapping.id;
      const isSelected = highlightState.selectedElementId === mapping.id;
      const isHighlighted = isHovered || isSelected;

      if (!isHighlighted) return null;

      const { designBounds } = mapping;
      return (
        <div
          key={mapping.id}
          className={cn(
            "absolute border-2 pointer-events-none transition-all duration-150",
            isSelected
              ? "border-primary bg-primary/10"
              : "border-primary/60 bg-primary/5"
          )}
          style={{
            left: `${designBounds.x * 100}%`,
            top: `${designBounds.y * 100}%`,
            width: `${designBounds.width * 100}%`,
            height: `${designBounds.height * 100}%`,
          }}
        >
          {/* Element name tooltip */}
          <div
            className={cn(
              "absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap",
              isSelected ? "bg-primary text-primary-foreground" : "bg-primary/80 text-primary-foreground"
            )}
          >
            {mapping.name}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-muted-foreground">Design</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleResetView}
            title="Reset view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Design canvas */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 overflow-auto relative",
          isPanning ? "cursor-grabbing" : "cursor-crosshair"
        )}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !imageUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            {/* Placeholder design preview */}
            <div
              className="relative w-full max-w-md aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-border overflow-hidden"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              }}
              onMouseMove={handleElementHover}
              onClick={handleElementClick}
            >
              {/* Mock design elements */}
              <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
                <div className="text-center">
                  <Move className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Design preview
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Alt+drag to pan, scroll to zoom
                  </p>
                </div>
              </div>
              {renderElementOverlays()}
            </div>
          </div>
        ) : (
          <div
            className="relative min-h-full"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: "0 0",
            }}
            onMouseMove={handleElementHover}
            onClick={handleElementClick}
          >
            <img
              src={imageUrl}
              alt="Figma design"
              className="max-w-none"
              draggable={false}
            />
            {renderElementOverlays()}
          </div>
        )}
      </div>
    </div>
  );
}
