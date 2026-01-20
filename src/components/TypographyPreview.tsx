/**
 * Typography Preview Component
 *
 * Displays extracted typography settings from Figma with visual previews
 * and generated CSS/Tailwind configuration.
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type {
  TypographyExtractionResult,
  ExtractedTypography,
  FontFamily,
  TypographyScale,
  TypographyHierarchy,
} from "~/utils/typography-extractor";
import {
  getFontWeightName,
  detectScaleRatio,
  createTypographySummary,
} from "~/utils/typography-extractor";
import { Copy, Check, Download, Type, Scale, Layers, FileCode } from "lucide-react";

// ============================================================================
// Sub-components
// ============================================================================

interface FontFamilyCardProps {
  family: FontFamily;
}

function FontFamilyCard({ family }: FontFamilyCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{family.figmaName}</CardTitle>
            <CardDescription className="mt-1">
              {family.category}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {family.isSystem && (
              <Badge variant="secondary">System</Badge>
            )}
            {family.googleFont && (
              <Badge variant="outline">Google Fonts</Badge>
            )}
            {!family.isSystem && !family.googleFont && (
              <Badge variant="destructive">Custom</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Font preview */}
        <div
          className="text-2xl py-3 border-b border-border"
          style={{ fontFamily: family.webSafe ?? family.figmaName }}
        >
          The quick brown fox jumps over the lazy dog
        </div>

        {/* Weight samples */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Available weights:</p>
          <div className="flex flex-wrap gap-2">
            {family.weights.map((weight) => (
              <span
                key={weight}
                className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
              >
                <span style={{ fontWeight: weight }}>{weight}</span>
                <span className="text-muted-foreground text-xs">
                  {getFontWeightName(weight)}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Fallback */}
        {family.webSafe && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Fallback: </span>
            <code className="bg-muted px-1 rounded">{family.webSafe}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ScaleItemProps {
  scale: TypographyScale;
  baseSize: number;
}

function ScaleItem({ scale, baseSize }: ScaleItemProps) {
  const isBase = Math.abs(scale.fontSize - baseSize) < 1;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="w-24 shrink-0">
        <Badge variant={isBase ? "default" : "outline"} className="w-full justify-center">
          {scale.name}
        </Badge>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="truncate"
          style={{
            fontSize: `${scale.fontSize}px`,
            lineHeight: `${scale.lineHeight}px`,
            fontWeight: scale.fontWeight,
            letterSpacing: scale.letterSpacing ? `${scale.letterSpacing}em` : undefined,
          }}
        >
          Typography Scale
        </p>
      </div>
      <div className="shrink-0 text-right text-sm text-muted-foreground space-y-0.5">
        <p>{scale.fontSize}px</p>
        <p className="text-xs">{scale.ratio}x</p>
      </div>
    </div>
  );
}

interface HierarchyItemProps {
  hierarchy: TypographyHierarchy;
}

function HierarchyItem({ hierarchy }: HierarchyItemProps) {
  const exampleStyle = hierarchy.styles[0];
  if (!exampleStyle) return null;

  const roleColors: Record<string, string> = {
    display: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    "heading-1": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "heading-2": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "heading-3": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "heading-4": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "heading-5": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "heading-6": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    body: "bg-green-500/10 text-green-700 dark:text-green-400",
    "body-large": "bg-green-500/10 text-green-700 dark:text-green-400",
    "body-small": "bg-green-500/10 text-green-700 dark:text-green-400",
    caption: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    label: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    button: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    custom: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Badge
            className={cn(
              "shrink-0 border-0",
              roleColors[hierarchy.role] ?? roleColors.custom
            )}
          >
            {hierarchy.role}
          </Badge>
          <div className="flex-1 min-w-0">
            <p
              className="truncate"
              style={{
                fontFamily: exampleStyle.style.fontFamily,
                fontSize: `${Math.min(exampleStyle.style.fontSize, 32)}px`,
                fontWeight: exampleStyle.style.fontWeight,
                lineHeight: 1.4,
              }}
            >
              {exampleStyle.sampleText || "Sample text preview"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {exampleStyle.style.fontFamily} &middot; {exampleStyle.style.fontSize}px &middot;{" "}
              {getFontWeightName(exampleStyle.style.fontWeight)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

function CodeBlock({ code, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-muted/50 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted">
          <span className="text-sm font-medium">{title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface TypographyPreviewProps {
  result: TypographyExtractionResult;
  fileName?: string;
  className?: string;
}

type TabId = "overview" | "fonts" | "scale" | "hierarchy" | "css" | "tailwind";

export function TypographyPreview({
  result,
  fileName,
  className,
}: TypographyPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Layers className="h-4 w-4" /> },
    { id: "fonts", label: "Fonts", icon: <Type className="h-4 w-4" /> },
    { id: "scale", label: "Scale", icon: <Scale className="h-4 w-4" /> },
    { id: "hierarchy", label: "Hierarchy", icon: <Layers className="h-4 w-4" /> },
    { id: "css", label: "CSS", icon: <FileCode className="h-4 w-4" /> },
    { id: "tailwind", label: "Tailwind", icon: <FileCode className="h-4 w-4" /> },
  ];

  // Calculate base size from scale
  const baseSize = result.scale.find((s) => s.name === "body")?.fontSize ?? 16;

  // Detect scale type
  const fontSizes = result.scale.map((s) => s.fontSize);
  const detectedScale = detectScaleRatio(fontSizes);

  const handleDownloadAll = () => {
    const content = [
      "/* Typography System",
      ` * Extracted from: ${fileName ?? "Figma Design"}`,
      ` * Generated: ${new Date().toISOString()}`,
      " */",
      "",
      "/* ===== CSS Variables ===== */",
      result.cssVariables,
      "",
      "/* ===== Font Face Declarations ===== */",
      result.fontFaceDeclarations,
    ].join("\n");

    const blob = new Blob([content], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "typography.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Typography System</h2>
          {fileName && (
            <p className="text-muted-foreground text-sm mt-1">
              Extracted from {fileName}
            </p>
          )}
        </div>
        <Button onClick={handleDownloadAll} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download CSS
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Font Families</CardDescription>
                <CardTitle className="text-4xl">{result.fontFamilies.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {result.fontFamilies.filter((f) => f.googleFont).length} from Google Fonts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Type Sizes</CardDescription>
                <CardTitle className="text-4xl">{result.scale.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {Math.min(...fontSizes)}px - {Math.max(...fontSizes)}px
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Base Size</CardDescription>
                <CardTitle className="text-4xl">{baseSize}px</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Body text size
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Scale Type</CardDescription>
                <CardTitle className="text-2xl">
                  {detectedScale?.name ?? "Custom"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {detectedScale ? `Ratio: ${detectedScale.ratio}` : "Non-standard scale"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "fonts" && (
          <div className="grid gap-4 md:grid-cols-2">
            {result.fontFamilies.map((family) => (
              <FontFamilyCard key={family.figmaName} family={family} />
            ))}
          </div>
        )}

        {activeTab === "scale" && (
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>
                {detectedScale
                  ? `Using ${detectedScale.name} scale (${detectedScale.ratio})`
                  : "Custom scale detected"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.scale.map((scale) => (
                <ScaleItem key={scale.name} scale={scale} baseSize={baseSize} />
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "hierarchy" && (
          <div className="space-y-4">
            {result.hierarchy.map((h, index) => (
              <HierarchyItem key={`${h.role}-${index}`} hierarchy={h} />
            ))}
          </div>
        )}

        {activeTab === "css" && (
          <div className="space-y-4">
            <CodeBlock
              title="CSS Variables"
              code={result.cssVariables}
            />
            <CodeBlock
              title="@font-face Declarations"
              code={result.fontFaceDeclarations}
            />
          </div>
        )}

        {activeTab === "tailwind" && (
          <CodeBlock
            title="tailwind.config.ts"
            code={result.tailwindConfig}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Compact Preview Component (for embedding in other views)
// ============================================================================

interface TypographyPreviewCompactProps {
  result: TypographyExtractionResult;
  className?: string;
}

export function TypographyPreviewCompact({
  result,
  className,
}: TypographyPreviewCompactProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick stats */}
      <div className="flex gap-4 text-sm">
        <span className="text-muted-foreground">
          {result.fontFamilies.length} font{result.fontFamilies.length !== 1 ? "s" : ""}
        </span>
        <span className="text-muted-foreground">
          {result.scale.length} sizes
        </span>
        <span className="text-muted-foreground">
          {result.hierarchy.length} roles
        </span>
      </div>

      {/* Font family pills */}
      <div className="flex flex-wrap gap-2">
        {result.fontFamilies.map((family) => (
          <Badge key={family.figmaName} variant="outline">
            {family.figmaName}
          </Badge>
        ))}
      </div>

      {/* Scale preview */}
      <div className="flex items-end gap-1">
        {result.scale.slice(0, 7).map((scale) => (
          <div
            key={scale.name}
            className="bg-primary/20 rounded-t"
            style={{
              width: "20px",
              height: `${Math.min(scale.fontSize, 48)}px`,
            }}
            title={`${scale.name}: ${scale.fontSize}px`}
          />
        ))}
      </div>
    </div>
  );
}

export default TypographyPreview;
