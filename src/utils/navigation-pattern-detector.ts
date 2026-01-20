/**
 * Navigation Pattern Detector
 *
 * Identifies navigation patterns from Figma designs:
 * - Top navigation bars (horizontal menus)
 * - Sidebar navigation (vertical menus)
 * - Breadcrumbs
 * - Tab navigation
 * - Pagination controls
 *
 * Detects active states and hierarchy, generates semantic nav markup
 * with proper ARIA landmarks.
 */

import type { FigmaNode } from "./figma-api";
import {
  analyzeNodeLayout,
  type BoundingBox,
  type SemanticRole,
  type LayoutPattern,
} from "./layout-analyzer";
import {
  analyzeInteractiveElements,
  type InteractiveElementType,
  type InteractiveState,
  type InteractiveElementAnalysis,
} from "./figma-interactive-elements";

// ============================================================================
// Types
// ============================================================================

/**
 * Types of navigation patterns that can be detected
 */
export type NavigationPatternType =
  | "top-nav"
  | "sidebar-nav"
  | "breadcrumb"
  | "tabs"
  | "pagination"
  | "bottom-nav"
  | "mega-menu"
  | "dropdown-menu"
  | "nested-nav"
  | "unknown";

/**
 * ARIA landmark roles for navigation elements
 */
export type AriaLandmarkRole =
  | "navigation"
  | "menu"
  | "menubar"
  | "tablist"
  | "list"
  | "none";

/**
 * Navigation item representing a single link/button in navigation
 */
export interface NavigationItem {
  /** Unique identifier from Figma node */
  nodeId: string;
  /** Display label text */
  label: string;
  /** Whether this item is currently active/selected */
  isActive: boolean;
  /** Whether this item is disabled */
  isDisabled: boolean;
  /** Confidence of active state detection (0-1) */
  activeConfidence: number;
  /** Nested navigation items (for hierarchical nav) */
  children?: NavigationItem[];
  /** Level in navigation hierarchy (0 = top level) */
  level: number;
  /** Icon presence detected */
  hasIcon: boolean;
  /** Order in the navigation sequence */
  order: number;
  /** Bounding box for positioning */
  bounds: BoundingBox;
  /** Interactive element analysis if available */
  interactiveAnalysis?: InteractiveElementAnalysis;
}

/**
 * Complete navigation pattern analysis result
 */
export interface NavigationPatternAnalysis {
  /** Type of navigation pattern detected */
  patternType: NavigationPatternType;
  /** Confidence score for the pattern detection (0-1) */
  confidence: number;
  /** All navigation items detected */
  items: NavigationItem[];
  /** Currently active item(s) */
  activeItems: NavigationItem[];
  /** ARIA landmark role to use */
  ariaRole: AriaLandmarkRole;
  /** Suggested aria-label for the navigation */
  ariaLabel: string;
  /** Whether the navigation is responsive/mobile */
  isResponsive: boolean;
  /** Direction of navigation layout */
  direction: "horizontal" | "vertical";
  /** Maximum hierarchy depth */
  maxDepth: number;
  /** Total item count including nested */
  totalItemCount: number;
  /** Generated semantic markup */
  semanticMarkup: SemanticNavMarkup;
  /** Detection reasons for debugging */
  detectionReasons: string[];
  /** Source node information */
  sourceNode: {
    nodeId: string;
    nodeName: string;
    bounds: BoundingBox;
  };
}

/**
 * Semantic navigation markup structure
 */
export interface SemanticNavMarkup {
  /** HTML element to use (nav, ul, ol, div) */
  element: string;
  /** ARIA attributes to apply */
  ariaAttributes: Record<string, string | boolean>;
  /** Tailwind CSS classes */
  tailwindClasses: string[];
  /** Raw CSS styles (as fallback) */
  cssStyles: Record<string, string>;
  /** JSX code snippet */
  jsx: string;
  /** Child elements markup */
  children: SemanticNavItemMarkup[];
}

/**
 * Semantic markup for a single navigation item
 */
export interface SemanticNavItemMarkup {
  /** HTML element (li, a, button) */
  element: string;
  /** ARIA attributes */
  ariaAttributes: Record<string, string | boolean>;
  /** Tailwind classes */
  tailwindClasses: string[];
  /** CSS styles */
  cssStyles: Record<string, string>;
  /** Content/label */
  content: string;
  /** Whether it's a link or button */
  interactionType: "link" | "button" | "none";
  /** Nested children if any */
  children?: SemanticNavItemMarkup[];
}

/**
 * Result of analyzing navigation in a frame/document
 */
export interface NavigationAnalysisResult {
  /** All navigation patterns found */
  patterns: NavigationPatternAnalysis[];
  /** Statistics about navigation */
  stats: {
    totalPatterns: number;
    byType: Record<NavigationPatternType, number>;
    totalItems: number;
    activeItemCount: number;
    maxDepth: number;
  };
  /** Warnings during analysis */
  warnings: string[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Keywords for navigation pattern detection from names
 */
const NAVIGATION_KEYWORDS: Record<NavigationPatternType, string[]> = {
  "top-nav": [
    "header-nav",
    "top-nav",
    "topnav",
    "navbar",
    "main-nav",
    "primary-nav",
    "app-bar",
    "appbar",
    "menu-bar",
    "menubar",
  ],
  "sidebar-nav": [
    "sidebar",
    "side-nav",
    "sidenav",
    "left-nav",
    "drawer",
    "vertical-nav",
    "menu-panel",
    "nav-panel",
  ],
  breadcrumb: [
    "breadcrumb",
    "breadcrumbs",
    "crumbs",
    "crumb-trail",
    "path-nav",
    "page-path",
  ],
  tabs: [
    "tabs",
    "tab-bar",
    "tabbar",
    "tab-nav",
    "segments",
    "segment-control",
    "tab-list",
    "tablist",
  ],
  pagination: [
    "pagination",
    "pager",
    "page-nav",
    "page-control",
    "paginator",
    "page-numbers",
  ],
  "bottom-nav": [
    "bottom-nav",
    "bottom-bar",
    "bottomnav",
    "tab-bar-bottom",
    "footer-nav",
    "mobile-nav",
  ],
  "mega-menu": ["mega-menu", "megamenu", "mega-nav", "expanded-nav"],
  "dropdown-menu": [
    "dropdown",
    "drop-down",
    "submenu",
    "sub-menu",
    "popover-menu",
    "flyout",
  ],
  "nested-nav": [
    "nested-nav",
    "hierarchical",
    "tree-nav",
    "multi-level",
    "accordion-nav",
  ],
  unknown: [],
};

/**
 * Keywords indicating active state in node names
 */
const ACTIVE_STATE_KEYWORDS = [
  "active",
  "selected",
  "current",
  "on",
  "pressed",
  "highlighted",
  "focus",
  "checked",
  "enabled",
];

/**
 * Keywords indicating disabled state
 */
const DISABLED_STATE_KEYWORDS = [
  "disabled",
  "inactive",
  "unavailable",
  "greyed",
  "grayed",
  "dimmed",
];

/**
 * Thresholds for navigation detection
 */
const NAV_THRESHOLDS = {
  /** Maximum height for horizontal nav (pixels) */
  HORIZONTAL_NAV_MAX_HEIGHT: 100,
  /** Minimum width percentage for top nav */
  TOP_NAV_MIN_WIDTH_PERCENT: 0.6,
  /** Maximum width percentage for sidebar */
  SIDEBAR_MAX_WIDTH_PERCENT: 0.35,
  /** Minimum items for navigation */
  MIN_NAV_ITEMS: 2,
  /** Maximum items for tab bar */
  MAX_TAB_ITEMS: 10,
  /** Pagination minimum buttons */
  PAGINATION_MIN_ITEMS: 3,
  /** Breadcrumb separator detection tolerance */
  BREADCRUMB_GAP_TOLERANCE: 0.3,
  /** Active state confidence threshold */
  ACTIVE_CONFIDENCE_THRESHOLD: 0.6,
} as const;

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze a Figma frame for all navigation patterns
 */
export function analyzeNavigationPatterns(
  rootNode: FigmaNode,
  fileComponents?: Record<
    string,
    { name: string; description: string; componentSetId?: string }
  >,
  fileComponentSets?: Record<string, { name: string; description: string }>
): NavigationAnalysisResult {
  const patterns: NavigationPatternAnalysis[] = [];
  const warnings: string[] = [];

  // Traverse and find navigation candidates
  traverseForNavigationPatterns(
    rootNode,
    patterns,
    warnings,
    fileComponents,
    fileComponentSets
  );

  // Calculate statistics
  const stats = calculateNavigationStats(patterns);

  return {
    patterns,
    stats,
    warnings,
  };
}

/**
 * Analyze a single node for navigation patterns
 */
export function analyzeNavigationNode(
  node: FigmaNode,
  parentBounds?: BoundingBox,
  fileComponents?: Record<
    string,
    { name: string; description: string; componentSetId?: string }
  >,
  fileComponentSets?: Record<string, { name: string; description: string }>
): NavigationPatternAnalysis | null {
  const bounds = extractBounds(node);

  // Calculate navigation pattern score
  const patternScore = calculateNavigationScore(node, bounds, parentBounds);

  // Minimum threshold to be considered navigation
  if (patternScore.score < 0.4) {
    return null;
  }

  // Detect the specific pattern type
  const { patternType, confidence, reasons } = detectPatternType(
    node,
    bounds,
    parentBounds,
    patternScore
  );

  // Extract navigation items
  const items = extractNavigationItems(
    node,
    patternType,
    fileComponents,
    fileComponentSets
  );

  // If no items found, skip
  if (items.length < NAV_THRESHOLDS.MIN_NAV_ITEMS) {
    return null;
  }

  // Detect active items
  const activeItems = items.filter((item) => item.isActive);

  // Determine ARIA role and label
  const { ariaRole, ariaLabel } = determineAriaProperties(patternType, node);

  // Calculate direction and responsiveness
  const direction = determineDirection(items, bounds);
  const isResponsive = detectResponsiveness(node, patternType);

  // Calculate hierarchy depth
  const maxDepth = calculateMaxDepth(items);
  const totalItemCount = countAllItems(items);

  // Generate semantic markup
  const semanticMarkup = generateSemanticMarkup(
    patternType,
    items,
    ariaRole,
    ariaLabel,
    direction
  );

  return {
    patternType,
    confidence,
    items,
    activeItems,
    ariaRole,
    ariaLabel,
    isResponsive,
    direction,
    maxDepth,
    totalItemCount,
    semanticMarkup,
    detectionReasons: reasons,
    sourceNode: {
      nodeId: node.id,
      nodeName: node.name,
      bounds,
    },
  };
}

// ============================================================================
// Pattern Type Detection
// ============================================================================

/**
 * Detect the specific navigation pattern type
 */
function detectPatternType(
  node: FigmaNode,
  bounds: BoundingBox,
  parentBounds: BoundingBox | undefined,
  navScore: { score: number; reasons: string[] }
): { patternType: NavigationPatternType; confidence: number; reasons: string[] } {
  const scores: Array<{
    type: NavigationPatternType;
    score: number;
    reason: string;
  }> = [];
  const lowerName = node.name.toLowerCase();

  // Score from name keywords
  for (const [type, keywords] of Object.entries(NAVIGATION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        const isExact =
          lowerName === keyword ||
          lowerName.startsWith(keyword + "-") ||
          lowerName.endsWith("-" + keyword);
        scores.push({
          type: type as NavigationPatternType,
          score: isExact ? 3 : 2,
          reason: `Name contains "${keyword}"`,
        });
        break;
      }
    }
  }

  // Score from position
  if (parentBounds) {
    const relPos = calculateRelativePosition(bounds, parentBounds);

    // Top nav: at top, wide
    if (
      relPos.topPercent < 0.1 &&
      relPos.widthPercent >= NAV_THRESHOLDS.TOP_NAV_MIN_WIDTH_PERCENT &&
      bounds.height <= NAV_THRESHOLDS.HORIZONTAL_NAV_MAX_HEIGHT
    ) {
      scores.push({ type: "top-nav", score: 2, reason: "Positioned at top, wide" });
    }

    // Sidebar: on side, narrow, tall
    if (
      (relPos.leftPercent < 0.05 || relPos.leftPercent + relPos.widthPercent > 0.95) &&
      relPos.widthPercent <= NAV_THRESHOLDS.SIDEBAR_MAX_WIDTH_PERCENT &&
      relPos.heightPercent >= 0.5
    ) {
      scores.push({ type: "sidebar-nav", score: 2, reason: "Positioned on side, narrow" });
    }

    // Bottom nav: at bottom, wide
    if (
      relPos.topPercent + relPos.heightPercent >= 0.9 &&
      relPos.widthPercent >= NAV_THRESHOLDS.TOP_NAV_MIN_WIDTH_PERCENT &&
      bounds.height <= NAV_THRESHOLDS.HORIZONTAL_NAV_MAX_HEIGHT
    ) {
      scores.push({ type: "bottom-nav", score: 2, reason: "Positioned at bottom, wide" });
    }
  }

  // Score from visual characteristics
  const children = node.children || [];
  const childBounds = children
    .filter((c) => c.absoluteBoundingBox)
    .map((c) => extractBounds(c));

  // Breadcrumb detection: horizontal, small items with separators
  if (
    childBounds.length >= 2 &&
    bounds.height <= 40 &&
    detectBreadcrumbPattern(children, childBounds)
  ) {
    scores.push({ type: "breadcrumb", score: 2.5, reason: "Horizontal with separators" });
  }

  // Tab detection: horizontal, similar-sized items
  if (
    childBounds.length >= 2 &&
    childBounds.length <= NAV_THRESHOLDS.MAX_TAB_ITEMS &&
    bounds.height <= 60 &&
    areSimilarSized(childBounds)
  ) {
    scores.push({ type: "tabs", score: 1.5, reason: "Horizontal, uniform items" });
  }

  // Pagination detection: contains numbers or arrows
  if (detectPaginationPattern(children)) {
    scores.push({ type: "pagination", score: 2.5, reason: "Contains page indicators" });
  }

  // Aggregate scores
  const typeScores = new Map<
    NavigationPatternType,
    { total: number; reasons: string[] }
  >();

  for (const { type, score, reason } of scores) {
    const existing = typeScores.get(type) || { total: 0, reasons: [] };
    existing.total += score;
    existing.reasons.push(reason);
    typeScores.set(type, existing);
  }

  // Find best type
  let bestType: NavigationPatternType = "unknown";
  let bestScore = 0;
  let bestReasons: string[] = [];

  typeScores.forEach(({ total, reasons }, type) => {
    if (total > bestScore) {
      bestType = type;
      bestScore = total;
      bestReasons = reasons;
    }
  });

  // Normalize confidence
  const confidence = Math.min(bestScore / 4, 1);

  return {
    patternType: bestType,
    confidence,
    reasons: [...navScore.reasons, ...bestReasons],
  };
}

/**
 * Calculate navigation likelihood score for a node
 */
function calculateNavigationScore(
  node: FigmaNode,
  bounds: BoundingBox,
  parentBounds?: BoundingBox
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const lowerName = node.name.toLowerCase();

  // Check for navigation-related names
  const navKeywords = [
    "nav",
    "menu",
    "tabs",
    "breadcrumb",
    "pagination",
    "links",
    "bar",
  ];
  for (const keyword of navKeywords) {
    if (lowerName.includes(keyword)) {
      score += 0.5;
      reasons.push(`Name contains "${keyword}"`);
    }
  }

  // Check node type
  if (node.type === "COMPONENT" || node.type === "INSTANCE") {
    score += 0.2;
    reasons.push("Is a component");
  }

  // Check for multiple clickable children
  const children = node.children || [];
  const clickableChildren = children.filter((c) =>
    isLikelyClickable(c.name, c.type)
  ).length;

  if (clickableChildren >= NAV_THRESHOLDS.MIN_NAV_ITEMS) {
    score += 0.4;
    reasons.push(`Has ${clickableChildren} clickable children`);
  }

  // Check for horizontal or vertical arrangement
  if (children.length >= 2) {
    const isArranged = detectArrangement(children);
    if (isArranged.isHorizontal || isArranged.isVertical) {
      score += 0.3;
      reasons.push(`Children are ${isArranged.isHorizontal ? "horizontal" : "vertical"}`);
    }
  }

  return { score, reasons };
}

// ============================================================================
// Navigation Item Extraction
// ============================================================================

/**
 * Extract navigation items from a navigation node
 */
function extractNavigationItems(
  node: FigmaNode,
  patternType: NavigationPatternType,
  fileComponents?: Record<
    string,
    { name: string; description: string; componentSetId?: string }
  >,
  fileComponentSets?: Record<string, { name: string; description: string }>
): NavigationItem[] {
  const items: NavigationItem[] = [];
  const children = node.children || [];

  // Get interactive elements analysis
  const interactiveResult = analyzeInteractiveElements(
    node,
    fileComponents,
    fileComponentSets
  );

  // Map interactive elements by node ID
  const interactiveMap = new Map<string, InteractiveElementAnalysis>();
  for (const element of interactiveResult.elements) {
    interactiveMap.set(element.nodeId, element);
  }

  // Extract items based on pattern type
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const childBounds = extractBounds(child);

    // Skip separators and decorative elements
    if (isSeparatorOrDecorative(child)) {
      continue;
    }

    // Get interactive analysis if available
    const interactiveAnalysis = interactiveMap.get(child.id);

    // Detect active and disabled states
    const { isActive, activeConfidence } = detectActiveState(
      child,
      interactiveAnalysis
    );
    const isDisabled = detectDisabledState(child, interactiveAnalysis);

    // Extract label
    const label = extractLabel(child);

    // Check for icon
    const hasIcon = detectIconPresence(child);

    // Extract nested items for hierarchical nav
    const nestedItems =
      patternType === "nested-nav" || patternType === "sidebar-nav"
        ? extractNestedItems(child, 1, fileComponents, fileComponentSets)
        : undefined;

    items.push({
      nodeId: child.id,
      label,
      isActive,
      isDisabled,
      activeConfidence,
      children: nestedItems,
      level: 0,
      hasIcon,
      order: i,
      bounds: childBounds,
      interactiveAnalysis,
    });
  }

  return items;
}

/**
 * Extract nested navigation items recursively
 */
function extractNestedItems(
  node: FigmaNode,
  level: number,
  fileComponents?: Record<
    string,
    { name: string; description: string; componentSetId?: string }
  >,
  fileComponentSets?: Record<string, { name: string; description: string }>,
  maxLevel = 4
): NavigationItem[] | undefined {
  if (level > maxLevel) return undefined;

  const children = node.children || [];
  const nestedItems: NavigationItem[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Skip non-interactive or decorative elements
    if (!isLikelyNavItem(child)) {
      continue;
    }

    const { isActive, activeConfidence } = detectActiveState(child);
    const isDisabled = detectDisabledState(child);
    const label = extractLabel(child);
    const hasIcon = detectIconPresence(child);
    const childBounds = extractBounds(child);

    const deeperNested = extractNestedItems(
      child,
      level + 1,
      fileComponents,
      fileComponentSets,
      maxLevel
    );

    nestedItems.push({
      nodeId: child.id,
      label,
      isActive,
      isDisabled,
      activeConfidence,
      children: deeperNested,
      level,
      hasIcon,
      order: i,
      bounds: childBounds,
    });
  }

  return nestedItems.length > 0 ? nestedItems : undefined;
}

// ============================================================================
// State Detection
// ============================================================================

/**
 * Detect if a navigation item is currently active/selected
 */
function detectActiveState(
  node: FigmaNode,
  interactiveAnalysis?: InteractiveElementAnalysis
): { isActive: boolean; activeConfidence: number } {
  let confidence = 0;
  const lowerName = node.name.toLowerCase();

  // Check name for active keywords
  for (const keyword of ACTIVE_STATE_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      confidence += 0.5;
      break;
    }
  }

  // Check component properties
  if (node.componentProperties) {
    for (const [propName, propValue] of Object.entries(node.componentProperties)) {
      const lowerPropName = propName.toLowerCase();
      const valueStr = String(propValue.value).toLowerCase();

      // Check for state property with active value
      if (
        (lowerPropName.includes("state") ||
          lowerPropName.includes("active") ||
          lowerPropName.includes("selected")) &&
        (valueStr === "true" ||
          valueStr === "on" ||
          valueStr === "active" ||
          valueStr === "selected")
      ) {
        confidence += 0.6;
      }
    }
  }

  // Check interactive analysis
  if (interactiveAnalysis) {
    const activeStates: InteractiveState[] = [
      "active",
      "selected",
      "checked",
      "pressed",
    ];
    if (activeStates.includes(interactiveAnalysis.currentState)) {
      confidence += 0.4;
    }
  }

  // Visual hints (if we can detect visual differences)
  // This would need more sophisticated analysis in production
  if (hasVisualActiveIndicators(node)) {
    confidence += 0.3;
  }

  const isActive = confidence >= NAV_THRESHOLDS.ACTIVE_CONFIDENCE_THRESHOLD;

  return { isActive, activeConfidence: Math.min(confidence, 1) };
}

/**
 * Detect if a navigation item is disabled
 */
function detectDisabledState(
  node: FigmaNode,
  interactiveAnalysis?: InteractiveElementAnalysis
): boolean {
  const lowerName = node.name.toLowerCase();

  // Check name
  for (const keyword of DISABLED_STATE_KEYWORDS) {
    if (lowerName.includes(keyword)) {
      return true;
    }
  }

  // Check component properties
  if (node.componentProperties) {
    for (const [propName, propValue] of Object.entries(node.componentProperties)) {
      const lowerPropName = propName.toLowerCase();
      const valueStr = String(propValue.value).toLowerCase();

      if (
        lowerPropName.includes("disabled") ||
        (lowerPropName.includes("state") && valueStr === "disabled")
      ) {
        return true;
      }
    }
  }

  // Check interactive analysis
  if (interactiveAnalysis?.currentState === "disabled") {
    return true;
  }

  return false;
}

/**
 * Check for visual active state indicators
 */
function hasVisualActiveIndicators(node: FigmaNode): boolean {
  // Check for fills that might indicate selection
  if (node.fills && Array.isArray(node.fills)) {
    for (const fill of node.fills as Array<{ visible?: boolean; type?: string }>) {
      if (fill.visible !== false && fill.type === "SOLID") {
        // Active items often have more prominent fills
        return true;
      }
    }
  }

  // Check for strokes/borders indicating selection
  if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
    return true;
  }

  // Check for effects (like shadows) indicating elevation
  if (node.effects && Array.isArray(node.effects)) {
    for (const effect of node.effects as Array<{ visible?: boolean; type?: string }>) {
      if (effect.visible !== false && effect.type === "DROP_SHADOW") {
        return true;
      }
    }
  }

  return false;
}

// ============================================================================
// ARIA and Semantic Markup Generation
// ============================================================================

/**
 * Determine ARIA role and label for navigation pattern
 */
function determineAriaProperties(
  patternType: NavigationPatternType,
  node: FigmaNode
): { ariaRole: AriaLandmarkRole; ariaLabel: string } {
  const nodeName = node.name;

  switch (patternType) {
    case "top-nav":
      return {
        ariaRole: "navigation",
        ariaLabel: "Main navigation",
      };

    case "sidebar-nav":
      return {
        ariaRole: "navigation",
        ariaLabel: "Sidebar navigation",
      };

    case "bottom-nav":
      return {
        ariaRole: "navigation",
        ariaLabel: "Bottom navigation",
      };

    case "breadcrumb":
      return {
        ariaRole: "navigation",
        ariaLabel: "Breadcrumb",
      };

    case "tabs":
      return {
        ariaRole: "tablist",
        ariaLabel: extractAriaLabel(nodeName, "Tabs"),
      };

    case "pagination":
      return {
        ariaRole: "navigation",
        ariaLabel: "Pagination",
      };

    case "mega-menu":
    case "dropdown-menu":
      return {
        ariaRole: "menu",
        ariaLabel: extractAriaLabel(nodeName, "Menu"),
      };

    case "nested-nav":
      return {
        ariaRole: "navigation",
        ariaLabel: extractAriaLabel(nodeName, "Navigation"),
      };

    default:
      return {
        ariaRole: "navigation",
        ariaLabel: extractAriaLabel(nodeName, "Navigation"),
      };
  }
}

/**
 * Generate semantic navigation markup
 */
function generateSemanticMarkup(
  patternType: NavigationPatternType,
  items: NavigationItem[],
  ariaRole: AriaLandmarkRole,
  ariaLabel: string,
  direction: "horizontal" | "vertical"
): SemanticNavMarkup {
  const isHorizontal = direction === "horizontal";

  // Determine wrapper element
  const wrapperElement = getWrapperElement(patternType, ariaRole);

  // Build ARIA attributes
  const ariaAttributes: Record<string, string | boolean> = {
    "aria-label": ariaLabel,
  };

  if (ariaRole !== "navigation") {
    ariaAttributes.role = ariaRole;
  }

  // Build Tailwind classes
  const tailwindClasses = getTailwindClasses(patternType, isHorizontal);

  // Build CSS styles
  const cssStyles = getCSSStyles(patternType, isHorizontal);

  // Generate children markup
  const children = generateItemsMarkup(patternType, items);

  // Generate JSX
  const jsx = generateJSX(
    wrapperElement,
    ariaAttributes,
    tailwindClasses,
    children,
    patternType
  );

  return {
    element: wrapperElement,
    ariaAttributes,
    tailwindClasses,
    cssStyles,
    jsx,
    children,
  };
}

/**
 * Get wrapper element for pattern type
 */
function getWrapperElement(
  patternType: NavigationPatternType,
  ariaRole: AriaLandmarkRole
): string {
  switch (patternType) {
    case "tabs":
      return "div"; // Using div with role="tablist"
    case "pagination":
      return "nav";
    case "mega-menu":
    case "dropdown-menu":
      return "div"; // Using div with role="menu"
    default:
      return "nav";
  }
}

/**
 * Get Tailwind classes for pattern type
 */
function getTailwindClasses(
  patternType: NavigationPatternType,
  isHorizontal: boolean
): string[] {
  const classes: string[] = [];

  // Base flex classes
  classes.push("flex");
  classes.push(isHorizontal ? "flex-row" : "flex-col");

  // Pattern-specific classes
  switch (patternType) {
    case "top-nav":
      classes.push("items-center", "gap-4", "px-4", "py-2");
      break;

    case "sidebar-nav":
      classes.push("gap-1", "p-2");
      break;

    case "bottom-nav":
      classes.push(
        "items-center",
        "justify-around",
        "border-t",
        "bg-background",
        "px-2",
        "py-1"
      );
      break;

    case "breadcrumb":
      classes.push("items-center", "gap-2", "text-sm");
      break;

    case "tabs":
      classes.push("items-center", "gap-1", "border-b");
      break;

    case "pagination":
      classes.push("items-center", "gap-1");
      break;

    default:
      classes.push("items-center", "gap-2");
  }

  return classes;
}

/**
 * Get CSS styles for pattern type
 */
function getCSSStyles(
  patternType: NavigationPatternType,
  isHorizontal: boolean
): Record<string, string> {
  const styles: Record<string, string> = {
    display: "flex",
    "flex-direction": isHorizontal ? "row" : "column",
  };

  switch (patternType) {
    case "top-nav":
      styles["align-items"] = "center";
      styles["gap"] = "1rem";
      styles["padding"] = "0.5rem 1rem";
      break;

    case "sidebar-nav":
      styles["gap"] = "0.25rem";
      styles["padding"] = "0.5rem";
      break;

    case "breadcrumb":
      styles["align-items"] = "center";
      styles["gap"] = "0.5rem";
      styles["font-size"] = "0.875rem";
      break;

    case "tabs":
      styles["align-items"] = "center";
      styles["gap"] = "0.25rem";
      styles["border-bottom"] = "1px solid var(--border)";
      break;

    case "pagination":
      styles["align-items"] = "center";
      styles["gap"] = "0.25rem";
      break;
  }

  return styles;
}

/**
 * Generate markup for navigation items
 */
function generateItemsMarkup(
  patternType: NavigationPatternType,
  items: NavigationItem[]
): SemanticNavItemMarkup[] {
  return items.map((item, index) => {
    const itemMarkup = generateSingleItemMarkup(patternType, item, index, items.length);
    return itemMarkup;
  });
}

/**
 * Generate markup for a single navigation item
 */
function generateSingleItemMarkup(
  patternType: NavigationPatternType,
  item: NavigationItem,
  index: number,
  totalItems: number
): SemanticNavItemMarkup {
  const ariaAttributes: Record<string, string | boolean> = {};
  const tailwindClasses: string[] = [];
  const cssStyles: Record<string, string> = {};

  let element: string;
  let interactionType: "link" | "button" | "none";

  // Determine element and interaction type based on pattern
  switch (patternType) {
    case "tabs":
      element = "button";
      interactionType = "button";
      ariaAttributes.role = "tab";
      ariaAttributes["aria-selected"] = item.isActive;
      tailwindClasses.push(
        "px-4",
        "py-2",
        "font-medium",
        "transition-colors",
        "border-b-2",
        "border-transparent"
      );
      if (item.isActive) {
        tailwindClasses.push("border-primary", "text-primary");
      } else {
        tailwindClasses.push("hover:text-foreground/80");
      }
      break;

    case "breadcrumb":
      if (index === totalItems - 1) {
        // Last item is current page
        element = "span";
        interactionType = "none";
        ariaAttributes["aria-current"] = "page";
        tailwindClasses.push("text-foreground", "font-medium");
      } else {
        element = "a";
        interactionType = "link";
        tailwindClasses.push(
          "text-muted-foreground",
          "hover:text-foreground",
          "transition-colors"
        );
      }
      break;

    case "pagination":
      element = "button";
      interactionType = "button";
      tailwindClasses.push(
        "min-w-[2rem]",
        "h-8",
        "rounded",
        "flex",
        "items-center",
        "justify-center"
      );
      if (item.isActive) {
        ariaAttributes["aria-current"] = "page";
        tailwindClasses.push("bg-primary", "text-primary-foreground");
      } else {
        tailwindClasses.push("hover:bg-muted");
      }
      break;

    case "sidebar-nav":
      element = "a";
      interactionType = "link";
      tailwindClasses.push(
        "flex",
        "items-center",
        "gap-3",
        "rounded-lg",
        "px-3",
        "py-2",
        "transition-colors"
      );
      if (item.isActive) {
        ariaAttributes["aria-current"] = "page";
        tailwindClasses.push("bg-muted", "text-foreground");
      } else {
        tailwindClasses.push("text-muted-foreground", "hover:bg-muted", "hover:text-foreground");
      }
      break;

    case "bottom-nav":
      element = "a";
      interactionType = "link";
      tailwindClasses.push(
        "flex",
        "flex-col",
        "items-center",
        "gap-1",
        "py-2",
        "px-4",
        "text-xs"
      );
      if (item.isActive) {
        ariaAttributes["aria-current"] = "page";
        tailwindClasses.push("text-primary");
      } else {
        tailwindClasses.push("text-muted-foreground");
      }
      break;

    default:
      // top-nav and others
      element = "a";
      interactionType = "link";
      tailwindClasses.push(
        "px-3",
        "py-2",
        "rounded-md",
        "transition-colors",
        "font-medium"
      );
      if (item.isActive) {
        ariaAttributes["aria-current"] = "page";
        tailwindClasses.push("bg-muted", "text-foreground");
      } else {
        tailwindClasses.push("text-muted-foreground", "hover:text-foreground");
      }
  }

  // Handle disabled state
  if (item.isDisabled) {
    ariaAttributes["aria-disabled"] = true;
    tailwindClasses.push("opacity-50", "pointer-events-none");
  }

  // Generate nested children if present
  const children = item.children
    ? item.children.map((child, i) =>
        generateSingleItemMarkup(patternType, child, i, item.children!.length)
      )
    : undefined;

  return {
    element,
    ariaAttributes,
    tailwindClasses,
    cssStyles,
    content: item.label,
    interactionType,
    children,
  };
}

/**
 * Generate JSX code for the navigation
 */
function generateJSX(
  element: string,
  ariaAttributes: Record<string, string | boolean>,
  tailwindClasses: string[],
  children: SemanticNavItemMarkup[],
  patternType: NavigationPatternType
): string {
  const lines: string[] = [];
  const indent = "  ";

  // Build attribute string
  const attrs: string[] = [];
  for (const [key, value] of Object.entries(ariaAttributes)) {
    if (typeof value === "boolean") {
      if (value) attrs.push(`${key}`);
    } else {
      attrs.push(`${key}="${value}"`);
    }
  }

  const classAttr = `className="${tailwindClasses.join(" ")}"`;
  attrs.push(classAttr);

  const attrStr = attrs.join(" ");

  // Open tag
  lines.push(`<${element} ${attrStr}>`);

  // Add breadcrumb separator note
  if (patternType === "breadcrumb") {
    lines.push(`${indent}{/* Note: Add separators (e.g., ChevronRight) between items */}`);
  }

  // Children as list for semantic nav
  if (patternType !== "tabs" && patternType !== "breadcrumb") {
    lines.push(`${indent}<ul className="flex ${patternType === "sidebar-nav" ? "flex-col" : "flex-row"} list-none m-0 p-0">`);
  }

  for (const child of children) {
    const childJsx = generateItemJSX(child, patternType, patternType !== "tabs" && patternType !== "breadcrumb");
    lines.push(childJsx);
  }

  if (patternType !== "tabs" && patternType !== "breadcrumb") {
    lines.push(`${indent}</ul>`);
  }

  // Close tag
  lines.push(`</${element}>`);

  return lines.join("\n");
}

/**
 * Generate JSX for a single item
 */
function generateItemJSX(
  item: SemanticNavItemMarkup,
  patternType: NavigationPatternType,
  wrapInLi: boolean
): string {
  const indent = wrapInLi ? "      " : "    ";

  // Build attributes
  const attrs: string[] = [];
  for (const [key, value] of Object.entries(item.ariaAttributes)) {
    if (typeof value === "boolean") {
      if (value) attrs.push(`${key}`);
    } else {
      attrs.push(`${key}="${value}"`);
    }
  }
  attrs.push(`className="${item.tailwindClasses.join(" ")}"`);

  if (item.interactionType === "link") {
    attrs.push('href="#"');
  } else if (item.interactionType === "button") {
    attrs.push('type="button"');
  }

  const attrStr = attrs.join(" ");

  if (wrapInLi) {
    return `    <li>\n${indent}<${item.element} ${attrStr}>${item.content}</${item.element}>\n    </li>`;
  }

  return `${indent}<${item.element} ${attrStr}>${item.content}</${item.element}>`;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract bounding box from Figma node
 */
function extractBounds(node: FigmaNode): BoundingBox {
  const bbox = node.absoluteBoundingBox;
  return bbox
    ? { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height }
    : { x: 0, y: 0, width: 0, height: 0 };
}

/**
 * Calculate relative position within parent
 */
function calculateRelativePosition(
  bounds: BoundingBox,
  parentBounds: BoundingBox
): { topPercent: number; leftPercent: number; widthPercent: number; heightPercent: number } {
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
 * Check if node is likely a separator or decorative element
 */
function isSeparatorOrDecorative(node: FigmaNode): boolean {
  const lowerName = node.name.toLowerCase();

  // Check for separator keywords
  const separatorKeywords = [
    "separator",
    "divider",
    "line",
    "chevron",
    "arrow",
    "slash",
    "pipe",
    "/",
    ">",
    "|",
  ];

  for (const keyword of separatorKeywords) {
    if (lowerName.includes(keyword) || lowerName === keyword) {
      return true;
    }
  }

  // Check for very small elements (likely separators)
  const bounds = extractBounds(node);
  if (bounds.width < 10 && bounds.height < 10) {
    return true;
  }

  // Check for vector/line types
  if (node.type === "VECTOR" || node.type === "LINE") {
    return true;
  }

  return false;
}

/**
 * Check if element is likely a navigation item
 */
function isLikelyNavItem(node: FigmaNode): boolean {
  // Skip separators
  if (isSeparatorOrDecorative(node)) {
    return false;
  }

  // Check if clickable
  if (isLikelyClickable(node.name, node.type)) {
    return true;
  }

  // Check for text content
  if (node.type === "TEXT" || hasTextChildren(node)) {
    return true;
  }

  return false;
}

/**
 * Check if node likely has text children
 */
function hasTextChildren(node: FigmaNode): boolean {
  const children = node.children || [];
  return children.some(
    (c) => c.type === "TEXT" || (c.children && hasTextChildren(c))
  );
}

/**
 * Check if element is likely clickable
 */
function isLikelyClickable(name: string, nodeType: string): boolean {
  const lowerName = name.toLowerCase();

  // Check type
  if (
    nodeType === "INSTANCE" ||
    nodeType === "COMPONENT" ||
    nodeType === "FRAME"
  ) {
    // Check name for interactive keywords
    const clickableKeywords = [
      "button",
      "link",
      "item",
      "tab",
      "option",
      "nav-item",
      "menu-item",
    ];
    for (const keyword of clickableKeywords) {
      if (lowerName.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extended Figma node with text characters (for TEXT nodes)
 */
interface FigmaTextNode extends FigmaNode {
  characters?: string;
}

/**
 * Extract text label from node
 */
function extractLabel(node: FigmaNode): string {
  // Cast to text node to check for characters property
  const textNode = node as FigmaTextNode;

  // Check for direct text content
  if (node.type === "TEXT" && textNode.characters) {
    return textNode.characters;
  }

  // Search children for text
  const children = node.children || [];
  for (const child of children) {
    const childTextNode = child as FigmaTextNode;
    if (child.type === "TEXT" && childTextNode.characters) {
      return childTextNode.characters;
    }

    // Recurse one level
    const grandchildren = child.children || [];
    for (const grandchild of grandchildren) {
      const grandchildTextNode = grandchild as FigmaTextNode;
      if (grandchild.type === "TEXT" && grandchildTextNode.characters) {
        return grandchildTextNode.characters;
      }
    }
  }

  // Fallback to node name (cleaned up)
  return cleanNodeName(node.name);
}

/**
 * Clean node name for display
 */
function cleanNodeName(name: string): string {
  // Remove common prefixes/suffixes
  let cleaned = name
    .replace(/^(nav-|menu-|tab-|item-)/i, "")
    .replace(/(-item|-link|-button)$/i, "")
    .replace(/[-_]/g, " ")
    .trim();

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Detect icon presence in node
 */
function detectIconPresence(node: FigmaNode): boolean {
  const lowerName = node.name.toLowerCase();

  // Check name
  if (lowerName.includes("icon")) {
    return true;
  }

  // Check children
  const children = node.children || [];
  for (const child of children) {
    const childName = child.name.toLowerCase();
    if (
      childName.includes("icon") ||
      child.type === "VECTOR" ||
      child.type === "STAR" ||
      child.type === "POLYGON"
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Detect breadcrumb pattern (horizontal with separators)
 */
function detectBreadcrumbPattern(
  children: FigmaNode[],
  bounds: BoundingBox[]
): boolean {
  if (children.length < 2) return false;

  // Check for separator-like elements
  let separatorCount = 0;
  let itemCount = 0;

  for (const child of children) {
    if (isSeparatorOrDecorative(child)) {
      separatorCount++;
    } else {
      itemCount++;
    }
  }

  // Breadcrumbs typically have separators between items
  // n items = n-1 separators approximately
  if (itemCount >= 2 && separatorCount >= itemCount - 1) {
    return true;
  }

  // Or check for uniform horizontal spacing with arrow-like names
  return children.some(
    (c) =>
      c.name.toLowerCase().includes("chevron") ||
      c.name.toLowerCase().includes("arrow") ||
      c.name.includes(">") ||
      c.name.includes("/")
  );
}

/**
 * Detect pagination pattern
 */
function detectPaginationPattern(children: FigmaNode[]): boolean {
  if (children.length < NAV_THRESHOLDS.PAGINATION_MIN_ITEMS) return false;

  let numberCount = 0;
  let arrowCount = 0;

  for (const child of children) {
    const lowerName = child.name.toLowerCase();
    const label = extractLabel(child);

    // Check for numbers
    if (/^\d+$/.test(label) || /^\d+$/.test(child.name)) {
      numberCount++;
    }

    // Check for arrows/prev/next
    if (
      lowerName.includes("prev") ||
      lowerName.includes("next") ||
      lowerName.includes("arrow") ||
      lowerName.includes("first") ||
      lowerName.includes("last") ||
      label === "<" ||
      label === ">" ||
      label === "←" ||
      label === "→"
    ) {
      arrowCount++;
    }
  }

  // Has numbers and/or navigation arrows
  return numberCount >= 2 || (numberCount >= 1 && arrowCount >= 1);
}

/**
 * Check if bounds are similar sized
 */
function areSimilarSized(bounds: BoundingBox[]): boolean {
  if (bounds.length < 2) return true;

  const areas = bounds.map((b) => b.width * b.height);
  const avgArea = areas.reduce((s, a) => s + a, 0) / areas.length;
  const variance =
    areas.reduce((s, a) => s + Math.abs(a - avgArea), 0) / areas.length;

  return avgArea > 0 && variance / avgArea < 0.5;
}

/**
 * Detect arrangement of children
 */
function detectArrangement(
  children: FigmaNode[]
): { isHorizontal: boolean; isVertical: boolean } {
  const bounds = children
    .filter((c) => c.absoluteBoundingBox)
    .map((c) => extractBounds(c));

  if (bounds.length < 2) {
    return { isHorizontal: false, isVertical: false };
  }

  // Sort by position
  const sortedByX = [...bounds].sort((a, b) => a.x - b.x);
  const sortedByY = [...bounds].sort((a, b) => a.y - b.y);

  // Check horizontal (Y overlap)
  let isHorizontal = true;
  for (let i = 1; i < sortedByX.length; i++) {
    const prev = sortedByX[i - 1];
    const curr = sortedByX[i];

    const overlap =
      Math.min(prev.y + prev.height, curr.y + curr.height) -
      Math.max(prev.y, curr.y);
    const minHeight = Math.min(prev.height, curr.height);

    if (overlap < minHeight * 0.3) {
      isHorizontal = false;
      break;
    }
  }

  // Check vertical (X overlap)
  let isVertical = true;
  for (let i = 1; i < sortedByY.length; i++) {
    const prev = sortedByY[i - 1];
    const curr = sortedByY[i];

    const overlap =
      Math.min(prev.x + prev.width, curr.x + curr.width) -
      Math.max(prev.x, curr.x);
    const minWidth = Math.min(prev.width, curr.width);

    if (overlap < minWidth * 0.3) {
      isVertical = false;
      break;
    }
  }

  return { isHorizontal, isVertical };
}

/**
 * Determine navigation direction from items
 */
function determineDirection(
  items: NavigationItem[],
  bounds: BoundingBox
): "horizontal" | "vertical" {
  if (items.length < 2) {
    return bounds.width > bounds.height ? "horizontal" : "vertical";
  }

  const itemBounds = items.map((i) => i.bounds);
  const { isHorizontal, isVertical } = detectArrangement(
    items.map((i) => ({
      absoluteBoundingBox: i.bounds,
      type: "FRAME",
      id: i.nodeId,
      name: i.label,
    })) as unknown as FigmaNode[]
  );

  if (isHorizontal && !isVertical) return "horizontal";
  if (isVertical && !isHorizontal) return "vertical";

  // Fallback to aspect ratio
  return bounds.width > bounds.height ? "horizontal" : "vertical";
}

/**
 * Detect if navigation is responsive/mobile-optimized
 */
function detectResponsiveness(
  node: FigmaNode,
  patternType: NavigationPatternType
): boolean {
  const lowerName = node.name.toLowerCase();

  // Check for mobile keywords
  if (
    lowerName.includes("mobile") ||
    lowerName.includes("responsive") ||
    lowerName.includes("compact")
  ) {
    return true;
  }

  // Bottom nav is typically mobile
  if (patternType === "bottom-nav") {
    return true;
  }

  return false;
}

/**
 * Calculate maximum hierarchy depth
 */
function calculateMaxDepth(items: NavigationItem[]): number {
  let maxDepth = 0;

  function traverse(item: NavigationItem, depth: number) {
    maxDepth = Math.max(maxDepth, depth);
    if (item.children) {
      for (const child of item.children) {
        traverse(child, depth + 1);
      }
    }
  }

  for (const item of items) {
    traverse(item, 0);
  }

  return maxDepth;
}

/**
 * Count all items including nested
 */
function countAllItems(items: NavigationItem[]): number {
  let count = 0;

  function traverse(item: NavigationItem) {
    count++;
    if (item.children) {
      for (const child of item.children) {
        traverse(child);
      }
    }
  }

  for (const item of items) {
    traverse(item);
  }

  return count;
}

/**
 * Extract aria-label from node name
 */
function extractAriaLabel(nodeName: string, fallback: string): string {
  // Clean up the name for use as aria-label
  const cleaned = nodeName
    .replace(/[-_]/g, " ")
    .replace(/\b(nav|navigation)\b/gi, "")
    .trim();

  if (cleaned.length > 0 && cleaned.length < 50) {
    return cleaned;
  }

  return fallback;
}

/**
 * Traverse node tree for navigation patterns
 */
function traverseForNavigationPatterns(
  node: FigmaNode,
  patterns: NavigationPatternAnalysis[],
  warnings: string[],
  fileComponents?: Record<
    string,
    { name: string; description: string; componentSetId?: string }
  >,
  fileComponentSets?: Record<string, { name: string; description: string }>,
  parentBounds?: BoundingBox
): void {
  const bounds = extractBounds(node);

  // Analyze this node
  const analysis = analyzeNavigationNode(
    node,
    parentBounds,
    fileComponents,
    fileComponentSets
  );

  if (analysis && analysis.confidence >= 0.5) {
    patterns.push(analysis);
  }

  // Recurse into children (unless this was already identified as navigation)
  if (!analysis && node.children) {
    for (const child of node.children) {
      traverseForNavigationPatterns(
        child,
        patterns,
        warnings,
        fileComponents,
        fileComponentSets,
        bounds
      );
    }
  }
}

/**
 * Calculate navigation statistics
 */
function calculateNavigationStats(
  patterns: NavigationPatternAnalysis[]
): NavigationAnalysisResult["stats"] {
  const byType: Record<NavigationPatternType, number> = {} as Record<
    NavigationPatternType,
    number
  >;

  let totalItems = 0;
  let activeItemCount = 0;
  let maxDepth = 0;

  for (const pattern of patterns) {
    byType[pattern.patternType] = (byType[pattern.patternType] || 0) + 1;
    totalItems += pattern.totalItemCount;
    activeItemCount += pattern.activeItems.length;
    maxDepth = Math.max(maxDepth, pattern.maxDepth);
  }

  return {
    totalPatterns: patterns.length,
    byType,
    totalItems,
    activeItemCount,
    maxDepth,
  };
}

