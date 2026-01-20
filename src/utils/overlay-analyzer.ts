/**
 * Overlay Analyzer - Modal, Popover, Tooltip, and Dropdown Detection
 *
 * Identifies overlay patterns in Figma designs:
 * - Modal dialogs, popovers, tooltips, and dropdown overlays
 * - Detects backdrop layers and positioning context
 * - Generates proper ARIA markup for accessibility
 * - Handles focus trap requirements
 */

import type { FigmaNode } from "./figma-api";
import type { BoundingBox } from "./layout-analyzer";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Types of overlay components that can be detected
 */
export type OverlayType =
  | "modal"
  | "dialog"
  | "alert-dialog"
  | "popover"
  | "tooltip"
  | "dropdown"
  | "menu"
  | "sheet"
  | "drawer"
  | "toast"
  | "snackbar"
  | "banner"
  | "command-palette"
  | "context-menu"
  | "unknown";

/**
 * Position of a sheet or drawer
 */
export type SheetPosition = "top" | "right" | "bottom" | "left" | "center";

/**
 * Positioning context for the overlay
 */
export type PositioningContext = "fixed" | "absolute" | "relative" | "anchored";

/**
 * Trigger type that opens the overlay
 */
export type TriggerType = "click" | "hover" | "focus" | "context-menu" | "keyboard" | "automatic";

/**
 * Backdrop/scrim style
 */
export interface BackdropAnalysis {
  /** Whether a backdrop is present */
  hasBackdrop: boolean;
  /** The backdrop node ID if found */
  backdropNodeId?: string;
  /** Backdrop opacity (0-1) */
  opacity?: number;
  /** Backdrop color */
  color?: { r: number; g: number; b: number; a: number };
  /** Whether the backdrop has blur effect */
  hasBlur?: boolean;
  /** Blur amount in pixels */
  blurAmount?: number;
  /** Whether clicking backdrop should dismiss */
  dismissOnBackdropClick: boolean;
}

/**
 * Focus management requirements
 */
export interface FocusTrapRequirements {
  /** Whether focus should be trapped in the overlay */
  requiresFocusTrap: boolean;
  /** Element to focus when overlay opens */
  initialFocusTarget?: "first-focusable" | "close-button" | "content" | "custom";
  /** Element to return focus to when overlay closes */
  returnFocusOnClose: boolean;
  /** Whether to allow scroll outside the overlay */
  lockScroll: boolean;
  /** List of focusable element selectors within overlay */
  focusableElements: string[];
  /** Whether escape key should close the overlay */
  closeOnEscape: boolean;
}

/**
 * ARIA attributes for accessibility
 */
export interface ARIAAttributes {
  /** Primary ARIA role */
  role: string;
  /** aria-modal attribute */
  "aria-modal"?: boolean;
  /** aria-labelledby - reference to title element */
  "aria-labelledby"?: string;
  /** aria-describedby - reference to description element */
  "aria-describedby"?: string;
  /** aria-label - direct label text */
  "aria-label"?: string;
  /** aria-haspopup - for trigger elements */
  "aria-haspopup"?: "dialog" | "menu" | "listbox" | "tree" | "grid" | "true" | "false";
  /** aria-expanded - for trigger elements */
  "aria-expanded"?: boolean;
  /** aria-controls - reference to controlled element */
  "aria-controls"?: string;
  /** aria-live - for toast/notification regions */
  "aria-live"?: "polite" | "assertive" | "off";
  /** aria-atomic - whether entire region should be announced */
  "aria-atomic"?: boolean;
  /** Additional custom ARIA attributes */
  additionalAttributes: Record<string, string | boolean>;
}

/**
 * Detected trigger element for the overlay
 */
export interface OverlayTrigger {
  /** Node ID of the trigger element */
  nodeId: string;
  /** Node name */
  nodeName: string;
  /** Trigger type */
  triggerType: TriggerType;
  /** Bounds of trigger element */
  bounds: BoundingBox;
  /** Confidence score */
  confidence: number;
  /** ARIA attributes for the trigger */
  ariaAttributes: ARIAAttributes;
}

/**
 * Detected close mechanism
 */
export interface CloseMechanism {
  /** Type of close action */
  type: "button" | "icon" | "escape" | "backdrop-click" | "outside-click" | "swipe";
  /** Node ID if applicable */
  nodeId?: string;
  /** Node name if applicable */
  nodeName?: string;
  /** Position in overlay */
  position?: "top-right" | "top-left" | "bottom" | "header" | "footer";
  /** Confidence score */
  confidence: number;
}

/**
 * Overlay content structure analysis
 */
export interface OverlayContentStructure {
  /** Has a header section */
  hasHeader: boolean;
  /** Has a title element */
  hasTitle: boolean;
  /** Title node ID */
  titleNodeId?: string;
  /** Has a description */
  hasDescription: boolean;
  /** Description node ID */
  descriptionNodeId?: string;
  /** Has a body/content section */
  hasBody: boolean;
  /** Body node ID */
  bodyNodeId?: string;
  /** Has a footer section */
  hasFooter: boolean;
  /** Footer node ID */
  footerNodeId?: string;
  /** Has action buttons */
  hasActions: boolean;
  /** Action button node IDs */
  actionNodeIds: string[];
  /** Has close button */
  hasCloseButton: boolean;
  /** Close button node ID */
  closeButtonNodeId?: string;
}

/**
 * Complete overlay analysis result
 */
export interface OverlayAnalysis {
  /** Node ID of the overlay */
  nodeId: string;
  /** Node name */
  nodeName: string;
  /** Detected overlay type */
  overlayType: OverlayType;
  /** Confidence score (0-1) */
  confidence: number;
  /** Bounds of the overlay */
  bounds: BoundingBox;
  /** Position for sheets/drawers */
  sheetPosition?: SheetPosition;
  /** Positioning context */
  positioningContext: PositioningContext;
  /** Backdrop analysis */
  backdrop: BackdropAnalysis;
  /** Focus trap requirements */
  focusTrap: FocusTrapRequirements;
  /** ARIA attributes for the overlay */
  ariaAttributes: ARIAAttributes;
  /** Detected trigger element */
  trigger?: OverlayTrigger;
  /** Close mechanisms */
  closeMechanisms: CloseMechanism[];
  /** Content structure */
  contentStructure: OverlayContentStructure;
  /** Detection reasons for debugging */
  detectionReasons: string[];
  /** Generated code suggestions */
  codeSuggestion: OverlayCodeSuggestion;
}

/**
 * Generated code for the overlay
 */
export interface OverlayCodeSuggestion {
  /** JSX code */
  jsx: string;
  /** Radix UI component suggestion */
  radixComponent?: string;
  /** Tailwind classes for the overlay */
  tailwindClasses: string[];
  /** CSS for animations */
  animationCSS: string;
  /** Focus trap hook suggestion */
  focusTrapHook?: string;
}

/**
 * Result of analyzing multiple overlays in a frame
 */
export interface OverlayAnalysisResult {
  /** All detected overlays */
  overlays: OverlayAnalysis[];
  /** Detected backdrop layers (shared or individual) */
  backdrops: Array<{
    nodeId: string;
    bounds: BoundingBox;
    coveredOverlayIds: string[];
  }>;
  /** Statistics */
  stats: {
    totalOverlays: number;
    byType: Record<OverlayType, number>;
    withBackdrop: number;
    withFocusTrap: number;
  };
  /** Warnings during analysis */
  warnings: string[];
}

// ============================================================================
// Constants for Detection
// ============================================================================

/**
 * Keywords for detecting overlay types from names
 * Order matters - more specific patterns first
 */
const OVERLAY_TYPE_KEYWORDS: Record<OverlayType, string[]> = {
  "alert-dialog": ["alert-dialog", "alertdialog", "confirm-dialog", "confirmation", "alert"],
  "command-palette": ["command-palette", "command-menu", "cmd-k", "cmdk", "spotlight"],
  "context-menu": ["context-menu", "contextmenu", "right-click-menu"],
  modal: ["modal", "dialog-modal", "fullscreen-modal", "modal-dialog"],
  dialog: ["dialog", "dialogue", "popup", "lightbox"],
  popover: ["popover", "pop-over", "popup-content", "floating-panel"],
  tooltip: ["tooltip", "tip", "hint", "info-tip", "helper-tip"],
  dropdown: ["dropdown", "drop-down", "select-menu", "dropdown-menu"],
  menu: ["menu", "menu-list", "action-menu", "nav-menu"],
  sheet: ["sheet", "bottom-sheet", "action-sheet", "side-sheet"],
  drawer: ["drawer", "side-drawer", "nav-drawer", "slide-out"],
  toast: ["toast", "notification", "snack", "alert-toast"],
  snackbar: ["snackbar", "snack-bar"],
  banner: ["banner", "announcement", "alert-banner", "info-bar"],
  unknown: [],
};

/**
 * Keywords for detecting sheet/drawer positions
 */
const POSITION_KEYWORDS: Record<SheetPosition, string[]> = {
  top: ["top", "slide-down", "dropdown", "header"],
  right: ["right", "slide-left", "side-right", "end"],
  bottom: ["bottom", "slide-up", "action-sheet", "footer"],
  left: ["left", "slide-right", "side-left", "start", "nav-drawer"],
  center: ["center", "centered", "middle"],
};

/**
 * Keywords for detecting close buttons
 */
const CLOSE_BUTTON_KEYWORDS = [
  "close",
  "dismiss",
  "cancel",
  "x-button",
  "icon-close",
  "btn-close",
  "close-btn",
  "exit",
];

/**
 * Keywords for detecting action buttons
 */
const ACTION_BUTTON_KEYWORDS = [
  "confirm",
  "submit",
  "save",
  "ok",
  "yes",
  "done",
  "apply",
  "primary-action",
  "action-button",
  "cta",
];

/**
 * Keywords for detecting backdrop/overlay
 */
const BACKDROP_KEYWORDS = [
  "backdrop",
  "overlay",
  "scrim",
  "dimmer",
  "mask",
  "background-overlay",
  "modal-backdrop",
];

/**
 * Keywords for content sections
 */
const CONTENT_SECTION_KEYWORDS = {
  header: ["header", "title-bar", "top-bar", "modal-header", "dialog-header"],
  title: ["title", "heading", "modal-title", "dialog-title", "headline"],
  description: ["description", "subtitle", "subheading", "body-text", "message", "content-text"],
  body: ["body", "content", "main", "modal-body", "dialog-content"],
  footer: ["footer", "actions", "buttons", "modal-footer", "dialog-footer", "button-group"],
};

/**
 * Thresholds for overlay detection
 */
const DETECTION_THRESHOLDS = {
  /** Maximum width ratio to parent for tooltip */
  TOOLTIP_MAX_WIDTH_RATIO: 0.4,
  /** Maximum height for tooltip */
  TOOLTIP_MAX_HEIGHT: 200,
  /** Minimum width ratio for modal */
  MODAL_MIN_WIDTH_RATIO: 0.3,
  /** Maximum width ratio for popover */
  POPOVER_MAX_WIDTH_RATIO: 0.5,
  /** Minimum height for sheet */
  SHEET_MIN_HEIGHT_RATIO: 0.2,
  /** Sheet edge proximity threshold */
  SHEET_EDGE_THRESHOLD: 50,
  /** Backdrop opacity threshold */
  BACKDROP_MIN_OPACITY: 0.1,
  /** Backdrop maximum opacity (semi-transparent) */
  BACKDROP_MAX_OPACITY: 0.95,
  /** Center tolerance for modal detection */
  CENTER_TOLERANCE: 0.15,
  /** Minimum confidence to include in results */
  MIN_CONFIDENCE: 0.4,
} as const;

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze a Figma frame for overlay patterns
 */
export function analyzeOverlays(
  rootNode: FigmaNode,
  parentBounds?: BoundingBox
): OverlayAnalysisResult {
  const overlays: OverlayAnalysis[] = [];
  const backdrops: OverlayAnalysisResult["backdrops"] = [];
  const warnings: string[] = [];

  const rootBounds = extractBounds(rootNode);
  const effectiveParentBounds = parentBounds || rootBounds;

  // First pass: find potential backdrops
  const backdropNodes = findBackdropNodes(rootNode, effectiveParentBounds);

  // Second pass: find overlay content
  traverseForOverlays(
    rootNode,
    overlays,
    warnings,
    effectiveParentBounds,
    backdropNodes
  );

  // Build backdrop info
  for (const backdropNode of backdropNodes) {
    const coveredOverlays = overlays.filter(
      (o) => isOverlaidBy(o.bounds, extractBounds(backdropNode), effectiveParentBounds)
    );

    if (coveredOverlays.length > 0 || backdropNodes.length === 1) {
      backdrops.push({
        nodeId: backdropNode.id,
        bounds: extractBounds(backdropNode),
        coveredOverlayIds: coveredOverlays.map((o) => o.nodeId),
      });
    }
  }

  // Calculate statistics
  const stats = calculateStats(overlays);

  return {
    overlays,
    backdrops,
    stats,
    warnings,
  };
}

/**
 * Analyze a single node for overlay characteristics
 */
export function analyzeOverlayNode(
  node: FigmaNode,
  parentBounds: BoundingBox,
  backdropNodes: FigmaNode[] = []
): OverlayAnalysis | null {
  const bounds = extractBounds(node);

  // Calculate overlay score
  const { type, confidence, reasons } = detectOverlayType(node, bounds, parentBounds);

  if (confidence < DETECTION_THRESHOLDS.MIN_CONFIDENCE) {
    return null;
  }

  // Detect sheet position if applicable
  const sheetPosition = detectSheetPosition(type, bounds, parentBounds, node.name);

  // Detect positioning context
  const positioningContext = detectPositioningContext(type, bounds, parentBounds);

  // Analyze backdrop
  const backdrop = analyzeBackdrop(node, backdropNodes, parentBounds);

  // Determine focus trap requirements
  const focusTrap = determineFocusTrapRequirements(type, backdrop);

  // Analyze content structure
  const contentStructure = analyzeContentStructure(node);

  // Detect close mechanisms
  const closeMechanisms = detectCloseMechanisms(node, contentStructure);

  // Generate ARIA attributes
  const ariaAttributes = generateARIAAttributes(type, contentStructure, backdrop);

  // Detect trigger if this is within a larger context
  const trigger = detectTrigger(node, parentBounds);

  // Generate code suggestion
  const codeSuggestion = generateCodeSuggestion(
    type,
    sheetPosition,
    bounds,
    parentBounds,
    backdrop,
    focusTrap,
    ariaAttributes,
    contentStructure
  );

  return {
    nodeId: node.id,
    nodeName: node.name,
    overlayType: type,
    confidence,
    bounds,
    sheetPosition,
    positioningContext,
    backdrop,
    focusTrap,
    ariaAttributes,
    trigger,
    closeMechanisms,
    contentStructure,
    detectionReasons: reasons,
    codeSuggestion,
  };
}

// ============================================================================
// Overlay Type Detection
// ============================================================================

/**
 * Detect the overlay type from node characteristics
 */
function detectOverlayType(
  node: FigmaNode,
  bounds: BoundingBox,
  parentBounds: BoundingBox
): { type: OverlayType; confidence: number; reasons: string[] } {
  const scores: Array<{ type: OverlayType; score: number; reason: string }> = [];
  const lowerName = node.name.toLowerCase();

  // Score from name keywords
  for (const [overlayType, keywords] of Object.entries(OVERLAY_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        const isExactMatch = lowerName === keyword ||
          lowerName.startsWith(keyword + "-") ||
          lowerName.endsWith("-" + keyword) ||
          lowerName.includes("/" + keyword) ||
          lowerName.includes(keyword + "/");
        const score = isExactMatch ? 3.0 : 2.0;
        scores.push({
          type: overlayType as OverlayType,
          score,
          reason: `Name contains "${keyword}"`,
        });
        break;
      }
    }
  }

  // Score from visual characteristics
  const visualScores = scoreFromVisualCharacteristics(node, bounds, parentBounds);
  scores.push(...visualScores);

  // Score from positioning
  const positionScores = scoreFromPositioning(bounds, parentBounds);
  scores.push(...positionScores);

  // Score from children structure
  const structureScores = scoreFromStructure(node);
  scores.push(...structureScores);

  // Aggregate scores by type
  const typeScores = new Map<OverlayType, { total: number; reasons: string[] }>();
  for (const { type, score, reason } of scores) {
    const existing = typeScores.get(type) || { total: 0, reasons: [] };
    existing.total += score;
    existing.reasons.push(reason);
    typeScores.set(type, existing);
  }

  // Find highest scoring type
  let bestType: OverlayType = "unknown";
  let bestScore = 0;
  let bestReasons: string[] = [];

  typeScores.forEach(({ total, reasons }, type) => {
    if (total > bestScore) {
      bestType = type;
      bestScore = total;
      bestReasons = reasons;
    }
  });

  // Normalize confidence to 0-1
  const confidence = Math.min(bestScore / 4, 1);

  return { type: bestType, confidence, reasons: bestReasons };
}

/**
 * Score overlay type from visual characteristics
 */
function scoreFromVisualCharacteristics(
  node: FigmaNode,
  bounds: BoundingBox,
  parentBounds: BoundingBox
): Array<{ type: OverlayType; score: number; reason: string }> {
  const scores: Array<{ type: OverlayType; score: number; reason: string }> = [];

  const widthRatio = bounds.width / parentBounds.width;
  const heightRatio = bounds.height / parentBounds.height;

  // Tooltip detection: small size
  if (
    widthRatio < DETECTION_THRESHOLDS.TOOLTIP_MAX_WIDTH_RATIO &&
    bounds.height < DETECTION_THRESHOLDS.TOOLTIP_MAX_HEIGHT
  ) {
    scores.push({ type: "tooltip", score: 1.0, reason: "Small size (tooltip-like)" });
  }

  // Modal detection: significant size, typically centered
  if (
    widthRatio >= DETECTION_THRESHOLDS.MODAL_MIN_WIDTH_RATIO &&
    widthRatio <= 0.9 &&
    heightRatio >= 0.2 &&
    heightRatio <= 0.9
  ) {
    scores.push({ type: "modal", score: 1.0, reason: "Modal-like dimensions" });
  }

  // Popover detection: medium size
  if (
    widthRatio <= DETECTION_THRESHOLDS.POPOVER_MAX_WIDTH_RATIO &&
    heightRatio <= 0.6
  ) {
    scores.push({ type: "popover", score: 0.7, reason: "Popover-like dimensions" });
  }

  // Sheet detection: edge-aligned, full-width or full-height
  if (widthRatio >= 0.9 && heightRatio >= DETECTION_THRESHOLDS.SHEET_MIN_HEIGHT_RATIO) {
    scores.push({ type: "sheet", score: 1.5, reason: "Full-width sheet dimensions" });
  }

  if (heightRatio >= 0.7 && widthRatio <= 0.4) {
    scores.push({ type: "drawer", score: 1.5, reason: "Side drawer dimensions" });
  }

  // Toast/snackbar: small, usually at edges
  if (heightRatio <= 0.15 && widthRatio >= 0.3 && widthRatio <= 0.8) {
    scores.push({ type: "toast", score: 0.8, reason: "Toast-like dimensions" });
  }

  // Check for shadow (elevated appearance)
  if (node.effects?.some((e: { type?: string }) => e.type === "DROP_SHADOW")) {
    scores.push({ type: "modal", score: 0.3, reason: "Has drop shadow" });
    scores.push({ type: "popover", score: 0.3, reason: "Has drop shadow" });
  }

  // Check for border radius (modern dialog style)
  if (node.cornerRadius && node.cornerRadius > 0) {
    scores.push({ type: "modal", score: 0.2, reason: "Has border radius" });
    scores.push({ type: "dialog", score: 0.2, reason: "Has border radius" });
  }

  return scores;
}

/**
 * Score overlay type from positioning within parent
 */
function scoreFromPositioning(
  bounds: BoundingBox,
  parentBounds: BoundingBox
): Array<{ type: OverlayType; score: number; reason: string }> {
  const scores: Array<{ type: OverlayType; score: number; reason: string }> = [];

  // Calculate center position
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const parentCenterX = parentBounds.x + parentBounds.width / 2;
  const parentCenterY = parentBounds.y + parentBounds.height / 2;

  const centerOffsetX = Math.abs(centerX - parentCenterX) / parentBounds.width;
  const centerOffsetY = Math.abs(centerY - parentCenterY) / parentBounds.height;

  // Centered content suggests modal/dialog
  if (
    centerOffsetX < DETECTION_THRESHOLDS.CENTER_TOLERANCE &&
    centerOffsetY < DETECTION_THRESHOLDS.CENTER_TOLERANCE
  ) {
    scores.push({ type: "modal", score: 1.5, reason: "Centered in parent" });
    scores.push({ type: "dialog", score: 1.0, reason: "Centered in parent" });
  }

  // Edge positions
  const distanceFromLeft = bounds.x - parentBounds.x;
  const distanceFromRight = (parentBounds.x + parentBounds.width) - (bounds.x + bounds.width);
  const distanceFromTop = bounds.y - parentBounds.y;
  const distanceFromBottom = (parentBounds.y + parentBounds.height) - (bounds.y + bounds.height);

  // Left edge
  if (distanceFromLeft < DETECTION_THRESHOLDS.SHEET_EDGE_THRESHOLD) {
    scores.push({ type: "drawer", score: 1.2, reason: "Aligned to left edge" });
    scores.push({ type: "sheet", score: 0.8, reason: "Aligned to left edge" });
  }

  // Right edge
  if (distanceFromRight < DETECTION_THRESHOLDS.SHEET_EDGE_THRESHOLD) {
    scores.push({ type: "drawer", score: 1.2, reason: "Aligned to right edge" });
    scores.push({ type: "sheet", score: 0.8, reason: "Aligned to right edge" });
  }

  // Bottom edge
  if (distanceFromBottom < DETECTION_THRESHOLDS.SHEET_EDGE_THRESHOLD) {
    scores.push({ type: "sheet", score: 1.5, reason: "Aligned to bottom edge" });
    scores.push({ type: "toast", score: 0.8, reason: "Near bottom edge" });
  }

  // Top edge
  if (distanceFromTop < DETECTION_THRESHOLDS.SHEET_EDGE_THRESHOLD) {
    scores.push({ type: "banner", score: 1.0, reason: "Aligned to top edge" });
    scores.push({ type: "toast", score: 0.5, reason: "Near top edge" });
  }

  // Corner positions (common for toasts)
  if (
    (distanceFromTop < 100 || distanceFromBottom < 100) &&
    (distanceFromLeft < 100 || distanceFromRight < 100)
  ) {
    scores.push({ type: "toast", score: 0.8, reason: "Positioned in corner" });
  }

  return scores;
}

/**
 * Score overlay type from internal structure
 */
function scoreFromStructure(node: FigmaNode): Array<{ type: OverlayType; score: number; reason: string }> {
  const scores: Array<{ type: OverlayType; score: number; reason: string }> = [];

  if (!node.children || node.children.length === 0) {
    return scores;
  }

  const childNames = node.children.map((c) => c.name.toLowerCase());
  const allNames = childNames.join(" ");

  // Check for dialog structure (header, body, footer)
  const hasHeader = childNames.some((n) =>
    CONTENT_SECTION_KEYWORDS.header.some((k) => n.includes(k))
  );
  const hasFooter = childNames.some((n) =>
    CONTENT_SECTION_KEYWORDS.footer.some((k) => n.includes(k))
  );
  const hasTitle = childNames.some((n) =>
    CONTENT_SECTION_KEYWORDS.title.some((k) => n.includes(k))
  );

  if (hasHeader && hasFooter) {
    scores.push({ type: "modal", score: 1.5, reason: "Has header and footer structure" });
    scores.push({ type: "dialog", score: 1.5, reason: "Has header and footer structure" });
  }

  if (hasTitle) {
    scores.push({ type: "dialog", score: 0.8, reason: "Has title element" });
    scores.push({ type: "modal", score: 0.5, reason: "Has title element" });
  }

  // Check for close button
  const hasCloseButton = childNames.some((n) =>
    CLOSE_BUTTON_KEYWORDS.some((k) => n.includes(k))
  );
  if (hasCloseButton) {
    scores.push({ type: "modal", score: 0.8, reason: "Has close button" });
    scores.push({ type: "dialog", score: 0.8, reason: "Has close button" });
    scores.push({ type: "sheet", score: 0.5, reason: "Has close button" });
  }

  // Check for action buttons (confirm/cancel pattern)
  const hasActionButtons = ACTION_BUTTON_KEYWORDS.some((k) => allNames.includes(k));
  if (hasActionButtons) {
    scores.push({ type: "dialog", score: 1.0, reason: "Has action buttons" });
    scores.push({ type: "alert-dialog", score: 0.8, reason: "Has action buttons" });
  }

  // Check for menu items pattern
  const hasManyChildren = node.children.length >= 3;
  const childrenSimilarSize = areChildrenSimilarSize(node.children);
  if (hasManyChildren && childrenSimilarSize) {
    scores.push({ type: "menu", score: 1.0, reason: "Has multiple similar-sized items" });
    scores.push({ type: "dropdown", score: 1.0, reason: "Has multiple similar-sized items" });
  }

  return scores;
}

// ============================================================================
// Sheet/Drawer Position Detection
// ============================================================================

/**
 * Detect the position of a sheet or drawer
 */
function detectSheetPosition(
  type: OverlayType,
  bounds: BoundingBox,
  parentBounds: BoundingBox,
  nodeName: string
): SheetPosition | undefined {
  // Only applicable for sheets and drawers
  if (type !== "sheet" && type !== "drawer") {
    return undefined;
  }

  const lowerName = nodeName.toLowerCase();

  // Check name first
  for (const [position, keywords] of Object.entries(POSITION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return position as SheetPosition;
      }
    }
  }

  // Determine from visual position
  const distanceFromLeft = bounds.x - parentBounds.x;
  const distanceFromRight = (parentBounds.x + parentBounds.width) - (bounds.x + bounds.width);
  const distanceFromTop = bounds.y - parentBounds.y;
  const distanceFromBottom = (parentBounds.y + parentBounds.height) - (bounds.y + bounds.height);

  const minHorizontal = Math.min(distanceFromLeft, distanceFromRight);
  const minVertical = Math.min(distanceFromTop, distanceFromBottom);

  // Check which edge it's closest to
  if (minHorizontal < minVertical) {
    // Closer to a side edge
    return distanceFromLeft < distanceFromRight ? "left" : "right";
  } else {
    // Closer to top or bottom
    return distanceFromTop < distanceFromBottom ? "top" : "bottom";
  }
}

// ============================================================================
// Positioning Context Detection
// ============================================================================

/**
 * Detect the positioning context for the overlay
 */
function detectPositioningContext(
  type: OverlayType,
  bounds: BoundingBox,
  parentBounds: BoundingBox
): PositioningContext {
  // Modals and dialogs are typically fixed/centered
  if (type === "modal" || type === "dialog" || type === "alert-dialog") {
    return "fixed";
  }

  // Sheets and drawers are fixed to viewport edges
  if (type === "sheet" || type === "drawer") {
    return "fixed";
  }

  // Tooltips and popovers are anchored to trigger elements
  if (type === "tooltip" || type === "popover") {
    return "anchored";
  }

  // Menus and dropdowns are anchored
  if (type === "menu" || type === "dropdown" || type === "context-menu") {
    return "anchored";
  }

  // Toasts are typically fixed position
  if (type === "toast" || type === "snackbar" || type === "banner") {
    return "fixed";
  }

  return "absolute";
}

// ============================================================================
// Backdrop Analysis
// ============================================================================

/**
 * Find potential backdrop nodes in the tree
 */
function findBackdropNodes(
  rootNode: FigmaNode,
  parentBounds: BoundingBox
): FigmaNode[] {
  const backdrops: FigmaNode[] = [];

  function traverse(node: FigmaNode) {
    const lowerName = node.name.toLowerCase();
    const bounds = extractBounds(node);

    // Check if this looks like a backdrop
    const isBackdropByName = BACKDROP_KEYWORDS.some((k) => lowerName.includes(k));
    const isFullSize =
      bounds.width >= parentBounds.width * 0.95 &&
      bounds.height >= parentBounds.height * 0.95;
    const hasSemiTransparentFill = hasBackdropFill(node);

    if (isBackdropByName || (isFullSize && hasSemiTransparentFill)) {
      backdrops.push(node);
    }

    // Continue traversing
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  if (rootNode.children) {
    for (const child of rootNode.children) {
      traverse(child);
    }
  }

  return backdrops;
}

/**
 * Check if node has a semi-transparent fill (backdrop-like)
 */
function hasBackdropFill(node: FigmaNode): boolean {
  if (!node.fills || !Array.isArray(node.fills)) return false;

  return node.fills.some((fill: { type?: string; opacity?: number; color?: { r: number; g: number; b: number; a: number } }) => {
    if (fill.type !== "SOLID") return false;

    const opacity = fill.opacity ?? fill.color?.a ?? 1;
    return (
      opacity >= DETECTION_THRESHOLDS.BACKDROP_MIN_OPACITY &&
      opacity <= DETECTION_THRESHOLDS.BACKDROP_MAX_OPACITY
    );
  });
}

/**
 * Analyze backdrop for an overlay
 */
function analyzeBackdrop(
  node: FigmaNode,
  backdropNodes: FigmaNode[],
  parentBounds: BoundingBox
): BackdropAnalysis {
  const bounds = extractBounds(node);

  // Find backdrop that covers this overlay
  let backdropNode: FigmaNode | undefined;
  for (const bd of backdropNodes) {
    const bdBounds = extractBounds(bd);
    if (isOverlaidBy(bounds, bdBounds, parentBounds)) {
      backdropNode = bd;
      break;
    }
  }

  if (!backdropNode) {
    // Check if overlay itself contains a backdrop sibling
    // This happens when backdrop is a sibling in the same frame
    return {
      hasBackdrop: false,
      dismissOnBackdropClick: true,
    };
  }

  // Extract backdrop properties
  let opacity: number | undefined;
  let color: { r: number; g: number; b: number; a: number } | undefined;
  let hasBlur = false;
  let blurAmount: number | undefined;

  if (backdropNode.fills && Array.isArray(backdropNode.fills)) {
    const solidFill = backdropNode.fills.find(
      (f: { type?: string }) => f.type === "SOLID"
    ) as { type: string; opacity?: number; color?: { r: number; g: number; b: number; a: number } } | undefined;

    if (solidFill) {
      opacity = solidFill.opacity ?? solidFill.color?.a ?? 0.5;
      color = solidFill.color;
    }
  }

  if (backdropNode.effects && Array.isArray(backdropNode.effects)) {
    const blurEffect = backdropNode.effects.find(
      (e: { type?: string }) => e.type === "BACKGROUND_BLUR" || e.type === "LAYER_BLUR"
    ) as { type: string; radius?: number } | undefined;

    if (blurEffect) {
      hasBlur = true;
      blurAmount = blurEffect.radius;
    }
  }

  return {
    hasBackdrop: true,
    backdropNodeId: backdropNode.id,
    opacity,
    color,
    hasBlur,
    blurAmount,
    dismissOnBackdropClick: true,
  };
}

// ============================================================================
// Focus Trap Requirements
// ============================================================================

/**
 * Determine focus trap requirements based on overlay type
 */
function determineFocusTrapRequirements(
  type: OverlayType,
  backdrop: BackdropAnalysis
): FocusTrapRequirements {
  // Types that always need focus trap
  const needsFocusTrap = [
    "modal",
    "dialog",
    "alert-dialog",
    "sheet",
    "drawer",
    "command-palette",
  ].includes(type);

  // Types that need scroll lock
  const needsScrollLock = [
    "modal",
    "dialog",
    "alert-dialog",
    "sheet",
    "drawer",
  ].includes(type);

  // Determine initial focus target
  let initialFocusTarget: FocusTrapRequirements["initialFocusTarget"] = "first-focusable";
  if (type === "alert-dialog") {
    initialFocusTarget = "content"; // Focus content for alert reading
  } else if (type === "dialog" || type === "modal") {
    initialFocusTarget = "close-button"; // Focus close button for quick dismissal
  }

  // Standard focusable elements
  const focusableElements = [
    "button",
    '[role="button"]',
    "a[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ];

  return {
    requiresFocusTrap: needsFocusTrap,
    initialFocusTarget,
    returnFocusOnClose: true,
    lockScroll: needsScrollLock,
    focusableElements,
    closeOnEscape: true,
  };
}

// ============================================================================
// Content Structure Analysis
// ============================================================================

/**
 * Analyze the content structure of an overlay
 */
function analyzeContentStructure(node: FigmaNode): OverlayContentStructure {
  const structure: OverlayContentStructure = {
    hasHeader: false,
    hasTitle: false,
    hasDescription: false,
    hasBody: false,
    hasFooter: false,
    hasActions: false,
    actionNodeIds: [],
    hasCloseButton: false,
  };

  if (!node.children) return structure;

  for (const child of node.children) {
    const lowerName = child.name.toLowerCase();

    // Check for header
    if (CONTENT_SECTION_KEYWORDS.header.some((k) => lowerName.includes(k))) {
      structure.hasHeader = true;
      // Look for title within header
      if (child.children) {
        for (const headerChild of child.children) {
          const headerChildName = headerChild.name.toLowerCase();
          if (CONTENT_SECTION_KEYWORDS.title.some((k) => headerChildName.includes(k))) {
            structure.hasTitle = true;
            structure.titleNodeId = headerChild.id;
          }
        }
      }
    }

    // Check for standalone title
    if (CONTENT_SECTION_KEYWORDS.title.some((k) => lowerName.includes(k))) {
      structure.hasTitle = true;
      structure.titleNodeId = structure.titleNodeId || child.id;
    }

    // Check for description
    if (CONTENT_SECTION_KEYWORDS.description.some((k) => lowerName.includes(k))) {
      structure.hasDescription = true;
      structure.descriptionNodeId = child.id;
    }

    // Check for body
    if (CONTENT_SECTION_KEYWORDS.body.some((k) => lowerName.includes(k))) {
      structure.hasBody = true;
      structure.bodyNodeId = child.id;
    }

    // Check for footer
    if (CONTENT_SECTION_KEYWORDS.footer.some((k) => lowerName.includes(k))) {
      structure.hasFooter = true;
      structure.footerNodeId = child.id;
    }

    // Check for close button
    if (CLOSE_BUTTON_KEYWORDS.some((k) => lowerName.includes(k))) {
      structure.hasCloseButton = true;
      structure.closeButtonNodeId = child.id;
    }

    // Check for action buttons
    if (ACTION_BUTTON_KEYWORDS.some((k) => lowerName.includes(k))) {
      structure.hasActions = true;
      structure.actionNodeIds.push(child.id);
    }

    // Recursively check children
    if (child.children) {
      const childStructure = analyzeContentStructure(child);
      mergeContentStructure(structure, childStructure);
    }
  }

  return structure;
}

/**
 * Merge child content structure into parent
 */
function mergeContentStructure(
  parent: OverlayContentStructure,
  child: OverlayContentStructure
): void {
  if (child.hasTitle && !parent.hasTitle) {
    parent.hasTitle = true;
    parent.titleNodeId = child.titleNodeId;
  }
  if (child.hasDescription && !parent.hasDescription) {
    parent.hasDescription = true;
    parent.descriptionNodeId = child.descriptionNodeId;
  }
  if (child.hasCloseButton && !parent.hasCloseButton) {
    parent.hasCloseButton = true;
    parent.closeButtonNodeId = child.closeButtonNodeId;
  }
  if (child.hasActions) {
    parent.hasActions = true;
    parent.actionNodeIds.push(...child.actionNodeIds);
  }
}

// ============================================================================
// Close Mechanism Detection
// ============================================================================

/**
 * Detect close mechanisms in the overlay
 */
function detectCloseMechanisms(
  node: FigmaNode,
  contentStructure: OverlayContentStructure
): CloseMechanism[] {
  const mechanisms: CloseMechanism[] = [];

  // Close button from structure analysis
  if (contentStructure.hasCloseButton && contentStructure.closeButtonNodeId) {
    const closeNode = findNodeById(node, contentStructure.closeButtonNodeId);
    if (closeNode) {
      const position = detectCloseButtonPosition(closeNode, node);
      mechanisms.push({
        type: "button",
        nodeId: contentStructure.closeButtonNodeId,
        nodeName: closeNode.name,
        position,
        confidence: 0.9,
      });
    }
  }

  // Escape key (always available for modals/dialogs)
  mechanisms.push({
    type: "escape",
    confidence: 1.0,
  });

  // Backdrop click
  mechanisms.push({
    type: "backdrop-click",
    confidence: 0.8,
  });

  return mechanisms;
}

/**
 * Detect the position of a close button within the overlay
 */
function detectCloseButtonPosition(
  closeNode: FigmaNode,
  parentNode: FigmaNode
): CloseMechanism["position"] {
  const closeBounds = extractBounds(closeNode);
  const parentBounds = extractBounds(parentNode);

  // Calculate relative position
  const relX = (closeBounds.x - parentBounds.x) / parentBounds.width;
  const relY = (closeBounds.y - parentBounds.y) / parentBounds.height;

  // Determine position
  if (relY < 0.2) {
    if (relX > 0.7) return "top-right";
    if (relX < 0.3) return "top-left";
    return "header";
  }

  if (relY > 0.8) {
    return "footer";
  }

  return "top-right"; // Default
}

// ============================================================================
// ARIA Attributes Generation
// ============================================================================

/**
 * Generate ARIA attributes for the overlay
 */
function generateARIAAttributes(
  type: OverlayType,
  contentStructure: OverlayContentStructure,
  backdrop: BackdropAnalysis
): ARIAAttributes {
  const attrs: ARIAAttributes = {
    role: "dialog",
    additionalAttributes: {},
  };

  // Set role based on type
  switch (type) {
    case "modal":
    case "dialog":
      attrs.role = "dialog";
      attrs["aria-modal"] = true;
      break;
    case "alert-dialog":
      attrs.role = "alertdialog";
      attrs["aria-modal"] = true;
      break;
    case "menu":
    case "dropdown":
    case "context-menu":
      attrs.role = "menu";
      break;
    case "tooltip":
      attrs.role = "tooltip";
      break;
    case "toast":
    case "snackbar":
      attrs.role = "status";
      attrs["aria-live"] = "polite";
      attrs["aria-atomic"] = true;
      break;
    case "banner":
      attrs.role = "alert";
      attrs["aria-live"] = "assertive";
      break;
    case "popover":
      attrs.role = "dialog";
      break;
    case "sheet":
    case "drawer":
      attrs.role = "dialog";
      attrs["aria-modal"] = true;
      break;
    case "command-palette":
      attrs.role = "dialog";
      attrs["aria-modal"] = true;
      attrs.additionalAttributes["aria-label"] = "Command palette";
      break;
  }

  // Add labelledby/describedby references
  if (contentStructure.hasTitle && contentStructure.titleNodeId) {
    attrs["aria-labelledby"] = generateIdFromNodeId(contentStructure.titleNodeId);
  }

  if (contentStructure.hasDescription && contentStructure.descriptionNodeId) {
    attrs["aria-describedby"] = generateIdFromNodeId(contentStructure.descriptionNodeId);
  }

  // If no title, use aria-label
  if (!contentStructure.hasTitle) {
    attrs["aria-label"] = getDefaultAriaLabel(type);
  }

  return attrs;
}

/**
 * Generate a safe ID from a Figma node ID
 */
function generateIdFromNodeId(nodeId: string): string {
  return `overlay-${nodeId.replace(/[^a-zA-Z0-9]/g, "-")}`;
}

/**
 * Get default aria-label for an overlay type
 */
function getDefaultAriaLabel(type: OverlayType): string {
  const labels: Record<OverlayType, string> = {
    modal: "Modal dialog",
    dialog: "Dialog",
    "alert-dialog": "Alert dialog",
    popover: "Popover",
    tooltip: "Tooltip",
    dropdown: "Dropdown menu",
    menu: "Menu",
    sheet: "Sheet",
    drawer: "Drawer",
    toast: "Notification",
    snackbar: "Snackbar notification",
    banner: "Alert banner",
    "command-palette": "Command palette",
    "context-menu": "Context menu",
    unknown: "Overlay",
  };
  return labels[type];
}

// ============================================================================
// Trigger Detection
// ============================================================================

/**
 * Detect the trigger element for the overlay
 */
function detectTrigger(
  node: FigmaNode,
  parentBounds: BoundingBox
): OverlayTrigger | undefined {
  // This would require context from the parent frame
  // For now, we generate trigger ARIA attributes based on overlay type
  return undefined;
}

/**
 * Generate ARIA attributes for a trigger element
 */
export function generateTriggerARIA(overlayType: OverlayType, overlayId: string): ARIAAttributes {
  const attrs: ARIAAttributes = {
    role: "button",
    additionalAttributes: {},
  };

  switch (overlayType) {
    case "modal":
    case "dialog":
    case "alert-dialog":
    case "sheet":
    case "drawer":
      attrs["aria-haspopup"] = "dialog";
      break;
    case "menu":
    case "dropdown":
    case "context-menu":
      attrs["aria-haspopup"] = "menu";
      break;
    case "popover":
    case "tooltip":
      attrs["aria-haspopup"] = "true";
      break;
  }

  attrs["aria-expanded"] = false;
  attrs["aria-controls"] = overlayId;

  return attrs;
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate code suggestion for the overlay
 */
function generateCodeSuggestion(
  type: OverlayType,
  sheetPosition: SheetPosition | undefined,
  bounds: BoundingBox,
  parentBounds: BoundingBox,
  backdrop: BackdropAnalysis,
  focusTrap: FocusTrapRequirements,
  ariaAttributes: ARIAAttributes,
  contentStructure: OverlayContentStructure
): OverlayCodeSuggestion {
  const tailwindClasses = generateTailwindClasses(type, sheetPosition, bounds, parentBounds, backdrop);
  const animationCSS = generateAnimationCSS(type, sheetPosition);
  const jsx = generateJSX(type, ariaAttributes, contentStructure, tailwindClasses);
  const radixComponent = getRadixComponent(type);
  const focusTrapHook = focusTrap.requiresFocusTrap ? "useFocusTrap" : undefined;

  return {
    jsx,
    radixComponent,
    tailwindClasses,
    animationCSS,
    focusTrapHook,
  };
}

/**
 * Generate Tailwind classes for the overlay
 */
function generateTailwindClasses(
  type: OverlayType,
  sheetPosition: SheetPosition | undefined,
  bounds: BoundingBox,
  parentBounds: BoundingBox,
  backdrop: BackdropAnalysis
): string[] {
  const classes: string[] = [];

  // Base positioning
  classes.push("fixed");

  // Positioning based on type
  switch (type) {
    case "modal":
    case "dialog":
    case "alert-dialog":
      classes.push("inset-0", "flex", "items-center", "justify-center");
      break;

    case "sheet":
    case "drawer":
      if (sheetPosition === "left") {
        classes.push("inset-y-0", "left-0");
      } else if (sheetPosition === "right") {
        classes.push("inset-y-0", "right-0");
      } else if (sheetPosition === "top") {
        classes.push("inset-x-0", "top-0");
      } else if (sheetPosition === "bottom") {
        classes.push("inset-x-0", "bottom-0");
      }
      break;

    case "toast":
    case "snackbar":
      classes.push("bottom-4", "right-4");
      break;

    case "banner":
      classes.push("inset-x-0", "top-0");
      break;

    case "tooltip":
    case "popover":
    case "dropdown":
    case "menu":
    case "context-menu":
      classes.push("absolute", "z-50");
      break;
  }

  // Z-index
  classes.push("z-50");

  // Content container classes
  const contentClasses: string[] = [];

  // Background
  contentClasses.push("bg-background");

  // Border radius
  if (type === "modal" || type === "dialog" || type === "alert-dialog" || type === "popover") {
    contentClasses.push("rounded-lg");
  }

  // Shadow
  contentClasses.push("shadow-lg");

  // Width constraints
  const widthRatio = bounds.width / parentBounds.width;
  if (widthRatio < 0.5) {
    contentClasses.push("max-w-md");
  } else if (widthRatio < 0.7) {
    contentClasses.push("max-w-lg");
  } else if (widthRatio < 0.9) {
    contentClasses.push("max-w-xl");
  }

  // Animation
  contentClasses.push("animate-in");
  if (type === "modal" || type === "dialog") {
    contentClasses.push("fade-in-0", "zoom-in-95");
  } else if (sheetPosition === "left") {
    contentClasses.push("slide-in-from-left");
  } else if (sheetPosition === "right") {
    contentClasses.push("slide-in-from-right");
  } else if (sheetPosition === "bottom") {
    contentClasses.push("slide-in-from-bottom");
  } else if (sheetPosition === "top") {
    contentClasses.push("slide-in-from-top");
  }

  return [...classes, ...contentClasses];
}

/**
 * Generate CSS animation
 */
function generateAnimationCSS(type: OverlayType, sheetPosition: SheetPosition | undefined): string {
  let css = `/* Animation for ${type} */\n`;

  switch (type) {
    case "modal":
    case "dialog":
    case "alert-dialog":
      css += `@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dialog-exit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.dialog-content {
  animation: dialog-enter 0.2s ease-out;
}

.dialog-content[data-state="closed"] {
  animation: dialog-exit 0.2s ease-in;
}`;
      break;

    case "sheet":
    case "drawer":
      const direction = sheetPosition || "right";
      const translateFrom = {
        left: "translateX(-100%)",
        right: "translateX(100%)",
        top: "translateY(-100%)",
        bottom: "translateY(100%)",
        center: "scale(0.95)",
      }[direction];

      css += `@keyframes sheet-enter-${direction} {
  from {
    transform: ${translateFrom};
  }
  to {
    transform: translate(0);
  }
}

@keyframes sheet-exit-${direction} {
  from {
    transform: translate(0);
  }
  to {
    transform: ${translateFrom};
  }
}

.sheet-content {
  animation: sheet-enter-${direction} 0.3s ease-out;
}

.sheet-content[data-state="closed"] {
  animation: sheet-exit-${direction} 0.2s ease-in;
}`;
      break;

    case "tooltip":
    case "popover":
      css += `@keyframes popover-enter {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popover-content {
  animation: popover-enter 0.15s ease-out;
}`;
      break;

    case "toast":
    case "snackbar":
      css += `@keyframes toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-exit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.toast {
  animation: toast-enter 0.3s ease-out;
}

.toast[data-state="closed"] {
  animation: toast-exit 0.2s ease-in;
}`;
      break;
  }

  // Backdrop animation
  css += `

/* Backdrop animation */
@keyframes backdrop-enter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.backdrop {
  animation: backdrop-enter 0.2s ease-out;
}`;

  return css;
}

/**
 * Generate JSX code for the overlay
 */
function generateJSX(
  type: OverlayType,
  ariaAttributes: ARIAAttributes,
  contentStructure: OverlayContentStructure,
  tailwindClasses: string[]
): string {
  const ariaProps = generateARIAProps(ariaAttributes);
  const className = tailwindClasses.join(" ");

  let jsx = "";

  // Generate based on type
  switch (type) {
    case "modal":
    case "dialog":
    case "alert-dialog":
      jsx = `{/* ${type.charAt(0).toUpperCase() + type.slice(1)} */}
{isOpen && (
  <div className="fixed inset-0 z-50">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    />

    {/* Dialog */}
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div
        role="${ariaAttributes.role}"
        ${ariaProps}
        className="${className}"
      >
        ${contentStructure.hasHeader ? `{/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          ${contentStructure.hasTitle ? `<h2 id="${ariaAttributes["aria-labelledby"]}" className="text-lg font-semibold">
            Dialog Title
          </h2>` : ""}
          ${contentStructure.hasCloseButton ? `<button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>` : ""}
        </div>` : ""}

        ${contentStructure.hasBody ? `{/* Content */}
        <div className="p-4">
          ${contentStructure.hasDescription ? `<p id="${ariaAttributes["aria-describedby"]}" className="text-sm text-muted-foreground">
            Dialog description goes here.
          </p>` : ""}
          {children}
        </div>` : ""}

        ${contentStructure.hasFooter ? `{/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-primary">
            Confirm
          </button>
        </div>` : ""}
      </div>
    </div>
  </div>
)}`;
      break;

    case "sheet":
    case "drawer":
      jsx = `{/* ${type.charAt(0).toUpperCase() + type.slice(1)} */}
{isOpen && (
  <div className="fixed inset-0 z-50">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/50"
      onClick={onClose}
      aria-hidden="true"
    />

    {/* Sheet */}
    <div
      role="${ariaAttributes.role}"
      ${ariaProps}
      className="${className}"
    >
      ${contentStructure.hasCloseButton ? `<button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>` : ""}

      {children}
    </div>
  </div>
)}`;
      break;

    case "tooltip":
      jsx = `{/* Tooltip */}
<div
  role="${ariaAttributes.role}"
  className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95"
>
  {content}
</div>`;
      break;

    case "popover":
      jsx = `{/* Popover */}
{isOpen && (
  <div
    role="${ariaAttributes.role}"
    ${ariaProps}
    className="z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
  >
    {children}
  </div>
)}`;
      break;

    case "dropdown":
    case "menu":
    case "context-menu":
      jsx = `{/* ${type.charAt(0).toUpperCase() + type.slice(1)} */}
{isOpen && (
  <div
    role="${ariaAttributes.role}"
    className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
  >
    {items.map((item, index) => (
      <button
        key={index}
        role="menuitem"
        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent"
        onClick={() => onSelect(item)}
      >
        {item.label}
      </button>
    ))}
  </div>
)}`;
      break;

    case "toast":
    case "snackbar":
      jsx = `{/* ${type.charAt(0).toUpperCase() + type.slice(1)} */}
<div
  role="${ariaAttributes.role}"
  aria-live="${ariaAttributes["aria-live"]}"
  aria-atomic="${ariaAttributes["aria-atomic"]}"
  className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md bg-background px-4 py-3 shadow-lg border"
>
  {message}
  <button
    onClick={onDismiss}
    className="ml-auto rounded-sm opacity-70 hover:opacity-100"
    aria-label="Dismiss"
  >
    <X className="h-4 w-4" />
  </button>
</div>`;
      break;

    default:
      jsx = `{/* Overlay */}
<div
  role="${ariaAttributes.role}"
  ${ariaProps}
  className="${className}"
>
  {children}
</div>`;
  }

  return jsx;
}

/**
 * Generate ARIA props string for JSX
 */
function generateARIAProps(ariaAttributes: ARIAAttributes): string {
  const props: string[] = [];

  if (ariaAttributes["aria-modal"]) {
    props.push('aria-modal="true"');
  }
  if (ariaAttributes["aria-labelledby"]) {
    props.push(`aria-labelledby="${ariaAttributes["aria-labelledby"]}"`);
  }
  if (ariaAttributes["aria-describedby"]) {
    props.push(`aria-describedby="${ariaAttributes["aria-describedby"]}"`);
  }
  if (ariaAttributes["aria-label"]) {
    props.push(`aria-label="${ariaAttributes["aria-label"]}"`);
  }
  if (ariaAttributes["aria-live"]) {
    props.push(`aria-live="${ariaAttributes["aria-live"]}"`);
  }
  if (ariaAttributes["aria-atomic"]) {
    props.push(`aria-atomic="${ariaAttributes["aria-atomic"]}"`);
  }

  return props.join("\n        ");
}

/**
 * Get recommended Radix UI component for overlay type
 */
function getRadixComponent(type: OverlayType): string | undefined {
  const radixMap: Record<OverlayType, string | undefined> = {
    modal: "@radix-ui/react-dialog",
    dialog: "@radix-ui/react-dialog",
    "alert-dialog": "@radix-ui/react-alert-dialog",
    popover: "@radix-ui/react-popover",
    tooltip: "@radix-ui/react-tooltip",
    dropdown: "@radix-ui/react-dropdown-menu",
    menu: "@radix-ui/react-dropdown-menu",
    "context-menu": "@radix-ui/react-context-menu",
    sheet: "@radix-ui/react-dialog", // Using Dialog for sheet
    drawer: "@radix-ui/react-dialog", // Using Dialog for drawer
    toast: undefined, // Use sonner or custom
    snackbar: undefined,
    banner: undefined,
    "command-palette": "cmdk",
    unknown: undefined,
  };

  return radixMap[type];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract bounding box from Figma node
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
 * Check if bounds A is overlaid by bounds B (B covers A)
 */
function isOverlaidBy(
  boundsA: BoundingBox,
  boundsB: BoundingBox,
  parentBounds: BoundingBox
): boolean {
  // B should be larger or similar to A and positioned behind/around it
  return (
    boundsB.x <= boundsA.x &&
    boundsB.y <= boundsA.y &&
    boundsB.x + boundsB.width >= boundsA.x + boundsA.width &&
    boundsB.y + boundsB.height >= boundsA.y + boundsA.height
  );
}

/**
 * Check if children have similar sizes (for menu detection)
 */
function areChildrenSimilarSize(children: FigmaNode[]): boolean {
  if (children.length < 2) return true;

  const heights = children
    .filter((c) => c.absoluteBoundingBox)
    .map((c) => c.absoluteBoundingBox!.height);

  if (heights.length < 2) return true;

  const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
  const variance = heights.reduce((sum, h) => sum + Math.abs(h - avgHeight), 0) / heights.length;

  return variance / avgHeight < 0.3;
}

/**
 * Find a node by ID in the tree
 */
function findNodeById(root: FigmaNode, nodeId: string): FigmaNode | undefined {
  if (root.id === nodeId) return root;

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Traverse the node tree for overlays
 */
function traverseForOverlays(
  node: FigmaNode,
  results: OverlayAnalysis[],
  warnings: string[],
  parentBounds: BoundingBox,
  backdropNodes: FigmaNode[]
): void {
  const analysis = analyzeOverlayNode(node, parentBounds, backdropNodes);
  if (analysis && analysis.confidence >= DETECTION_THRESHOLDS.MIN_CONFIDENCE) {
    results.push(analysis);
    // Don't recurse into detected overlays - they're complete units
    return;
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      // Skip backdrop nodes
      if (backdropNodes.some((b) => b.id === child.id)) {
        continue;
      }
      traverseForOverlays(child, results, warnings, parentBounds, backdropNodes);
    }
  }
}

/**
 * Calculate statistics from analyzed overlays
 */
function calculateStats(overlays: OverlayAnalysis[]): OverlayAnalysisResult["stats"] {
  const byType: Record<OverlayType, number> = {} as Record<OverlayType, number>;
  let withBackdrop = 0;
  let withFocusTrap = 0;

  for (const overlay of overlays) {
    byType[overlay.overlayType] = (byType[overlay.overlayType] || 0) + 1;
    if (overlay.backdrop.hasBackdrop) withBackdrop++;
    if (overlay.focusTrap.requiresFocusTrap) withFocusTrap++;
  }

  return {
    totalOverlays: overlays.length,
    byType,
    withBackdrop,
    withFocusTrap,
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Quick check if a node looks like an overlay
 */
export function isLikelyOverlay(node: FigmaNode, parentBounds: BoundingBox): boolean {
  const bounds = extractBounds(node);
  const { confidence } = detectOverlayType(node, bounds, parentBounds);
  return confidence >= DETECTION_THRESHOLDS.MIN_CONFIDENCE;
}

/**
 * Get overlay type keywords for testing/documentation
 */
export function getOverlayKeywords(): Record<OverlayType, string[]> {
  return { ...OVERLAY_TYPE_KEYWORDS };
}

/**
 * Get Tailwind animation classes for an overlay type
 */
export function getAnimationClasses(type: OverlayType, sheetPosition?: SheetPosition): string[] {
  const classes = ["animate-in"];

  switch (type) {
    case "modal":
    case "dialog":
    case "alert-dialog":
      classes.push("fade-in-0", "zoom-in-95");
      break;
    case "sheet":
    case "drawer":
      if (sheetPosition === "left") classes.push("slide-in-from-left");
      else if (sheetPosition === "right") classes.push("slide-in-from-right");
      else if (sheetPosition === "top") classes.push("slide-in-from-top");
      else classes.push("slide-in-from-bottom");
      break;
    case "tooltip":
    case "popover":
      classes.push("fade-in-0", "zoom-in-95");
      break;
    case "toast":
    case "snackbar":
      classes.push("fade-in-0", "slide-in-from-right-full");
      break;
  }

  return classes;
}

/**
 * Get backdrop Tailwind classes
 */
export function getBackdropClasses(hasBlur: boolean = false): string[] {
  const classes = [
    "fixed",
    "inset-0",
    "bg-black/50",
  ];

  if (hasBlur) {
    classes.push("backdrop-blur-sm");
  }

  return classes;
}
