import { useState, useMemo } from "react";
import { useFigmaFileFrames, useRefreshFileFrames } from "~/hooks/useFigmaFiles";
import { useFigmaAccounts } from "~/hooks/useFigmaAccounts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Box,
  Image,
  HelpCircle,
  ChevronRight,
  Search,
  CheckSquare,
  Square,
  Layers,
  AlertCircle,
} from "lucide-react";
import type { FigmaFrameRecord, FigmaFrameCategory } from "~/db/schema";
import { COMMON_DEVICE_SIZES } from "~/utils/figma-api";

// ============================================
// Types
// ============================================

interface FrameExplorerProps {
  fileKey: string;
  accountId?: string;
  onSelectionChange?: (selectedFrames: FigmaFrameRecord[]) => void;
}

type CategoryFilter = FigmaFrameCategory | "all";

// ============================================
// Helper Functions
// ============================================

function getCategoryIcon(category: FigmaFrameCategory) {
  switch (category) {
    case "screen":
      return <Monitor className="h-4 w-4" />;
    case "component":
      return <Box className="h-4 w-4" />;
    case "asset":
      return <Image className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
}

function getCategoryBadgeVariant(
  category: FigmaFrameCategory
): "default" | "secondary" | "outline" {
  switch (category) {
    case "screen":
      return "default";
    case "component":
      return "secondary";
    case "asset":
      return "outline";
    default:
      return "outline";
  }
}

function getDeviceIcon(width: number, height: number) {
  const maxDim = Math.max(width, height);
  const minDim = Math.min(width, height);

  // Phone-like aspect ratio
  if (maxDim / minDim > 1.5 && maxDim <= 1000) {
    return <Smartphone className="h-3 w-3" />;
  }
  // Tablet-like
  if (maxDim <= 1400 && minDim >= 700) {
    return <Tablet className="h-3 w-3" />;
  }
  // Desktop
  if (maxDim >= 1200) {
    return <Monitor className="h-3 w-3" />;
  }
  return null;
}

function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

// ============================================
// Category Filter Tabs Component
// ============================================

function CategoryFilterTabs({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
}: {
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  categoryCounts: Record<FigmaFrameCategory, number>;
}) {
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const categories: { value: CategoryFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: totalCount },
    { value: "screen", label: "Screens", count: categoryCounts.screen },
    { value: "component", label: "Components", count: categoryCounts.component },
    { value: "asset", label: "Assets", count: categoryCounts.asset },
    { value: "unknown", label: "Other", count: categoryCounts.unknown },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(({ value, label, count }) => (
        <Button
          key={value}
          variant={selectedCategory === value ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(value)}
          className="gap-2"
        >
          {value !== "all" && getCategoryIcon(value as FigmaFrameCategory)}
          {label}
          <Badge
            variant={selectedCategory === value ? "secondary" : "outline"}
            className="ml-1"
          >
            {count}
          </Badge>
        </Button>
      ))}
    </div>
  );
}

// ============================================
// Frame Card Component
// ============================================

function FrameCard({
  frame,
  isSelected,
  onToggle,
}: {
  frame: FigmaFrameRecord;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const deviceIcon = getDeviceIcon(frame.width, frame.height);

  return (
    <div
      className={
        "flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer " +
        (isSelected
          ? "bg-primary/10 border-primary"
          : "bg-card hover:bg-accent/50")
      }
      onClick={onToggle}
    >
      <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{frame.name}</p>
          <Badge
            variant={getCategoryBadgeVariant(frame.category as FigmaFrameCategory)}
            className="text-xs shrink-0"
          >
            {frame.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {deviceIcon}
          <span>{formatDimensions(frame.width, frame.height)}</span>
          {frame.matchedDevice && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-primary">{frame.matchedDevice}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Page Section Component
// ============================================

function PageSection({
  pageName,
  pageId,
  frames,
  selectedFrameIds,
  onToggleFrame,
  onSelectAllInPage,
  onDeselectAllInPage,
}: {
  pageName: string;
  pageId: string;
  frames: FigmaFrameRecord[];
  selectedFrameIds: Set<string>;
  onToggleFrame: (frameId: string) => void;
  onSelectAllInPage: () => void;
  onDeselectAllInPage: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedInPage = frames.filter((f) => selectedFrameIds.has(f.id)).length;
  const allSelected = selectedInPage === frames.length && frames.length > 0;
  const someSelected = selectedInPage > 0 && selectedInPage < frames.length;

  return (
    <div className="border rounded-lg">
      <div className="flex items-center justify-between p-3 bg-muted/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <ChevronRight
            className={"h-4 w-4 transition-transform " + (isExpanded ? "rotate-90" : "")}
          />
          <Layers className="h-4 w-4" />
          <span className="font-medium">{pageName}</span>
          <Badge variant="outline" className="text-xs">
            {frames.length} frames
          </Badge>
        </button>
        <div className="flex items-center gap-2">
          {selectedInPage > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedInPage} selected
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (allSelected) {
                onDeselectAllInPage();
              } else {
                onSelectAllInPage();
              }
            }}
            className="h-7 px-2"
          >
            {allSelected ? (
              <Square className="h-4 w-4" />
            ) : someSelected ? (
              <CheckSquare className="h-4 w-4 opacity-50" />
            ) : (
              <CheckSquare className="h-4 w-4" />
            )}
            <span className="ml-1 text-xs">
              {allSelected ? "Deselect All" : "Select All"}
            </span>
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-3 space-y-2">
          {frames.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No frames found on this page
            </p>
          ) : (
            frames.map((frame) => (
              <FrameCard
                key={frame.id}
                frame={frame}
                isSelected={selectedFrameIds.has(frame.id)}
                onToggle={() => onToggleFrame(frame.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Loading State Component
// ============================================

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Error State Component
// ============================================

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Failed to load frames</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          {error.message}
        </p>
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Layers className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No frames found</h3>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
          This file doesn't contain any top-level frames. Try selecting a different file.
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Component
// ============================================

export function FrameExplorer({
  fileKey,
  accountId,
  onSelectionChange,
}: FrameExplorerProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(
    accountId
  );
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: accounts, isLoading: accountsLoading } = useFigmaAccounts();
  const {
    data: fileData,
    isLoading: fileLoading,
    error: fileError,
    refetch,
  } = useFigmaFileFrames(fileKey, selectedAccountId);
  const refreshFrames = useRefreshFileFrames();

  const isLoading = accountsLoading || fileLoading;

  // Combine all frames with their page info
  const allFrames = useMemo(() => {
    if (!fileData) return [];
    return fileData.pages.flatMap((page) =>
      page.frames.map((frame) => ({ ...frame, pageName: page.name }))
    );
  }, [fileData]);

  // Filter frames based on category and search
  const filteredFrames = useMemo(() => {
    return allFrames.filter((frame) => {
      // Category filter
      if (categoryFilter !== "all" && frame.category !== categoryFilter) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          frame.name.toLowerCase().includes(query) ||
          frame.matchedDevice?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allFrames, categoryFilter, searchQuery]);

  // Group filtered frames by page
  const framesByPage = useMemo(() => {
    if (!fileData) return new Map<string, { pageName: string; frames: FigmaFrameRecord[] }>();

    const map = new Map<string, { pageName: string; frames: FigmaFrameRecord[] }>();

    for (const page of fileData.pages) {
      const pageFrames = filteredFrames.filter((f) => f.pageId === page.id);
      if (pageFrames.length > 0 || categoryFilter === "all") {
        map.set(page.id, {
          pageName: page.name,
          frames: pageFrames,
        });
      }
    }

    return map;
  }, [fileData, filteredFrames, categoryFilter]);

  // Get selected frames
  const selectedFrames = useMemo(() => {
    return allFrames.filter((f) => selectedFrameIds.has(f.id));
  }, [allFrames, selectedFrameIds]);

  // Handle frame toggle
  const handleToggleFrame = (frameId: string) => {
    setSelectedFrameIds((prev) => {
      const next = new Set(prev);
      if (next.has(frameId)) {
        next.delete(frameId);
      } else {
        next.add(frameId);
      }
      return next;
    });
  };

  // Handle select all in page
  const handleSelectAllInPage = (pageId: string) => {
    const pageFrames = framesByPage.get(pageId)?.frames || [];
    setSelectedFrameIds((prev) => {
      const next = new Set(prev);
      pageFrames.forEach((f) => next.add(f.id));
      return next;
    });
  };

  // Handle deselect all in page
  const handleDeselectAllInPage = (pageId: string) => {
    const pageFrames = framesByPage.get(pageId)?.frames || [];
    setSelectedFrameIds((prev) => {
      const next = new Set(prev);
      pageFrames.forEach((f) => next.delete(f.id));
      return next;
    });
  };

  // Handle select all filtered
  const handleSelectAllFiltered = () => {
    setSelectedFrameIds((prev) => {
      const next = new Set(prev);
      filteredFrames.forEach((f) => next.add(f.id));
      return next;
    });
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    setSelectedFrameIds(new Set());
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshFrames.mutate({ fileKey, accountId: selectedAccountId });
  };

  // Notify parent of selection changes
  useMemo(() => {
    onSelectionChange?.(selectedFrames);
  }, [selectedFrames, onSelectionChange]);

  // No file key provided
  if (!fileKey) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No file selected</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a Figma file key to explore its frames.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Frame Explorer</h2>
          <p className="text-muted-foreground">
            {fileData
              ? `${fileData.file.name} • ${allFrames.length} frames in ${fileData.pages.length} pages`
              : "Loading file information..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accounts && accounts.length > 1 && (
            <Select
              value={selectedAccountId || accounts[0]?.id}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.label || account.figmaEmail}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshFrames.isPending}
          >
            <RefreshCw
              className={"h-4 w-4 mr-2 " + (refreshFrames.isPending ? "animate-spin" : "")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : fileError ? (
        <ErrorState error={fileError as Error} onRetry={() => refetch()} />
      ) : !fileData || allFrames.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryFilterTabs
              selectedCategory={categoryFilter}
              onCategoryChange={setCategoryFilter}
              categoryCounts={fileData.categoryCounts}
            />
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search frames..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selection Summary */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="text-sm">
                {selectedFrameIds.size} of {filteredFrames.length} frames selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllFiltered}
                disabled={
                  filteredFrames.length === 0 ||
                  selectedFrameIds.size === filteredFrames.length
                }
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedFrameIds.size === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>

          {/* Pages and Frames */}
          <div className="space-y-4">
            {Array.from(framesByPage.entries()).map(([pageId, { pageName, frames }]) => (
              <PageSection
                key={pageId}
                pageId={pageId}
                pageName={pageName}
                frames={frames}
                selectedFrameIds={selectedFrameIds}
                onToggleFrame={handleToggleFrame}
                onSelectAllInPage={() => handleSelectAllInPage(pageId)}
                onDeselectAllInPage={() => handleDeselectAllInPage(pageId)}
              />
            ))}
          </div>

          {/* Device Size Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Device Size Reference</CardTitle>
              <CardDescription>
                Frames are categorized based on their dimensions matching common device sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                {Object.entries(COMMON_DEVICE_SIZES)
                  .slice(0, 12)
                  .map(([name, { width, height }]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between p-2 rounded bg-muted/50"
                    >
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground">
                        {width} × {height}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
