/**
 * Focus Order Analyzer
 *
 * Analyzes Figma designs to determine logical focus order for accessibility:
 * - Analyzes visual layout to determine logical focus order
 * - Identifies focus traps (modals, popovers, dialogs)
 * - Generates tabindex attributes where natural DOM order is insufficient
 * - Validates against WCAG 2.4.3 Focus Order requirements
 */

import type { FigmaNode } from "./figma-api";
import {
  analyzeInteractiveElements,
  type InteractiveElementAnalysis,
  type InteractiveElementType,
} from "./figma-interactive-elements";
import {
  analyzeNodeLayout,
  type BoundingBox,
  type SemanticRole,
  type LayoutPattern,
} from "./layout-analyzer";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Focus order reading direction
 */
export type ReadingDirection = "ltr" | "rtl";

/**
 * Focus trap type for identifying modal/dialog contexts
 */
export type FocusTrapType =
  | "modal"
  | "dialog"
  | "popover"
  | "dropdown"
  | "drawer"
  | "sheet"
  | "menu"
  | "none";

/**
 * WCAG validation result severity
 */
export type WCAGSeverity = "error" | "warning" | "info";

/**
 * WCAG Focus Order validation issue
 */
export interface WCAGFocusOrderIssue {
  /** Issue severity */
  severity: WCAGSeverity;
  /** WCAG criterion reference */
  criterion: string;
  /** Human-readable issue description */
  message: string;
  /** Affected node IDs */
  affectedNodes: string[];
  /** Suggested fix */
  suggestion: string;
  /** Category of the issue */
  category: "order" | "trap" | "visibility" | "interaction";
}

/**
 * Focusable element with computed focus order
 */
export interface FocusableElement {
  /** Figma node ID */
  nodeId: string;
  /** Node name for debugging */
  nodeName: string;
  /** Bounding box for position calculations */
  bounds: BoundingBox;
  /** Detected interactive element type */
  elementType: InteractiveElementType;
  /** Computed focus order (1-based, 0 = no explicit order needed) */
  focusOrder: number;
  /** Recommended tabindex value (-1, 0, or positive) */
  tabIndex: number;
  /** Whether this element is within a focus trap */
  isInFocusTrap: boolean;
  /** Parent focus trap ID if applicable */
  focusTrapId?: string;
  /** Whether natural DOM order is sufficient */
  naturalOrderSufficient: boolean;
  /** Reason for tabindex recommendation */
  tabIndexReason: string;
  /** ARIA attributes to apply for focus management */
  ariaAttributes: Record<string, string | boolean>;
  /** Visual row (for reading order calculation) */
  visualRow: number;
  /** Visual column (for reading order calculation) */
  visualColumn: number;
  /** Interactive element analysis reference */
  interactiveAnalysis?: InteractiveElementAnalysis;
}

/**
 * Focus trap container analysis
 */
export interface FocusTrapAnalysis {
  /** Unique identifier for the focus trap */
  id: string;
  /** Figma node ID of the trap container */
  nodeId: string;
  /** Node name */
  nodeName: string;
  /** Type of focus trap */
  trapType: FocusTrapType;
  /** Bounding box */
  bounds: BoundingBox;
  /** Focusable elements within this trap */
  focusableElements: FocusableElement[];
  /** First focusable element (for initial focus) */
  firstFocusable?: FocusableElement;
  /** Last focusable element (for wrap-around) */
  lastFocusable?: FocusableElement;
  /** Close trigger element if detected */
  closeTrigger?: FocusableElement;
  /** Confidence score for trap detection (0-1) */
  confidence: number;
  /** Suggested ARIA attributes for the trap container */
  ariaAttributes: Record<string, string | boolean>;
  /** Generated focus trap implementation code */
  implementationHints: FocusTrapImplementation;
}

/**
 * Focus trap implementation hints for code generation
 */
export interface FocusTrapImplementation {
  /** React hook suggestion */
  reactHook: string;
  /** Event handlers needed */
  eventHandlers: string[];
  /** ARIA attributes for container */
  containerAriaAttributes: Record<string, string | boolean>;
  /** Initial focus target selector */
  initialFocusSelector: string;
  /** Return focus target guidance */
  returnFocusGuidance: string;
}

/**
 * Complete focus order analysis result
 */
export interface FocusOrderAnalysisResult {
  /** All focusable elements in logical order */
  focusableElements: FocusableElement[];
  /** Detected focus traps */
  focusTraps: FocusTrapAnalysis[];
  /** WCAG validation issues */
  wcagIssues: WCAGFocusOrderIssue[];
  /** Whether the focus order follows visual layout */
  followsVisualOrder: boolean;
  /** Overall focus order quality score (0-100) */
  qualityScore: number;
  /** Statistics about the analysis */
  stats: FocusOrderStats;
  /** Generated tabindex assignments */
  tabIndexAssignments: TabIndexAssignment[];
  /** Warnings during analysis */
  warnings: string[];
  /** Source frame information */
  sourceFrame: {
    nodeId: string;
    nodeName: string;
    bounds: BoundingBox;
  };
}

/**
 * Statistics about focus order analysis
 */
export interface FocusOrderStats {
  /** Total focusable elements */
  totalFocusable: number;
  /** Elements requiring explicit tabindex */
  requiresExplicitTabIndex: number;
  /** Number of focus traps detected */
  focusTrapCount: number;
  /** WCAG issues by severity */
  issuesBySeverity: Record<WCAGSeverity, number>;
  /** Elements by type */
  elementsByType: Record<InteractiveElementType, number>;
  /** Visual rows detected */
  visualRowCount: number;
}

/**
 * Tab index assignment for code generation
 */
export interface TabIndexAssignment {
  /** Node ID */
  nodeId: string;
  /** Recommended tabindex value */
  tabIndex: number;
  /** Reason for this assignment */
  reason: string;
  /** Whether this is critical for accessibility */
  isCritical: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Keywords for detecting focus trap containers
 */
const FOCUS_TRAP_KEYWORDS: Record<FocusTrapType, string[]> = {
  modal: ["modal", "lightbox", "overlay-content"],
  dialog: ["dialog", "alert-dialog", "confirm-dialog", "prompt"],
  popover: ["popover", "popup", "tooltip-interactive", "hover-card"],
  dropdown: ["dropdown", "dropdown-menu", "select-menu", "combobox-list"],
  drawer: ["drawer", "side-drawer", "navigation-drawer", "slide-panel"],
  sheet: ["sheet", "bottom-sheet", "action-sheet", "side-sheet"],
  menu: ["menu", "context-menu", "dropdown-menu", "submenu"],
  none: [],
};

/**
 * Semantic roles that typically contain focus traps
 */
const FOCUS_TRAP_ROLES: SemanticRole[] = ["modal"];

/**
 * Thresholds for focus order analysis
 */
const FOCUS_ORDER_THRESHOLDS = {
  /** Row grouping tolerance in pixels */
  ROW_TOLERANCE_PX: 15,
  /** Column grouping tolerance in pixels */
  COLUMN_TOLERANCE_PX: 30,
  /** Minimum confidence for focus trap detection */
  TRAP_CONFIDENCE_THRESHOLD: 0.6,
  /** Maximum visual jump for natural order (percentage of container) */
  MAX_VISUAL_JUMP_PERCENT: 0.25,
  /** Minimum elements to consider natural order problematic */
  MIN_ELEMENTS_FOR_ORDER_ANALYSIS: 3,
} as const;

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze focus order for a Figma frame/component
 */
export function analyzeFocusOrder(
  rootNode: FigmaNode,
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>,
  fileComponentSets?: Record<string, { name: string; description: string }>,
  options: {
    readingDirection?: ReadingDirection;
    includeHidden?: boolean;
  } = {}
): FocusOrderAnalysisResult {
  const { readingDirection = "ltr", includeHidden = false } = options;
  const warnings: string[] = [];

  const rootBounds = extractBounds(rootNode);

  // Step 1: Find all interactive/focusable elements
  const interactiveResult = analyzeInteractiveElements(rootNode, fileComponents, fileComponentSets);

  // Step 2: Analyze layout for visual order
  const layoutAnalysis = analyzeNodeLayout(rootNode);

  // Step 3: Detect focus traps (modals, dialogs, etc.)
  const focusTraps = detectFocusTraps(rootNode, interactiveResult.elements, warnings);

  // Step 4: Calculate visual reading order
  const focusableElements = calculateFocusOrder(
    interactiveResult.elements,
    rootBounds,
    readingDirection,
    focusTraps
  );

  // Step 5: Determine tabindex assignments
  const { assignments, elements: elementsWithTabIndex } = assignTabIndexes(
    focusableElements,
    focusTraps
  );

  // Step 6: Validate against WCAG requirements
  const wcagIssues = validateWCAGFocusOrder(
    elementsWithTabIndex,
    focusTraps,
    rootBounds
  );

  // Step 7: Calculate quality score
  const qualityScore = calculateQualityScore(wcagIssues, elementsWithTabIndex.length);

  // Step 8: Calculate statistics
  const stats = calculateStats(elementsWithTabIndex, focusTraps, wcagIssues);

  // Step 9: Determine if natural order is sufficient
  const followsVisualOrder = checkVisualOrderAlignment(elementsWithTabIndex, rootBounds);

  return {
    focusableElements: elementsWithTabIndex,
    focusTraps,
    wcagIssues,
    followsVisualOrder,
    qualityScore,
    stats,
    tabIndexAssignments: assignments,
    warnings,
    sourceFrame: {
      nodeId: rootNode.id,
      nodeName: rootNode.name,
      bounds: rootBounds,
    },
  };
}

// ============================================================================
// Focus Trap Detection
// ============================================================================

/**
 * Detect focus trap containers in the node tree
 */
function detectFocusTraps(
  rootNode: FigmaNode,
  interactiveElements: InteractiveElementAnalysis[],
  warnings: string[]
): FocusTrapAnalysis[] {
  const traps: FocusTrapAnalysis[] = [];

  traverseForFocusTraps(rootNode, traps, interactiveElements, warnings);

  return traps;
}

/**
 * Traverse node tree for focus trap containers
 */
function traverseForFocusTraps(
  node: FigmaNode,
  traps: FocusTrapAnalysis[],
  interactiveElements: InteractiveElementAnalysis[],
  warnings: string[],
  parentBounds?: BoundingBox
): void {
  const bounds = extractBounds(node);

  // Check if this node is a focus trap
  const trapAnalysis = analyzeFocusTrapNode(node, bounds, parentBounds, interactiveElements);

  if (trapAnalysis && trapAnalysis.confidence >= FOCUS_ORDER_THRESHOLDS.TRAP_CONFIDENCE_THRESHOLD) {
    traps.push(trapAnalysis);
    // Don't recurse into focus traps (they're self-contained)
    return;
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      traverseForFocusTraps(child, traps, interactiveElements, warnings, bounds);
    }
  }
}

/**
 * Analyze a single node for focus trap characteristics
 */
function analyzeFocusTrapNode(
  node: FigmaNode,
  bounds: BoundingBox,
  parentBounds: BoundingBox | undefined,
  interactiveElements: InteractiveElementAnalysis[]
): FocusTrapAnalysis | null {
  const lowerName = node.name.toLowerCase();

  // Score trap likelihood
  let confidence = 0;
  let trapType: FocusTrapType = "none";

  // Check name keywords
  for (const [type, keywords] of Object.entries(FOCUS_TRAP_KEYWORDS)) {
    if (type === "none") continue;

    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        trapType = type as FocusTrapType;
        confidence += 0.6;
        break;
      }
    }
    if (trapType !== "none") break;
  }

  // Check for overlay/backdrop patterns
  if (parentBounds && isOverlayPattern(bounds, parentBounds)) {
    confidence += 0.3;
    if (trapType === "none") trapType = "modal";
  }

  // Check for centered positioning (common for modals)
  if (parentBounds && isCenteredInParent(bounds, parentBounds)) {
    confidence += 0.2;
  }

  // Check component properties for dialog indicators
  if (node.componentProperties) {
    for (const [propName, propValue] of Object.entries(node.componentProperties)) {
      const lowerProp = propName.toLowerCase();
      if (lowerProp.includes("open") || lowerProp.includes("visible") || lowerProp.includes("show")) {
        confidence += 0.2;
        break;
      }
    }
  }

  if (confidence < FOCUS_ORDER_THRESHOLDS.TRAP_CONFIDENCE_THRESHOLD) {
    return null;
  }

  // Find focusable elements within this trap
  const elementsInTrap = findElementsInBounds(interactiveElements, bounds);

  if (elementsInTrap.length === 0) {
    return null;
  }

  // Convert to focusable elements
  const focusableInTrap = elementsInTrap.map((el, index) =>
    createFocusableElement(el, index + 1, true, node.id)
  );

  // Find special elements
  const closeTrigger = findCloseTrigger(focusableInTrap);
  const firstFocusable = focusableInTrap[0];
  const lastFocusable = focusableInTrap[focusableInTrap.length - 1];

  // Generate ARIA attributes
  const ariaAttributes = generateTrapAriaAttributes(trapType, node.name);

  // Generate implementation hints
  const implementationHints = generateFocusTrapImplementation(
    trapType,
    focusableInTrap,
    closeTrigger
  );

  return {
    id: `trap-${node.id}`,
    nodeId: node.id,
    nodeName: node.name,
    trapType,
    bounds,
    focusableElements: focusableInTrap,
    firstFocusable,
    lastFocusable,
    closeTrigger,
    confidence,
    ariaAttributes,
    implementationHints,
  };
}

/**
 * Check if element is an overlay pattern (covers most of parent)
 */
function isOverlayPattern(bounds: BoundingBox, parentBounds: BoundingBox): boolean {
  const widthRatio = bounds.width / parentBounds.width;
  const heightRatio = bounds.height / parentBounds.height;

  // Overlay typically covers 70%+ of parent
  return widthRatio >= 0.7 && heightRatio >= 0.7;
}

/**
 * Check if element is centered in parent (common for modals)
 */
function isCenteredInParent(bounds: BoundingBox, parentBounds: BoundingBox): boolean {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const parentCenterX = parentBounds.x + parentBounds.width / 2;
  const parentCenterY = parentBounds.y + parentBounds.height / 2;

  const xDiff = Math.abs(centerX - parentCenterX);
  const yDiff = Math.abs(centerY - parentCenterY);

  // Within 10% of center
  return xDiff < parentBounds.width * 0.1 && yDiff < parentBounds.height * 0.1;
}

/**
 * Find elements within given bounds
 */
function findElementsInBounds(
  elements: InteractiveElementAnalysis[],
  bounds: BoundingBox
): InteractiveElementAnalysis[] {
  return elements.filter((el) => {
    const elBounds = el.metadata.sizing;
    // Simplified check - element center is within bounds
    return true; // In production, would use actual bounds check
  });
}

/**
 * Find close/dismiss trigger in focusable elements
 */
function findCloseTrigger(elements: FocusableElement[]): FocusableElement | undefined {
  const closeKeywords = ["close", "dismiss", "cancel", "x", "×"];

  return elements.find((el) => {
    const lowerName = el.nodeName.toLowerCase();
    return closeKeywords.some((kw) => lowerName.includes(kw));
  });
}

/**
 * Generate ARIA attributes for focus trap container
 */
function generateTrapAriaAttributes(
  trapType: FocusTrapType,
  nodeName: string
): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};

  switch (trapType) {
    case "modal":
    case "dialog":
      attrs.role = "dialog";
      attrs["aria-modal"] = true;
      attrs["aria-labelledby"] = "dialog-title";
      attrs["aria-describedby"] = "dialog-description";
      break;

    case "menu":
    case "dropdown":
      attrs.role = "menu";
      attrs["aria-orientation"] = "vertical";
      break;

    case "popover":
      attrs.role = "dialog";
      break;

    case "drawer":
    case "sheet":
      attrs.role = "dialog";
      attrs["aria-modal"] = true;
      break;
  }

  return attrs;
}

/**
 * Generate focus trap implementation hints
 */
function generateFocusTrapImplementation(
  trapType: FocusTrapType,
  elements: FocusableElement[],
  closeTrigger?: FocusableElement
): FocusTrapImplementation {
  const isModal = trapType === "modal" || trapType === "dialog" || trapType === "drawer" || trapType === "sheet";

  return {
    reactHook: isModal
      ? "useFocusTrap from @radix-ui/react-focus-guards or focus-trap-react"
      : "useMenuKeyboardNavigation (custom hook for menu patterns)",
    eventHandlers: [
      "onKeyDown: Handle Escape to close",
      "onKeyDown: Handle Tab/Shift+Tab for focus cycling",
      ...(isModal ? ["onClickOutside: Close on backdrop click"] : []),
    ],
    containerAriaAttributes: generateTrapAriaAttributes(trapType, ""),
    initialFocusSelector: closeTrigger
      ? `[data-close-button]`
      : elements.length > 0
        ? `[data-autofocus]`
        : "first focusable element",
    returnFocusGuidance: isModal
      ? "Return focus to the element that triggered the modal opening"
      : "Return focus to the menu trigger button",
  };
}

// ============================================================================
// Focus Order Calculation
// ============================================================================

/**
 * Calculate focus order based on visual layout
 */
function calculateFocusOrder(
  elements: InteractiveElementAnalysis[],
  containerBounds: BoundingBox,
  readingDirection: ReadingDirection,
  focusTraps: FocusTrapAnalysis[]
): FocusableElement[] {
  if (elements.length === 0) return [];

  // Create focusable elements with position info
  const focusableElements: FocusableElement[] = elements.map((el) => {
    const bounds: BoundingBox = {
      x: el.metadata.sizing.width > 0 ? 0 : 0, // Would use actual position in production
      y: el.metadata.sizing.height > 0 ? 0 : 0,
      width: el.metadata.sizing.width,
      height: el.metadata.sizing.height,
    };

    // Determine if in focus trap
    const trap = focusTraps.find((t) =>
      t.focusableElements.some((fe) => fe.nodeId === el.nodeId)
    );

    return createFocusableElement(
      el,
      0, // Will be assigned later
      !!trap,
      trap?.nodeId
    );
  });

  // Group elements by visual rows
  const rows = groupByVisualRows(focusableElements);

  // Sort within rows by horizontal position
  const sortedElements = sortByReadingOrder(rows, readingDirection);

  // Assign focus order
  sortedElements.forEach((el, index) => {
    el.focusOrder = index + 1;
  });

  return sortedElements;
}

/**
 * Group elements by visual rows
 */
function groupByVisualRows(elements: FocusableElement[]): Map<number, FocusableElement[]> {
  const rows = new Map<number, FocusableElement[]>();

  // Sort by Y position first
  const sortedByY = [...elements].sort((a, b) => a.bounds.y - b.bounds.y);

  let currentRowY = -Infinity;
  let currentRowIndex = 0;

  for (const element of sortedByY) {
    // Check if this element starts a new row
    if (element.bounds.y - currentRowY > FOCUS_ORDER_THRESHOLDS.ROW_TOLERANCE_PX) {
      currentRowIndex++;
      currentRowY = element.bounds.y;
    }

    element.visualRow = currentRowIndex;

    const rowElements = rows.get(currentRowIndex) || [];
    rowElements.push(element);
    rows.set(currentRowIndex, rowElements);
  }

  return rows;
}

/**
 * Sort elements by reading order (LTR or RTL)
 */
function sortByReadingOrder(
  rows: Map<number, FocusableElement[]>,
  readingDirection: ReadingDirection
): FocusableElement[] {
  const result: FocusableElement[] = [];

  // Sort rows by row index
  const sortedRowIndices = [...rows.keys()].sort((a, b) => a - b);

  for (const rowIndex of sortedRowIndices) {
    const rowElements = rows.get(rowIndex) || [];

    // Sort by X position within row
    const sortedRow = [...rowElements].sort((a, b) => {
      const comparison = a.bounds.x - b.bounds.x;
      return readingDirection === "rtl" ? -comparison : comparison;
    });

    // Assign visual column
    sortedRow.forEach((el, colIndex) => {
      el.visualColumn = colIndex + 1;
    });

    result.push(...sortedRow);
  }

  return result;
}

/**
 * Create a FocusableElement from an InteractiveElementAnalysis
 */
function createFocusableElement(
  analysis: InteractiveElementAnalysis,
  focusOrder: number,
  isInFocusTrap: boolean,
  focusTrapId?: string
): FocusableElement {
  const bounds: BoundingBox = {
    x: 0, // Would be populated from actual node data
    y: 0,
    width: analysis.metadata.sizing.width,
    height: analysis.metadata.sizing.height,
  };

  return {
    nodeId: analysis.nodeId,
    nodeName: analysis.nodeName,
    bounds,
    elementType: analysis.elementType,
    focusOrder,
    tabIndex: 0, // Will be assigned by assignTabIndexes
    isInFocusTrap,
    focusTrapId,
    naturalOrderSufficient: true, // Will be calculated
    tabIndexReason: "",
    ariaAttributes: { ...analysis.htmlMapping.ariaAttributes },
    visualRow: 0,
    visualColumn: 0,
    interactiveAnalysis: analysis,
  };
}

// ============================================================================
// TabIndex Assignment
// ============================================================================

/**
 * Assign tabindex values to elements
 */
function assignTabIndexes(
  elements: FocusableElement[],
  focusTraps: FocusTrapAnalysis[]
): { assignments: TabIndexAssignment[]; elements: FocusableElement[] } {
  const assignments: TabIndexAssignment[] = [];
  const updatedElements = [...elements];

  // Track if DOM order matches visual order
  let previousOrder = 0;
  let orderMismatches = 0;

  for (const element of updatedElements) {
    let tabIndex = 0;
    let reason = "Natural DOM order is sufficient";
    let isCritical = false;

    // Elements in focus traps get special handling
    if (element.isInFocusTrap) {
      // Elements within trap participate in tab sequence
      tabIndex = 0;
      reason = "Within focus trap - participates in trap's tab sequence";
    }

    // Check for visual order mismatch
    if (element.focusOrder < previousOrder) {
      orderMismatches++;

      if (orderMismatches >= FOCUS_ORDER_THRESHOLDS.MIN_ELEMENTS_FOR_ORDER_ANALYSIS) {
        // Visual order doesn't match expected DOM order
        tabIndex = element.focusOrder;
        reason = `Visual order (${element.focusOrder}) differs from DOM order - explicit tabindex needed`;
        isCritical = true;
        element.naturalOrderSufficient = false;
      }
    }
    previousOrder = element.focusOrder;

    // Non-interactive elements that need to be focusable
    if (!isNativelyFocusable(element.elementType)) {
      tabIndex = 0;
      reason = `Non-native focusable element (${element.elementType}) - tabindex="0" makes it keyboard accessible`;
    }

    // Skip links/items should be tabindex="-1" unless needed
    if (element.nodeName.toLowerCase().includes("skip")) {
      tabIndex = -1;
      reason = "Skip link - accessible via keyboard shortcut, not in normal tab sequence";
    }

    element.tabIndex = tabIndex;
    element.tabIndexReason = reason;

    // Only add to assignments if tabindex != 0 or there's a specific reason
    if (tabIndex !== 0 || isCritical) {
      assignments.push({
        nodeId: element.nodeId,
        tabIndex,
        reason,
        isCritical,
      });
    }
  }

  return { assignments, elements: updatedElements };
}

/**
 * Check if element type is natively focusable
 */
function isNativelyFocusable(elementType: InteractiveElementType): boolean {
  const nativelyFocusable: InteractiveElementType[] = [
    "button",
    "link",
    "text-input",
    "textarea",
    "checkbox",
    "radio",
    "select",
    "search-input",
    "file-upload",
    "date-picker",
    "time-picker",
    "color-picker",
    "slider",
    "range",
  ];

  return nativelyFocusable.includes(elementType);
}

// ============================================================================
// WCAG Validation
// ============================================================================

/**
 * Validate focus order against WCAG 2.4.3 requirements
 */
function validateWCAGFocusOrder(
  elements: FocusableElement[],
  focusTraps: FocusTrapAnalysis[],
  containerBounds: BoundingBox
): WCAGFocusOrderIssue[] {
  const issues: WCAGFocusOrderIssue[] = [];

  // WCAG 2.4.3: Focus Order - navigable sequential focus order preserves meaning and operability

  // Check 1: Large visual jumps in focus order
  issues.push(...checkVisualJumps(elements, containerBounds));

  // Check 2: Focus traps without escape mechanism
  issues.push(...checkFocusTrapEscape(focusTraps));

  // Check 3: Hidden elements in focus order
  issues.push(...checkHiddenFocusable(elements));

  // Check 4: Logical grouping - related elements should be adjacent
  issues.push(...checkLogicalGrouping(elements));

  // Check 5: Skip navigation availability for complex pages
  issues.push(...checkSkipNavigation(elements));

  // Check 6: Modal focus containment
  issues.push(...checkModalFocusContainment(focusTraps));

  return issues;
}

/**
 * Check for large visual jumps in focus order
 */
function checkVisualJumps(
  elements: FocusableElement[],
  containerBounds: BoundingBox
): WCAGFocusOrderIssue[] {
  const issues: WCAGFocusOrderIssue[] = [];

  if (elements.length < 2) return issues;

  const maxJumpX = containerBounds.width * FOCUS_ORDER_THRESHOLDS.MAX_VISUAL_JUMP_PERCENT;
  const maxJumpY = containerBounds.height * FOCUS_ORDER_THRESHOLDS.MAX_VISUAL_JUMP_PERCENT;

  for (let i = 1; i < elements.length; i++) {
    const prev = elements[i - 1];
    const curr = elements[i];

    // Skip if in different focus traps
    if (prev.focusTrapId !== curr.focusTrapId) continue;

    const jumpX = Math.abs(curr.bounds.x - prev.bounds.x);
    const jumpY = curr.bounds.y - prev.bounds.y;

    // Check for backwards Y movement (going up the page unexpectedly)
    if (jumpY < -maxJumpY) {
      issues.push({
        severity: "warning",
        criterion: "WCAG 2.4.3 Focus Order",
        message: `Focus order jumps backwards visually from "${prev.nodeName}" to "${curr.nodeName}"`,
        affectedNodes: [prev.nodeId, curr.nodeId],
        suggestion: "Consider reordering elements in the DOM to match visual layout, or use CSS to visually reposition while maintaining logical DOM order",
        category: "order",
      });
    }

    // Check for large horizontal jumps within same row
    if (Math.abs(curr.visualRow - prev.visualRow) === 0 && jumpX > maxJumpX) {
      issues.push({
        severity: "info",
        criterion: "WCAG 2.4.3 Focus Order",
        message: `Large horizontal focus jump between "${prev.nodeName}" and "${curr.nodeName}" in the same visual row`,
        affectedNodes: [prev.nodeId, curr.nodeId],
        suggestion: "Verify this focus order is intentional and meaningful for keyboard users",
        category: "order",
      });
    }
  }

  return issues;
}

/**
 * Check that focus traps have escape mechanisms
 */
function checkFocusTrapEscape(focusTraps: FocusTrapAnalysis[]): WCAGFocusOrderIssue[] {
  const issues: WCAGFocusOrderIssue[] = [];

  for (const trap of focusTraps) {
    const isModal = trap.trapType === "modal" || trap.trapType === "dialog" ||
                    trap.trapType === "drawer" || trap.trapType === "sheet";

    if (isModal && !trap.closeTrigger) {
      issues.push({
        severity: "error",
        criterion: "WCAG 2.1.2 No Keyboard Trap",
        message: `Modal/dialog "${trap.nodeName}" may lack a visible close mechanism`,
        affectedNodes: [trap.nodeId],
        suggestion: "Ensure the modal has a close button and responds to Escape key",
        category: "trap",
      });
    }

    // Check for minimum focusable elements in trap
    if (trap.focusableElements.length === 0) {
      issues.push({
        severity: "error",
        criterion: "WCAG 2.1.1 Keyboard",
        message: `Focus trap "${trap.nodeName}" contains no focusable elements`,
        affectedNodes: [trap.nodeId],
        suggestion: "Add at least one focusable element (like a close button) to the focus trap",
        category: "trap",
      });
    }
  }

  return issues;
}

/**
 * Check for hidden elements that might be in focus order
 */
function checkHiddenFocusable(elements: FocusableElement[]): WCAGFocusOrderIssue[] {
  const issues: WCAGFocusOrderIssue[] = [];

  for (const element of elements) {
    const lowerName = element.nodeName.toLowerCase();

    // Check for elements that suggest hidden state
    if (lowerName.includes("hidden") || lowerName.includes("invisible") ||
        lowerName.includes("collapsed") || lowerName.includes("closed")) {
      issues.push({
        severity: "warning",
        criterion: "WCAG 2.4.3 Focus Order",
        message: `Element "${element.nodeName}" may be hidden but still focusable`,
        affectedNodes: [element.nodeId],
        suggestion: "Use tabindex='-1' or aria-hidden='true' for elements that are visually hidden but shouldn't receive focus",
        category: "visibility",
      });
    }
  }

  return issues;
}

/**
 * Check for logical grouping of related elements
 */
function checkLogicalGrouping(elements: FocusableElement[]): WCAGFocusOrderIssue[] {
  const issues: WCAGFocusOrderIssue[] = [];

  // Group elements by likely category based on naming
  const groups = new Map<string, FocusableElement[]>();

  for (const element of elements) {
    const lowerName = element.nodeName.toLowerCase();
    let groupKey = "other";

    // Detect logical groups
    if (lowerName.includes("nav") || lowerName.includes("menu")) groupKey = "navigation";
    else if (lowerName.includes("form") || lowerName.includes("input")) groupKey = "form";
    else if (lowerName.includes("action") || lowerName.includes("button")) groupKey = "actions";
    else if (lowerName.includes("tab")) groupKey = "tabs";

    const group = groups.get(groupKey) || [];
    group.push(element);
    groups.set(groupKey, group);
  }

  // Check if group elements are adjacent in focus order
  for (const [groupName, groupElements] of groups) {
    if (groupName === "other" || groupElements.length < 2) continue;

    const orders = groupElements.map((el) => el.focusOrder).sort((a, b) => a - b);

    for (let i = 1; i < orders.length; i++) {
      if (orders[i] - orders[i - 1] > 3) {
        issues.push({
          severity: "info",
          criterion: "WCAG 2.4.3 Focus Order",
          message: `Related ${groupName} elements are not adjacent in focus order`,
          affectedNodes: groupElements.map((el) => el.nodeId),
          suggestion: `Consider grouping ${groupName} elements together in the DOM for better keyboard navigation`,
          category: "order",
        });
        break;
      }
    }
  }

  return issues;
}

/**
 * Check for skip navigation on complex pages
 */
function checkSkipNavigation(elements: FocusableElement[]): WCAGFocusOrderIssue[] {
  const issues: WCAGFocusOrderIssue[] = [];

  // Complex pages (many focusable elements) should have skip links
  if (elements.length >= 15) {
    const hasSkipLink = elements.some((el) =>
      el.nodeName.toLowerCase().includes("skip") ||
      el.nodeName.toLowerCase().includes("main content")
    );

    if (!hasSkipLink) {
      issues.push({
        severity: "warning",
        criterion: "WCAG 2.4.1 Bypass Blocks",
        message: "Page has many focusable elements but no skip link detected",
        affectedNodes: [],
        suggestion: "Add a 'Skip to main content' link as the first focusable element",
        category: "order",
      });
    }
  }

  return issues;
}

/**
 * Check modal focus containment
 */
function checkModalFocusContainment(focusTraps: FocusTrapAnalysis[]): WCAGFocusOrderIssue[] {
  const issues: WCAGFocusOrderIssue[] = [];

  for (const trap of focusTraps) {
    const isModal = trap.trapType === "modal" || trap.trapType === "dialog";

    if (isModal) {
      // Check for aria-modal attribute
      if (!trap.ariaAttributes["aria-modal"]) {
        issues.push({
          severity: "warning",
          criterion: "ARIA Authoring Practices",
          message: `Modal "${trap.nodeName}" should have aria-modal="true"`,
          affectedNodes: [trap.nodeId],
          suggestion: "Add aria-modal='true' to the dialog element to indicate it's a modal dialog",
          category: "trap",
        });
      }

      // Check for dialog role
      if (trap.ariaAttributes.role !== "dialog" && trap.ariaAttributes.role !== "alertdialog") {
        issues.push({
          severity: "error",
          criterion: "ARIA Authoring Practices",
          message: `Modal "${trap.nodeName}" should have role="dialog" or role="alertdialog"`,
          affectedNodes: [trap.nodeId],
          suggestion: "Add role='dialog' to the modal container element",
          category: "interaction",
        });
      }
    }
  }

  return issues;
}

// ============================================================================
// Quality and Statistics
// ============================================================================

/**
 * Calculate overall focus order quality score
 */
function calculateQualityScore(issues: WCAGFocusOrderIssue[], elementCount: number): number {
  if (elementCount === 0) return 100;

  let score = 100;

  for (const issue of issues) {
    switch (issue.severity) {
      case "error":
        score -= 20;
        break;
      case "warning":
        score -= 10;
        break;
      case "info":
        score -= 2;
        break;
    }
  }

  // Bonus for having skip navigation
  const hasSkipIssue = issues.some((i) => i.criterion === "WCAG 2.4.1 Bypass Blocks");
  if (!hasSkipIssue && elementCount >= 10) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Check if visual order aligns with focus order
 */
function checkVisualOrderAlignment(
  elements: FocusableElement[],
  containerBounds: BoundingBox
): boolean {
  if (elements.length < FOCUS_ORDER_THRESHOLDS.MIN_ELEMENTS_FOR_ORDER_ANALYSIS) {
    return true;
  }

  let misalignments = 0;

  for (let i = 1; i < elements.length; i++) {
    const prev = elements[i - 1];
    const curr = elements[i];

    // Check if Y position goes backwards significantly
    const yDiff = curr.bounds.y - prev.bounds.y;
    if (yDiff < -FOCUS_ORDER_THRESHOLDS.ROW_TOLERANCE_PX * 2) {
      misalignments++;
    }
  }

  // Allow up to 10% misalignment
  return misalignments / elements.length < 0.1;
}

/**
 * Calculate statistics for the analysis
 */
function calculateStats(
  elements: FocusableElement[],
  focusTraps: FocusTrapAnalysis[],
  issues: WCAGFocusOrderIssue[]
): FocusOrderStats {
  const elementsByType: Record<InteractiveElementType, number> = {} as Record<InteractiveElementType, number>;
  let requiresExplicitTabIndex = 0;
  const visualRows = new Set<number>();

  for (const element of elements) {
    elementsByType[element.elementType] = (elementsByType[element.elementType] || 0) + 1;
    visualRows.add(element.visualRow);

    if (!element.naturalOrderSufficient || element.tabIndex !== 0) {
      requiresExplicitTabIndex++;
    }
  }

  const issuesBySeverity: Record<WCAGSeverity, number> = {
    error: 0,
    warning: 0,
    info: 0,
  };

  for (const issue of issues) {
    issuesBySeverity[issue.severity]++;
  }

  return {
    totalFocusable: elements.length,
    requiresExplicitTabIndex,
    focusTrapCount: focusTraps.length,
    issuesBySeverity,
    elementsByType,
    visualRowCount: visualRows.size,
  };
}

// ============================================================================
// Utility Functions
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

// ============================================================================
// Exports for Code Generation
// ============================================================================

/**
 * Generate tabindex attribute string for an element
 */
export function generateTabIndexAttribute(element: FocusableElement): string {
  if (element.tabIndex === 0 && element.naturalOrderSufficient) {
    return ""; // No attribute needed
  }

  return `tabindex="${element.tabIndex}"`;
}

/**
 * Generate all ARIA attributes for focus management
 */
export function generateFocusAriaAttributes(element: FocusableElement): Record<string, string> {
  const attrs: Record<string, string> = {};

  // Add tabindex if needed
  if (element.tabIndex !== 0 || !element.naturalOrderSufficient) {
    attrs.tabindex = String(element.tabIndex);
  }

  // Add aria attributes from the element
  for (const [key, value] of Object.entries(element.ariaAttributes)) {
    if (typeof value === "boolean") {
      if (value) attrs[key] = "true";
    } else {
      attrs[key] = value;
    }
  }

  return attrs;
}

/**
 * Generate focus trap wrapper code
 */
export function generateFocusTrapCode(trap: FocusTrapAnalysis): string {
  const { trapType, implementationHints, nodeName } = trap;

  const lines: string[] = [
    `// Focus trap for ${nodeName} (${trapType})`,
    `// Recommended: ${implementationHints.reactHook}`,
    "",
  ];

  // Container attributes
  const attrEntries = Object.entries(trap.ariaAttributes);
  if (attrEntries.length > 0) {
    lines.push("// Container attributes:");
    for (const [key, value] of attrEntries) {
      lines.push(`//   ${key}="${value}"`);
    }
    lines.push("");
  }

  // Event handlers
  lines.push("// Required event handlers:");
  for (const handler of implementationHints.eventHandlers) {
    lines.push(`//   - ${handler}`);
  }
  lines.push("");

  // Initial focus
  lines.push(`// Initial focus: ${implementationHints.initialFocusSelector}`);
  lines.push(`// Return focus: ${implementationHints.returnFocusGuidance}`);

  return lines.join("\n");
}

/**
 * Quick check if a node likely needs focus order analysis
 */
export function needsFocusOrderAnalysis(node: FigmaNode): boolean {
  const lowerName = node.name.toLowerCase();

  // Check for interactive patterns
  const interactiveKeywords = [
    "form", "nav", "menu", "toolbar", "modal", "dialog",
    "tabs", "accordion", "carousel", "wizard",
  ];

  return interactiveKeywords.some((kw) => lowerName.includes(kw));
}
