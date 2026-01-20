import { useState } from "react";
import {
  Panel,
  PanelContent,
  PanelDescription,
  PanelHeader,
  PanelTitle,
} from "~/components/ui/panel";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import {
  History,
  Search,
  Star,
  StarOff,
  MoreVertical,
  Eye,
  RefreshCw,
  Trash2,
  Code,
  Image,
  FileOutput,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  StickyNote,
  GitCompare,
} from "lucide-react";
import {
  useConversionHistory,
  useSearchConversionHistory,
  useToggleConversionFavorite,
  useDeleteConversion,
  useUpdateConversionNotes,
  type SearchFilters,
} from "~/hooks/useConversionHistory";
import type { ConversionHistory, ConversionType, ConversionStatus } from "~/db/schema";
import { formatDistanceToNow } from "date-fns";

interface ConversionHistoryListProps {
  fileKey?: string;
  nodeId?: string;
  onViewCode?: (conversion: ConversionHistory) => void;
  onRerun?: (conversion: ConversionHistory) => void;
  onCompare?: (conversion1: ConversionHistory, conversion2: ConversionHistory) => void;
}

function getConversionTypeIcon(type: ConversionType) {
  switch (type) {
    case "code-generation":
      return <Code className="h-4 w-4" />;
    case "image-export":
      return <Image className="h-4 w-4" />;
    case "full-export":
      return <FileOutput className="h-4 w-4" />;
    case "preview":
      return <Eye className="h-4 w-4" />;
    default:
      return <Code className="h-4 w-4" />;
  }
}

function getStatusBadge(status: ConversionStatus) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Processing
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function ConversionCard({
  conversion,
  onViewCode,
  onRerun,
  onToggleFavorite,
  onDelete,
  onEditNotes,
  isSelected,
  onSelect,
}: {
  conversion: ConversionHistory;
  onViewCode?: (conversion: ConversionHistory) => void;
  onRerun?: (conversion: ConversionHistory) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onEditNotes: (conversion: ConversionHistory) => void;
  isSelected: boolean;
  onSelect: (conversion: ConversionHistory) => void;
}) {
  const tags = conversion.tags ? JSON.parse(conversion.tags) as string[] : [];

  return (
    <div
      className={`border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer ${
        isSelected ? "border-primary bg-primary/5" : ""
      }`}
      onClick={() => onSelect(conversion)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getConversionTypeIcon(conversion.conversionType as ConversionType)}
            <span className="font-medium truncate">{conversion.nodeName}</span>
            {conversion.version > 1 && (
              <Badge variant="outline" className="text-xs">
                v{conversion.version}
              </Badge>
            )}
            {conversion.isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            {conversion.fileName || conversion.fileKey}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {getStatusBadge(conversion.status as ConversionStatus)}
            {conversion.jsFramework && (
              <Badge variant="secondary">{conversion.jsFramework}</Badge>
            )}
            {conversion.cssFramework && (
              <Badge variant="secondary">{conversion.cssFramework}</Badge>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(conversion.createdAt), {
                addSuffix: true,
              })}
            </span>
            {conversion.durationMs && (
              <span>Duration: {formatDuration(conversion.durationMs)}</span>
            )}
            {conversion.outputCodeLines && (
              <span>{conversion.outputCodeLines} lines</span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewCode && conversion.outputCode && (
              <DropdownMenuItem onClick={() => onViewCode(conversion)}>
                <Eye className="mr-2 h-4 w-4" />
                View Code
              </DropdownMenuItem>
            )}
            {onRerun && (
              <DropdownMenuItem onClick={() => onRerun(conversion)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-run Conversion
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onToggleFavorite(conversion.id)}>
              {conversion.isFavorite ? (
                <>
                  <StarOff className="mr-2 h-4 w-4" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Add to Favorites
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditNotes(conversion)}>
              <StickyNote className="mr-2 h-4 w-4" />
              {conversion.notes ? "Edit Notes" : "Add Notes"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(conversion.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {conversion.notes && (
        <div className="mt-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
          {conversion.notes}
        </div>
      )}
      {conversion.errorMessage && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          {conversion.errorMessage}
        </div>
      )}
    </div>
  );
}

export function ConversionHistoryList({
  fileKey,
  nodeId,
  onViewCode,
  onRerun,
  onCompare,
}: ConversionHistoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedConversions, setSelectedConversions] = useState<ConversionHistory[]>([]);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingConversion, setEditingConversion] = useState<ConversionHistory | null>(null);
  const [notesValue, setNotesValue] = useState("");

  // Build filters
  const filters: SearchFilters = {
    searchQuery: searchQuery || undefined,
    conversionType:
      selectedType !== "all" ? (selectedType as ConversionType) : undefined,
    status:
      selectedStatus !== "all" ? (selectedStatus as ConversionStatus) : undefined,
    isFavorite: showFavoritesOnly ? true : undefined,
    limit: 50,
  };

  // Use different queries based on context
  const { data: searchResults, isLoading: isSearching } =
    useSearchConversionHistory(filters);
  const { data: allHistory, isLoading: isLoadingAll } = useConversionHistory();

  const toggleFavorite = useToggleConversionFavorite();
  const deleteConversion = useDeleteConversion();
  const updateNotes = useUpdateConversionNotes();

  const isLoading = isSearching || isLoadingAll;
  const hasFilters = searchQuery || selectedType !== "all" || selectedStatus !== "all" || showFavoritesOnly;
  const conversions = hasFilters ? searchResults : allHistory;

  const handleToggleFavorite = (id: string) => {
    toggleFavorite.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this conversion?")) {
      deleteConversion.mutate(id);
      setSelectedConversions((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleEditNotes = (conversion: ConversionHistory) => {
    setEditingConversion(conversion);
    setNotesValue(conversion.notes || "");
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = () => {
    if (editingConversion) {
      updateNotes.mutate({ id: editingConversion.id, notes: notesValue });
      setNotesDialogOpen(false);
      setEditingConversion(null);
    }
  };

  const handleSelectConversion = (conversion: ConversionHistory) => {
    setSelectedConversions((prev) => {
      const isSelected = prev.some((c) => c.id === conversion.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== conversion.id);
      }
      // Allow up to 2 selections for comparison
      if (prev.length >= 2) {
        return [prev[1], conversion];
      }
      return [...prev, conversion];
    });
  };

  const handleCompare = () => {
    if (selectedConversions.length === 2 && onCompare) {
      onCompare(selectedConversions[0], selectedConversions[1]);
    }
  };

  return (
    <Panel>
      <PanelHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <PanelTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Conversion History
            </PanelTitle>
            <PanelDescription>
              View and manage your past design-to-code conversions. Re-run with
              updated settings or compare different versions.
            </PanelDescription>
          </div>
          {selectedConversions.length === 2 && onCompare && (
            <Button onClick={handleCompare} variant="outline">
              <GitCompare className="mr-2 h-4 w-4" />
              Compare Selected
            </Button>
          )}
        </div>
      </PanelHeader>
      <PanelContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="code-generation">Code Generation</SelectItem>
                <SelectItem value="image-export">Image Export</SelectItem>
                <SelectItem value="full-export">Full Export</SelectItem>
                <SelectItem value="preview">Preview</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star
                className={`h-4 w-4 ${
                  showFavoritesOnly ? "fill-current" : ""
                }`}
              />
            </Button>
          </div>

          {/* Selection info */}
          {selectedConversions.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {selectedConversions.length} selected
                {selectedConversions.length === 1 && " (select 2 to compare)"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversions([])}
              >
                Clear selection
              </Button>
            </div>
          )}

          {/* Conversion list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : conversions && conversions.length > 0 ? (
            <div className="space-y-3">
              {conversions.map((conversion) => (
                <ConversionCard
                  key={conversion.id}
                  conversion={conversion}
                  onViewCode={onViewCode}
                  onRerun={onRerun}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                  onEditNotes={handleEditNotes}
                  isSelected={selectedConversions.some(
                    (c) => c.id === conversion.id
                  )}
                  onSelect={handleSelectConversion}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversions found</p>
              {hasFilters && (
                <p className="text-sm mt-1">
                  Try adjusting your filters or search query
                </p>
              )}
            </div>
          )}
        </div>
      </PanelContent>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConversion?.notes ? "Edit Notes" : "Add Notes"}
            </DialogTitle>
            <DialogDescription>
              Add notes to help you remember the context or purpose of this
              conversion.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your notes..."
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={updateNotes.isPending}>
              {updateNotes.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
