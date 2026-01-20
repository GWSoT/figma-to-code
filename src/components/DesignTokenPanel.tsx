/**
 * Design Token Panel Component
 *
 * Displays extracted design tokens with visual previews.
 * Features:
 * - Visual previews for colors, typography, spacing, etc.
 * - Token editing and renaming
 * - Token usage tracking across components
 * - Token grouping and categorization
 */

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Palette,
  Type,
  Ruler,
  Square,
  Layers,
  Search,
  Edit2,
  Check,
  X,
  Copy,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import type { DesignToken, DesignTokenType } from "~/utils/tailwind-generator";

// ============================================================================
// Types
// ============================================================================

export interface TokenUsage {
  componentName: string;
  propertyName: string;
  lineNumber?: number;
}

export interface DesignTokenWithUsage extends DesignToken {
  usages?: TokenUsage[];
}

export interface TokenGroup {
  name: string;
  tokens: DesignTokenWithUsage[];
  collapsed?: boolean;
}

export interface DesignTokenPanelProps {
  /** Design tokens to display */
  tokens: DesignTokenWithUsage[];
  /** Callback when a token is edited */
  onTokenEdit?: (token: DesignTokenWithUsage, newValue: string) => void;
  /** Callback when a token is renamed */
  onTokenRename?: (token: DesignTokenWithUsage, newName: string) => void;
  /** Callback when a token is deleted */
  onTokenDelete?: (token: DesignTokenWithUsage) => void;
  /** Callback when a token's usage is clicked */
  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;
  /** Whether tokens are editable */
  editable?: boolean;
  /** Custom grouping function */
  groupBy?: "type" | "category" | "none";
  /** Default expanded groups */
  defaultExpandedGroups?: string[];
  /** Class name for additional styling */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const TOKEN_TYPE_CONFIG: Record<
  DesignTokenType,
  { icon: React.ReactNode; label: string; category: string }
> = {
  color: { icon: <Palette className="h-4 w-4" />, label: "Colors", category: "Colors" },
  spacing: { icon: <Ruler className="h-4 w-4" />, label: "Spacing", category: "Layout" },
  fontSize: { icon: <Type className="h-4 w-4" />, label: "Font Sizes", category: "Typography" },
  fontFamily: { icon: <Type className="h-4 w-4" />, label: "Font Families", category: "Typography" },
  fontWeight: { icon: <Type className="h-4 w-4" />, label: "Font Weights", category: "Typography" },
  lineHeight: { icon: <Type className="h-4 w-4" />, label: "Line Heights", category: "Typography" },
  letterSpacing: { icon: <Type className="h-4 w-4" />, label: "Letter Spacing", category: "Typography" },
  borderRadius: { icon: <Square className="h-4 w-4" />, label: "Border Radius", category: "Borders" },
  borderWidth: { icon: <Square className="h-4 w-4" />, label: "Border Width", category: "Borders" },
  boxShadow: { icon: <Layers className="h-4 w-4" />, label: "Shadows", category: "Effects" },
  opacity: { icon: <Eye className="h-4 w-4" />, label: "Opacity", category: "Effects" },
  zIndex: { icon: <Layers className="h-4 w-4" />, label: "Z-Index", category: "Layout" },
};

// ============================================================================
// Helper Functions
// ============================================================================

function groupTokensByType(tokens: DesignTokenWithUsage[]): TokenGroup[] {
  const groups = new Map<DesignTokenType, DesignTokenWithUsage[]>();

  for (const token of tokens) {
    const existing = groups.get(token.type) || [];
    groups.set(token.type, [...existing, token]);
  }

  return Array.from(groups.entries()).map(([type, groupTokens]) => ({
    name: TOKEN_TYPE_CONFIG[type]?.label || type,
    tokens: groupTokens,
  }));
}

function groupTokensByCategory(tokens: DesignTokenWithUsage[]): TokenGroup[] {
  const groups = new Map<string, DesignTokenWithUsage[]>();

  for (const token of tokens) {
    const category = TOKEN_TYPE_CONFIG[token.type]?.category || "Other";
    const existing = groups.get(category) || [];
    groups.set(category, [...existing, token]);
  }

  return Array.from(groups.entries()).map(([category, groupTokens]) => ({
    name: category,
    tokens: groupTokens,
  }));
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}

// ============================================================================
// Sub-Components
// ============================================================================

/** Color preview swatch */
function ColorPreview({ value, size = "md" }: { value: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "rounded-md border shadow-sm",
        sizeClasses[size]
      )}
      style={{ backgroundColor: value }}
      aria-label={`Color: ${value}`}
    />
  );
}

/** Typography preview */
function TypographyPreview({
  token,
}: {
  token: DesignTokenWithUsage;
}) {
  const style: React.CSSProperties = {};

  switch (token.type) {
    case "fontSize":
      style.fontSize = token.value;
      break;
    case "fontFamily":
      style.fontFamily = token.value;
      break;
    case "fontWeight":
      style.fontWeight = token.value;
      break;
    case "lineHeight":
      style.lineHeight = token.value;
      break;
    case "letterSpacing":
      style.letterSpacing = token.value;
      break;
  }

  return (
    <div className="flex items-center gap-2">
      <span style={style} className="text-foreground truncate max-w-[120px]">
        Aa
      </span>
      <span className="text-xs text-muted-foreground">{token.value}</span>
    </div>
  );
}

/** Spacing preview */
function SpacingPreview({ value }: { value: string }) {
  // Parse the value to get a numeric representation
  const numericValue = parseFloat(value);
  const displayWidth = Math.min(Math.max(numericValue * 2, 8), 80);

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-4 bg-primary/20 border border-primary/40 rounded"
        style={{ width: `${displayWidth}px` }}
      />
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

/** Border radius preview */
function BorderRadiusPreview({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 bg-muted border-2 border-primary/40"
        style={{ borderRadius: value }}
      />
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

/** Shadow preview */
function ShadowPreview({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 bg-background rounded"
        style={{ boxShadow: value }}
      />
      <span className="text-xs text-muted-foreground truncate max-w-[100px]">{value}</span>
    </div>
  );
}

/** Generic value preview */
function GenericPreview({ value }: { value: string }) {
  return (
    <span className="text-sm font-mono text-muted-foreground">{value}</span>
  );
}

/** Token preview based on type */
function TokenPreview({ token }: { token: DesignTokenWithUsage }) {
  switch (token.type) {
    case "color":
      return <ColorPreview value={token.value} />;
    case "fontSize":
    case "fontFamily":
    case "fontWeight":
    case "lineHeight":
    case "letterSpacing":
      return <TypographyPreview token={token} />;
    case "spacing":
      return <SpacingPreview value={token.value} />;
    case "borderRadius":
      return <BorderRadiusPreview value={token.value} />;
    case "boxShadow":
      return <ShadowPreview value={token.value} />;
    default:
      return <GenericPreview value={token.value} />;
  }
}

/** Editable token name input */
function EditableTokenName({
  token,
  onRename,
  editable,
}: {
  token: DesignTokenWithUsage;
  onRename?: (token: DesignTokenWithUsage, newName: string) => void;
  editable?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(token.name);

  const handleSave = useCallback(() => {
    if (editValue.trim() && editValue !== token.name) {
      onRename?.(token, editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, token, onRename]);

  const handleCancel = useCallback(() => {
    setEditValue(token.name);
    setIsEditing(false);
  }, [token.name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  if (!editable) {
    return <span className="font-medium text-sm">{token.name}</span>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-6 text-xs w-32"
          autoFocus
          data-testid="token-name-input"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleSave}
          data-testid="save-token-name"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      className="font-medium text-sm hover:text-primary transition-colors flex items-center gap-1 text-left"
      onClick={() => setIsEditing(true)}
      data-testid="edit-token-name"
    >
      {token.name}
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50" />
    </button>
  );
}

/** Editable token value */
function EditableTokenValue({
  token,
  onEdit,
  editable,
}: {
  token: DesignTokenWithUsage;
  onEdit?: (token: DesignTokenWithUsage, newValue: string) => void;
  editable?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(token.value);

  const handleSave = useCallback(() => {
    if (editValue.trim() && editValue !== token.value) {
      onEdit?.(token, editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, token, onEdit]);

  const handleCancel = useCallback(() => {
    setEditValue(token.value);
    setIsEditing(false);
  }, [token.value]);

  if (!editable || token.type === "color") {
    // For colors, we show a different editor
    return null;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="h-6 text-xs w-24 font-mono"
          autoFocus
          data-testid="token-value-input"
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleSave}
          data-testid="save-token-value"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
      onClick={() => setIsEditing(true)}
      data-testid="edit-token-value"
    >
      Edit value
    </button>
  );
}

/** Color picker for color tokens */
function ColorTokenEditor({
  token,
  onEdit,
  editable,
}: {
  token: DesignTokenWithUsage;
  onEdit?: (token: DesignTokenWithUsage, newValue: string) => void;
  editable?: boolean;
}) {
  const [localColor, setLocalColor] = useState(token.value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalColor(newValue);
    },
    []
  );

  const handleBlur = useCallback(() => {
    if (localColor !== token.value) {
      onEdit?.(token, localColor);
    }
  }, [localColor, token, onEdit]);

  if (!editable || token.type !== "color") {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="color"
        value={localColor.startsWith("#") ? localColor : "#000000"}
        onChange={handleChange}
        onBlur={handleBlur}
        className="h-6 w-6 rounded cursor-pointer border-0"
        data-testid="color-picker"
      />
      <Input
        value={localColor}
        onChange={(e) => setLocalColor(e.target.value)}
        onBlur={handleBlur}
        className="h-6 text-xs w-24 font-mono"
        data-testid="color-input"
      />
    </div>
  );
}

/** Token usage list */
function TokenUsageList({
  token,
  onUsageClick,
}: {
  token: DesignTokenWithUsage;
  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;
}) {
  if (!token.usages || token.usages.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">No usages found</span>
    );
  }

  return (
    <div className="space-y-1">
      {token.usages.map((usage, index) => (
        <button
          key={`${usage.componentName}-${usage.propertyName}-${index}`}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
          onClick={() => onUsageClick?.(token, usage)}
          data-testid={`token-usage-${index}`}
        >
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {usage.componentName}
          </Badge>
          <span className="font-mono">{usage.propertyName}</span>
          {usage.lineNumber && (
            <span className="text-muted-foreground/60">:L{usage.lineNumber}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Single token row/card */
function TokenItem({
  token,
  onTokenEdit,
  onTokenRename,
  onTokenDelete,
  onUsageClick,
  editable,
  showUsage,
}: {
  token: DesignTokenWithUsage;
  onTokenEdit?: (token: DesignTokenWithUsage, newValue: string) => void;
  onTokenRename?: (token: DesignTokenWithUsage, newName: string) => void;
  onTokenDelete?: (token: DesignTokenWithUsage) => void;
  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;
  editable?: boolean;
  showUsage?: boolean;
}) {
  const config = TOKEN_TYPE_CONFIG[token.type];

  return (
    <div
      className="group flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
      data-testid={`token-item-${token.name}`}
    >
      {/* Preview */}
      <div className="flex-shrink-0">
        <TokenPreview token={token} />
      </div>

      {/* Token info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <EditableTokenName
            token={token}
            onRename={onTokenRename}
            editable={editable}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-[10px]">
                  {config?.icon}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config?.label || token.type}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {token.description && (
          <p className="text-xs text-muted-foreground mt-1">{token.description}</p>
        )}

        {token.figmaStyleName && token.figmaStyleName !== token.name && (
          <p className="text-xs text-muted-foreground/60 mt-1">
            Figma: {token.figmaStyleName}
          </p>
        )}

        {/* Editable value */}
        <EditableTokenValue token={token} onEdit={onTokenEdit} editable={editable} />
        <ColorTokenEditor token={token} onEdit={onTokenEdit} editable={editable} />

        {/* Usage */}
        {showUsage && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs font-medium mb-1">
              Usage ({token.usages?.length || 0})
            </p>
            <TokenUsageList token={token} onUsageClick={onUsageClick} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => copyToClipboard(token.value)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy value
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(token.name)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(`var(--${token.name})`)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy as CSS var
            </DropdownMenuItem>
            {editable && onTokenDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onTokenDelete(token)}
              >
                <X className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/** Collapsible token group */
function TokenGroupSection({
  group,
  onTokenEdit,
  onTokenRename,
  onTokenDelete,
  onUsageClick,
  editable,
  showUsage,
  defaultExpanded,
}: {
  group: TokenGroup;
  onTokenEdit?: (token: DesignTokenWithUsage, newValue: string) => void;
  onTokenRename?: (token: DesignTokenWithUsage, newName: string) => void;
  onTokenDelete?: (token: DesignTokenWithUsage) => void;
  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;
  editable?: boolean;
  showUsage?: boolean;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? true);

  return (
    <div className="border rounded-lg overflow-hidden" data-testid={`token-group-${group.name}`}>
      <button
        className="flex items-center justify-between w-full p-3 bg-muted/50 hover:bg-muted transition-colors text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="font-medium">{group.name}</span>
          <Badge variant="secondary" className="text-xs">
            {group.tokens.length}
          </Badge>
        </div>
      </button>

      {isExpanded && (
        <div className="p-2 space-y-2">
          {group.tokens.map((token) => (
            <TokenItem
              key={`${token.type}-${token.name}`}
              token={token}
              onTokenEdit={onTokenEdit}
              onTokenRename={onTokenRename}
              onTokenDelete={onTokenDelete}
              onUsageClick={onUsageClick}
              editable={editable}
              showUsage={showUsage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DesignTokenPanel({
  tokens,
  onTokenEdit,
  onTokenRename,
  onTokenDelete,
  onUsageClick,
  editable = false,
  groupBy = "type",
  defaultExpandedGroups,
  className,
}: DesignTokenPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"grid" | "list">("list");
  const [showUsage, setShowUsage] = useState(false);

  // Filter tokens by search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;

    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.value.toLowerCase().includes(query) ||
        token.type.toLowerCase().includes(query) ||
        token.figmaStyleName?.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  // Group tokens
  const groups = useMemo(() => {
    if (groupBy === "none") {
      return [{ name: "All Tokens", tokens: filteredTokens }];
    }
    if (groupBy === "category") {
      return groupTokensByCategory(filteredTokens);
    }
    return groupTokensByType(filteredTokens);
  }, [filteredTokens, groupBy]);

  // Token type counts for tabs
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: tokens.length };
    for (const token of tokens) {
      const category = TOKEN_TYPE_CONFIG[token.type]?.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
    }
    return counts;
  }, [tokens]);

  const [activeCategory, setActiveCategory] = useState("all");

  // Filter by category tab
  const categoryFilteredGroups = useMemo(() => {
    if (activeCategory === "all") return groups;

    return groups.filter((group) => {
      // Check if any token in the group matches the category
      return group.tokens.some(
        (token) => TOKEN_TYPE_CONFIG[token.type]?.category === activeCategory
      );
    });
  }, [groups, activeCategory]);

  return (
    <div className={cn("flex flex-col h-full", className)} data-testid="design-token-panel">
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Design Tokens</h2>
            <p className="text-sm text-muted-foreground">
              {tokens.length} tokens extracted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showUsage ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowUsage(!showUsage)}
              data-testid="toggle-usage"
            >
              <Eye className="h-4 w-4 mr-1" />
              Usage
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="token-search"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b px-4">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="text-xs">
              All ({typeCounts.all})
            </TabsTrigger>
            {["Colors", "Typography", "Layout", "Borders", "Effects"].map(
              (category) =>
                typeCounts[category] ? (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category} ({typeCounts[category]})
                  </TabsTrigger>
                ) : null
            )}
          </TabsList>
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {categoryFilteredGroups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tokens found</p>
              {searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            categoryFilteredGroups.map((group) => (
              <TokenGroupSection
                key={group.name}
                group={group}
                onTokenEdit={onTokenEdit}
                onTokenRename={onTokenRename}
                onTokenDelete={onTokenDelete}
                onUsageClick={onUsageClick}
                editable={editable}
                showUsage={showUsage}
                defaultExpanded={
                  defaultExpandedGroups?.includes(group.name) ?? true
                }
              />
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}

export default DesignTokenPanel;
