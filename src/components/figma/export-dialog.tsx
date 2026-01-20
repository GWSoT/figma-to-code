import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { Checkbox } from "~/components/ui/checkbox";
import { useFigmaExportManager } from "~/hooks/useFigmaExport";
import type { FigmaExportFormat } from "~/db/schema";
import {
  ImageIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  LoaderIcon,
} from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileKey: string;
  nodeId: string;
  nodeName: string;
  nodeWidth: number;
  nodeHeight: number;
  accountId?: string;
}

type ExportScaleOption = 1 | 2 | 3;

interface ExportConfig {
  format: FigmaExportFormat;
  scales: ExportScaleOption[];
  quality: number;
  generateSrcset: boolean;
}

const FORMAT_OPTIONS: { value: FigmaExportFormat; label: string; description: string }[] = [
  { value: "png", label: "PNG", description: "Lossless, best for graphics" },
  { value: "jpg", label: "JPG", description: "Lossy, smaller files, no transparency" },
  { value: "webp", label: "WebP", description: "Modern format, best compression" },
];

const SCALE_OPTIONS: { value: ExportScaleOption; label: string }[] = [
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
];

export function ExportDialog({
  open,
  onOpenChange,
  fileKey,
  nodeId,
  nodeName,
  nodeWidth,
  nodeHeight,
  accountId,
}: ExportDialogProps) {
  const { exportMultiple, isExporting, lastSetResult, reset } = useFigmaExportManager();

  const [config, setConfig] = useState<ExportConfig>({
    format: "webp",
    scales: [1, 2, 3],
    quality: 85,
    generateSrcset: true,
  });

  const [copied, setCopied] = useState(false);

  const handleScaleToggle = (scale: ExportScaleOption) => {
    setConfig((prev) => {
      const newScales = prev.scales.includes(scale)
        ? prev.scales.filter((s) => s !== scale)
        : [...prev.scales, scale].sort((a, b) => a - b);
      return { ...prev, scales: newScales.length > 0 ? newScales : [1] };
    });
  };

  const handleExport = async () => {
    try {
      await exportMultiple({
        accountId,
        fileKey,
        nodeId,
        nodeName,
        format: config.format,
        scales: config.scales,
        quality: config.format !== "png" ? config.quality : undefined,
        generateSrcset: config.generateSrcset,
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCopySrcset = async () => {
    if (lastSetResult?.srcsetMarkup) {
      await navigator.clipboard.writeText(lastSetResult.srcsetMarkup);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const estimatedSizes = config.scales.map((scale) => ({
    scale,
    width: nodeWidth * scale,
    height: nodeHeight * scale,
  }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Export Image
          </DialogTitle>
          <DialogDescription>
            Export "{nodeName}" at multiple resolutions for responsive images.
          </DialogDescription>
        </DialogHeader>

        {!lastSetResult ? (
          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select
                value={config.format}
                onValueChange={(value) =>
                  setConfig((prev) => ({ ...prev, format: value as FigmaExportFormat }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality Slider (for JPG and WebP) */}
            {config.format !== "png" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-muted-foreground">{config.quality}%</span>
                </div>
                <Slider
                  value={[config.quality]}
                  onValueChange={([value]) =>
                    setConfig((prev) => ({ ...prev, quality: value }))
                  }
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            )}

            {/* Scale Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolutions</label>
              <div className="flex gap-2">
                {SCALE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleScaleToggle(option.value)}
                    className={`flex-1 rounded-lg border px-4 py-3 text-center transition-colors ${
                      config.scales.includes(option.value)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {nodeWidth * option.value}×{nodeHeight * option.value}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Srcset Option */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="srcset"
                checked={config.generateSrcset}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, generateSrcset: !!checked }))
                }
              />
              <label
                htmlFor="srcset"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Generate srcset markup for responsive images
              </label>
            </div>

            {/* Preview of what will be exported */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-sm font-medium mb-2">Export Preview</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {estimatedSizes
                  .filter((s) => config.scales.includes(s.scale as ExportScaleOption))
                  .map((size) => (
                    <div key={size.scale} className="flex justify-between">
                      <span>{size.scale}x</span>
                      <span>
                        {size.width}×{size.height}px (.{config.format})
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Export Results */}
            <div className="rounded-lg border bg-green-500/10 border-green-500/20 p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-2">
                <CheckIcon className="size-4" />
                <span className="font-medium">Export Complete</span>
              </div>
              <div className="space-y-2">
                {lastSetResult.exports.map((exp) => (
                  <div
                    key={exp.exportId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {exp.scale}x ({exp.width}×{exp.height})
                    </span>
                    <span className="text-muted-foreground">
                      {(exp.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Srcset Markup */}
            {lastSetResult.srcsetMarkup && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">srcset Markup</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopySrcset}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="size-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="size-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <pre className="rounded-lg border bg-muted p-3 text-xs overflow-x-auto">
                  <code>{lastSetResult.srcsetMarkup}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!lastSetResult ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || config.scales.length === 0}
              >
                {isExporting ? (
                  <>
                    <LoaderIcon className="size-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="size-4" />
                    Export {config.scales.length} Image{config.scales.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => reset()}>
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
