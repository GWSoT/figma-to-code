/**
 * Export Code Dialog
 *
 * Dialog for exporting generated code as a downloadable ZIP file.
 * Supports multiple frameworks, styling options, and configuration files.
 */

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  FolderArchive,
  Download,
  CheckIcon,
  LoaderIcon,
  FileCode,
  FileText,
  Settings2,
  Package,
  Palette,
} from "lucide-react";
import type { GeneratedFile, FrameworkType, StylingType } from "~/utils/code-generation-agent/types";
import {
  generateCodeExport,
  downloadZip,
  formatFileSize,
  type CodeExportOptions,
  type DesignTokenExport,
  type ExportResult,
} from "~/utils/code-export";
import { useRecordConversion } from "~/hooks/useConversionHistory";

// ============================================================================
// Types
// ============================================================================

interface ExportCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: GeneratedFile[];
  componentName: string;
  framework: FrameworkType;
  styling: StylingType;
  designTokens?: DesignTokenExport[];
  /** Optional context for tracking conversion history */
  conversionContext?: {
    fileKey: string;
    fileName?: string;
    nodeId: string;
    nodeName: string;
    nodeType?: string;
    figmaAccountId?: string;
    configurationId?: string;
  };
}

interface ExportConfig {
  includeReadme: boolean;
  includeConfig: boolean;
  includeTokens: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const FRAMEWORK_LABELS: Record<FrameworkType, string> = {
  react: "React",
  vue: "Vue",
  svelte: "Svelte",
  html: "HTML",
};

const STYLING_LABELS: Record<StylingType, string> = {
  tailwind: "Tailwind CSS",
  "styled-components": "Styled Components",
  "css-modules": "CSS Modules",
  inline: "Inline Styles",
  scss: "SCSS",
};

const FILE_TYPE_ICONS: Record<GeneratedFile["type"], React.ReactNode> = {
  component: <FileCode className="size-4 text-blue-500" />,
  styles: <Palette className="size-4 text-pink-500" />,
  types: <FileText className="size-4 text-purple-500" />,
  test: <FileText className="size-4 text-green-500" />,
  story: <FileText className="size-4 text-orange-500" />,
  index: <FileText className="size-4 text-gray-500" />,
};

// ============================================================================
// Component
// ============================================================================

export function ExportCodeDialog({
  open,
  onOpenChange,
  files,
  componentName,
  framework,
  styling,
  designTokens = [],
  conversionContext,
}: ExportCodeDialogProps) {
  const [config, setConfig] = useState<ExportConfig>({
    includeReadme: true,
    includeConfig: true,
    includeTokens: designTokens.length > 0,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const recordConversion = useRecordConversion();

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    startTimeRef.current = Date.now();

    try {
      const exportOptions: CodeExportOptions = {
        componentName,
        framework,
        styling,
        includeReadme: config.includeReadme,
        includeConfig: config.includeConfig,
        designTokens: config.includeTokens ? designTokens : undefined,
      };

      const result = await generateCodeExport(files, exportOptions);
      setExportResult(result);

      // Auto-download
      downloadZip(result.blob, result.filename);

      // Record conversion history if context is provided
      if (conversionContext) {
        const durationMs = Date.now() - startTimeRef.current;
        const outputCode = files.map(f => f.content).join('\n\n');

        recordConversion.mutate({
          fileKey: conversionContext.fileKey,
          fileName: conversionContext.fileName,
          nodeId: conversionContext.nodeId,
          nodeName: conversionContext.nodeName,
          nodeType: conversionContext.nodeType,
          figmaAccountId: conversionContext.figmaAccountId,
          configurationId: conversionContext.configurationId,
          conversionType: "full-export",
          jsFramework: framework,
          cssFramework: styling,
          outputCode,
          outputFormat: framework === "html" ? "html" : "tsx",
          exportedAssetsCount: result.fileCount,
          durationMs,
          status: "completed",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate export";
      setError(message);

      // Record failed conversion if context is provided
      if (conversionContext) {
        const durationMs = Date.now() - startTimeRef.current;

        recordConversion.mutate({
          fileKey: conversionContext.fileKey,
          fileName: conversionContext.fileName,
          nodeId: conversionContext.nodeId,
          nodeName: conversionContext.nodeName,
          nodeType: conversionContext.nodeType,
          figmaAccountId: conversionContext.figmaAccountId,
          configurationId: conversionContext.configurationId,
          conversionType: "full-export",
          jsFramework: framework,
          cssFramework: styling,
          durationMs,
          status: "failed",
          errorMessage: message,
        });
      }
    } finally {
      setIsExporting(false);
    }
  }, [files, componentName, framework, styling, config, designTokens, conversionContext, recordConversion]);

  const handleClose = useCallback(() => {
    setExportResult(null);
    setError(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleReset = useCallback(() => {
    setExportResult(null);
    setError(null);
  }, []);

  // Calculate estimated file count
  let estimatedFileCount = files.length;
  if (config.includeReadme) estimatedFileCount++;
  if (config.includeConfig && framework !== "html") {
    estimatedFileCount++; // package.json
    if (styling === "tailwind") estimatedFileCount++; // tailwind.config.js
  }
  if (config.includeTokens && designTokens.length > 0) estimatedFileCount++;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" data-testid="export-code-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderArchive className="size-5" />
            Export Code
          </DialogTitle>
          <DialogDescription>
            Download "{componentName}" as a ZIP file with all components, styles, and configuration.
          </DialogDescription>
        </DialogHeader>

        {!exportResult ? (
          <div className="space-y-6">
            {/* Framework & Styling Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Framework</label>
                <div className="font-medium">{FRAMEWORK_LABELS[framework]}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Styling</label>
                <div className="font-medium">{STYLING_LABELS[styling]}</div>
              </div>
            </div>

            {/* Files Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Files to Export</label>
              <div className="rounded-lg border bg-muted/30 p-3 max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {files.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center gap-2 text-sm"
                    >
                      {FILE_TYPE_ICONS[file.type] || <FileText className="size-4" />}
                      <span className="font-mono text-xs">{file.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Include in Export</label>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="readme"
                    checked={config.includeReadme}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, includeReadme: !!checked }))
                    }
                  />
                  <div className="grid gap-0.5">
                    <label
                      htmlFor="readme"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      README.md
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Setup instructions and usage documentation
                    </p>
                  </div>
                </div>

                {framework !== "html" && (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="config"
                      checked={config.includeConfig}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, includeConfig: !!checked }))
                      }
                    />
                    <div className="grid gap-0.5">
                      <label
                        htmlFor="config"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Configuration Files
                      </label>
                      <p className="text-xs text-muted-foreground">
                        package.json{styling === "tailwind" ? " and tailwind.config.js" : ""}
                      </p>
                    </div>
                  </div>
                )}

                {designTokens.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="tokens"
                      checked={config.includeTokens}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, includeTokens: !!checked }))
                      }
                    />
                    <div className="grid gap-0.5">
                      <label
                        htmlFor="tokens"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Design Tokens
                      </label>
                      <p className="text-xs text-muted-foreground">
                        CSS custom properties ({designTokens.length} tokens)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Export Preview */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Export Preview</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>File name</span>
                  <span className="font-mono">{componentName}.zip</span>
                </div>
                <div className="flex justify-between">
                  <span>Total files</span>
                  <span>{estimatedFileCount} files</span>
                </div>
                <div className="flex justify-between">
                  <span>Directory structure</span>
                  <span className="font-mono">{componentName}/</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Export Complete */}
            <div className="rounded-lg border bg-green-500/10 border-green-500/20 p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-3">
                <CheckIcon className="size-4" />
                <span className="font-medium">Export Complete</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File name</span>
                  <span className="font-mono">{exportResult.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total files</span>
                  <span>{exportResult.fileCount} files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total size</span>
                  <span>{formatFileSize(exportResult.totalSize)}</span>
                </div>
              </div>
            </div>

            {/* Download Button (in case auto-download didn't work) */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Download started automatically.</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => downloadZip(exportResult.blob, exportResult.filename)}
              >
                Click here if the download didn't start
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {!exportResult ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || files.length === 0}
                data-testid="export-code-button"
              >
                {isExporting ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    Export ZIP
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                Export Another
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
