/**
 * Layout Analyzer - Semantic Layout Intent Detection
 *
 * Analyzes visual positioning to infer semantic layout intent:
 * - Detect header/footer/sidebar patterns
 * - Identify navigation structures, card grids, and list layouts
 * - Use heuristics (and ML-ready scoring) to understand layout purpose
 */

import type { FigmaNode } from "./figma-api";

// ============================================================================
// Types and Interfaces
// ============================================================================

/** Bounding box for positioning calculations */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Semantic layout role detected from visual analysis */
export type SemanticRole =
  | "header"
  | "footer"
  | "sidebar"
  | "navigation"
  | "main-content"
  | "card"
  | "card-grid"
  | "list"
  | "list-item"
  | "hero"
  | "form"
  | "modal"
  | "toolbar"
  | "tab-bar"
  | "breadcrumb"
  | "search"
  | "avatar"
  | "button-group"
  | "content-section"
  | "unknown";

/** Layout pattern detected from spatial analysis */
export type LayoutPattern =
  | "horizontal-stack"
  | "vertical-stack"
  | "grid"
  | "absolute"
  | "centered"
  | "split"
  | "wrap"
  | "unknown";

/** Alignment types */
export type HorizontalAlignment = "left" | "center" | "right" | "stretch" | "mixed";
export type VerticalAlignment = "top" | "center" | "bottom" | "stretch" | "mixed";

/** Node analysis result for a single element */
export interface NodeLayoutAnalysis {
  nodeId: string;
  nodeName: string;
  bounds: BoundingBox;
  semanticRole: SemanticRole;
  confidence: number; // 0-1 confidence score
  layoutPattern: LayoutPattern;
  horizontalAlignment: HorizontalAlignment;
  verticalAlignment: VerticalAlignment;
  suggestedCSS: SuggestedCSS;
  children?: NodeLayoutAnalysis[];
  metadata: LayoutMetadata;
}

/** Metadata about the analyzed layout */
export interface LayoutMetadata {
  isFullWidth: boolean;
  isFullHeight: boolean;
  hasUniformChildren: boolean;
  childCount: number;
  averageGap?: number;
  dominantDirection?: "horizontal" | "vertical";
  aspectRatio: number;
  relativePosition: RelativePosition;
}

/** Position relative to parent */
export interface RelativePosition {
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
}

/** Suggested CSS for code generation */
export interface SuggestedCSS {
  display: "flex" | "grid" | "block" | "inline-flex" | "inline-block";
  flexDirection?: "row" | "column";
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  position?: "relative" | "absolute" | "static";
  additionalStyles: Record<string, string>;
}

/** Analysis result for a complete frame/screen */
export interface FrameLayoutAnalysis {
  frameId: string;
  frameName: string;
  bounds: BoundingBox;
  sections: SectionAnalysis[];
  overallPattern: LayoutPattern;
  suggestedStructure: StructureSuggestion[];
}

/** Section analysis for major layout regions */
export interface SectionAnalysis {
  role: SemanticRole;
  confidence: number;
  bounds: BoundingBox;
  nodeIds: string[];
  childPattern: LayoutPattern;
}

/** Structural suggestion for code generation */
export interface StructureSuggestion {
  element: string;
  role: SemanticRole;
  cssClasses: string[];
  children?: StructureSuggestion[];
}

// ============================================================================
// Constants for Heuristics
// ============================================================================

/** Thresholds for layout detection */
const THRESHOLDS = {
  /** Percentage of parent width to consider "full width" */
  FULL_WIDTH_PERCENT: 0.9,
  /** Percentage of parent height to consider "full height" */
  FULL_HEIGHT_PERCENT: 0.9,
  /** Maximum height percentage for a header region */
  HEADER_MAX_HEIGHT_PERCENT: 0.15,
  /** Minimum Y position percentage for footer detection */
  FOOTER_MIN_Y_PERCENT: 0.85,
  /** Maximum width percentage for sidebar detection */
  SIDEBAR_MAX_WIDTH_PERCENT: 0.35,
  /** Gap tolerance for detecting uniform spacing (percentage) */
  GAP_TOLERANCE_PERCENT: 0.2,
  /** Minimum children for grid detection */
  GRID_MIN_CHILDREN: 4,
  /** Minimum children for list detection */
  LIST_MIN_CHILDREN: 2,
  /** Maximum aspect ratio variance for uniform children */
  ASPECT_RATIO_VARIANCE: 0.3,
  /** Minimum similarity score for card detection */
  CARD_SIMILARITY_THRESHOLD: 0.7,
  /** Navigation max height in pixels */
  NAV_MAX_HEIGHT_PX: 80,
  /** Tab bar typical height range */
  TAB_BAR_HEIGHT_MIN: 40,
  TAB_BAR_HEIGHT_MAX: 60,
} as const;

/** Keywords for semantic role detection - ORDER MATTERS (more specific first) */
const ROLE_KEYWORDS: Record<SemanticRole, string[]> = {
  header: ["header", "navbar", "topbar", "top-bar", "app-bar", "appbar"],
  footer: ["footer", "bottom-bar", "bottombar", "bottom-nav"],
  sidebar: ["sidebar", "side-bar", "sidenav", "side-nav", "drawer", "menu-panel"],
  navigation: ["nav", "navigation", "menu", "links"],
  "main-content": ["main", "content", "body", "container", "wrapper"],
  "card-grid": ["cards", "card-grid", "tiles", "gallery", "collection", "products grid"],
  list: ["list", "items", "rows", "entries"],  // "list" checked before "card" (item)
  "list-item": ["list-item", "row", "entry"],
  card: ["card", "tile", "panel", "box"],  // "item" removed - too generic
  hero: ["hero", "banner", "jumbotron", "splash", "cover"],
  form: ["form", "input", "field", "login", "signup", "register"],
  modal: ["modal", "dialog", "popup", "overlay", "sheet"],
  toolbar: ["toolbar", "tool-bar", "action-bar", "actions"],
  "tab-bar": ["tabs", "tab-bar", "tabbar", "segments"],
  breadcrumb: ["breadcrumb", "crumbs", "path"],
  search: ["search", "searchbar", "search-box", "filter"],
  avatar: ["avatar", "profile-pic", "user-image", "photo"],
  "button-group": ["button-group", "btn-group", "buttons"],
  "content-section": ["section", "block", "area", "region"],
  unknown: [],
};

// ============================================================================
// Core Analysis Functions
// ============================================================================

/**
 * Analyze a Figma node and its children to detect semantic layout intent
 */
export function analyzeNodeLayout(
  node: FigmaNode,
  parentBounds?: BoundingBox
): NodeLayoutAnalysis {
  const bounds = extractBounds(node);
  const children = node.children || [];

  // Analyze children recursively
  const childAnalyses = children
    .filter((child) => child.absoluteBoundingBox)
    .map((child) => analyzeNodeLayout(child, bounds));

  // Detect semantic role
  const { role, confidence } = detectSemanticRole(node, bounds, parentBounds, childAnalyses);

  // Detect layout pattern
  const layoutPattern = detectLayoutPattern(childAnalyses, bounds);

  // Detect alignments
  const horizontalAlignment = detectHorizontalAlignment(childAnalyses, bounds);
  const verticalAlignment = detectVerticalAlignment(childAnalyses, bounds);

  // Generate suggested CSS
  const suggestedCSS = generateSuggestedCSS(layoutPattern, horizontalAlignment, verticalAlignment, childAnalyses);

  // Build metadata
  const metadata = buildMetadata(bounds, parentBounds, childAnalyses);

  return {
    nodeId: node.id,
    nodeName: node.name,
    bounds,
    semanticRole: role,
    confidence,
    layoutPattern,
    horizontalAlignment,
    verticalAlignment,
    suggestedCSS,
    children: childAnalyses.length > 0 ? childAnalyses : undefined,
    metadata,
  };
}

/**
 * Analyze a complete frame/screen for major layout sections
 */
export function analyzeFrameLayout(frameNode: FigmaNode): FrameLayoutAnalysis {
  const bounds = extractBounds(frameNode);
  const children = frameNode.children || [];

  // Analyze all children
  const childAnalyses = children
    .filter((child) => child.absoluteBoundingBox)
    .map((child) => analyzeNodeLayout(child, bounds));

  // Detect major sections (header, footer, sidebar, main content)
  const sections = detectMajorSections(childAnalyses, bounds);

  // Determine overall pattern
  const overallPattern = detectLayoutPattern(childAnalyses, bounds);

  // Generate structure suggestions
  const suggestedStructure = generateStructureSuggestions(sections, childAnalyses);

  return {
    frameId: frameNode.id,
    frameName: frameNode.name,
    bounds,
    sections,
    overallPattern,
    suggestedStructure,
  };
}

// ============================================================================
// Spatial Analysis Functions
// ============================================================================

/**
 * Extract bounding box from a Figma node
 */
function extractBounds(node: FigmaNode): BoundingBox {
  const bbox = node.absoluteBoundingBox;
  if (!bbox) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
  };
}

/**
 * Calculate relative position within parent bounds
 */
function calculateRelativePosition(bounds: BoundingBox, parentBounds: BoundingBox): RelativePosition {
  if (parentBounds.width === 0 || parentBounds.height === 0) {
    return { topPercent: 0, leftPercent: 0, widthPercent: 0, heightPercent: 0 };
  }

  return {
    topPercent: (bounds.y - parentBounds.y) / parentBounds.height,
    leftPercent: (bounds.x - parentBounds.x) / parentBounds.width,
    widthPercent: bounds.width / parentBounds.width,
    heightPercent: bounds.height / parentBounds.height,
  };
}

/**
 * Calculate gaps between children in a direction
 */
function calculateGaps(children: NodeLayoutAnalysis[], direction: "horizontal" | "vertical"): number[] {
  if (children.length < 2) return [];

  // Sort children by position
  const sorted = [...children].sort((a, b) => {
    return direction === "horizontal"
      ? a.bounds.x - b.bounds.x
      : a.bounds.y - b.bounds.y;
  });

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (direction === "horizontal") {
      const gap = curr.bounds.x - (prev.bounds.x + prev.bounds.width);
      gaps.push(gap);
    } else {
      const gap = curr.bounds.y - (prev.bounds.y + prev.bounds.height);
      gaps.push(gap);
    }
  }

  return gaps;
}

/**
 * Check if gaps are uniform (within tolerance)
 */
function areGapsUniform(gaps: number[]): boolean {
  if (gaps.length < 2) return true;

  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  if (avgGap === 0) return true;

  const tolerance = Math.abs(avgGap * THRESHOLDS.GAP_TOLERANCE_PERCENT);
  return gaps.every((gap) => Math.abs(gap - avgGap) <= tolerance);
}

/**
 * Calculate average gap
 */
function calculateAverageGap(gaps: number[]): number {
  if (gaps.length === 0) return 0;
  return gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
}

/**
 * Check if children have similar dimensions (for grid/card detection)
 */
function areChildrenUniform(children: NodeLayoutAnalysis[]): boolean {
  if (children.length < 2) return true;

  const aspectRatios = children.map((c) =>
    c.bounds.height !== 0 ? c.bounds.width / c.bounds.height : 1
  );

  const avgRatio = aspectRatios.reduce((sum, r) => sum + r, 0) / aspectRatios.length;
  const variance = aspectRatios.reduce((sum, r) => sum + Math.abs(r - avgRatio), 0) / aspectRatios.length;

  return variance / avgRatio < THRESHOLDS.ASPECT_RATIO_VARIANCE;
}

// ============================================================================
// Semantic Role Detection
// ============================================================================

/**
 * Detect semantic role from visual positioning and naming
 */
function detectSemanticRole(
  node: FigmaNode,
  bounds: BoundingBox,
  parentBounds: BoundingBox | undefined,
  childAnalyses: NodeLayoutAnalysis[]
): { role: SemanticRole; confidence: number } {
  const scores: Array<{ role: SemanticRole; score: number }> = [];

  // Score from name keywords
  const nameScore = scoreFromName(node.name);
  if (nameScore) {
    scores.push(nameScore);
  }

  // Score from position (if parent bounds available)
  if (parentBounds) {
    const relPos = calculateRelativePosition(bounds, parentBounds);
    const positionScores = scoreFromPosition(relPos, bounds, parentBounds);
    scores.push(...positionScores);
  }

  // Score from children patterns
  const childrenScores = scoreFromChildren(childAnalyses, bounds);
  scores.push(...childrenScores);

  // Score from node type
  const typeScore = scoreFromNodeType(node);
  if (typeScore) {
    scores.push(typeScore);
  }

  // Find highest scoring role
  if (scores.length === 0) {
    return { role: "unknown", confidence: 0 };
  }

  // Aggregate scores by role
  const roleScores = new Map<SemanticRole, number>();
  for (const { role, score } of scores) {
    roleScores.set(role, (roleScores.get(role) || 0) + score);
  }

  // Find max
  let maxRole: SemanticRole = "unknown";
  let maxScore = 0;
  for (const [role, score] of roleScores) {
    if (score > maxScore) {
      maxRole = role;
      maxScore = score;
    }
  }

  // Normalize confidence to 0-1
  const confidence = Math.min(maxScore / 3, 1);

  return { role: maxRole, confidence };
}

/**
 * Score semantic role from node name
 */
function scoreFromName(name: string): { role: SemanticRole; score: number } | null {
  const lowerName = name.toLowerCase();

  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        // Higher score for exact match or start of name
        const score = lowerName.startsWith(keyword) ? 2.5 : 1.5;
        return { role: role as SemanticRole, score };
      }
    }
  }

  return null;
}

/**
 * Score semantic role from position within parent
 */
function scoreFromPosition(
  relPos: RelativePosition,
  bounds: BoundingBox,
  parentBounds: BoundingBox
): Array<{ role: SemanticRole; score: number }> {
  const scores: Array<{ role: SemanticRole; score: number }> = [];

  // Header detection: at top, full width, limited height
  if (
    relPos.topPercent < 0.05 &&
    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&
    relPos.heightPercent <= THRESHOLDS.HEADER_MAX_HEIGHT_PERCENT
  ) {
    scores.push({ role: "header", score: 2 });
  }

  // Footer detection: at bottom, full width
  if (
    relPos.topPercent >= THRESHOLDS.FOOTER_MIN_Y_PERCENT &&
    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT
  ) {
    scores.push({ role: "footer", score: 2 });
  }

  // Tab bar detection: at bottom, specific height range
  if (
    relPos.topPercent >= THRESHOLDS.FOOTER_MIN_Y_PERCENT &&
    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&
    bounds.height >= THRESHOLDS.TAB_BAR_HEIGHT_MIN &&
    bounds.height <= THRESHOLDS.TAB_BAR_HEIGHT_MAX
  ) {
    scores.push({ role: "tab-bar", score: 1.5 });
  }

  // Sidebar detection: on left or right edge, limited width, tall
  if (
    (relPos.leftPercent < 0.05 || relPos.leftPercent + relPos.widthPercent > 0.95) &&
    relPos.widthPercent <= THRESHOLDS.SIDEBAR_MAX_WIDTH_PERCENT &&
    relPos.heightPercent >= 0.5
  ) {
    scores.push({ role: "sidebar", score: 2 });
  }

  // Hero detection: at top, full width, significant height
  if (
    relPos.topPercent < 0.05 &&
    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&
    relPos.heightPercent >= 0.2 &&
    relPos.heightPercent <= 0.5
  ) {
    scores.push({ role: "hero", score: 1.5 });
  }

  // Navigation detection: at top, limited height
  if (
    relPos.topPercent < 0.1 &&
    bounds.height <= THRESHOLDS.NAV_MAX_HEIGHT_PX
  ) {
    scores.push({ role: "navigation", score: 1 });
  }

  // Main content: centered, takes up most space
  if (
    relPos.widthPercent >= 0.5 &&
    relPos.heightPercent >= 0.4 &&
    relPos.topPercent >= 0.05 &&
    relPos.topPercent <= 0.3
  ) {
    scores.push({ role: "main-content", score: 1 });
  }

  // Modal/dialog: centered, smaller than parent
  if (
    relPos.widthPercent < 0.9 &&
    relPos.widthPercent > 0.3 &&
    relPos.heightPercent < 0.9 &&
    relPos.heightPercent > 0.2 &&
    Math.abs(relPos.leftPercent + relPos.widthPercent / 2 - 0.5) < 0.1 &&
    Math.abs(relPos.topPercent + relPos.heightPercent / 2 - 0.5) < 0.15
  ) {
    scores.push({ role: "modal", score: 1.5 });
  }

  return scores;
}

/**
 * Score semantic role from children patterns
 */
function scoreFromChildren(
  children: NodeLayoutAnalysis[],
  bounds: BoundingBox
): Array<{ role: SemanticRole; score: number }> {
  const scores: Array<{ role: SemanticRole; score: number }> = [];

  if (children.length === 0) return scores;

  // Check for uniform children (potential grid or list)
  const hasUniformChildren = areChildrenUniform(children);

  // Check horizontal gaps
  const hGaps = calculateGaps(children, "horizontal");
  const hasUniformHGaps = areGapsUniform(hGaps);

  // Check vertical gaps
  const vGaps = calculateGaps(children, "vertical");
  const hasUniformVGaps = areGapsUniform(vGaps);

  // Card grid detection - must actually be a grid pattern (multiple rows)
  if (
    children.length >= THRESHOLDS.GRID_MIN_CHILDREN &&
    hasUniformChildren &&
    detectGridArrangement(children)
  ) {
    scores.push({ role: "card-grid", score: 2.5 });  // Higher score for actual grids
  }

  // List detection
  if (
    children.length >= THRESHOLDS.LIST_MIN_CHILDREN &&
    hasUniformChildren &&
    hasUniformVGaps &&
    !hasUniformHGaps
  ) {
    scores.push({ role: "list", score: 1.5 });
  }

  // Button group detection: small, horizontal, uniform
  if (
    children.length >= 2 &&
    children.length <= 6 &&
    hasUniformHGaps &&
    bounds.height <= 60
  ) {
    scores.push({ role: "button-group", score: 1 });
  }

  // Navigation detection: horizontal children, limited height
  if (
    children.length >= 3 &&
    children.length <= 10 &&
    hasUniformHGaps &&
    bounds.height <= THRESHOLDS.NAV_MAX_HEIGHT_PX
  ) {
    scores.push({ role: "navigation", score: 1 });
  }

  // Check for individual cards
  const childRoles = children.map((c) => c.semanticRole);
  if (childRoles.every((r) => r === "card" || r === "list-item")) {
    if (detectGridArrangement(children)) {
      scores.push({ role: "card-grid", score: 2 });
    } else {
      scores.push({ role: "list", score: 1.5 });
    }
  }

  return scores;
}

/**
 * Score semantic role from Figma node type
 */
function scoreFromNodeType(node: FigmaNode): { role: SemanticRole; score: number } | null {
  const type = node.type;

  // Component instances may have semantic meaning
  if (type === "INSTANCE" || type === "COMPONENT") {
    // Check name for clues
    const nameScore = scoreFromName(node.name);
    if (nameScore) {
      return { role: nameScore.role, score: nameScore.score * 1.2 };
    }
  }

  return null;
}

// ============================================================================
// Layout Pattern Detection
// ============================================================================

/**
 * Detect layout pattern from children arrangement
 */
function detectLayoutPattern(
  children: NodeLayoutAnalysis[],
  parentBounds: BoundingBox
): LayoutPattern {
  if (children.length === 0) {
    return "unknown";
  }

  if (children.length === 1) {
    // Single child - check if centered
    const child = children[0];
    const relPos = calculateRelativePosition(child.bounds, parentBounds);
    const isCenteredH = Math.abs(relPos.leftPercent + relPos.widthPercent / 2 - 0.5) < 0.1;
    const isCenteredV = Math.abs(relPos.topPercent + relPos.heightPercent / 2 - 0.5) < 0.1;

    if (isCenteredH && isCenteredV) {
      return "centered";
    }
    return "absolute";
  }

  // Check for grid arrangement
  if (children.length >= THRESHOLDS.GRID_MIN_CHILDREN && detectGridArrangement(children)) {
    return "grid";
  }

  // Check for horizontal or vertical stack
  const { isHorizontal, isVertical } = detectStackDirection(children);

  if (isHorizontal && !isVertical) {
    return "horizontal-stack";
  }

  if (isVertical && !isHorizontal) {
    return "vertical-stack";
  }

  // Check for split layout (two main columns or rows)
  if (children.length === 2) {
    const isSplit = detectSplitLayout(children, parentBounds);
    if (isSplit) {
      return "split";
    }
  }

  // Check for wrap layout (multiple rows of items)
  if (children.length >= 3 && detectWrapLayout(children)) {
    return "wrap";
  }

  // Fallback to absolute if no clear pattern
  return "absolute";
}

/**
 * Detect if children are arranged in a grid pattern (not just horizontal or vertical)
 */
function detectGridArrangement(children: NodeLayoutAnalysis[]): boolean {
  if (children.length < THRESHOLDS.GRID_MIN_CHILDREN) return false;

  // Use a tolerance for Y position grouping (items within 10px are on same row)
  const yTolerance = 10;

  // Group children by Y position (rows)
  const rows: NodeLayoutAnalysis[][] = [];
  const sortedByY = [...children].sort((a, b) => a.bounds.y - b.bounds.y);

  let currentRow: NodeLayoutAnalysis[] = [sortedByY[0]];
  let currentRowY = sortedByY[0].bounds.y;

  for (let i = 1; i < sortedByY.length; i++) {
    const child = sortedByY[i];
    if (Math.abs(child.bounds.y - currentRowY) <= yTolerance) {
      currentRow.push(child);
    } else {
      rows.push(currentRow);
      currentRow = [child];
      currentRowY = child.bounds.y;
    }
  }
  rows.push(currentRow);

  // A grid must have at least 2 actual rows
  if (rows.length < 2) return false;

  // A grid should have at least 2 items per row (on average)
  const avgItemsPerRow = children.length / rows.length;
  if (avgItemsPerRow < 2) return false;

  // Check that rows have similar item counts (grid is roughly rectangular)
  const itemCounts = rows.map(r => r.length);
  const maxCount = Math.max(...itemCounts);
  const minCount = Math.min(...itemCounts);

  // Allow for incomplete last row but not wildly different counts
  return minCount >= maxCount * 0.5;
}

/**
 * Detect stack direction (horizontal vs vertical)
 */
function detectStackDirection(children: NodeLayoutAnalysis[]): { isHorizontal: boolean; isVertical: boolean } {
  if (children.length < 2) {
    return { isHorizontal: false, isVertical: false };
  }

  // Sort by position
  const sortedByX = [...children].sort((a, b) => a.bounds.x - b.bounds.x);
  const sortedByY = [...children].sort((a, b) => a.bounds.y - b.bounds.y);

  // Check horizontal arrangement (no Y overlap, ordered by X)
  let isHorizontal = true;
  for (let i = 1; i < sortedByX.length; i++) {
    const prev = sortedByX[i - 1];
    const curr = sortedByX[i];

    // Check for significant Y overlap (they're roughly on the same row)
    const prevBottom = prev.bounds.y + prev.bounds.height;
    const currTop = curr.bounds.y;
    const currBottom = curr.bounds.y + curr.bounds.height;
    const prevTop = prev.bounds.y;

    const overlap = Math.min(prevBottom, currBottom) - Math.max(prevTop, currTop);
    const minHeight = Math.min(prev.bounds.height, curr.bounds.height);

    if (overlap < minHeight * 0.5) {
      isHorizontal = false;
      break;
    }
  }

  // Check vertical arrangement (no X overlap, ordered by Y)
  let isVertical = true;
  for (let i = 1; i < sortedByY.length; i++) {
    const prev = sortedByY[i - 1];
    const curr = sortedByY[i];

    // Check for significant X overlap (they're roughly in the same column)
    const prevRight = prev.bounds.x + prev.bounds.width;
    const currLeft = curr.bounds.x;
    const currRight = curr.bounds.x + curr.bounds.width;
    const prevLeft = prev.bounds.x;

    const overlap = Math.min(prevRight, currRight) - Math.max(prevLeft, currLeft);
    const minWidth = Math.min(prev.bounds.width, curr.bounds.width);

    if (overlap < minWidth * 0.5) {
      isVertical = false;
      break;
    }
  }

  return { isHorizontal, isVertical };
}

/**
 * Detect split layout (e.g., sidebar + main content)
 */
function detectSplitLayout(children: NodeLayoutAnalysis[], parentBounds: BoundingBox): boolean {
  if (children.length !== 2) return false;

  const [a, b] = children;

  // Check horizontal split (side by side)
  const horizontalGap = Math.min(
    Math.abs(a.bounds.x + a.bounds.width - b.bounds.x),
    Math.abs(b.bounds.x + b.bounds.width - a.bounds.x)
  );

  const totalWidth = a.bounds.width + b.bounds.width + horizontalGap;
  const isHorizontalSplit = totalWidth >= parentBounds.width * 0.8;

  // Check vertical split (stacked)
  const verticalGap = Math.min(
    Math.abs(a.bounds.y + a.bounds.height - b.bounds.y),
    Math.abs(b.bounds.y + b.bounds.height - a.bounds.y)
  );

  const totalHeight = a.bounds.height + b.bounds.height + verticalGap;
  const isVerticalSplit = totalHeight >= parentBounds.height * 0.8;

  return isHorizontalSplit || isVerticalSplit;
}

/**
 * Detect wrap layout (flex-wrap behavior)
 */
function detectWrapLayout(children: NodeLayoutAnalysis[]): boolean {
  if (children.length < 3) return false;

  // Get unique Y positions (potential rows)
  const yPositions = children.map((c) => Math.round(c.bounds.y));
  const uniqueYs = [...new Set(yPositions)].sort((a, b) => a - b);

  // If there are multiple rows and items per row
  if (uniqueYs.length >= 2) {
    const firstRowY = uniqueYs[0];
    const firstRowItems = children.filter((c) => Math.abs(c.bounds.y - firstRowY) < 10);

    // Multiple items in first row suggests wrap
    if (firstRowItems.length >= 2 && uniqueYs.length >= 2) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Alignment Detection
// ============================================================================

/**
 * Detect horizontal alignment of children
 */
function detectHorizontalAlignment(
  children: NodeLayoutAnalysis[],
  parentBounds: BoundingBox
): HorizontalAlignment {
  if (children.length === 0) return "left";

  const leftEdges = children.map((c) => c.bounds.x - parentBounds.x);
  const rightEdges = children.map((c) => parentBounds.x + parentBounds.width - (c.bounds.x + c.bounds.width));
  const centers = children.map((c) => c.bounds.x + c.bounds.width / 2 - (parentBounds.x + parentBounds.width / 2));

  // Check for consistent left alignment
  const avgLeft = leftEdges.reduce((s, v) => s + v, 0) / leftEdges.length;
  const leftVariance = leftEdges.reduce((s, v) => s + Math.abs(v - avgLeft), 0) / leftEdges.length;

  // Check for consistent right alignment
  const avgRight = rightEdges.reduce((s, v) => s + v, 0) / rightEdges.length;
  const rightVariance = rightEdges.reduce((s, v) => s + Math.abs(v - avgRight), 0) / rightEdges.length;

  // Check for center alignment
  const avgCenter = centers.reduce((s, v) => s + v, 0) / centers.length;
  const centerVariance = centers.reduce((s, v) => s + Math.abs(v - avgCenter), 0) / centers.length;

  // Check for stretch (fills parent width)
  const isStretched = children.every((c) =>
    c.bounds.width / parentBounds.width >= THRESHOLDS.FULL_WIDTH_PERCENT
  );

  if (isStretched) return "stretch";

  const tolerance = parentBounds.width * 0.05;

  if (centerVariance < tolerance && Math.abs(avgCenter) < tolerance) return "center";
  if (leftVariance < tolerance) return "left";
  if (rightVariance < tolerance) return "right";

  return "mixed";
}

/**
 * Detect vertical alignment of children
 */
function detectVerticalAlignment(
  children: NodeLayoutAnalysis[],
  parentBounds: BoundingBox
): VerticalAlignment {
  if (children.length === 0) return "top";

  const topEdges = children.map((c) => c.bounds.y - parentBounds.y);
  const bottomEdges = children.map((c) => parentBounds.y + parentBounds.height - (c.bounds.y + c.bounds.height));
  const centers = children.map((c) => c.bounds.y + c.bounds.height / 2 - (parentBounds.y + parentBounds.height / 2));

  // Check for consistent top alignment
  const avgTop = topEdges.reduce((s, v) => s + v, 0) / topEdges.length;
  const topVariance = topEdges.reduce((s, v) => s + Math.abs(v - avgTop), 0) / topEdges.length;

  // Check for consistent bottom alignment
  const avgBottom = bottomEdges.reduce((s, v) => s + v, 0) / bottomEdges.length;
  const bottomVariance = bottomEdges.reduce((s, v) => s + Math.abs(v - avgBottom), 0) / bottomEdges.length;

  // Check for center alignment
  const avgCenter = centers.reduce((s, v) => s + v, 0) / centers.length;
  const centerVariance = centers.reduce((s, v) => s + Math.abs(v - avgCenter), 0) / centers.length;

  // Check for stretch
  const isStretched = children.every((c) =>
    c.bounds.height / parentBounds.height >= THRESHOLDS.FULL_HEIGHT_PERCENT
  );

  if (isStretched) return "stretch";

  const tolerance = parentBounds.height * 0.05;

  if (centerVariance < tolerance && Math.abs(avgCenter) < tolerance) return "center";
  if (topVariance < tolerance) return "top";
  if (bottomVariance < tolerance) return "bottom";

  return "mixed";
}

// ============================================================================
// Major Section Detection
// ============================================================================

/**
 * Detect major layout sections (header, footer, sidebar, main)
 */
function detectMajorSections(
  children: NodeLayoutAnalysis[],
  parentBounds: BoundingBox
): SectionAnalysis[] {
  const sections: SectionAnalysis[] = [];
  const usedNodeIds = new Set<string>();

  // Sort children by Y position for vertical scanning
  const sortedByY = [...children].sort((a, b) => a.bounds.y - b.bounds.y);

  // Detect header (top, full width)
  for (const child of sortedByY) {
    const relPos = calculateRelativePosition(child.bounds, parentBounds);

    if (
      relPos.topPercent < 0.05 &&
      relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&
      relPos.heightPercent <= THRESHOLDS.HEADER_MAX_HEIGHT_PERCENT
    ) {
      sections.push({
        role: "header",
        confidence: 0.9,
        bounds: child.bounds,
        nodeIds: [child.nodeId],
        childPattern: child.layoutPattern,
      });
      usedNodeIds.add(child.nodeId);
      break;
    }
  }

  // Detect footer (bottom, full width)
  for (let i = sortedByY.length - 1; i >= 0; i--) {
    const child = sortedByY[i];
    if (usedNodeIds.has(child.nodeId)) continue;

    const relPos = calculateRelativePosition(child.bounds, parentBounds);

    if (
      relPos.topPercent + relPos.heightPercent >= THRESHOLDS.FOOTER_MIN_Y_PERCENT &&
      relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT
    ) {
      const role: SemanticRole = child.bounds.height >= THRESHOLDS.TAB_BAR_HEIGHT_MIN &&
        child.bounds.height <= THRESHOLDS.TAB_BAR_HEIGHT_MAX ? "tab-bar" : "footer";

      sections.push({
        role,
        confidence: 0.9,
        bounds: child.bounds,
        nodeIds: [child.nodeId],
        childPattern: child.layoutPattern,
      });
      usedNodeIds.add(child.nodeId);
      break;
    }
  }

  // Sort remaining by X position for horizontal scanning
  const remainingByX = children
    .filter((c) => !usedNodeIds.has(c.nodeId))
    .sort((a, b) => a.bounds.x - b.bounds.x);

  // Detect sidebar (left or right edge, narrow, tall)
  for (const child of remainingByX) {
    const relPos = calculateRelativePosition(child.bounds, parentBounds);

    if (
      (relPos.leftPercent < 0.05 || relPos.leftPercent + relPos.widthPercent > 0.95) &&
      relPos.widthPercent <= THRESHOLDS.SIDEBAR_MAX_WIDTH_PERCENT &&
      relPos.heightPercent >= 0.5
    ) {
      sections.push({
        role: "sidebar",
        confidence: 0.85,
        bounds: child.bounds,
        nodeIds: [child.nodeId],
        childPattern: child.layoutPattern,
      });
      usedNodeIds.add(child.nodeId);
      break;
    }
  }

  // Remaining elements form main content
  const mainContentNodes = children.filter((c) => !usedNodeIds.has(c.nodeId));
  if (mainContentNodes.length > 0) {
    // Calculate combined bounds
    const minX = Math.min(...mainContentNodes.map((c) => c.bounds.x));
    const minY = Math.min(...mainContentNodes.map((c) => c.bounds.y));
    const maxX = Math.max(...mainContentNodes.map((c) => c.bounds.x + c.bounds.width));
    const maxY = Math.max(...mainContentNodes.map((c) => c.bounds.y + c.bounds.height));

    sections.push({
      role: "main-content",
      confidence: 0.7,
      bounds: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      nodeIds: mainContentNodes.map((c) => c.nodeId),
      childPattern: detectLayoutPattern(mainContentNodes, parentBounds),
    });
  }

  return sections;
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate suggested CSS properties based on layout analysis
 */
function generateSuggestedCSS(
  pattern: LayoutPattern,
  hAlign: HorizontalAlignment,
  vAlign: VerticalAlignment,
  children: NodeLayoutAnalysis[]
): SuggestedCSS {
  const css: SuggestedCSS = {
    display: "flex",
    additionalStyles: {},
  };

  switch (pattern) {
    case "horizontal-stack":
      css.display = "flex";
      css.flexDirection = "row";
      css.alignItems = mapAlignmentToCSS(vAlign, "vertical");
      css.justifyContent = mapAlignmentToCSS(hAlign, "horizontal");

      // Calculate gap if uniform
      const hGaps = calculateGaps(children, "horizontal");
      if (areGapsUniform(hGaps) && hGaps.length > 0) {
        const avgGap = calculateAverageGap(hGaps);
        if (avgGap > 0) {
          css.gap = `${Math.round(avgGap)}px`;
        }
      }
      break;

    case "vertical-stack":
      css.display = "flex";
      css.flexDirection = "column";
      css.alignItems = mapAlignmentToCSS(hAlign, "horizontal");
      css.justifyContent = mapAlignmentToCSS(vAlign, "vertical");

      // Calculate gap if uniform
      const vGaps = calculateGaps(children, "vertical");
      if (areGapsUniform(vGaps) && vGaps.length > 0) {
        const avgGap = calculateAverageGap(vGaps);
        if (avgGap > 0) {
          css.gap = `${Math.round(avgGap)}px`;
        }
      }
      break;

    case "grid":
      css.display = "grid";

      // Detect columns from unique X positions
      const xPositions = [...new Set(children.map((c) => Math.round(c.bounds.x)))].sort((a, b) => a - b);
      const numColumns = xPositions.length;

      if (numColumns > 0) {
        // Check if columns are equal width
        const columnWidths = children
          .filter((c) => Math.round(c.bounds.x) === xPositions[0])
          .map((c) => c.bounds.width);
        const avgWidth = columnWidths.reduce((s, w) => s + w, 0) / columnWidths.length;
        const widthVariance = columnWidths.reduce((s, w) => s + Math.abs(w - avgWidth), 0) / columnWidths.length;

        if (widthVariance < avgWidth * 0.1) {
          css.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
        } else {
          css.gridTemplateColumns = `repeat(${numColumns}, auto)`;
        }
      }

      // Calculate gap
      const gridHGaps = calculateGaps(children, "horizontal");
      const gridVGaps = calculateGaps(children, "vertical");
      const avgHGap = calculateAverageGap(gridHGaps);
      const avgVGap = calculateAverageGap(gridVGaps);

      if (Math.abs(avgHGap - avgVGap) < 5) {
        css.gap = `${Math.round((avgHGap + avgVGap) / 2)}px`;
      } else {
        css.gap = `${Math.round(avgVGap)}px ${Math.round(avgHGap)}px`;
      }
      break;

    case "centered":
      css.display = "flex";
      css.justifyContent = "center";
      css.alignItems = "center";
      break;

    case "split":
      css.display = "flex";
      css.flexDirection = children.length === 2 &&
        Math.abs(children[0].bounds.y - children[1].bounds.y) > children[0].bounds.height
          ? "column"
          : "row";
      break;

    case "wrap":
      css.display = "flex";
      css.flexDirection = "row";
      css.additionalStyles["flexWrap"] = "wrap";

      // Calculate gap
      const wrapHGaps = calculateGaps(children, "horizontal");
      if (areGapsUniform(wrapHGaps) && wrapHGaps.length > 0) {
        css.gap = `${Math.round(calculateAverageGap(wrapHGaps))}px`;
      }
      break;

    case "absolute":
    default:
      css.display = "block";
      css.position = "relative";
      break;
  }

  return css;
}

/**
 * Map alignment type to CSS value
 */
function mapAlignmentToCSS(alignment: HorizontalAlignment | VerticalAlignment, direction: "horizontal" | "vertical"): string {
  switch (alignment) {
    case "left":
    case "top":
      return direction === "horizontal" ? "flex-start" : "flex-start";
    case "center":
      return "center";
    case "right":
    case "bottom":
      return direction === "horizontal" ? "flex-end" : "flex-end";
    case "stretch":
      return "stretch";
    case "mixed":
    default:
      return "flex-start";
  }
}

/**
 * Generate structure suggestions for semantic HTML/JSX
 */
function generateStructureSuggestions(
  sections: SectionAnalysis[],
  children: NodeLayoutAnalysis[]
): StructureSuggestion[] {
  const suggestions: StructureSuggestion[] = [];

  for (const section of sections) {
    const element = mapRoleToElement(section.role);
    const cssClasses = mapRoleToCSSClasses(section.role, section.childPattern);

    suggestions.push({
      element,
      role: section.role,
      cssClasses,
    });
  }

  return suggestions;
}

/**
 * Map semantic role to HTML element
 */
function mapRoleToElement(role: SemanticRole): string {
  switch (role) {
    case "header":
      return "header";
    case "footer":
    case "tab-bar":
      return "footer";
    case "sidebar":
    case "navigation":
      return "nav";
    case "main-content":
      return "main";
    case "list":
      return "ul";
    case "list-item":
      return "li";
    case "form":
      return "form";
    case "modal":
      return "dialog";
    case "hero":
    case "content-section":
      return "section";
    case "card":
    case "card-grid":
    default:
      return "div";
  }
}

/**
 * Map semantic role to Tailwind CSS classes
 */
function mapRoleToCSSClasses(role: SemanticRole, pattern: LayoutPattern): string[] {
  const classes: string[] = [];

  // Role-specific classes
  switch (role) {
    case "header":
      classes.push("sticky", "top-0", "z-50");
      break;
    case "footer":
      classes.push("mt-auto");
      break;
    case "sidebar":
      classes.push("flex-shrink-0");
      break;
    case "main-content":
      classes.push("flex-1", "overflow-auto");
      break;
    case "card":
      classes.push("rounded-lg", "shadow");
      break;
    case "modal":
      classes.push("fixed", "inset-0", "z-50");
      break;
  }

  // Pattern-specific classes
  switch (pattern) {
    case "horizontal-stack":
      classes.push("flex", "flex-row");
      break;
    case "vertical-stack":
      classes.push("flex", "flex-col");
      break;
    case "grid":
      classes.push("grid");
      break;
    case "centered":
      classes.push("flex", "items-center", "justify-center");
      break;
  }

  return classes;
}

// ============================================================================
// Metadata Building
// ============================================================================

/**
 * Build metadata for a node analysis
 */
function buildMetadata(
  bounds: BoundingBox,
  parentBounds: BoundingBox | undefined,
  children: NodeLayoutAnalysis[]
): LayoutMetadata {
  const relPos = parentBounds
    ? calculateRelativePosition(bounds, parentBounds)
    : { topPercent: 0, leftPercent: 0, widthPercent: 1, heightPercent: 1 };

  const isFullWidth = relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT;
  const isFullHeight = relPos.heightPercent >= THRESHOLDS.FULL_HEIGHT_PERCENT;
  const hasUniformChildren = areChildrenUniform(children);

  // Calculate dominant direction
  const { isHorizontal, isVertical } = detectStackDirection(children);
  let dominantDirection: "horizontal" | "vertical" | undefined;
  if (isHorizontal && !isVertical) {
    dominantDirection = "horizontal";
  } else if (isVertical && !isHorizontal) {
    dominantDirection = "vertical";
  }

  // Calculate average gap
  let averageGap: number | undefined;
  if (dominantDirection) {
    const gaps = calculateGaps(children, dominantDirection);
    if (gaps.length > 0) {
      averageGap = calculateAverageGap(gaps);
    }
  }

  return {
    isFullWidth,
    isFullHeight,
    hasUniformChildren,
    childCount: children.length,
    averageGap,
    dominantDirection,
    aspectRatio: bounds.height !== 0 ? bounds.width / bounds.height : 1,
    relativePosition: relPos,
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Quick analysis for a single node - returns role and confidence
 */
export function quickAnalyze(node: FigmaNode, parentBounds?: BoundingBox): {
  role: SemanticRole;
  confidence: number;
  pattern: LayoutPattern;
} {
  const analysis = analyzeNodeLayout(node, parentBounds);
  return {
    role: analysis.semanticRole,
    confidence: analysis.confidence,
    pattern: analysis.layoutPattern,
  };
}

/**
 * Analyze and return flat list of all semantic roles in a tree
 */
export function flattenAnalysis(analysis: NodeLayoutAnalysis): Array<{
  nodeId: string;
  nodeName: string;
  role: SemanticRole;
  confidence: number;
}> {
  const results: Array<{
    nodeId: string;
    nodeName: string;
    role: SemanticRole;
    confidence: number;
  }> = [];

  function traverse(node: NodeLayoutAnalysis) {
    results.push({
      nodeId: node.nodeId,
      nodeName: node.nodeName,
      role: node.semanticRole,
      confidence: node.confidence,
    });

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(analysis);
  return results;
}

/**
 * Get CSS code snippet for a layout pattern
 */
export function getCSSForPattern(pattern: LayoutPattern, options?: {
  gap?: number;
  columns?: number;
}): string {
  const css: string[] = [];

  switch (pattern) {
    case "horizontal-stack":
      css.push("display: flex;");
      css.push("flex-direction: row;");
      if (options?.gap) css.push(`gap: ${options.gap}px;`);
      break;

    case "vertical-stack":
      css.push("display: flex;");
      css.push("flex-direction: column;");
      if (options?.gap) css.push(`gap: ${options.gap}px;`);
      break;

    case "grid":
      css.push("display: grid;");
      if (options?.columns) {
        css.push(`grid-template-columns: repeat(${options.columns}, 1fr);`);
      }
      if (options?.gap) css.push(`gap: ${options.gap}px;`);
      break;

    case "centered":
      css.push("display: flex;");
      css.push("justify-content: center;");
      css.push("align-items: center;");
      break;

    case "wrap":
      css.push("display: flex;");
      css.push("flex-wrap: wrap;");
      if (options?.gap) css.push(`gap: ${options.gap}px;`);
      break;

    case "absolute":
      css.push("position: relative;");
      break;
  }

  return css.join("\n");
}

/**
 * Get Tailwind classes for a layout pattern
 */
export function getTailwindForPattern(pattern: LayoutPattern, options?: {
  gap?: number;
  columns?: number;
}): string[] {
  const classes: string[] = [];

  switch (pattern) {
    case "horizontal-stack":
      classes.push("flex", "flex-row");
      break;

    case "vertical-stack":
      classes.push("flex", "flex-col");
      break;

    case "grid":
      classes.push("grid");
      if (options?.columns) {
        classes.push(`grid-cols-${options.columns}`);
      }
      break;

    case "centered":
      classes.push("flex", "items-center", "justify-center");
      break;

    case "wrap":
      classes.push("flex", "flex-wrap");
      break;

    case "absolute":
      classes.push("relative");
      break;
  }

  // Add gap classes (Tailwind uses scale)
  if (options?.gap) {
    const gapClass = mapGapToTailwind(options.gap);
    if (gapClass) classes.push(gapClass);
  }

  return classes;
}

/**
 * Map pixel gap to Tailwind gap class
 */
function mapGapToTailwind(gapPx: number): string | null {
  // Tailwind gap scale: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, etc.
  const gapScale: Record<number, string> = {
    0: "gap-0",
    4: "gap-1",
    8: "gap-2",
    12: "gap-3",
    16: "gap-4",
    20: "gap-5",
    24: "gap-6",
    32: "gap-8",
    40: "gap-10",
    48: "gap-12",
  };

  // Find closest match
  const closest = Object.keys(gapScale)
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - gapPx) < Math.abs(prev - gapPx) ? curr : prev
    );

  return gapScale[closest] || `gap-[${gapPx}px]`;
}
