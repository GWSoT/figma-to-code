/**
 * Figma Interactive Element Detector
 *
 * Identifies interactive elements from Figma designs:
 * - Buttons, links, form inputs, toggles, sliders
 * - Detects hover/pressed/disabled states from component variants
 * - Maps interactions to appropriate HTML elements and ARIA roles
 */

import type { FigmaNode } from "./figma-api";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Types of interactive elements that can be detected
 */
export type InteractiveElementType =
  | "button"
  | "link"
  | "text-input"
  | "textarea"
  | "checkbox"
  | "radio"
  | "toggle"
  | "switch"
  | "slider"
  | "range"
  | "select"
  | "dropdown"
  | "menu-item"
  | "tab"
  | "accordion"
  | "disclosure"
  | "dialog-trigger"
  | "icon-button"
  | "fab" // Floating action button
  | "chip"
  | "tag"
  | "breadcrumb-link"
  | "pagination-control"
  | "stepper-control"
  | "rating"
  | "file-upload"
  | "color-picker"
  | "date-picker"
  | "time-picker"
  | "search-input"
  | "unknown";

/**
 * Interactive states that can be detected from variants
 */
export type InteractiveState =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "pressed"
  | "disabled"
  | "loading"
  | "selected"
  | "checked"
  | "unchecked"
  | "indeterminate"
  | "error"
  | "success"
  | "warning"
  | "readonly"
  | "expanded"
  | "collapsed";

/**
 * HTML element recommendation for code generation
 */
export interface HTMLElementMapping {
  /** Primary HTML element to use */
  element: string;
  /** ARIA role if needed (empty if semantic element is sufficient) */
  role?: string;
  /** Suggested ARIA attributes */
  ariaAttributes: Record<string, string | boolean>;
  /** Additional HTML attributes to consider */
  htmlAttributes: Record<string, string>;
  /** Whether the element should be focusable */
  focusable: boolean;
  /** Whether to use button/anchor wrapper */
  wrapperElement?: "button" | "a" | "label";
}

/**
 * Detected state from a component variant
 */
export interface DetectedState {
  /** The state type */
  state: InteractiveState;
  /** Confidence score (0-1) */
  confidence: number;
  /** Source of detection (name, property, visual) */
  source: "variant-name" | "variant-property" | "visual-analysis" | "naming-convention";
  /** The variant property name if applicable */
  propertyName?: string;
  /** The variant property value if applicable */
  propertyValue?: string;
}

/**
 * Complete analysis result for an interactive element
 */
export interface InteractiveElementAnalysis {
  /** The Figma node ID */
  nodeId: string;
  /** The node name */
  nodeName: string;
  /** Detected element type */
  elementType: InteractiveElementType;
  /** Confidence score for the detection (0-1) */
  confidence: number;
  /** All detected states for this element */
  states: DetectedState[];
  /** Current state (the variant being analyzed) */
  currentState: InteractiveState;
  /** HTML/ARIA mapping for code generation */
  htmlMapping: HTMLElementMapping;
  /** Additional metadata */
  metadata: InteractiveElementMetadata;
  /** Detection reasons (for debugging/transparency) */
  detectionReasons: string[];
}

/**
 * Metadata about the interactive element
 */
export interface InteractiveElementMetadata {
  /** Whether this is a component instance */
  isComponentInstance: boolean;
  /** The component name if applicable */
  componentName?: string;
  /** Component set/variant information */
  componentSet?: {
    name: string;
    variantProperties: Record<string, string[]>;
    allVariants: VariantInfo[];
  };
  /** Visual characteristics */
  visualHints: {
    hasIcon: boolean;
    hasText: boolean;
    hasIndicator: boolean;
    isRounded: boolean;
    hasBorder: boolean;
    hasShadow: boolean;
    aspectRatio: number;
  };
  /** Sizing information */
  sizing: {
    width: number;
    height: number;
    isSmall: boolean;
    isMedium: boolean;
    isLarge: boolean;
  };
  /** Interaction affordances detected */
  affordances: string[];
}

/**
 * Information about a component variant
 */
export interface VariantInfo {
  /** The variant node ID */
  nodeId: string;
  /** The variant name */
  name: string;
  /** Property values for this variant */
  properties: Record<string, string>;
  /** Detected state */
  state: InteractiveState;
}

/**
 * Result of analyzing a Figma file/frame for interactive elements
 */
export interface InteractiveElementsResult {
  /** All detected interactive elements */
  elements: InteractiveElementAnalysis[];
  /** Summary statistics */
  stats: {
    totalElements: number;
    byType: Record<InteractiveElementType, number>;
    byState: Record<InteractiveState, number>;
    componentSets: number;
  };
  /** Any warnings during analysis */
  warnings: string[];
}

// ============================================================================
// Constants and Patterns
// ============================================================================

/**
 * Keywords for detecting interactive element types from names
 * Order matters - more specific patterns should come first
 */
const ELEMENT_TYPE_KEYWORDS: Record<InteractiveElementType, string[]> = {
  // Form inputs - specific first
  "search-input": ["search", "search-box", "searchbar", "search-field", "search-input"],
  "file-upload": ["file-upload", "file-input", "upload", "dropzone", "file-picker"],
  "color-picker": ["color-picker", "colorpicker", "color-select", "hue", "saturation"],
  "date-picker": ["date-picker", "datepicker", "calendar-input", "date-select", "date-field"],
  "time-picker": ["time-picker", "timepicker", "time-select", "time-field"],
  textarea: ["textarea", "text-area", "multiline", "comment-box", "message-input"],
  "text-input": ["input", "text-field", "textfield", "text-input", "form-field", "email-input", "password-input"],

  // Selection controls
  checkbox: ["checkbox", "check-box", "checkmark", "check"],
  radio: ["radio", "radio-button", "option-button"],
  toggle: ["toggle", "toggle-switch"],
  switch: ["switch"],

  // Range/slider controls
  slider: ["slider", "range-slider", "seek-bar"],
  range: ["range", "progress-bar", "volume-control"],
  rating: ["rating", "star-rating", "stars", "review-rating"],
  "stepper-control": ["stepper", "number-input", "quantity", "counter", "increment", "decrement"],

  // Selection/dropdown
  select: ["select", "selectbox", "combobox", "combo-box"],
  dropdown: ["dropdown", "drop-down", "popover-trigger", "menu-trigger"],

  // Navigation
  "breadcrumb-link": ["breadcrumb", "crumb"],
  "pagination-control": ["pagination", "page-nav", "page-control", "pager"],
  tab: ["tab", "tab-item", "segment", "segment-control"],

  // Buttons - check these after more specific types
  "icon-button": ["icon-button", "iconbutton", "btn-icon", "action-icon"],
  fab: ["fab", "floating-action", "floating-button", "speed-dial"],
  "dialog-trigger": ["dialog-trigger", "modal-trigger", "popup-trigger", "open-dialog", "open-modal"],
  button: ["button", "btn", "cta", "submit", "cancel", "action", "primary-action", "secondary-action"],

  // Links
  link: ["link", "anchor", "href", "hyperlink", "text-link", "nav-link"],

  // Menu items
  "menu-item": ["menu-item", "menuitem", "list-item", "option", "action-item"],

  // Disclosure
  accordion: ["accordion", "collapsible", "expandable-section"],
  disclosure: ["disclosure", "expand", "collapse", "chevron-toggle"],

  // Chips/tags
  chip: ["chip", "filter-chip", "action-chip", "input-chip"],
  tag: ["tag", "label-tag", "badge-interactive"],

  unknown: [],
};

/**
 * Keywords for detecting interactive states from variant names/properties
 */
const STATE_KEYWORDS: Record<InteractiveState, string[]> = {
  default: ["default", "normal", "rest", "idle", "base"],
  hover: ["hover", "hovered", "mouseover", "rollover"],
  focus: ["focus", "focused", "keyboard-focus", "focus-visible"],
  active: ["active", "clicking", "mousedown"],
  pressed: ["pressed", "down", "tap", "click"],
  disabled: ["disabled", "inactive", "unavailable", "greyed", "grayed"],
  loading: ["loading", "pending", "processing", "spinner", "busy"],
  selected: ["selected", "active", "current", "on"],
  checked: ["checked", "on", "true", "yes", "enabled"],
  unchecked: ["unchecked", "off", "false", "no"],
  indeterminate: ["indeterminate", "mixed", "partial"],
  error: ["error", "invalid", "danger", "destructive"],
  success: ["success", "valid", "confirmed", "complete"],
  warning: ["warning", "caution", "alert"],
  readonly: ["readonly", "read-only", "view-only", "locked"],
  expanded: ["expanded", "open", "opened", "shown"],
  collapsed: ["collapsed", "closed", "hidden", "minimized"],
};

/**
 * Common variant property names that indicate state
 */
const STATE_PROPERTY_NAMES = [
  "state",
  "status",
  "variant",
  "mode",
  "type",
  "style",
  "appearance",
  "condition",
  "interaction",
];

/**
 * Size thresholds for element classification
 */
const SIZE_THRESHOLDS = {
  SMALL_MAX: 32,
  MEDIUM_MAX: 48,
  LARGE_MIN: 56,
  ICON_BUTTON_MAX: 56,
  TOGGLE_WIDTH_MIN: 40,
  TOGGLE_WIDTH_MAX: 80,
  SLIDER_MIN_WIDTH: 80,
  INPUT_MIN_HEIGHT: 28,
  INPUT_MAX_HEIGHT: 64,
} as const;

// ============================================================================
// Main Analysis Functions
// ============================================================================

/**
 * Analyze a Figma node tree for interactive elements
 */
export function analyzeInteractiveElements(
  rootNode: FigmaNode,
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>,
  fileComponentSets?: Record<string, { name: string; description: string }>
): InteractiveElementsResult {
  const elements: InteractiveElementAnalysis[] = [];
  const warnings: string[] = [];

  // Traverse the tree and analyze each node
  traverseForInteractiveElements(rootNode, elements, warnings, fileComponents, fileComponentSets);

  // Calculate statistics
  const stats = calculateStats(elements);

  return {
    elements,
    stats,
    warnings,
  };
}

/**
 * Analyze a single node for interactivity
 */
export function analyzeNode(
  node: FigmaNode,
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>,
  fileComponentSets?: Record<string, { name: string; description: string }>
): InteractiveElementAnalysis | null {
  // Determine if this node is likely interactive
  const interactivityScore = calculateInteractivityScore(node, fileComponents, fileComponentSets);

  if (interactivityScore.score < 0.3) {
    return null;
  }

  // Detect the element type
  const { type, confidence, reasons } = detectElementType(node, fileComponents);

  // Detect states from variants
  const states = detectStates(node, fileComponents, fileComponentSets);

  // Determine current state
  const currentState = detectCurrentState(node, states);

  // Get HTML/ARIA mapping
  const htmlMapping = getHTMLMapping(type, currentState, node);

  // Build metadata
  const metadata = buildMetadata(node, fileComponents, fileComponentSets);

  return {
    nodeId: node.id,
    nodeName: node.name,
    elementType: type,
    confidence,
    states,
    currentState,
    htmlMapping,
    metadata,
    detectionReasons: reasons,
  };
}

// ============================================================================
// Element Type Detection
// ============================================================================

/**
 * Detect the interactive element type from a node
 */
function detectElementType(
  node: FigmaNode,
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>
): { type: InteractiveElementType; confidence: number; reasons: string[] } {
  const scores: Array<{ type: InteractiveElementType; score: number; reason: string }> = [];
  const lowerName = node.name.toLowerCase();

  // Check component name if it's an instance
  let componentName = "";
  if (node.type === "INSTANCE" && node.componentId && fileComponents) {
    const component = fileComponents[node.componentId];
    if (component) {
      componentName = component.name.toLowerCase();
    }
  }

  const namesToCheck = [lowerName, componentName].filter(Boolean);

  // Score from name keywords
  for (const [elementType, keywords] of Object.entries(ELEMENT_TYPE_KEYWORDS)) {
    for (const name of namesToCheck) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          const isExactMatch = name === keyword || name.startsWith(keyword + "-") || name.endsWith("-" + keyword);
          const score = isExactMatch ? 2.5 : 1.5;
          scores.push({
            type: elementType as InteractiveElementType,
            score,
            reason: `Name contains "${keyword}"`,
          });
          break; // Only count each type once per name
        }
      }
    }
  }

  // Score from visual characteristics
  const visualScores = scoreFromVisualCharacteristics(node);
  scores.push(...visualScores);

  // Score from node type
  if (node.type === "COMPONENT" || node.type === "INSTANCE" || node.type === "COMPONENT_SET") {
    // Components are more likely to be interactive
    scores.push({ type: "button", score: 0.3, reason: "Is a component" });
  }

  // Aggregate scores by type
  const typeScores = new Map<InteractiveElementType, { total: number; reasons: string[] }>();
  for (const { type, score, reason } of scores) {
    const existing = typeScores.get(type) || { total: 0, reasons: [] };
    existing.total += score;
    existing.reasons.push(reason);
    typeScores.set(type, existing);
  }

  // Find the highest scoring type
  let bestType: InteractiveElementType = "unknown";
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
  const confidence = Math.min(bestScore / 3, 1);

  return { type: bestType, confidence, reasons: bestReasons };
}

/**
 * Score element type from visual characteristics
 */
function scoreFromVisualCharacteristics(
  node: FigmaNode
): Array<{ type: InteractiveElementType; score: number; reason: string }> {
  const scores: Array<{ type: InteractiveElementType; score: number; reason: string }> = [];
  const bounds = node.absoluteBoundingBox;

  if (!bounds) return scores;

  const { width, height } = bounds;
  const aspectRatio = width / height;

  // Toggle/switch detection (wide and short)
  if (
    width >= SIZE_THRESHOLDS.TOGGLE_WIDTH_MIN &&
    width <= SIZE_THRESHOLDS.TOGGLE_WIDTH_MAX &&
    height >= 16 &&
    height <= 32 &&
    aspectRatio >= 1.5 &&
    aspectRatio <= 3
  ) {
    scores.push({ type: "toggle", score: 1.5, reason: "Toggle-like dimensions" });
  }

  // Checkbox/radio detection (square-ish and small)
  if (width >= 14 && width <= 28 && Math.abs(aspectRatio - 1) < 0.2) {
    scores.push({ type: "checkbox", score: 1.0, reason: "Checkbox-like dimensions" });
  }

  // Slider detection (very wide)
  if (width >= SIZE_THRESHOLDS.SLIDER_MIN_WIDTH && height <= 24 && aspectRatio >= 4) {
    scores.push({ type: "slider", score: 1.5, reason: "Slider-like dimensions" });
  }

  // Icon button detection (small and square)
  if (
    width <= SIZE_THRESHOLDS.ICON_BUTTON_MAX &&
    height <= SIZE_THRESHOLDS.ICON_BUTTON_MAX &&
    Math.abs(aspectRatio - 1) < 0.3
  ) {
    scores.push({ type: "icon-button", score: 0.8, reason: "Icon button-like dimensions" });
  }

  // Text input detection (medium height, wider)
  if (
    height >= SIZE_THRESHOLDS.INPUT_MIN_HEIGHT &&
    height <= SIZE_THRESHOLDS.INPUT_MAX_HEIGHT &&
    width >= 100 &&
    aspectRatio >= 2
  ) {
    scores.push({ type: "text-input", score: 0.8, reason: "Input-like dimensions" });
  }

  // Button detection (medium size, wider than tall)
  if (height >= 28 && height <= 60 && width >= 60 && aspectRatio >= 1.5) {
    scores.push({ type: "button", score: 0.5, reason: "Button-like dimensions" });
  }

  // Check for border radius (suggests clickable)
  if (node.cornerRadius && node.cornerRadius > 0) {
    scores.push({ type: "button", score: 0.3, reason: "Has border radius" });
  }

  return scores;
}

// ============================================================================
// State Detection
// ============================================================================

/**
 * Detect interactive states from component variants
 */
function detectStates(
  node: FigmaNode,
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>,
  fileComponentSets?: Record<string, { name: string; description: string }>
): DetectedState[] {
  const states: DetectedState[] = [];

  // Check component properties for variant states
  if (node.componentProperties) {
    for (const [propName, propValue] of Object.entries(node.componentProperties)) {
      const lowerPropName = propName.toLowerCase();
      const valueStr = String(propValue.value).toLowerCase();

      // Check if this property indicates state
      if (STATE_PROPERTY_NAMES.some((sp) => lowerPropName.includes(sp))) {
        const detectedState = detectStateFromValue(valueStr);
        if (detectedState) {
          states.push({
            state: detectedState,
            confidence: 0.9,
            source: "variant-property",
            propertyName: propName,
            propertyValue: String(propValue.value),
          });
        }
      }

      // Boolean properties often indicate on/off states
      if (propValue.type === "BOOLEAN") {
        states.push({
          state: propValue.value ? "checked" : "unchecked",
          confidence: 0.7,
          source: "variant-property",
          propertyName: propName,
          propertyValue: String(propValue.value),
        });
      }
    }
  }

  // Check node name for state hints
  const stateFromName = detectStateFromName(node.name);
  if (stateFromName) {
    states.push(stateFromName);
  }

  // Check component name if it's an instance
  if (node.type === "INSTANCE" && node.componentId && fileComponents) {
    const component = fileComponents[node.componentId];
    if (component) {
      const stateFromComponentName = detectStateFromName(component.name);
      if (stateFromComponentName) {
        stateFromComponentName.confidence *= 1.2; // Boost confidence for component names
        states.push(stateFromComponentName);
      }
    }
  }

  // If no states detected, add default
  if (states.length === 0) {
    states.push({
      state: "default",
      confidence: 0.5,
      source: "naming-convention",
    });
  }

  return states;
}

/**
 * Detect state from a string value
 */
function detectStateFromValue(value: string): InteractiveState | null {
  const lowerValue = value.toLowerCase();

  for (const [state, keywords] of Object.entries(STATE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerValue === keyword || lowerValue.includes(keyword)) {
        return state as InteractiveState;
      }
    }
  }

  return null;
}

/**
 * Detect state from node/component name
 */
function detectStateFromName(name: string): DetectedState | null {
  const lowerName = name.toLowerCase();

  // Split by common separators
  const parts = lowerName.split(/[-_/=:,\s]+/);

  for (const [state, keywords] of Object.entries(STATE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (parts.includes(keyword)) {
        return {
          state: state as InteractiveState,
          confidence: 0.8,
          source: "variant-name",
        };
      }
    }
  }

  return null;
}

/**
 * Determine the current state from detected states
 */
function detectCurrentState(node: FigmaNode, states: DetectedState[]): InteractiveState {
  if (states.length === 0) {
    return "default";
  }

  // Sort by confidence and return the highest
  const sorted = [...states].sort((a, b) => b.confidence - a.confidence);
  return sorted[0].state;
}

// ============================================================================
// HTML/ARIA Mapping
// ============================================================================

/**
 * Get the appropriate HTML element and ARIA attributes for an interactive element
 */
function getHTMLMapping(
  elementType: InteractiveElementType,
  currentState: InteractiveState,
  node: FigmaNode
): HTMLElementMapping {
  const ariaAttributes: Record<string, string | boolean> = {};
  const htmlAttributes: Record<string, string> = {};

  switch (elementType) {
    case "button":
    case "icon-button":
    case "fab":
      return {
        element: "button",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "button",
        },
        focusable: true,
      };

    case "link":
    case "breadcrumb-link":
      return {
        element: "a",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          href: "#",
        },
        focusable: true,
      };

    case "text-input":
    case "search-input":
      return {
        element: "input",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: elementType === "search-input" ? "search" : "text",
        },
        focusable: true,
        wrapperElement: "label",
      };

    case "textarea":
      return {
        element: "textarea",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
        wrapperElement: "label",
      };

    case "checkbox":
      return {
        element: "input",
        ariaAttributes: {
          "aria-checked": currentState === "checked" || currentState === "selected",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "checkbox",
        },
        focusable: true,
        wrapperElement: "label",
      };

    case "radio":
      return {
        element: "input",
        ariaAttributes: {
          "aria-checked": currentState === "checked" || currentState === "selected",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "radio",
        },
        focusable: true,
        wrapperElement: "label",
      };

    case "toggle":
    case "switch":
      return {
        element: "button",
        role: "switch",
        ariaAttributes: {
          "aria-checked": currentState === "checked" || currentState === "selected",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "slider":
    case "range":
      return {
        element: "input",
        ariaAttributes: {
          "aria-valuemin": "0",
          "aria-valuemax": "100",
          "aria-valuenow": "50",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "range",
        },
        focusable: true,
      };

    case "select":
    case "dropdown":
      return {
        element: "select",
        ariaAttributes: {
          "aria-expanded": currentState === "expanded",
          "aria-haspopup": "listbox",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "menu-item":
      return {
        element: "button",
        role: "menuitem",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "tab":
      return {
        element: "button",
        role: "tab",
        ariaAttributes: {
          "aria-selected": currentState === "selected" || currentState === "active",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "accordion":
    case "disclosure":
      return {
        element: "button",
        ariaAttributes: {
          "aria-expanded": currentState === "expanded",
          "aria-controls": "content-id",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "dialog-trigger":
      return {
        element: "button",
        ariaAttributes: {
          "aria-haspopup": "dialog",
          "aria-expanded": currentState === "expanded",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "chip":
    case "tag":
      // Chips can be interactive or not
      return {
        element: "button",
        ariaAttributes: {
          "aria-pressed": currentState === "selected" || currentState === "checked",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "pagination-control":
      return {
        element: "button",
        ariaAttributes: {
          "aria-current": currentState === "selected" ? "page" : undefined,
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "stepper-control":
      return {
        element: "button",
        role: "spinbutton",
        ariaAttributes: {
          "aria-valuenow": "0",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };

    case "rating":
      return {
        element: "div",
        role: "radiogroup",
        ariaAttributes: {
          "aria-label": "Rating",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: false,
      };

    case "file-upload":
      return {
        element: "input",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "file",
        },
        focusable: true,
        wrapperElement: "label",
      };

    case "color-picker":
      return {
        element: "input",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "color",
        },
        focusable: true,
        wrapperElement: "label",
      };

    case "date-picker":
      return {
        element: "input",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "date",
        },
        focusable: true,
        wrapperElement: "label",
      };

    case "time-picker":
      return {
        element: "input",
        ariaAttributes: {
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {
          type: "time",
        },
        focusable: true,
        wrapperElement: "label",
      };

    default:
      return {
        element: "div",
        role: "button",
        ariaAttributes: {
          tabindex: "0",
          ...getStateAriaAttributes(currentState),
        },
        htmlAttributes: {},
        focusable: true,
      };
  }
}

/**
 * Get ARIA attributes for a given state
 */
function getStateAriaAttributes(state: InteractiveState): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};

  switch (state) {
    case "disabled":
      attrs["aria-disabled"] = true;
      break;
    case "loading":
      attrs["aria-busy"] = true;
      break;
    case "error":
      attrs["aria-invalid"] = true;
      break;
    case "readonly":
      attrs["aria-readonly"] = true;
      break;
    case "expanded":
      attrs["aria-expanded"] = true;
      break;
    case "collapsed":
      attrs["aria-expanded"] = false;
      break;
    case "pressed":
    case "active":
      attrs["aria-pressed"] = true;
      break;
  }

  return attrs;
}

// ============================================================================
// Interactivity Scoring
// ============================================================================

/**
 * Calculate a score indicating how likely a node is to be interactive
 */
function calculateInteractivityScore(
  node: FigmaNode,
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>,
  fileComponentSets?: Record<string, { name: string; description: string }>
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const lowerName = node.name.toLowerCase();

  // Components and instances are more likely interactive
  if (node.type === "COMPONENT" || node.type === "INSTANCE") {
    score += 0.3;
    reasons.push("Is a component/instance");
  }

  if (node.type === "COMPONENT_SET") {
    score += 0.5;
    reasons.push("Is a component set (variants)");
  }

  // Check for interactive keywords in name
  const interactiveKeywords = [
    "button", "btn", "link", "input", "toggle", "switch", "checkbox",
    "radio", "slider", "dropdown", "select", "tab", "menu", "action",
    "click", "tap", "press", "submit", "cancel", "close", "open",
    "expand", "collapse", "hover", "focus", "active", "disabled",
  ];

  for (const keyword of interactiveKeywords) {
    if (lowerName.includes(keyword)) {
      score += 0.4;
      reasons.push(`Name contains "${keyword}"`);
      break;
    }
  }

  // Component properties suggest interactivity
  if (node.componentProperties && Object.keys(node.componentProperties).length > 0) {
    score += 0.3;
    reasons.push("Has component properties");

    // Check for state-related properties
    for (const propName of Object.keys(node.componentProperties)) {
      if (STATE_PROPERTY_NAMES.some((sp) => propName.toLowerCase().includes(sp))) {
        score += 0.2;
        reasons.push(`Has state property: ${propName}`);
      }
    }
  }

  // Visual characteristics
  const bounds = node.absoluteBoundingBox;
  if (bounds) {
    // Interactive elements are usually reasonably sized
    if (bounds.width >= 20 && bounds.width <= 400 && bounds.height >= 20 && bounds.height <= 100) {
      score += 0.1;
      reasons.push("Interactive-sized dimensions");
    }

    // Border radius suggests clickable
    if (node.cornerRadius && node.cornerRadius > 0) {
      score += 0.1;
      reasons.push("Has border radius");
    }
  }

  return { score, reasons };
}

// ============================================================================
// Metadata Building
// ============================================================================

/**
 * Build metadata about the interactive element
 */
function buildMetadata(
  node: FigmaNode,
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>,
  fileComponentSets?: Record<string, { name: string; description: string }>
): InteractiveElementMetadata {
  const bounds = node.absoluteBoundingBox;
  const width = bounds?.width || 0;
  const height = bounds?.height || 0;

  const isComponentInstance = node.type === "INSTANCE";
  let componentName: string | undefined;
  let componentSet: InteractiveElementMetadata["componentSet"];

  if (isComponentInstance && node.componentId && fileComponents) {
    const component = fileComponents[node.componentId];
    if (component) {
      componentName = component.name;

      if (component.componentSetId && fileComponentSets) {
        const set = fileComponentSets[component.componentSetId];
        if (set) {
          componentSet = {
            name: set.name,
            variantProperties: extractVariantProperties(node),
            allVariants: [], // Would need component set children to populate
          };
        }
      }
    }
  }

  // Analyze children for visual hints
  const visualHints = analyzeVisualHints(node);

  // Determine sizing category
  const sizing = {
    width,
    height,
    isSmall: Math.max(width, height) <= SIZE_THRESHOLDS.SMALL_MAX,
    isMedium: Math.max(width, height) > SIZE_THRESHOLDS.SMALL_MAX && Math.max(width, height) <= SIZE_THRESHOLDS.MEDIUM_MAX,
    isLarge: Math.max(width, height) >= SIZE_THRESHOLDS.LARGE_MIN,
  };

  // Detect affordances
  const affordances = detectAffordances(node, visualHints);

  return {
    isComponentInstance,
    componentName,
    componentSet,
    visualHints,
    sizing,
    affordances,
  };
}

/**
 * Extract variant properties from component properties
 */
function extractVariantProperties(node: FigmaNode): Record<string, string[]> {
  const properties: Record<string, string[]> = {};

  if (node.componentProperties) {
    for (const [propName, propValue] of Object.entries(node.componentProperties)) {
      if (propValue.type === "VARIANT") {
        properties[propName] = [String(propValue.value)];
      }
    }
  }

  return properties;
}

/**
 * Analyze visual hints from node structure
 */
function analyzeVisualHints(node: FigmaNode): InteractiveElementMetadata["visualHints"] {
  const bounds = node.absoluteBoundingBox;

  let hasIcon = false;
  let hasText = false;
  let hasIndicator = false;

  // Check children for icons and text
  if (node.children) {
    for (const child of node.children) {
      const childName = child.name.toLowerCase();

      if (child.type === "TEXT") {
        hasText = true;
      }

      if (
        childName.includes("icon") ||
        childName.includes("svg") ||
        child.type === "VECTOR" ||
        child.type === "STAR" ||
        child.type === "POLYGON"
      ) {
        hasIcon = true;
      }

      if (
        childName.includes("indicator") ||
        childName.includes("badge") ||
        childName.includes("dot") ||
        childName.includes("checkmark") ||
        childName.includes("thumb")
      ) {
        hasIndicator = true;
      }
    }
  }

  const isRounded = (node.cornerRadius && node.cornerRadius > 0) || false;
  const hasBorder = (node.strokes && node.strokes.length > 0) || false;
  const hasShadow = (node.effects && node.effects.some((e: { type?: string }) => e.type === "DROP_SHADOW")) || false;

  const width = bounds?.width || 1;
  const height = bounds?.height || 1;
  const aspectRatio = width / height;

  return {
    hasIcon,
    hasText,
    hasIndicator,
    isRounded,
    hasBorder,
    hasShadow,
    aspectRatio,
  };
}

/**
 * Detect interaction affordances from the element
 */
function detectAffordances(
  node: FigmaNode,
  visualHints: InteractiveElementMetadata["visualHints"]
): string[] {
  const affordances: string[] = [];

  if (visualHints.isRounded) {
    affordances.push("rounded-corners");
  }

  if (visualHints.hasShadow) {
    affordances.push("elevated");
  }

  if (visualHints.hasBorder) {
    affordances.push("outlined");
  }

  if (visualHints.hasIcon && !visualHints.hasText) {
    affordances.push("icon-only");
  }

  if (visualHints.hasText && !visualHints.hasIcon) {
    affordances.push("text-only");
  }

  if (visualHints.hasText && visualHints.hasIcon) {
    affordances.push("icon-with-text");
  }

  if (visualHints.hasIndicator) {
    affordances.push("has-state-indicator");
  }

  // Check for fills indicating clickability
  if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    affordances.push("filled");
  }

  return affordances;
}

// ============================================================================
// Tree Traversal
// ============================================================================

/**
 * Traverse the node tree and find all interactive elements
 */
function traverseForInteractiveElements(
  node: FigmaNode,
  results: InteractiveElementAnalysis[],
  warnings: string[],
  fileComponents?: Record<string, { name: string; description: string; componentSetId?: string }>,
  fileComponentSets?: Record<string, { name: string; description: string }>
): void {
  // Analyze this node
  const analysis = analyzeNode(node, fileComponents, fileComponentSets);
  if (analysis && analysis.confidence >= 0.5) {
    results.push(analysis);
  }

  // Recurse into children (but not into component instances - they're self-contained)
  if (node.children && node.type !== "INSTANCE") {
    for (const child of node.children) {
      traverseForInteractiveElements(child, results, warnings, fileComponents, fileComponentSets);
    }
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Calculate statistics from analyzed elements
 */
function calculateStats(elements: InteractiveElementAnalysis[]): InteractiveElementsResult["stats"] {
  const byType: Record<InteractiveElementType, number> = {} as Record<InteractiveElementType, number>;
  const byState: Record<InteractiveState, number> = {} as Record<InteractiveState, number>;
  let componentSets = 0;

  for (const element of elements) {
    // Count by type
    byType[element.elementType] = (byType[element.elementType] || 0) + 1;

    // Count by current state
    byState[element.currentState] = (byState[element.currentState] || 0) + 1;

    // Count component sets
    if (element.metadata.componentSet) {
      componentSets++;
    }
  }

  return {
    totalElements: elements.length,
    byType,
    byState,
    componentSets,
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Quick check if a node is likely interactive
 */
export function isLikelyInteractive(node: FigmaNode): boolean {
  const { score } = calculateInteractivityScore(node);
  return score >= 0.3;
}

/**
 * Get all available states for an element type
 */
export function getAvailableStates(elementType: InteractiveElementType): InteractiveState[] {
  const commonStates: InteractiveState[] = ["default", "hover", "focus", "active", "disabled"];

  switch (elementType) {
    case "checkbox":
    case "radio":
    case "toggle":
    case "switch":
      return [...commonStates, "checked", "unchecked", "indeterminate"];

    case "text-input":
    case "textarea":
    case "search-input":
      return [...commonStates, "error", "success", "readonly"];

    case "button":
    case "icon-button":
    case "fab":
      return [...commonStates, "loading", "pressed"];

    case "accordion":
    case "disclosure":
    case "dropdown":
      return [...commonStates, "expanded", "collapsed"];

    case "tab":
    case "chip":
    case "tag":
      return [...commonStates, "selected"];

    default:
      return commonStates;
  }
}

/**
 * Get suggested CSS pseudo-classes for a state
 */
export function getCSSSelectorForState(state: InteractiveState): string {
  switch (state) {
    case "hover":
      return ":hover";
    case "focus":
      return ":focus, :focus-visible";
    case "active":
    case "pressed":
      return ":active";
    case "disabled":
      return ":disabled, [aria-disabled='true']";
    case "checked":
    case "selected":
      return ":checked, [aria-checked='true'], [aria-selected='true']";
    case "error":
      return "[aria-invalid='true']";
    case "expanded":
      return "[aria-expanded='true']";
    case "collapsed":
      return "[aria-expanded='false']";
    default:
      return "";
  }
}

/**
 * Get Tailwind classes for a state
 */
export function getTailwindClassesForState(state: InteractiveState): string[] {
  switch (state) {
    case "hover":
      return ["hover:"];
    case "focus":
      return ["focus:", "focus-visible:"];
    case "active":
    case "pressed":
      return ["active:"];
    case "disabled":
      return ["disabled:", "aria-disabled:"];
    case "checked":
    case "selected":
      return ["checked:", "aria-checked:", "aria-selected:"];
    case "error":
      return ["aria-invalid:"];
    default:
      return [];
  }
}
