/**
 * Design Preview Route
 *
 * Side-by-side view showing Figma design and generated code with:
 * - Synchronized scrolling
 * - Element highlighting
 * - Click-to-navigate between design elements and code
 * - Multiple panel arrangements (side-by-side, top-bottom, design-only, code-only)
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SplitView } from "~/components/code-preview";
import type { ElementMapping, PanelArrangement } from "~/components/code-preview";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  ArrowLeft,
  Sparkles,
  Play,
  Code2,
  HelpCircle,
} from "lucide-react";
import type { GeneratedFile } from "~/utils/code-generation-agent/types";
import { Link } from "@tanstack/react-router";
import {
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
} from "~/components/ui/panel";

// ============================================================================
// Types
// ============================================================================

interface DesignPreviewSearchParams {
  nodeId?: string;
  fileKey?: string;
}

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/dashboard/design-preview")({
  validateSearch: (search: Record<string, unknown>): DesignPreviewSearchParams => {
    return {
      nodeId: search.nodeId as string | undefined,
      fileKey: search.fileKey as string | undefined,
    };
  },
  component: DesignPreviewPage,
});

// ============================================================================
// Demo Data
// ============================================================================

/** Demo element mappings for the split view */
const DEMO_ELEMENT_MAPPINGS: ElementMapping[] = [
  {
    id: "card-container",
    name: "Card Container",
    figmaNodeId: "1:1",
    designBounds: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
    codeLocation: { file: "components/Card.tsx", startLine: 17, endLine: 50 },
    children: ["card-image", "card-content"],
  },
  {
    id: "card-image",
    name: "Card Image",
    figmaNodeId: "1:2",
    designBounds: { x: 0.12, y: 0.12, width: 0.76, height: 0.3 },
    codeLocation: { file: "components/Card.tsx", startLine: 25, endLine: 31 },
    children: [],
    parentId: "card-container",
  },
  {
    id: "card-content",
    name: "Card Content",
    figmaNodeId: "1:3",
    designBounds: { x: 0.12, y: 0.45, width: 0.76, height: 0.4 },
    codeLocation: { file: "components/Card.tsx", startLine: 32, endLine: 48 },
    children: ["card-title", "card-description"],
    parentId: "card-container",
  },
  {
    id: "card-title",
    name: "Card Title",
    figmaNodeId: "1:4",
    designBounds: { x: 0.14, y: 0.47, width: 0.72, height: 0.08 },
    codeLocation: { file: "components/Card.tsx", startLine: 33, endLine: 35 },
    children: [],
    parentId: "card-content",
  },
  {
    id: "card-description",
    name: "Card Description",
    figmaNodeId: "1:5",
    designBounds: { x: 0.14, y: 0.57, width: 0.72, height: 0.1 },
    codeLocation: { file: "components/Card.tsx", startLine: 36, endLine: 40 },
    children: [],
    parentId: "card-content",
  },
];

/** Demo generated files */
const DEMO_FILES: GeneratedFile[] = [
  {
    path: "components/Card.tsx",
    type: "component",
    language: "typescript",
    content: `import React from "react";
import { cn } from "~/lib/utils";

interface CardProps {
  title: string;
  description?: string;
  image?: string;
  className?: string;
  onClick?: () => void;
}

export function Card({
  title,
  description,
  image,
  className,
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6",
        "hover:shadow-lg transition-all duration-300",
        "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {image && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
`,
  },
  {
    path: "components/Card.module.css",
    type: "styles",
    language: "css",
    content: `.card {
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background-color: var(--card);
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
}

.cardImage {
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 0.5rem;
}

.cardImage img {
  width: 100%;
  height: 12rem;
  object-fit: cover;
}

.cardTitle {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--foreground);
}

.cardDescription {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--muted-foreground);
}
`,
  },
  {
    path: "components/Card.types.ts",
    type: "types",
    language: "typescript",
    content: `/**
 * Card component props interface
 */
export interface CardProps {
  /** Card title - displayed as heading */
  title: string;

  /** Optional description text */
  description?: string;

  /** Optional image URL for card header */
  image?: string;

  /** Additional CSS classes */
  className?: string;

  /** Click handler */
  onClick?: () => void;
}

/**
 * Card variant types
 */
export type CardVariant = "default" | "outlined" | "elevated";

/**
 * Card size options
 */
export type CardSize = "sm" | "md" | "lg";
`,
  },
];

// ============================================================================
// Main Page Component
// ============================================================================

function DesignPreviewPage() {
  const search = Route.useSearch();
  const [fileKey, setFileKey] = useState(search.fileKey || "");
  const [nodeId, setNodeId] = useState(search.nodeId || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>(DEMO_FILES);
  const [elementMappings, setElementMappings] = useState<ElementMapping[]>(DEMO_ELEMENT_MAPPINGS);
  const [arrangement, setArrangement] = useState<PanelArrangement>("side-by-side");

  // Simulate code generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setGeneratedFiles(DEMO_FILES);
    setElementMappings(DEMO_ELEMENT_MAPPINGS);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] p-6 gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/frames">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design Preview</h1>
            <p className="text-muted-foreground mt-1">
              View Figma designs side-by-side with generated code
            </p>
          </div>
        </div>

        {/* Quick input */}
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fileKey" className="text-xs">File Key</Label>
            <Input
              id="fileKey"
              placeholder="abc123xyz"
              value={fileKey}
              onChange={(e) => setFileKey(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nodeId" className="text-xs">Node ID</Label>
            <Input
              id="nodeId"
              placeholder="1:234"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              className="w-32"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main split view */}
      <Panel className="flex-1 overflow-hidden">
        <SplitView
          fileKey={fileKey || "demo-file"}
          nodeId={nodeId || "1:0"}
          generatedFiles={generatedFiles}
          elementMappings={elementMappings}
          initialArrangement={arrangement}
          onArrangementChange={setArrangement}
          enableScrollSync={true}
        />
      </Panel>

      {/* Help panel */}
      <Panel>
        <PanelHeader className="pb-3">
          <PanelTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            How to use
          </PanelTitle>
        </PanelHeader>
        <PanelContent className="pt-0">
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">Synchronized scrolling</h4>
              <p className="text-muted-foreground text-xs">
                Scroll in either panel and the other follows. Toggle with the Sync button.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Element highlighting</h4>
              <p className="text-muted-foreground text-xs">
                Hover over design elements to highlight the corresponding code. Click to select.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Panel layouts</h4>
              <p className="text-muted-foreground text-xs">
                Use the Layout menu to switch between side-by-side, top/bottom, or single panel views.
              </p>
            </div>
          </div>
        </PanelContent>
      </Panel>
    </div>
  );
}

export default DesignPreviewPage;
