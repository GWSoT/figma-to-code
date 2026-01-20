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
  Copy,
  Check,
  FileCode,
  Palette,
  FileType,
  ArrowLeft,
} from "lucide-react";
import type { GeneratedFile, FrameworkType, StylingType } from "~/utils/code-generation-agent/types";
import { Link } from "@tanstack/react-router";

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

/** Code editor with syntax highlighting placeholder */
function CodeEditor({
  files,
  selectedFile,
  onFileSelect,
  onCodeChange,
}: {
  files: GeneratedFile[];
  selectedFile: GeneratedFile | null;
  onFileSelect: (file: GeneratedFile) => void;
  onCodeChange: (content: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (selectedFile) {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [selectedFile]);

  const getFileIcon = (type: GeneratedFile["type"]) => {
    switch (type) {
      case "component":
        return <FileCode className="h-4 w-4" />;
      case "styles":
        return <Palette className="h-4 w-4" />;
      case "types":
        return <FileType className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* File tabs */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 overflow-x-auto">
        {files.map((file) => (
          <Button
            key={file.path}
            variant={selectedFile?.path === file.path ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onFileSelect(file)}
            className="flex items-center gap-2 shrink-0"
          >
            {getFileIcon(file.type)}
            {file.path}
          </Button>
        ))}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto">
        {selectedFile ? (
          <textarea
            className="w-full h-full p-4 font-mono text-sm bg-gray-950 text-gray-100 resize-none focus:outline-none"
            value={selectedFile.content}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  );
}

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

  // Extract width and height from search params
  const initialWidth = search.width || 375;
  const initialHeight = search.height || 667;

  return (
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
            Download All
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
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <CodeEditor
                  files={files}
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  onCodeChange={handleCodeChange}
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
                onPreviewError={(error) => console.error("Preview error:", error)}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default PreviewPage;
