/**
 * Preview Route
 *
 * Full-featured preview page for generated code with:
 * - Side-by-side code editor and live preview
 * - Real-time hot reloading
 * - Figma viewport size matching
 * - Interactive testing of generated components
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { CodePreview, VIEWPORT_PRESETS } from "~/components/CodePreview";
import { IntegratedCodeEditor, type EditorError } from "~/components/IntegratedCodeEditor";
import { DesignTokenPanel, type DesignTokenWithUsage, type TokenUsage } from "~/components/DesignTokenPanel";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import {
  Code2,
  Settings,
  Download,
  ArrowLeft,
  Palette,
  FolderArchive,
} from "lucide-react";
import type { GeneratedFile, FrameworkType, StylingType } from "~/utils/code-generation-agent/types";
import { Link } from "@tanstack/react-router";
import { ExportCodeDialog } from "~/components/ExportCodeDialog";
import type { DesignTokenExport } from "~/utils/code-export";

// ============================================================================
// Types
// ============================================================================

interface PreviewSearchParams {
  frameId?: string;
  nodeId?: string;
  fileKey?: string;
  width?: number;
  height?: number;
}

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/dashboard/preview")({
  validateSearch: (search: Record<string, unknown>): PreviewSearchParams => {
    return {
      frameId: search.frameId as string | undefined,
      nodeId: search.nodeId as string | undefined,
      fileKey: search.fileKey as string | undefined,
      width: search.width ? Number(search.width) : undefined,
      height: search.height ? Number(search.height) : undefined,
    };
  },
  component: PreviewPage,
});

// ============================================================================
// Demo/Example Files
// ============================================================================

/** Example design tokens for demonstration */
const DEMO_TOKENS: DesignTokenWithUsage[] = [
  {
    name: "primary",
    value: "#3B82F6",
    type: "color",
    figmaStyleName: "Primary/500",
    description: "Primary brand color",
    usages: [
      { componentName: "Card", propertyName: "bg-primary", lineNumber: 95 },
      { componentName: "Button", propertyName: "bg-primary", lineNumber: 12 },
    ],
  },
  {
    name: "secondary",
    value: "#6B7280",
    type: "color",
    figmaStyleName: "Gray/500",
    usages: [
      { componentName: "Card", propertyName: "text-secondary" },
    ],
  },
  {
    name: "background",
    value: "#FFFFFF",
    type: "color",
    figmaStyleName: "Background/Default",
  },
  {
    name: "destructive",
    value: "#EF4444",
    type: "color",
    figmaStyleName: "Error/500",
  },
  {
    name: "text-base",
    value: "16px",
    type: "fontSize",
    figmaStyleName: "Body/Regular",
    usages: [
      { componentName: "Card", propertyName: "text-base", lineNumber: 115 },
    ],
  },
  {
    name: "text-xl",
    value: "20px",
    type: "fontSize",
    figmaStyleName: "Heading/H3",
    usages: [
      { componentName: "Card", propertyName: "text-xl", lineNumber: 112 },
    ],
  },
  {
    name: "text-sm",
    value: "14px",
    type: "fontSize",
    figmaStyleName: "Body/Small",
  },
  {
    name: "font-sans",
    value: '"Inter", system-ui, sans-serif',
    type: "fontFamily",
    figmaStyleName: "Font/Primary",
  },
  {
    name: "font-bold",
    value: "700",
    type: "fontWeight",
    figmaStyleName: "Weight/Bold",
  },
  {
    name: "font-medium",
    value: "500",
    type: "fontWeight",
    figmaStyleName: "Weight/Medium",
  },
  {
    name: "leading-relaxed",
    value: "1.625",
    type: "lineHeight",
    figmaStyleName: "Leading/Relaxed",
  },
  {
    name: "spacing-4",
    value: "16px",
    type: "spacing",
    usages: [
      { componentName: "Card", propertyName: "p-4" },
    ],
  },
  {
    name: "spacing-6",
    value: "24px",
    type: "spacing",
    usages: [
      { componentName: "Card", propertyName: "p-6", lineNumber: 111 },
    ],
  },
  {
    name: "spacing-2",
    value: "8px",
    type: "spacing",
  },
  {
    name: "rounded-xl",
    value: "12px",
    type: "borderRadius",
    figmaStyleName: "Radius/XL",
    usages: [
      { componentName: "Card", propertyName: "rounded-xl", lineNumber: 95 },
    ],
  },
  {
    name: "rounded-md",
    value: "6px",
    type: "borderRadius",
    figmaStyleName: "Radius/MD",
  },
  {
    name: "shadow-lg",
    value: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    type: "boxShadow",
    figmaStyleName: "Shadow/Large",
    usages: [
      { componentName: "Card", propertyName: "shadow-lg", lineNumber: 95 },
    ],
  },
  {
    name: "shadow-xl",
    value: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    type: "boxShadow",
    figmaStyleName: "Shadow/XL",
  },
];

/** Example generated files for demonstration */
const DEMO_FILES: GeneratedFile[] = [
  {
    path: "Card.tsx",
    type: "component",
    language: "typescript",
    content: `interface CardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  onClick?: () => void;
}

function Card({ title, description, imageUrl, onClick }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
      style={{ maxWidth: '320px' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-600">Learn more</span>
          <svg
            className={\`h-5 w-5 text-blue-600 transition-transform duration-200 \${isHovered ? 'translate-x-1' : ''}\`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Render with example props
const root = document.getElementById('root');
if (root) {
  const App = () => (
    <Card
      title="Beautiful Component"
      description="This is an interactive preview of your generated React component. Try clicking or hovering!"
      imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&q=80"
    />
  );

  ReactDOM.createRoot(root).render(React.createElement(App));
}
`,
  },
  {
    path: "Card.module.css",
    type: "styles",
    language: "css",
    content: `/* Additional custom styles can be added here */
.card-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`,
  },
];

// ============================================================================
// Components
// ============================================================================

/** Settings panel for preview configuration */
function SettingsPanel({
  framework,
  styling,
  onFrameworkChange,
  onStylingChange,
}: {
  framework: FrameworkType;
  styling: StylingType;
  onFrameworkChange: (framework: FrameworkType) => void;
  onStylingChange: (styling: StylingType) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Framework</label>
        <Select value={framework} onValueChange={(v) => onFrameworkChange(v as FrameworkType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="vue">Vue</SelectItem>
            <SelectItem value="svelte">Svelte</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Styling</label>
        <Select value={styling} onValueChange={(v) => onStylingChange(v as StylingType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tailwind">Tailwind CSS</SelectItem>
            <SelectItem value="styled-components">Styled Components</SelectItem>
            <SelectItem value="css-modules">CSS Modules</SelectItem>
            <SelectItem value="inline">Inline Styles</SelectItem>
            <SelectItem value="scss">SCSS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-2">Viewport Presets</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {VIEWPORT_PRESETS.slice(0, 5).map((preset) => (
            <div key={preset.name} className="flex justify-between">
              <span>{preset.name}</span>
              <span>{preset.width} × {preset.height}</span>
            </div>
          ))}
          <p className="pt-1 text-muted-foreground/70">
            ... and {VIEWPORT_PRESETS.length - 5} more
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

function PreviewPage() {
  const search = Route.useSearch() as PreviewSearchParams;

  // State
  const [files, setFiles] = useState<GeneratedFile[]>(DEMO_FILES);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(DEMO_FILES[0]);
  const [framework, setFramework] = useState<FrameworkType>("react");
  const [styling, setStyling] = useState<StylingType>("tailwind");
  const [activeTab, setActiveTab] = useState<string>("preview");
  const [previewReady, setPreviewReady] = useState(false);
  const [editorErrors, setEditorErrors] = useState<EditorError[]>([]);
  const [tokens, setTokens] = useState<DesignTokenWithUsage[]>(DEMO_TOKENS);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Handle code changes for hot reload
  const handleCodeChange = useCallback((content: string) => {
    if (!selectedFile) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.path === selectedFile.path ? { ...f, content } : f
      )
    );

    setSelectedFile((prev) =>
      prev ? { ...prev, content } : null
    );
  }, [selectedFile]);

  // Handle file download
  const handleDownload = useCallback(() => {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.path;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }, [files]);

  // Handle token editing
  const handleTokenEdit = useCallback((token: DesignTokenWithUsage, newValue: string) => {
    setTokens((prev) =>
      prev.map((t) =>
        t.name === token.name && t.type === token.type
          ? { ...t, value: newValue }
          : t
      )
    );
  }, []);

  // Handle token renaming
  const handleTokenRename = useCallback((token: DesignTokenWithUsage, newName: string) => {
    setTokens((prev) =>
      prev.map((t) =>
        t.name === token.name && t.type === token.type
          ? { ...t, name: newName }
          : t
      )
    );
  }, []);

  // Handle token deletion
  const handleTokenDelete = useCallback((token: DesignTokenWithUsage) => {
    setTokens((prev) =>
      prev.filter((t) => !(t.name === token.name && t.type === token.type))
    );
  }, []);

  // Handle usage click - navigate to the line in code
  const handleUsageClick = useCallback((token: DesignTokenWithUsage, usage: TokenUsage) => {
    // Find the file that contains this component
    const targetFile = files.find((f) => f.path.includes(usage.componentName));
    if (targetFile) {
      setSelectedFile(targetFile);
      setActiveTab("preview");
      // Note: In a real implementation, we would scroll to the line number
      console.log(`Navigate to ${usage.componentName}:${usage.lineNumber}`);
    }
  }, [files]);

  // Extract width and height from search params
  const initialWidth = search.width || 375;
  const initialHeight = search.height || 667;

  // Convert tokens to export format (filter to only supported types)
  const exportableTypes = ["color", "fontSize", "spacing", "borderRadius", "boxShadow", "fontFamily", "fontWeight", "lineHeight"] as const;
  const exportTokens: DesignTokenExport[] = tokens
    .filter((token) => exportableTypes.includes(token.type as typeof exportableTypes[number]))
    .map((token) => ({
      name: token.name,
      value: token.value,
      type: token.type as DesignTokenExport["type"],
    }));

  // Derive component name from first file
  const componentName = files.length > 0
    ? files[0].path.replace(/\.(tsx?|jsx?|vue|svelte)$/, "")
    : "Component";

  return (
    <>
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/frames">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Frames
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Code Preview</h1>
            <p className="text-sm text-muted-foreground">
              Edit code and see changes in real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={previewReady ? "default" : "secondary"}>
            {previewReady ? "Preview Ready" : "Loading..."}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Files
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            data-testid="export-zip-button"
          >
            <FolderArchive className="h-4 w-4 mr-2" />
            Export ZIP
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="border-b px-4">
                <TabsList className="h-10">
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="tokens" className="flex items-center gap-2" data-testid="tokens-tab">
                    <Palette className="h-4 w-4" />
                    Tokens
                    <Badge variant="secondary" className="text-[10px] ml-1">
                      {tokens.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <IntegratedCodeEditor
                  files={files}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  onCodeChange={handleCodeChange}
                  errors={editorErrors}
                  theme="vs-dark"
                  showMinimap={true}
                  wordWrap="on"
                />
              </TabsContent>

              <TabsContent value="tokens" className="flex-1 m-0 overflow-hidden" data-testid="tokens-tab-content">
                <DesignTokenPanel
                  tokens={tokens}
                  editable={true}
                  groupBy="type"
                  onTokenEdit={handleTokenEdit}
                  onTokenRename={handleTokenRename}
                  onTokenDelete={handleTokenDelete}
                  onUsageClick={handleUsageClick}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="settings" className="flex-1 m-0 overflow-auto">
                <SettingsPanel
                  framework={framework}
                  styling={styling}
                  onFrameworkChange={setFramework}
                  onStylingChange={setStyling}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4 overflow-auto bg-muted/20">
              <CodePreview
                files={files}
                framework={framework}
                styling={styling}
                initialWidth={initialWidth}
                initialHeight={initialHeight}
                hotReloadEnabled={true}
                showDeviceFrame={true}
                interactiveMode={true}
                onPreviewReady={() => setPreviewReady(true)}
                onPreviewError={(error) => {
                  console.error("Preview error:", error);
                  // Parse error message to extract line/column if available
                  const lineMatch = error.match(/line (\d+)/i);
                  const colMatch = error.match(/column (\d+)/i);
                  if (lineMatch) {
                    setEditorErrors([{
                      line: parseInt(lineMatch[1], 10),
                      column: colMatch ? parseInt(colMatch[1], 10) : 1,
                      message: error,
                      severity: "error",
                    }]);
                  }
                }}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>

    {/* Export Code Dialog */}
    <ExportCodeDialog
      open={exportDialogOpen}
      onOpenChange={setExportDialogOpen}
      files={files}
      componentName={componentName}
      framework={framework}
      styling={styling}
      designTokens={exportTokens}
    />
    </>
  );
}

export default PreviewPage;
