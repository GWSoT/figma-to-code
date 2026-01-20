/**
 * CodePreview Component
 *
 * Renders generated code in a real-time preview with support for:
 * - Live rendering of React/HTML code in an iframe sandbox
 * - Hot reloading when code changes
 * - Figma viewport size matching with common device presets
 * - Interactive testing of generated components
 * - Zoom controls and responsive preview modes
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Play,
  Pause,
  RefreshCw,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Code2,
  Eye,
  MousePointer,
  Move,
  Grid3X3,
} from "lucide-react";
import type { GeneratedFile, FrameworkType, StylingType } from "~/utils/code-generation-agent/types";

// ============================================================================
// Types
// ============================================================================

export interface CodePreviewProps {
  /** Generated files to preview */
  files: GeneratedFile[];
  /** Target framework */
  framework: FrameworkType;
  /** Styling approach */
  styling: StylingType;
  /** Initial viewport width */
  initialWidth?: number;
  /** Initial viewport height */
  initialHeight?: number;
  /** Whether hot reload is enabled */
  hotReloadEnabled?: boolean;
  /** Callback when preview is ready */
  onPreviewReady?: () => void;
  /** Callback when preview errors occur */
  onPreviewError?: (error: string) => void;
  /** Custom CSS to inject */
  customCSS?: string;
  /** Whether to show the device frame */
  showDeviceFrame?: boolean;
  /** Whether preview is in interactive mode */
  interactiveMode?: boolean;
}

export interface ViewportPreset {
  name: string;
  width: number;
  height: number;
  deviceType: "mobile" | "tablet" | "desktop";
  icon: React.ReactNode;
}

export interface PreviewState {
  status: "idle" | "loading" | "ready" | "error";
  error?: string;
  lastUpdated?: Date;
}

// ============================================================================
// Constants
// ============================================================================

/** Common viewport presets matching Figma device sizes */
export const VIEWPORT_PRESETS: ViewportPreset[] = [
  // Mobile devices
  { name: "iPhone SE", width: 375, height: 667, deviceType: "mobile", icon: <Smartphone className="h-4 w-4" /> },
  { name: "iPhone 14", width: 390, height: 844, deviceType: "mobile", icon: <Smartphone className="h-4 w-4" /> },
  { name: "iPhone 14 Pro Max", width: 430, height: 932, deviceType: "mobile", icon: <Smartphone className="h-4 w-4" /> },
  { name: "Pixel 7", width: 412, height: 915, deviceType: "mobile", icon: <Smartphone className="h-4 w-4" /> },
  { name: "Samsung Galaxy S21", width: 360, height: 800, deviceType: "mobile", icon: <Smartphone className="h-4 w-4" /> },

  // Tablet devices
  { name: "iPad Mini", width: 768, height: 1024, deviceType: "tablet", icon: <Tablet className="h-4 w-4" /> },
  { name: "iPad Pro 11\"", width: 834, height: 1194, deviceType: "tablet", icon: <Tablet className="h-4 w-4" /> },
  { name: "iPad Pro 12.9\"", width: 1024, height: 1366, deviceType: "tablet", icon: <Tablet className="h-4 w-4" /> },
  { name: "Surface Pro", width: 912, height: 1368, deviceType: "tablet", icon: <Tablet className="h-4 w-4" /> },

  // Desktop devices
  { name: "MacBook Air", width: 1280, height: 832, deviceType: "desktop", icon: <Monitor className="h-4 w-4" /> },
  { name: "MacBook Pro 14\"", width: 1512, height: 982, deviceType: "desktop", icon: <Monitor className="h-4 w-4" /> },
  { name: "Desktop HD", width: 1920, height: 1080, deviceType: "desktop", icon: <Monitor className="h-4 w-4" /> },
  { name: "Desktop 2K", width: 2560, height: 1440, deviceType: "desktop", icon: <Monitor className="h-4 w-4" /> },
];

/** HTML template for iframe preview */
const createPreviewHTML = (
  componentCode: string,
  styles: string,
  framework: FrameworkType,
  styling: StylingType
) => {
  // Base styles for preview
  const baseStyles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #1a1a1a;
      background: #ffffff;
    }
    #root {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .preview-error {
      color: #dc2626;
      background: #fef2f2;
      padding: 16px;
      border-radius: 8px;
      font-family: monospace;
      white-space: pre-wrap;
    }
  `;

  // Tailwind CDN if using Tailwind
  const tailwindScript = styling === "tailwind"
    ? '<script src="https://cdn.tailwindcss.com"></script>'
    : '';

  // React CDN scripts
  const reactScripts = framework === "react" ? `
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  ` : '';

  // Vue CDN script
  const vueScript = framework === "vue"
    ? '<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>'
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  ${tailwindScript}
  <style>
    ${baseStyles}
    ${styles}
  </style>
</head>
<body>
  <div id="root"></div>
  ${reactScripts}
  ${vueScript}
  <script${framework === "react" ? ' type="text/babel"' : ''}>
    try {
      ${componentCode}
    } catch (error) {
      document.getElementById('root').innerHTML =
        '<div class="preview-error">Error: ' + error.message + '</div>';
      window.parent.postMessage({ type: 'preview-error', error: error.message }, '*');
    }
  </script>
</body>
</html>`;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform generated code for iframe preview
 */
function transformCodeForPreview(
  files: GeneratedFile[],
  framework: FrameworkType
): { componentCode: string; styles: string } {
  // Find the main component file
  const componentFile = files.find(f => f.type === "component");
  const styleFile = files.find(f => f.type === "styles");

  let componentCode = "";
  let styles = styleFile?.content || "";

  if (!componentFile) {
    return { componentCode: "document.getElementById('root').innerHTML = '<p>No component to preview</p>';", styles };
  }

  const code = componentFile.content;

  if (framework === "react") {
    // Transform React code for browser execution
    // Remove imports and exports, wrap in IIFE
    let transformed = code
      // Remove import statements
      .replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '')
      // Remove export statements but keep the content
      .replace(/^export\s+default\s+/gm, '')
      .replace(/^export\s+/gm, '')
      // Remove type imports
      .replace(/^import\s+type\s+.*?;?\s*$/gm, '')
      .trim();

    // Extract the component name (first function or const component)
    const componentNameMatch = transformed.match(/(?:function|const)\s+(\w+)/);
    const componentName = componentNameMatch?.[1] || "Component";

    componentCode = `
      const React = window.React;
      const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;
      const ReactDOM = window.ReactDOM;

      ${transformed}

      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(${componentName}));

      window.parent.postMessage({ type: 'preview-ready' }, '*');
    `;
  } else if (framework === "vue") {
    // Transform Vue code for browser execution
    let transformed = code
      .replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '')
      .replace(/^export\s+default\s+/gm, 'const component = ')
      .trim();

    componentCode = `
      const { createApp, ref, reactive, computed, watch, onMounted } = Vue;

      ${transformed}

      createApp(component).mount('#root');

      window.parent.postMessage({ type: 'preview-ready' }, '*');
    `;
  } else if (framework === "html") {
    // HTML is rendered directly
    componentCode = `
      document.getElementById('root').innerHTML = \`${code.replace(/`/g, '\\`')}\`;
      window.parent.postMessage({ type: 'preview-ready' }, '*');
    `;
  } else if (framework === "svelte") {
    // Svelte requires compilation - show placeholder
    componentCode = `
      document.getElementById('root').innerHTML = '<p style="color: #666; text-align: center;">Svelte preview requires build compilation. View the code output instead.</p>';
      window.parent.postMessage({ type: 'preview-ready' }, '*');
    `;
  }

  return { componentCode, styles };
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Viewport selector with device presets */
function ViewportSelector({
  selectedPreset,
  onSelectPreset,
  customWidth,
  customHeight,
  onCustomSizeChange,
}: {
  selectedPreset: ViewportPreset | null;
  onSelectPreset: (preset: ViewportPreset) => void;
  customWidth: number;
  customHeight: number;
  onCustomSizeChange: (width: number, height: number) => void;
}) {
  const groupedPresets = useMemo(() => {
    return {
      mobile: VIEWPORT_PRESETS.filter(p => p.deviceType === "mobile"),
      tablet: VIEWPORT_PRESETS.filter(p => p.deviceType === "tablet"),
      desktop: VIEWPORT_PRESETS.filter(p => p.deviceType === "desktop"),
    };
  }, []);

  return (
    <Select
      value={selectedPreset?.name || "custom"}
      onValueChange={(value) => {
        const preset = VIEWPORT_PRESETS.find(p => p.name === value);
        if (preset) {
          onSelectPreset(preset);
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select viewport" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="custom">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Custom ({customWidth} × {customHeight})
          </div>
        </SelectItem>

        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Mobile</div>
        {groupedPresets.mobile.map(preset => (
          <SelectItem key={preset.name} value={preset.name}>
            <div className="flex items-center gap-2">
              {preset.icon}
              {preset.name} ({preset.width} × {preset.height})
            </div>
          </SelectItem>
        ))}

        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Tablet</div>
        {groupedPresets.tablet.map(preset => (
          <SelectItem key={preset.name} value={preset.name}>
            <div className="flex items-center gap-2">
              {preset.icon}
              {preset.name} ({preset.width} × {preset.height})
            </div>
          </SelectItem>
        ))}

        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Desktop</div>
        {groupedPresets.desktop.map(preset => (
          <SelectItem key={preset.name} value={preset.name}>
            <div className="flex items-center gap-2">
              {preset.icon}
              {preset.name} ({preset.width} × {preset.height})
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Zoom controls */
function ZoomControls({
  zoom,
  onZoomChange,
}: {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) {
  const zoomPresets = [25, 50, 75, 100, 125, 150, 200];

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onZoomChange(Math.max(25, zoom - 25))}
              disabled={zoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom out</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Select
        value={String(zoom)}
        onValueChange={(value) => onZoomChange(Number(value))}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {zoomPresets.map(preset => (
            <SelectItem key={preset} value={String(preset)}>
              {preset}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onZoomChange(Math.min(200, zoom + 25))}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom in</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

/** Preview status indicator */
function StatusIndicator({ state }: { state: PreviewState }) {
  const statusConfig = {
    idle: { icon: <Code2 className="h-4 w-4" />, text: "Ready", variant: "outline" as const },
    loading: { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: "Loading...", variant: "secondary" as const },
    ready: { icon: <CheckCircle className="h-4 w-4" />, text: "Preview ready", variant: "default" as const },
    error: { icon: <AlertCircle className="h-4 w-4" />, text: "Error", variant: "destructive" as const },
  };

  const config = statusConfig[state.status];

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.text}
    </Badge>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CodePreview({
  files,
  framework,
  styling,
  initialWidth = 375,
  initialHeight = 667,
  hotReloadEnabled = true,
  onPreviewReady,
  onPreviewError,
  customCSS = "",
  showDeviceFrame = true,
  interactiveMode: initialInteractiveMode = true,
}: CodePreviewProps) {
  // State
  const [previewState, setPreviewState] = useState<PreviewState>({ status: "idle" });
  const [viewportWidth, setViewportWidth] = useState(initialWidth);
  const [viewportHeight, setViewportHeight] = useState(initialHeight);
  const [zoom, setZoom] = useState(100);
  const [isRotated, setIsRotated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(initialInteractiveMode);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ViewportPreset | null>(
    VIEWPORT_PRESETS.find(p => p.width === initialWidth && p.height === initialHeight) || null
  );

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCodeRef = useRef<string>("");

  // Generate preview HTML
  const previewHTML = useMemo(() => {
    if (files.length === 0) return "";

    const { componentCode, styles } = transformCodeForPreview(files, framework);
    const combinedStyles = styles + "\n" + customCSS;

    return createPreviewHTML(componentCode, combinedStyles, framework, styling);
  }, [files, framework, styling, customCSS]);

  // Handle iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "preview-ready") {
        setPreviewState({ status: "ready", lastUpdated: new Date() });
        onPreviewReady?.();
      } else if (event.data.type === "preview-error") {
        setPreviewState({ status: "error", error: event.data.error });
        onPreviewError?.(event.data.error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onPreviewReady, onPreviewError]);

  // Update iframe when code changes (hot reload)
  useEffect(() => {
    if (isPaused || !hotReloadEnabled) return;

    if (previewHTML && previewHTML !== lastCodeRef.current) {
      lastCodeRef.current = previewHTML;
      setPreviewState({ status: "loading" });

      if (iframeRef.current) {
        iframeRef.current.srcdoc = previewHTML;
      }
    }
  }, [previewHTML, isPaused, hotReloadEnabled]);

  // Handle viewport preset selection
  const handlePresetSelect = useCallback((preset: ViewportPreset) => {
    setSelectedPreset(preset);
    setViewportWidth(preset.width);
    setViewportHeight(preset.height);
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    if (iframeRef.current && previewHTML) {
      setPreviewState({ status: "loading" });
      iframeRef.current.srcdoc = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = previewHTML;
        }
      }, 50);
    }
  }, [previewHTML]);

  // Handle rotation
  const handleRotate = useCallback(() => {
    setIsRotated(!isRotated);
    const newWidth = viewportHeight;
    const newHeight = viewportWidth;
    setViewportWidth(newWidth);
    setViewportHeight(newHeight);
    setSelectedPreset(null); // Clear preset when rotating
  }, [isRotated, viewportWidth, viewportHeight]);

  // Handle fullscreen toggle
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Calculate scaled dimensions
  const scaledWidth = (viewportWidth * zoom) / 100;
  const scaledHeight = (viewportHeight * zoom) / 100;

  // No files state
  if (files.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Eye className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No code to preview</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            Generate code from a Figma design to see a live preview here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={containerRef} className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <CardDescription>
              {viewportWidth} × {viewportHeight}
              {selectedPreset && ` • ${selectedPreset.name}`}
            </CardDescription>
          </div>
          <StatusIndicator state={previewState} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {/* Viewport selector */}
          <ViewportSelector
            selectedPreset={selectedPreset}
            onSelectPreset={handlePresetSelect}
            customWidth={viewportWidth}
            customHeight={viewportHeight}
            onCustomSizeChange={(w, h) => {
              setViewportWidth(w);
              setViewportHeight(h);
              setSelectedPreset(null);
            }}
          />

          {/* Zoom controls */}
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={interactiveMode ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setInteractiveMode(!interactiveMode)}
                  >
                    <MousePointer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {interactiveMode ? "Interactive mode on" : "Interactive mode off"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRotate}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rotate viewport</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isPaused ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isPaused ? "Resume hot reload" : "Pause hot reload"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={previewState.status === "loading"}
                  >
                    <RefreshCw className={`h-4 w-4 ${previewState.status === "loading" ? "animate-spin" : ""}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh preview</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 overflow-auto">
        {/* Preview area with device frame */}
        <div
          className="flex items-center justify-center min-h-[400px] bg-muted/30 rounded-lg overflow-auto p-4"
          style={{ minHeight: isFullscreen ? "calc(100vh - 200px)" : "400px" }}
        >
          <div
            className={`relative transition-all duration-200 ${showDeviceFrame ? "bg-gray-900 rounded-[2rem] p-3 shadow-xl" : ""}`}
            style={{
              width: showDeviceFrame ? scaledWidth + 24 : scaledWidth,
              height: showDeviceFrame ? scaledHeight + 24 : scaledHeight,
            }}
          >
            {/* Device notch (for mobile) */}
            {showDeviceFrame && selectedPreset?.deviceType === "mobile" && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-xl z-10" />
            )}

            {/* Iframe preview */}
            <iframe
              ref={iframeRef}
              title="Component Preview"
              srcDoc={previewHTML}
              className={`bg-white rounded-lg ${showDeviceFrame ? "rounded-[1.5rem]" : ""}`}
              style={{
                width: scaledWidth,
                height: scaledHeight,
                border: "none",
                pointerEvents: interactiveMode ? "auto" : "none",
              }}
              sandbox="allow-scripts allow-same-origin"
            />

            {/* Non-interactive overlay */}
            {!interactiveMode && (
              <div
                className="absolute inset-0 cursor-move"
                style={{
                  top: showDeviceFrame ? 12 : 0,
                  left: showDeviceFrame ? 12 : 0,
                  right: showDeviceFrame ? 12 : 0,
                  bottom: showDeviceFrame ? 12 : 0,
                }}
              />
            )}
          </div>
        </div>

        {/* Error display */}
        {previewState.status === "error" && previewState.error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Preview Error</p>
                <pre className="mt-1 text-sm text-destructive/80 whitespace-pre-wrap font-mono">
                  {previewState.error}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Last updated timestamp */}
        {previewState.lastUpdated && previewState.status === "ready" && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Last updated: {previewState.lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default CodePreview;
