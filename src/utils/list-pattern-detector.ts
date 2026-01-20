/**
 * List Pattern Detector - Identifies Card Grids and List Patterns
 *
 * Detects and analyzes:
 * - Card grids (multiple columns of similar items)
 * - Vertical lists (single column of items)
 * - Horizontal lists (single row of items)
 * - Table-like patterns
 * - Navigation menus
 *
 * Uses the repetition detector for core similarity analysis.
 */

import type { FigmaNode } from "./figma-api";
import type { BoundingBox, NodeLayoutAnalysis, SemanticRole } from "./layout-analyzer";
import {
  detectRepeatingUnits,
  detectRepeatingUnitsFromAnalysis,
  type RepeatingUnitResult,
  type ArrangementType,
  type RepeatingItem,
} from "./repetition-detector";

// ============================================================================
// Types and Interfaces
// ============================================================================

/** Result of list/card pattern detection */
export interface ListPatternResult {
  /** Whether a list pattern was detected */
  isListPattern: boolean;
  /** The type of list pattern */
  patternType: ListPatternType;
  /** The semantic meaning of the list */
  semanticType: ListSemanticType;
  /** The repeating unit analysis */
  repetitionAnalysis: RepeatingUnitResult;
  /** Structural information about the list */
  structure: ListStructure;
  /** Suggested HTML element */
  suggestedElement: ListElementSuggestion;
  /** Confidence in the detection */
  confidence: number;
  /** List items for code generation */
  listItems: ListItemInfo[];
}

/** Types of list patterns */
export type ListPatternType =
  | "card-grid"
  | "vertical-list"
  | "horizontal-list"
  | "table"
  | "navigation-menu"
  | "tabs"
  | "carousel"
  | "unknown";

/** Semantic types for lists */
export type ListSemanticType =
  | "product-catalog"
  | "user-list"
  | "article-feed"
  | "media-gallery"
  | "settings-list"
  | "navigation"
  | "breadcrumb"
  | "tabs"
  | "menu"
  | "data-table"
  | "generic-list"
  | "unknown";

/** Structural information about the list */
export interface ListStructure {
  /** Number of columns (for grids) */
  columns: number;
  /** Number of rows */
  rows: number;
  /** Total item count */
  itemCount: number;
  /** Horizontal gap between items */
  horizontalGap: number;
  /** Vertical gap between items */
  verticalGap: number;
  /** Whether items have consistent sizes */
  hasConsistentSizes: boolean;
  /** Whether the list is scrollable (extends beyond visible area) */
  isScrollable: boolean;
  /** Item width (representative) */
  itemWidth: number;
  /** Item height (representative) */
  itemHeight: number;
}

/** Suggested HTML element configuration */
export interface ListElementSuggestion {
  /** Container element */
  containerElement: string;
  /** Item element */
  itemElement: string;
  /** ARIA role for container */
  containerRole?: string;
  /** ARIA role for items */
  itemRole?: string;
  /** Additional accessibility attributes */
  ariaAttributes: Record<string, string>;
  /** Tailwind classes for container */
  containerClasses: string[];
  /** Tailwind classes for items */
  itemClasses: string[];
}

/** Information about individual list items */
export interface ListItemInfo {
  nodeId: string;
  nodeName: string;
  bounds: BoundingBox;
  index: number;
  /** Grid position if applicable */
  gridPosition?: { row: number; column: number };
  /** Detected content types within the item */
  contentTypes: ItemContentType[];
  /** Whether this item differs from the representative */
  hasVariations: boolean;
}

/** Types of content that can be in a list item */
export type ItemContentType =
  | "image"
  | "text"
  | "icon"
  | "button"
  | "badge"
  | "avatar"
  | "checkbox"
  | "price"
  | "rating"
  | "timestamp"
  | "link";

// ============================================================================
// Configuration Constants
// ============================================================================

const CONFIG = {
  /** Minimum items for list detection */
  MIN_LIST_ITEMS: 2,
  /** Minimum items for grid detection */
  MIN_GRID_ITEMS: 4,
  /** Minimum confidence for list detection */
  MIN_CONFIDENCE: 0.5,
  /** Max height ratio for navigation items */
  NAV_ITEM_MAX_HEIGHT: 60,
  /** Typical tab bar height range */
  TAB_HEIGHT_MIN: 40,
  TAB_HEIGHT_MAX: 80,
  /** Keywords for semantic type detection */
  SEMANTIC_KEYWORDS: {
    "product-catalog": ["product", "item", "price", "shop", "store", "catalog"],
    "user-list": ["user", "member", "person", "contact", "profile", "team"],
    "article-feed": ["article", "post", "blog", "news", "feed", "story"],
    "media-gallery": ["image", "photo", "video", "media", "gallery", "thumbnail"],
    "settings-list": ["setting", "option", "preference", "config"],
    navigation: ["nav", "menu", "link", "navigation"],
    breadcrumb: ["breadcrumb", "path", "crumb"],
    tabs: ["tab", "tabs", "segment"],
    menu: ["menu", "dropdown", "action"],
  } as Record<string, string[]>,
} as const;

// ============================================================================
// Main Detection Functions
// ============================================================================

/**
 * Detect list/card patterns in child nodes
 */
export function detectListPattern(
  children: FigmaNode[],
  parentBounds: BoundingBox,
  parentName?: string
): ListPatternResult {
  // Run repetition detection first
  const repetitionAnalysis = detectRepeatingUnits(children, parentBounds);

  if (!repetitionAnalysis.hasRepeatingUnits) {
    return createEmptyListResult();
  }

  // Determine pattern type from arrangement
  const patternType = determinePatternType(
    repetitionAnalysis,
    parentBounds,
    parentName
  );

  // Determine semantic type from naming and structure
  const semanticType = determineSemanticType(
    repetitionAnalysis,
    patternType,
    parentName
  );

  // Calculate structure
  const structure = calculateListStructure(repetitionAnalysis, parentBounds);

  // Generate element suggestion
  const suggestedElement = generateElementSuggestion(
    patternType,
    semanticType,
    structure
  );

  // Extract list items info
  const listItems = extractListItems(
    repetitionAnalysis,
    children,
    structure
  );

  // Calculate overall confidence
  const confidence = calculateListConfidence(
    repetitionAnalysis,
    patternType,
    structure
  );

  return {
    isListPattern: confidence >= CONFIG.MIN_CONFIDENCE,
    patternType,
    semanticType,
    repetitionAnalysis,
    structure,
    suggestedElement,
    confidence,
    listItems,
  };
}

/**
 * Detect list patterns from layout analysis results
 */
export function detectListPatternFromAnalysis(
  analyses: NodeLayoutAnalysis[],
  parentBounds: BoundingBox,
  parentName?: string
): ListPatternResult {
  const repetitionAnalysis = detectRepeatingUnitsFromAnalysis(analyses);

  if (!repetitionAnalysis.hasRepeatingUnits) {
    return createEmptyListResult();
  }

  const patternType = determinePatternType(
    repetitionAnalysis,
    parentBounds,
    parentName
  );

  const semanticType = determineSemanticType(
    repetitionAnalysis,
    patternType,
    parentName
  );

  const structure = calculateListStructure(repetitionAnalysis, parentBounds);

  const suggestedElement = generateElementSuggestion(
    patternType,
    semanticType,
    structure
  );

  // Map analyses to list items
  const listItems = repetitionAnalysis.items.map((item, idx) => ({
    nodeId: item.nodeId,
    nodeName: item.nodeName,
    bounds: item.bounds,
    index: item.index,
    gridPosition: calculateGridPosition(item, structure),
    contentTypes: inferContentTypes(analyses.find((a) => a.nodeId === item.nodeId)),
    hasVariations: repetitionAnalysis.variations.some(
      (v) => v.nodeId === item.nodeId
    ),
  }));

  const confidence = calculateListConfidence(
    repetitionAnalysis,
    patternType,
    structure
  );

  return {
    isListPattern: confidence >= CONFIG.MIN_CONFIDENCE,
    patternType,
    semanticType,
    repetitionAnalysis,
    structure,
    suggestedElement,
    confidence,
    listItems,
  };
}

// ============================================================================
// Pattern Type Detection
// ============================================================================

/**
 * Determine the pattern type from repetition analysis
 */
function determinePatternType(
  analysis: RepeatingUnitResult,
  parentBounds: BoundingBox,
  parentName?: string
): ListPatternType {
  const { arrangement, items, spacing } = analysis;
  const lowerName = (parentName || "").toLowerCase();

  // Check for navigation patterns
  if (isNavigationPattern(items, parentBounds, lowerName)) {
    return "navigation-menu";
  }

  // Check for tabs
  if (isTabPattern(items, parentBounds, lowerName)) {
    return "tabs";
  }

  // Check for carousel (horizontal with likely scroll)
  if (isCarouselPattern(items, parentBounds)) {
    return "carousel";
  }

  // Map arrangement to pattern type
  switch (arrangement) {
    case "grid":
      return "card-grid";
    case "horizontal-list":
      // Check if it's more like a table row
      if (items.length > 5 && areItemsTableLike(items)) {
        return "table";
      }
      return "horizontal-list";
    case "vertical-list":
      // Check if items are table-like (many columns)
      if (areItemsTableLike(items)) {
        return "table";
      }
      return "vertical-list";
    case "masonry":
      return "card-grid"; // Treat masonry as card grid
    default:
      return "unknown";
  }
}

/**
 * Check if pattern is navigation
 */
function isNavigationPattern(
  items: RepeatingItem[],
  parentBounds: BoundingBox,
  name: string
): boolean {
  // Name-based detection
  const navKeywords = ["nav", "menu", "link", "navigation"];
  if (navKeywords.some((k) => name.includes(k))) {
    return true;
  }

  // Check if items are small and horizontal
  if (items.length >= 3) {
    const avgHeight =
      items.reduce((sum, i) => sum + i.bounds.height, 0) / items.length;
    const isSmallHeight = avgHeight <= CONFIG.NAV_ITEM_MAX_HEIGHT;
    const isHorizontal = areItemsHorizontal(items);

    if (isSmallHeight && isHorizontal) {
      return true;
    }
  }

  return false;
}

/**
 * Check if pattern is tabs
 */
function isTabPattern(
  items: RepeatingItem[],
  parentBounds: BoundingBox,
  name: string
): boolean {
  // Name-based detection
  const tabKeywords = ["tab", "tabs", "segment"];
  if (tabKeywords.some((k) => name.includes(k))) {
    return true;
  }

  // Check for tab-like characteristics
  const avgHeight =
    items.reduce((sum, i) => sum + i.bounds.height, 0) / items.length;

  if (
    avgHeight >= CONFIG.TAB_HEIGHT_MIN &&
    avgHeight <= CONFIG.TAB_HEIGHT_MAX &&
    areItemsHorizontal(items)
  ) {
    // Check if items span full width (or close to it)
    const totalItemWidth = items.reduce((sum, i) => sum + i.bounds.width, 0);
    const gapEstimate = (items.length - 1) * 8; // Assume small gaps
    const coverage = (totalItemWidth + gapEstimate) / parentBounds.width;

    if (coverage > 0.7) {
      return true;
    }
  }

  return false;
}

/**
 * Check if pattern is carousel
 */
function isCarouselPattern(
  items: RepeatingItem[],
  parentBounds: BoundingBox
): boolean {
  if (!areItemsHorizontal(items)) return false;

  // Calculate total content width
  const sortedByX = [...items].sort((a, b) => a.bounds.x - b.bounds.x);
  const firstItem = sortedByX[0];
  const lastItem = sortedByX[sortedByX.length - 1];

  const contentWidth = lastItem.bounds.x + lastItem.bounds.width - firstItem.bounds.x;

  // Carousel if content extends beyond parent
  return contentWidth > parentBounds.width * 1.2;
}

/**
 * Check if items are arranged horizontally
 */
function areItemsHorizontal(items: RepeatingItem[]): boolean {
  if (items.length < 2) return true;

  // Check if most items share similar Y position
  const yPositions = items.map((i) => i.bounds.y);
  const avgY = yPositions.reduce((a, b) => a + b, 0) / yPositions.length;
  const yVariance =
    yPositions.reduce((sum, y) => sum + Math.abs(y - avgY), 0) / yPositions.length;

  // Small Y variance indicates horizontal arrangement
  const avgHeight =
    items.reduce((sum, i) => sum + i.bounds.height, 0) / items.length;

  return yVariance < avgHeight * 0.3;
}

/**
 * Check if items are table-like (regular, data-focused)
 */
function areItemsTableLike(items: RepeatingItem[]): boolean {
  // Tables typically have many narrow items or very uniform children
  const avgWidth =
    items.reduce((sum, i) => sum + i.bounds.width, 0) / items.length;
  const avgHeight =
    items.reduce((sum, i) => sum + i.bounds.height, 0) / items.length;

  // Table rows are typically wide and short
  const aspectRatio = avgWidth / avgHeight;

  return aspectRatio > 5 && items.length > 3;
}

// ============================================================================
// Semantic Type Detection
// ============================================================================

/**
 * Determine semantic type from naming and structure
 */
function determineSemanticType(
  analysis: RepeatingUnitResult,
  patternType: ListPatternType,
  parentName?: string
): ListSemanticType {
  const lowerName = (parentName || "").toLowerCase();

  // Check name against keyword patterns
  for (const [semanticType, keywords] of Object.entries(CONFIG.SEMANTIC_KEYWORDS)) {
    if (keywords.some((k) => lowerName.includes(k))) {
      return semanticType as ListSemanticType;
    }
  }

  // Also check item names
  for (const item of analysis.items.slice(0, 5)) {
    const itemName = item.nodeName.toLowerCase();
    for (const [semanticType, keywords] of Object.entries(CONFIG.SEMANTIC_KEYWORDS)) {
      if (keywords.some((k) => itemName.includes(k))) {
        return semanticType as ListSemanticType;
      }
    }
  }

  // Infer from pattern type
  switch (patternType) {
    case "navigation-menu":
      return "navigation";
    case "tabs":
      return "tabs";
    case "card-grid":
      return "generic-list"; // Could be products, media, etc.
    case "table":
      return "data-table";
    default:
      return "generic-list";
  }
}

// ============================================================================
// Structure Calculation
// ============================================================================

/**
 * Calculate list structure from repetition analysis
 */
function calculateListStructure(
  analysis: RepeatingUnitResult,
  parentBounds: BoundingBox
): ListStructure {
  const { items, spacing } = analysis;

  if (items.length === 0) {
    return createEmptyStructure();
  }

  const representative = analysis.representativeUnit || items[0];

  // Calculate columns and rows
  const columns = spacing.columns || 1;
  const rows = spacing.rows || Math.ceil(items.length / columns);

  // Check size consistency
  const widths = items.map((i) => i.bounds.width);
  const heights = items.map((i) => i.bounds.height);

  const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
  const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

  const widthVariance =
    widths.reduce((sum, w) => sum + Math.abs(w - avgWidth), 0) / widths.length;
  const heightVariance =
    heights.reduce((sum, h) => sum + Math.abs(h - avgHeight), 0) / heights.length;

  const hasConsistentSizes =
    widthVariance < avgWidth * 0.15 && heightVariance < avgHeight * 0.15;

  // Check if scrollable (content extends beyond parent)
  const contentBounds = calculateContentBounds(items);
  const isScrollable =
    contentBounds.width > parentBounds.width ||
    contentBounds.height > parentBounds.height;

  return {
    columns,
    rows,
    itemCount: items.length,
    horizontalGap: spacing.horizontalGap,
    verticalGap: spacing.verticalGap,
    hasConsistentSizes,
    isScrollable,
    itemWidth: Math.round(representative.bounds.width),
    itemHeight: Math.round(representative.bounds.height),
  };
}

/**
 * Calculate bounding box containing all items
 */
function calculateContentBounds(items: RepeatingItem[]): BoundingBox {
  if (items.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const minX = Math.min(...items.map((i) => i.bounds.x));
  const minY = Math.min(...items.map((i) => i.bounds.y));
  const maxX = Math.max(...items.map((i) => i.bounds.x + i.bounds.width));
  const maxY = Math.max(...items.map((i) => i.bounds.y + i.bounds.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Create empty structure
 */
function createEmptyStructure(): ListStructure {
  return {
    columns: 0,
    rows: 0,
    itemCount: 0,
    horizontalGap: 0,
    verticalGap: 0,
    hasConsistentSizes: false,
    isScrollable: false,
    itemWidth: 0,
    itemHeight: 0,
  };
}

// ============================================================================
// Element Suggestion Generation
// ============================================================================

/**
 * Generate suggested HTML elements for the list
 */
function generateElementSuggestion(
  patternType: ListPatternType,
  semanticType: ListSemanticType,
  structure: ListStructure
): ListElementSuggestion {
  const suggestion = getBaseSuggestion(patternType, semanticType);

  // Add container classes based on structure
  suggestion.containerClasses.push(...getContainerClasses(patternType, structure));

  // Add item classes
  suggestion.itemClasses.push(...getItemClasses(patternType));

  return suggestion;
}

/**
 * Get base element suggestion
 */
function getBaseSuggestion(
  patternType: ListPatternType,
  semanticType: ListSemanticType
): ListElementSuggestion {
  switch (patternType) {
    case "card-grid":
      return {
        containerElement: "ul",
        itemElement: "li",
        containerRole: "list",
        ariaAttributes: {},
        containerClasses: [],
        itemClasses: [],
      };

    case "vertical-list":
      return {
        containerElement: semanticType === "navigation" ? "nav" : "ul",
        itemElement: semanticType === "navigation" ? "a" : "li",
        containerRole: semanticType === "navigation" ? "navigation" : "list",
        ariaAttributes:
          semanticType === "navigation"
            ? { "aria-label": "Navigation" }
            : {},
        containerClasses: [],
        itemClasses: [],
      };

    case "horizontal-list":
      return {
        containerElement: "ul",
        itemElement: "li",
        containerRole: "list",
        ariaAttributes: {},
        containerClasses: [],
        itemClasses: [],
      };

    case "navigation-menu":
      return {
        containerElement: "nav",
        itemElement: "a",
        containerRole: "navigation",
        ariaAttributes: { "aria-label": "Main navigation" },
        containerClasses: [],
        itemClasses: [],
      };

    case "tabs":
      return {
        containerElement: "div",
        itemElement: "button",
        containerRole: "tablist",
        itemRole: "tab",
        ariaAttributes: {},
        containerClasses: [],
        itemClasses: [],
      };

    case "carousel":
      return {
        containerElement: "div",
        itemElement: "div",
        containerRole: "region",
        ariaAttributes: { "aria-label": "Carousel", "aria-roledescription": "carousel" },
        containerClasses: [],
        itemClasses: [],
      };

    case "table":
      return {
        containerElement: "table",
        itemElement: "tr",
        ariaAttributes: {},
        containerClasses: [],
        itemClasses: [],
      };

    default:
      return {
        containerElement: "div",
        itemElement: "div",
        ariaAttributes: {},
        containerClasses: [],
        itemClasses: [],
      };
  }
}

/**
 * Get Tailwind classes for container
 */
function getContainerClasses(
  patternType: ListPatternType,
  structure: ListStructure
): string[] {
  const classes: string[] = [];

  switch (patternType) {
    case "card-grid":
      classes.push("grid");
      // Add column classes
      if (structure.columns === 2) {
        classes.push("grid-cols-2");
      } else if (structure.columns === 3) {
        classes.push("grid-cols-3");
      } else if (structure.columns === 4) {
        classes.push("grid-cols-4");
      } else if (structure.columns >= 5) {
        classes.push(`grid-cols-${Math.min(structure.columns, 6)}`);
      } else {
        classes.push("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
      }
      // Add gap
      classes.push(mapGapToClass(structure.horizontalGap, structure.verticalGap));
      break;

    case "vertical-list":
      classes.push("flex", "flex-col");
      if (structure.verticalGap > 0) {
        classes.push(mapGapToClass(0, structure.verticalGap));
      }
      break;

    case "horizontal-list":
      classes.push("flex", "flex-row", "items-center");
      if (structure.horizontalGap > 0) {
        classes.push(mapGapToClass(structure.horizontalGap, 0));
      }
      break;

    case "navigation-menu":
      classes.push("flex", "items-center");
      classes.push(mapGapToClass(structure.horizontalGap || 16, 0));
      break;

    case "tabs":
      classes.push("flex", "border-b");
      break;

    case "carousel":
      classes.push("flex", "overflow-x-auto", "snap-x", "snap-mandatory");
      classes.push(mapGapToClass(structure.horizontalGap || 16, 0));
      break;

    case "table":
      classes.push("w-full", "border-collapse");
      break;
  }

  return classes;
}

/**
 * Get Tailwind classes for items
 */
function getItemClasses(patternType: ListPatternType): string[] {
  switch (patternType) {
    case "card-grid":
      return ["rounded-lg", "border", "bg-card", "p-4", "shadow-sm"];
    case "vertical-list":
      return [];
    case "horizontal-list":
      return [];
    case "navigation-menu":
      return ["text-sm", "font-medium", "hover:text-primary"];
    case "tabs":
      return ["px-4", "py-2", "border-b-2", "border-transparent", "hover:border-primary"];
    case "carousel":
      return ["flex-shrink-0", "snap-center"];
    case "table":
      return [];
    default:
      return [];
  }
}

/**
 * Map gap sizes to Tailwind class
 */
function mapGapToClass(horizontalGap: number, verticalGap: number): string {
  const hClass = gapToTailwindScale(horizontalGap);
  const vClass = gapToTailwindScale(verticalGap);

  if (horizontalGap === verticalGap || (horizontalGap === 0 && verticalGap > 0)) {
    return `gap-${vClass || hClass}`;
  }
  if (verticalGap === 0 && horizontalGap > 0) {
    return `gap-x-${hClass}`;
  }
  if (horizontalGap !== verticalGap) {
    return `gap-x-${hClass} gap-y-${vClass}`;
  }
  return "gap-4";
}

/**
 * Convert pixel gap to Tailwind scale
 */
function gapToTailwindScale(gap: number): string {
  if (gap <= 0) return "0";
  if (gap <= 4) return "1";
  if (gap <= 8) return "2";
  if (gap <= 12) return "3";
  if (gap <= 16) return "4";
  if (gap <= 20) return "5";
  if (gap <= 24) return "6";
  if (gap <= 32) return "8";
  if (gap <= 40) return "10";
  if (gap <= 48) return "12";
  return "16";
}

// ============================================================================
// List Item Extraction
// ============================================================================

/**
 * Extract detailed list item information
 */
function extractListItems(
  analysis: RepeatingUnitResult,
  children: FigmaNode[],
  structure: ListStructure
): ListItemInfo[] {
  return analysis.items.map((item) => {
    const sourceNode = children.find((c) => c.id === item.nodeId);

    return {
      nodeId: item.nodeId,
      nodeName: item.nodeName,
      bounds: item.bounds,
      index: item.index,
      gridPosition: calculateGridPosition(item, structure),
      contentTypes: inferContentTypesFromNode(sourceNode),
      hasVariations: analysis.variations.some((v) => v.nodeId === item.nodeId),
    };
  });
}

/**
 * Calculate grid position for an item
 */
function calculateGridPosition(
  item: RepeatingItem,
  structure: ListStructure
): { row: number; column: number } | undefined {
  if (structure.columns <= 1) return undefined;

  const column = item.index % structure.columns;
  const row = Math.floor(item.index / structure.columns);

  return { row, column };
}

/**
 * Infer content types from a Figma node
 */
function inferContentTypesFromNode(node?: FigmaNode): ItemContentType[] {
  if (!node) return [];

  const types: ItemContentType[] = [];
  const name = node.name.toLowerCase();

  // Check from name
  if (name.includes("image") || name.includes("photo") || name.includes("thumbnail")) {
    types.push("image");
  }
  if (name.includes("text") || name.includes("title") || name.includes("description")) {
    types.push("text");
  }
  if (name.includes("icon")) {
    types.push("icon");
  }
  if (name.includes("button") || name.includes("cta")) {
    types.push("button");
  }
  if (name.includes("badge") || name.includes("tag")) {
    types.push("badge");
  }
  if (name.includes("avatar") || name.includes("profile")) {
    types.push("avatar");
  }
  if (name.includes("checkbox") || name.includes("check")) {
    types.push("checkbox");
  }
  if (name.includes("price") || name.includes("cost")) {
    types.push("price");
  }
  if (name.includes("rating") || name.includes("star")) {
    types.push("rating");
  }
  if (name.includes("time") || name.includes("date")) {
    types.push("timestamp");
  }
  if (name.includes("link")) {
    types.push("link");
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      types.push(...inferContentTypesFromNode(child));
    }
  }

  return Array.from(new Set(types)); // Deduplicate
}

/**
 * Infer content types from layout analysis
 */
function inferContentTypes(analysis?: NodeLayoutAnalysis): ItemContentType[] {
  if (!analysis) return [];

  const types: ItemContentType[] = [];
  const name = analysis.nodeName.toLowerCase();

  // Similar logic to inferContentTypesFromNode
  if (name.includes("image")) types.push("image");
  if (name.includes("text")) types.push("text");
  if (name.includes("icon")) types.push("icon");
  if (name.includes("button")) types.push("button");
  if (name.includes("avatar")) types.push("avatar");

  // Check children
  if (analysis.children) {
    for (const child of analysis.children) {
      types.push(...inferContentTypes(child));
    }
  }

  return Array.from(new Set(types));
}

// ============================================================================
// Confidence Calculation
// ============================================================================

/**
 * Calculate overall confidence in list detection
 */
function calculateListConfidence(
  analysis: RepeatingUnitResult,
  patternType: ListPatternType,
  structure: ListStructure
): number {
  let confidence = analysis.confidence;

  // Boost for recognized patterns
  if (patternType !== "unknown") {
    confidence += 0.1;
  }

  // Boost for consistent sizes
  if (structure.hasConsistentSizes) {
    confidence += 0.1;
  }

  // Boost for more items
  if (structure.itemCount >= 4) {
    confidence += 0.05;
  }
  if (structure.itemCount >= 6) {
    confidence += 0.05;
  }

  return Math.min(confidence, 1);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create empty list result
 */
function createEmptyListResult(): ListPatternResult {
  return {
    isListPattern: false,
    patternType: "unknown",
    semanticType: "unknown",
    repetitionAnalysis: {
      hasRepeatingUnits: false,
      items: [],
      representativeUnit: null,
      variations: [],
      similarityScore: 0,
      arrangement: "unknown",
      spacing: {
        horizontalGap: 0,
        verticalGap: 0,
        isUniformHorizontal: false,
        isUniformVertical: false,
      },
      confidence: 0,
    },
    structure: createEmptyStructure(),
    suggestedElement: {
      containerElement: "div",
      itemElement: "div",
      ariaAttributes: {},
      containerClasses: [],
      itemClasses: [],
    },
    confidence: 0,
    listItems: [],
  };
}

// ============================================================================
// Exports
// ============================================================================

export { CONFIG as LIST_PATTERN_CONFIG };
