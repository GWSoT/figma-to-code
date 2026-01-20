/**
 * Slot/Children Pattern Detector
 *
 * Identifies slot/children patterns in Figma designs and generates proper:
 * - React children and render props
 * - Vue slots (default and named)
 * - Svelte slots (default and named)
 *
 * Detection is based on:
 * - Node naming conventions (e.g., "Slot", "Content", "Children")
 * - Frame auto-layout with placeholder content
 * - Component structure analysis
 * - Visual hints like empty containers
 */

import type { FigmaNode } from "./figma-api";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Types of slots that can be detected
 */
export type SlotType =
  | "default" // Main content slot (React children, Vue default slot)
  | "header" // Header/top slot
  | "footer" // Footer/bottom slot
  | "leading" // Left/start slot (icons, avatars)
  | "trailing" // Right/end slot (actions, icons)
  | "title" // Title slot
  | "subtitle" // Subtitle slot
  | "content" // Generic content slot
  | "actions" // Actions/buttons slot
  | "icon" // Icon slot
  | "prefix" // Prefix slot (for inputs)
  | "suffix" // Suffix slot (for inputs)
  | "trigger" // Trigger slot (for dropdowns, dialogs)
  | "overlay" // Overlay content slot
  | "custom"; // Custom named slot

/**
 * A detected slot in a Figma design
 */
export interface DetectedSlot {
  /** Unique identifier for the slot */
  id: string;
  /** Slot type */
  type: SlotType;
  /** Slot name (for named slots) */
  name: string;
  /** Original Figma node name */
  nodeName: string;
  /** Node ID in Figma */
  nodeId: string;
  /** Whether this is the default/main content slot */
  isDefault: boolean;
  /** Whether the slot is required (has no fallback) */
  required: boolean;
  /** Description of the slot's purpose */
  description: string;
  /** Expected content type */
  expectedContentType: SlotContentType;
  /** Position hint for rendering order */
  position: SlotPosition;
  /** Confidence score (0-1) */
  confidence: number;
  /** Bounding box for the slot area */
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Fallback content if slot is empty */
  fallbackContent?: string;
}

/**
 * Expected content type for a slot
 */
export type SlotContentType =
  | "any" // Any content
  | "text" // Text content
  | "element" // Single element
  | "elements" // Multiple elements
  | "component" // React/Vue/Svelte component
  | "icon" // Icon element
  | "image" // Image element
  | "interactive"; // Interactive element (button, link)

/**
 * Position hint for slot ordering
 */
export type SlotPosition =
  | "start" // Start/top/left
  | "center" // Center/middle
  | "end" // End/bottom/right
  | "before" // Before main content
  | "after" // After main content
  | "overlay"; // Overlaying content

/**
 * Result of slot pattern detection
 */
export interface SlotPatternResult {
  /** Whether slots were detected */
  hasSlots: boolean;
  /** Detected slots */
  slots: DetectedSlot[];
  /** Whether there's a default content slot */
  hasDefaultSlot: boolean;
  /** Named slots (excluding default) */
  namedSlots: DetectedSlot[];
  /** Total confidence score */
  overallConfidence: number;
  /** Component type hint based on slot patterns */
  componentTypeHint?: string;
  /** Generated code for different frameworks */
  frameworkCode: {
    react: ReactSlotCode;
    vue: VueSlotCode;
    svelte: SvelteSlotCode;
  };
}

/**
 * React slot code generation
 */
export interface ReactSlotCode {
  /** Props interface additions */
  propsInterface: string;
  /** JSX for rendering slots */
  jsx: string;
  /** Usage example */
  usageExample: string;
}

/**
 * Vue slot code generation
 */
export interface VueSlotCode {
  /** Template slots */
  template: string;
  /** Script setup for slot handling */
  scriptSetup: string;
  /** Usage example */
  usageExample: string;
}

/**
 * Svelte slot code generation
 */
export interface SvelteSlotCode {
  /** Template slots */
  template: string;
  /** Script additions */
  script: string;
  /** Usage example */
  usageExample: string;
}

/**
 * Options for slot detection
 */
export interface SlotDetectionOptions {
  /** Minimum confidence threshold (0-1) */
  minConfidence: number;
  /** Include placeholder analysis */
  analyzePlaceholders: boolean;
  /** Include auto-layout analysis */
  analyzeAutoLayout: boolean;
  /** Framework for code generation */
  framework: "react" | "vue" | "svelte" | "all";
  /** Use TypeScript */
  useTypeScript: boolean;
  /** Component name for code generation */
  componentName: string;
}

const DEFAULT_OPTIONS: SlotDetectionOptions = {
  minConfidence: 0.5,
  analyzePlaceholders: true,
  analyzeAutoLayout: true,
  framework: "all",
  useTypeScript: true,
  componentName: "Component",
};

// ============================================================================
// Slot Name Patterns
// ============================================================================

/**
 * Patterns for detecting slot types from node names
 */
const SLOT_NAME_PATTERNS: Record<SlotType, RegExp[]> = {
  default: [
    /^slot$/i,
    /^content$/i,
    /^children$/i,
    /^main$/i,
    /^body$/i,
    /\bcontent\s*slot\b/i,
    /\bdefault\s*slot\b/i,
    /\bmain\s*content\b/i,
  ],
  header: [
    /^header$/i,
    /^top$/i,
    /\bheader\s*slot\b/i,
    /\btop\s*content\b/i,
    /\bheading\b/i,
  ],
  footer: [
    /^footer$/i,
    /^bottom$/i,
    /\bfooter\s*slot\b/i,
    /\bbottom\s*content\b/i,
  ],
  leading: [
    /^leading$/i,
    /^start$/i,
    /^left$/i,
    /^prepend$/i,
    /\bleading\s*slot\b/i,
    /\bstart\s*content\b/i,
  ],
  trailing: [
    /^trailing$/i,
    /^end$/i,
    /^right$/i,
    /^append$/i,
    /\btrailing\s*slot\b/i,
    /\bend\s*content\b/i,
  ],
  title: [
    /^title$/i,
    /\btitle\s*slot\b/i,
    /\bheadline\b/i,
  ],
  subtitle: [
    /^subtitle$/i,
    /^subhead$/i,
    /\bsubtitle\s*slot\b/i,
    /\bsubheading\b/i,
  ],
  content: [
    /\bcontent\b/i,
    /\binner\b/i,
    /\bwrapper\b/i,
  ],
  actions: [
    /^actions$/i,
    /^buttons$/i,
    /^cta$/i,
    /\baction\s*slot\b/i,
    /\bbuttons?\s*area\b/i,
  ],
  icon: [
    /^icon$/i,
    /^icon\s*slot$/i,
    /\bicon\s*container\b/i,
    /\bicon\s*wrapper\b/i,
  ],
  prefix: [
    /^prefix$/i,
    /\bprefix\s*slot\b/i,
    /\binput\s*prefix\b/i,
  ],
  suffix: [
    /^suffix$/i,
    /\bsuffix\s*slot\b/i,
    /\binput\s*suffix\b/i,
  ],
  trigger: [
    /^trigger$/i,
    /\btrigger\s*slot\b/i,
    /\bactivator\b/i,
  ],
  overlay: [
    /^overlay$/i,
    /\boverlay\s*content\b/i,
    /\bmodal\s*content\b/i,
    /\bdialog\s*content\b/i,
    /\bpopover\s*content\b/i,
  ],
  custom: [], // No automatic patterns for custom slots
};

/**
 * Patterns indicating placeholder content (not real content)
 */
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /placeholder/i,
  /lorem\s*ipsum/i,
  /sample/i,
  /example/i,
  /dummy/i,
  /mock/i,
  /your\s+\w+\s+here/i,
  /\[.*\]/,
  /\{.*\}/,
  /\.{3,}/,
  /xxx+/i,
];

/**
 * Patterns for component containers that should have children
 */
const CONTAINER_COMPONENT_PATTERNS: RegExp[] = [
  /^card$/i,
  /^modal$/i,
  /^dialog$/i,
  /^drawer$/i,
  /^panel$/i,
  /^section$/i,
  /^container$/i,
  /^wrapper$/i,
  /^layout$/i,
  /^box$/i,
  /^stack$/i,
  /^flex$/i,
  /^grid$/i,
  /^group$/i,
  /^accordion$/i,
  /^tab\s*panel$/i,
  /^popover$/i,
  /^tooltip$/i,
  /^dropdown$/i,
  /^menu$/i,
  /^list$/i,
  /^list\s*item$/i,
];

// ============================================================================
// Slot Detection Functions
// ============================================================================

/**
 * Detect slot patterns in a Figma node tree
 */
export function detectSlotPatterns(
  node: FigmaNode,
  options: Partial<SlotDetectionOptions> = {}
): SlotPatternResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const slots: DetectedSlot[] = [];

  // Analyze the node and its children for slot patterns
  analyzeNodeForSlots(node, slots, opts, true);

  // Deduplicate and sort slots
  const uniqueSlots = deduplicateSlots(slots);
  const filteredSlots = uniqueSlots.filter(s => s.confidence >= opts.minConfidence);

  // Determine default slot
  const defaultSlot = findDefaultSlot(filteredSlots);
  const namedSlots = filteredSlots.filter(s => !s.isDefault);

  // Calculate overall confidence
  const overallConfidence = filteredSlots.length > 0
    ? filteredSlots.reduce((sum, s) => sum + s.confidence, 0) / filteredSlots.length
    : 0;

  // Generate framework-specific code
  const frameworkCode = generateFrameworkCode(filteredSlots, opts);

  return {
    hasSlots: filteredSlots.length > 0,
    slots: filteredSlots,
    hasDefaultSlot: !!defaultSlot,
    namedSlots,
    overallConfidence,
    componentTypeHint: inferComponentType(node, filteredSlots),
    frameworkCode,
  };
}

/**
 * Analyze a node and its children for slot patterns
 */
function analyzeNodeForSlots(
  node: FigmaNode,
  slots: DetectedSlot[],
  options: SlotDetectionOptions,
  isRoot: boolean
): void {
  // Check if node name matches slot patterns
  const slotFromName = detectSlotFromName(node);
  if (slotFromName) {
    slots.push(slotFromName);
  }

  // Check for container components that should have default children
  if (isRoot && isContainerComponent(node.name)) {
    const containerSlot = createContainerDefaultSlot(node);
    if (containerSlot) {
      slots.push(containerSlot);
    }
  }

  // Check for auto-layout containers with placeholder content
  if (options.analyzeAutoLayout && isAutoLayoutContainer(node)) {
    const layoutSlots = detectAutoLayoutSlots(node, options);
    slots.push(...layoutSlots);
  }

  // Check for placeholder content indicating slot areas
  if (options.analyzePlaceholders && hasPlaceholderContent(node)) {
    const placeholderSlot = createPlaceholderSlot(node);
    if (placeholderSlot) {
      slots.push(placeholderSlot);
    }
  }

  // Recursively analyze children
  if (node.children) {
    for (const child of node.children) {
      analyzeNodeForSlots(child, slots, options, false);
    }
  }
}

/**
 * Detect slot type from node name
 */
function detectSlotFromName(node: FigmaNode): DetectedSlot | null {
  const name = node.name.trim();

  for (const [slotType, patterns] of Object.entries(SLOT_NAME_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(name)) {
        return createSlot(node, slotType as SlotType, 0.9);
      }
    }
  }

  // Check for explicit slot naming convention: "slot:name" or "[slot]"
  const explicitSlotMatch = name.match(/(?:slot[:\s-]+)?(\w+)/i);
  if (name.toLowerCase().includes("slot") && explicitSlotMatch) {
    const slotName = explicitSlotMatch[1].toLowerCase();
    const slotType = mapNameToSlotType(slotName);
    return createSlot(node, slotType, 0.95);
  }

  return null;
}

/**
 * Map a slot name to a slot type
 */
function mapNameToSlotType(name: string): SlotType {
  const lowerName = name.toLowerCase();

  // Check each slot type's patterns
  for (const [slotType, patterns] of Object.entries(SLOT_NAME_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerName)) {
        return slotType as SlotType;
      }
    }
  }

  // Check for common mappings
  const mappings: Record<string, SlotType> = {
    header: "header",
    head: "header",
    top: "header",
    footer: "footer",
    foot: "footer",
    bottom: "footer",
    left: "leading",
    start: "leading",
    prepend: "leading",
    right: "trailing",
    end: "trailing",
    append: "trailing",
    title: "title",
    headline: "title",
    subtitle: "subtitle",
    subhead: "subtitle",
    content: "content",
    body: "default",
    main: "default",
    children: "default",
    actions: "actions",
    buttons: "actions",
    icon: "icon",
    prefix: "prefix",
    suffix: "suffix",
    trigger: "trigger",
    overlay: "overlay",
  };

  return mappings[lowerName] || "custom";
}

/**
 * Create a slot definition
 */
function createSlot(
  node: FigmaNode,
  type: SlotType,
  confidence: number
): DetectedSlot {
  const name = generateSlotName(node.name, type);
  const position = inferSlotPosition(type, node);
  const expectedContentType = inferContentType(type, node);

  return {
    id: `slot-${node.id}`,
    type,
    name,
    nodeName: node.name,
    nodeId: node.id,
    isDefault: type === "default" || type === "content",
    required: false,
    description: generateSlotDescription(type, name),
    expectedContentType,
    position,
    confidence,
    bounds: node.absoluteBoundingBox
      ? {
          x: node.absoluteBoundingBox.x,
          y: node.absoluteBoundingBox.y,
          width: node.absoluteBoundingBox.width,
          height: node.absoluteBoundingBox.height,
        }
      : undefined,
  };
}

/**
 * Generate a valid slot name from node name
 */
function generateSlotName(nodeName: string, type: SlotType): string {
  // Clean the node name
  let name = nodeName
    .replace(/\s*slot\s*/gi, "")
    .replace(/[\s-]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");

  // If empty after cleaning, use the slot type
  if (!name) {
    name = type === "custom" ? "content" : type;
  }

  // Convert to camelCase for named slots
  if (type !== "default") {
    name = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  } else {
    name = "default";
  }

  return name;
}

/**
 * Infer slot position from type and node
 */
function inferSlotPosition(type: SlotType, node: FigmaNode): SlotPosition {
  switch (type) {
    case "header":
    case "title":
    case "leading":
    case "prefix":
      return "start";
    case "footer":
    case "subtitle":
    case "trailing":
    case "suffix":
    case "actions":
      return "end";
    case "overlay":
    case "trigger":
      return "overlay";
    case "content":
    case "default":
    default:
      return "center";
  }
}

/**
 * Infer expected content type from slot type and node
 */
function inferContentType(type: SlotType, node: FigmaNode): SlotContentType {
  switch (type) {
    case "icon":
      return "icon";
    case "title":
    case "subtitle":
      return "text";
    case "actions":
      return "interactive";
    case "trigger":
      return "component";
    case "leading":
    case "trailing":
    case "prefix":
    case "suffix":
      return "element";
    case "header":
    case "footer":
    case "content":
    case "default":
    case "overlay":
    default:
      return "any";
  }
}

/**
 * Generate a description for a slot
 */
function generateSlotDescription(type: SlotType, name: string): string {
  const descriptions: Record<SlotType, string> = {
    default: "The main content area of the component.",
    header: "Content displayed in the header area.",
    footer: "Content displayed in the footer area.",
    leading: "Content displayed at the start (left in LTR).",
    trailing: "Content displayed at the end (right in LTR).",
    title: "The title text or element.",
    subtitle: "The subtitle or secondary text.",
    content: "The main content area.",
    actions: "Action buttons or interactive elements.",
    icon: "An icon element.",
    prefix: "Content displayed before the main element.",
    suffix: "Content displayed after the main element.",
    trigger: "The element that triggers the component.",
    overlay: "Content displayed in the overlay.",
    custom: `Custom slot for ${name} content.`,
  };

  return descriptions[type];
}

/**
 * Check if a node is a container component that typically has children
 */
function isContainerComponent(name: string): boolean {
  return CONTAINER_COMPONENT_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Create a default slot for container components
 */
function createContainerDefaultSlot(node: FigmaNode): DetectedSlot | null {
  // Only create if there are children that look like content
  if (!node.children || node.children.length === 0) {
    return null;
  }

  return createSlot(node, "default", 0.7);
}

/**
 * Check if a node is an auto-layout container
 */
function isAutoLayoutContainer(node: FigmaNode): boolean {
  // Check for Figma auto-layout properties
  const nodeAny = node as any;
  return (
    nodeAny.layoutMode === "HORIZONTAL" ||
    nodeAny.layoutMode === "VERTICAL" ||
    nodeAny.primaryAxisSizingMode !== undefined
  );
}

/**
 * Detect slots from auto-layout container structure
 */
function detectAutoLayoutSlots(
  node: FigmaNode,
  options: SlotDetectionOptions
): DetectedSlot[] {
  const slots: DetectedSlot[] = [];
  const nodeAny = node as any;

  if (!node.children || node.children.length === 0) {
    return slots;
  }

  const isHorizontal = nodeAny.layoutMode === "HORIZONTAL";

  // Analyze children positions
  const children = node.children;

  // Check first child for leading/header slot
  if (children.length >= 2) {
    const first = children[0];
    if (looksLikeSlotContent(first)) {
      const type = isHorizontal ? "leading" : "header";
      slots.push(createSlot(first, type, 0.6));
    }
  }

  // Check last child for trailing/footer slot
  if (children.length >= 2) {
    const last = children[children.length - 1];
    if (looksLikeSlotContent(last)) {
      const type = isHorizontal ? "trailing" : "footer";
      slots.push(createSlot(last, type, 0.6));
    }
  }

  // Check middle children for content slot
  if (children.length >= 3) {
    const middle = children.slice(1, -1);
    if (middle.length === 1 && looksLikeSlotContent(middle[0])) {
      slots.push(createSlot(middle[0], "content", 0.6));
    }
  }

  return slots;
}

/**
 * Check if a node looks like slot content (placeholder or generic container)
 */
function looksLikeSlotContent(node: FigmaNode): boolean {
  // Check name patterns
  if (hasPlaceholderName(node.name)) {
    return true;
  }

  // Check for empty or minimal content
  const nodeAny = node as any;
  if (nodeAny.type === "FRAME" || nodeAny.type === "GROUP") {
    if (!node.children || node.children.length === 0) {
      return true;
    }
  }

  // Check for placeholder patterns
  return SLOT_NAME_PATTERNS.content.some((pattern) => pattern.test(node.name));
}

/**
 * Check if a node name looks like a placeholder
 */
function hasPlaceholderName(name: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Check if a node has placeholder content
 */
function hasPlaceholderContent(node: FigmaNode): boolean {
  // Check node name
  if (hasPlaceholderName(node.name)) {
    return true;
  }

  // Check for text children with placeholder content
  if (node.children) {
    for (const child of node.children) {
      if ((child as any).type === "TEXT") {
        const characters = (child as any).characters;
        if (characters && hasPlaceholderName(characters)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Create a slot from placeholder content
 */
function createPlaceholderSlot(node: FigmaNode): DetectedSlot | null {
  // Try to infer slot type from placeholder
  const slotType = inferSlotTypeFromPlaceholder(node);

  return createSlot(node, slotType, 0.65);
}

/**
 * Infer slot type from placeholder patterns
 */
function inferSlotTypeFromPlaceholder(node: FigmaNode): SlotType {
  const name = node.name.toLowerCase();

  if (name.includes("title") || name.includes("heading")) {
    return "title";
  }
  if (name.includes("subtitle") || name.includes("description")) {
    return "subtitle";
  }
  if (name.includes("icon")) {
    return "icon";
  }
  if (name.includes("action") || name.includes("button")) {
    return "actions";
  }
  if (name.includes("header") || name.includes("top")) {
    return "header";
  }
  if (name.includes("footer") || name.includes("bottom")) {
    return "footer";
  }

  return "content";
}

/**
 * Find the default slot from a list of slots
 */
function findDefaultSlot(slots: DetectedSlot[]): DetectedSlot | undefined {
  // First, look for explicitly marked default slot
  const explicitDefault = slots.find((s) => s.isDefault && s.type === "default");
  if (explicitDefault) {
    return explicitDefault;
  }

  // Then look for content slots
  const contentSlot = slots.find((s) => s.type === "content");
  if (contentSlot) {
    contentSlot.isDefault = true;
    return contentSlot;
  }

  // If only one slot, make it default
  if (slots.length === 1) {
    slots[0].isDefault = true;
    return slots[0];
  }

  return undefined;
}

/**
 * Deduplicate slots by node ID
 */
function deduplicateSlots(slots: DetectedSlot[]): DetectedSlot[] {
  const slotMap = new Map<string, DetectedSlot>();

  for (const slot of slots) {
    const existing = slotMap.get(slot.nodeId);
    if (!existing || slot.confidence > existing.confidence) {
      slotMap.set(slot.nodeId, slot);
    }
  }

  // Sort by position
  const positionOrder: SlotPosition[] = [
    "start",
    "before",
    "center",
    "after",
    "end",
    "overlay",
  ];

  return Array.from(slotMap.values()).sort(
    (a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position)
  );
}

/**
 * Infer component type from node and slot patterns
 */
function inferComponentType(
  node: FigmaNode,
  slots: DetectedSlot[]
): string | undefined {
  const hasHeader = slots.some((s) => s.type === "header");
  const hasFooter = slots.some((s) => s.type === "footer");
  const hasActions = slots.some((s) => s.type === "actions");
  const hasTrigger = slots.some((s) => s.type === "trigger");
  const hasOverlay = slots.some((s) => s.type === "overlay");
  const hasLeadingTrailing =
    slots.some((s) => s.type === "leading") ||
    slots.some((s) => s.type === "trailing");

  if (hasTrigger && hasOverlay) {
    return "dropdown";
  }
  if (hasHeader && hasFooter && hasActions) {
    return "dialog";
  }
  if (hasHeader && hasFooter) {
    return "card";
  }
  if (hasLeadingTrailing) {
    return "list-item";
  }
  if (hasActions) {
    return "action-container";
  }

  return undefined;
}

// ============================================================================
// Framework Code Generation
// ============================================================================

/**
 * Generate framework-specific code for slots
 */
function generateFrameworkCode(
  slots: DetectedSlot[],
  options: SlotDetectionOptions
): SlotPatternResult["frameworkCode"] {
  return {
    react: generateReactSlotCode(slots, options),
    vue: generateVueSlotCode(slots, options),
    svelte: generateSvelteSlotCode(slots, options),
  };
}

/**
 * Generate React slot code
 */
function generateReactSlotCode(
  slots: DetectedSlot[],
  options: SlotDetectionOptions
): ReactSlotCode {
  const { componentName, useTypeScript } = options;
  const defaultSlot = slots.find((s) => s.isDefault);
  const namedSlots = slots.filter((s) => !s.isDefault);

  // Generate props interface
  let propsInterface = "";
  const propLines: string[] = [];

  // Children prop for default slot
  if (defaultSlot) {
    propLines.push(
      `  /** ${defaultSlot.description} */`,
      `  children?: React.ReactNode;`
    );
  }

  // Named slot props as render props or ReactNode
  for (const slot of namedSlots) {
    const propName = slot.name;
    const propType = getReactPropType(slot);
    const required = slot.required ? "" : "?";

    propLines.push(`  /** ${slot.description} */`, `  ${propName}${required}: ${propType};`);
  }

  if (useTypeScript && propLines.length > 0) {
    propsInterface = `interface ${componentName}Props {\n${propLines.join("\n")}\n}`;
  }

  // Generate JSX
  let jsx = "";
  const jsxParts: string[] = [];

  for (const slot of slots) {
    if (slot.isDefault) {
      jsxParts.push(`{children}`);
    } else {
      const propName = slot.name;
      if (slot.expectedContentType === "component") {
        jsxParts.push(`{typeof ${propName} === 'function' ? ${propName}() : ${propName}}`);
      } else {
        jsxParts.push(`{${propName}}`);
      }
    }
  }

  jsx = jsxParts.join("\n      ");

  // Generate usage example
  const usageProps: string[] = [];
  for (const slot of namedSlots) {
    usageProps.push(`  ${slot.name}={<div>Your ${slot.name} content</div>}`);
  }

  const usageExample = `<${componentName}${usageProps.length > 0 ? "\n" + usageProps.join("\n") + "\n" : ""}>
  {/* Default content */}
  <p>Your content here</p>
</${componentName}>`;

  return {
    propsInterface,
    jsx,
    usageExample,
  };
}

/**
 * Get React prop type for a slot
 */
function getReactPropType(slot: DetectedSlot): string {
  switch (slot.expectedContentType) {
    case "text":
      return "React.ReactNode | string";
    case "component":
      return "React.ReactNode | (() => React.ReactNode)";
    case "icon":
      return "React.ReactElement";
    case "interactive":
      return "React.ReactNode";
    default:
      return "React.ReactNode";
  }
}

/**
 * Generate Vue slot code
 */
function generateVueSlotCode(
  slots: DetectedSlot[],
  options: SlotDetectionOptions
): VueSlotCode {
  const defaultSlot = slots.find((s) => s.isDefault);
  const namedSlots = slots.filter((s) => !s.isDefault);

  // Generate template slots
  const templateParts: string[] = [];

  if (defaultSlot) {
    if (defaultSlot.fallbackContent) {
      templateParts.push(`<!-- ${defaultSlot.description} -->`);
      templateParts.push(`<slot>${defaultSlot.fallbackContent}</slot>`);
    } else {
      templateParts.push(`<!-- ${defaultSlot.description} -->`);
      templateParts.push(`<slot />`);
    }
  }

  for (const slot of namedSlots) {
    templateParts.push(`<!-- ${slot.description} -->`);
    if (slot.fallbackContent) {
      templateParts.push(`<slot name="${slot.name}">${slot.fallbackContent}</slot>`);
    } else {
      templateParts.push(`<slot name="${slot.name}" />`);
    }
  }

  const template = templateParts.join("\n    ");

  // Generate script setup for slot handling
  let scriptSetup = "";
  if (options.useTypeScript && namedSlots.length > 0) {
    const slotTypes: string[] = [];
    for (const slot of slots) {
      const slotName = slot.isDefault ? "default" : slot.name;
      slotTypes.push(`  ${slotName}?: (props: {}) => any;`);
    }

    scriptSetup = `defineSlots<{
${slotTypes.join("\n")}
}>();`;
  }

  // Generate usage example
  const usageParts: string[] = [];

  if (defaultSlot) {
    usageParts.push(`  <!-- Default slot content -->`);
    usageParts.push(`  <p>Your content here</p>`);
  }

  for (const slot of namedSlots) {
    usageParts.push(`  <!-- ${slot.description} -->`);
    usageParts.push(`  <template #${slot.name}>`);
    usageParts.push(`    <div>Your ${slot.name} content</div>`);
    usageParts.push(`  </template>`);
  }

  const usageExample = `<${options.componentName}>
${usageParts.join("\n")}
</${options.componentName}>`;

  return {
    template,
    scriptSetup,
    usageExample,
  };
}

/**
 * Generate Svelte slot code
 */
function generateSvelteSlotCode(
  slots: DetectedSlot[],
  options: SlotDetectionOptions
): SvelteSlotCode {
  const defaultSlot = slots.find((s) => s.isDefault);
  const namedSlots = slots.filter((s) => !s.isDefault);

  // Generate template slots
  const templateParts: string[] = [];

  if (defaultSlot) {
    templateParts.push(`<!-- ${defaultSlot.description} -->`);
    if (defaultSlot.fallbackContent) {
      templateParts.push(`<slot>${defaultSlot.fallbackContent}</slot>`);
    } else {
      templateParts.push(`<slot />`);
    }
  }

  for (const slot of namedSlots) {
    templateParts.push(`<!-- ${slot.description} -->`);
    if (slot.fallbackContent) {
      templateParts.push(`<slot name="${slot.name}">${slot.fallbackContent}</slot>`);
    } else {
      templateParts.push(`<slot name="${slot.name}" />`);
    }
  }

  const template = templateParts.join("\n  ");

  // Generate script additions for Svelte 5 snippets (optional)
  let script = "";
  if (options.useTypeScript && namedSlots.length > 0) {
    const snippetTypes: string[] = [];

    for (const slot of namedSlots) {
      snippetTypes.push(`  /** ${slot.description} */`);
      snippetTypes.push(`  ${slot.name}?: import('svelte').Snippet;`);
    }

    if (defaultSlot) {
      snippetTypes.unshift(`  /** ${defaultSlot.description} */`);
      snippetTypes.unshift(`  children?: import('svelte').Snippet;`);
    }

    script = `// Optional: Svelte 5 snippet props for typed slots
interface $$Slots {
${snippetTypes.join("\n")}
}`;
  }

  // Generate usage example
  const usageParts: string[] = [];

  if (defaultSlot) {
    usageParts.push(`  <!-- Default slot content -->`);
    usageParts.push(`  <p>Your content here</p>`);
  }

  for (const slot of namedSlots) {
    usageParts.push(`  <!-- ${slot.description} -->`);
    usageParts.push(`  <svelte:fragment slot="${slot.name}">`);
    usageParts.push(`    <div>Your ${slot.name} content</div>`);
    usageParts.push(`  </svelte:fragment>`);
  }

  const usageExample = `<${options.componentName}>
${usageParts.join("\n")}
</${options.componentName}>`;

  return {
    template,
    script,
    usageExample,
  };
}

// ============================================================================
// Additional Utilities
// ============================================================================

/**
 * Analyze a component for slot compatibility
 */
export function analyzeSlotCompatibility(
  node: FigmaNode,
  targetFramework: "react" | "vue" | "svelte"
): {
  isCompatible: boolean;
  issues: string[];
  suggestions: string[];
} {
  const result = detectSlotPatterns(node);
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for common issues
  if (!result.hasDefaultSlot && result.namedSlots.length === 0) {
    suggestions.push(
      "Consider adding a default content slot for flexibility."
    );
  }

  if (result.namedSlots.length > 5) {
    issues.push(
      `High number of named slots (${result.namedSlots.length}). Consider simplifying the component structure.`
    );
  }

  // Framework-specific checks
  if (targetFramework === "react") {
    for (const slot of result.namedSlots) {
      if (slot.name === "children") {
        issues.push(
          "Slot named 'children' conflicts with React's children prop."
        );
      }
    }
  }

  if (targetFramework === "vue") {
    for (const slot of result.namedSlots) {
      if (slot.name.includes("-")) {
        suggestions.push(
          `Slot name '${slot.name}' contains hyphens. Use camelCase for Vue slot names.`
        );
      }
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Generate slot documentation for a component
 */
export function generateSlotDocumentation(
  result: SlotPatternResult,
  format: "markdown" | "jsdoc" = "markdown"
): string {
  if (!result.hasSlots) {
    return format === "markdown"
      ? "No slots detected in this component."
      : "// No slots detected";
  }

  if (format === "markdown") {
    let doc = "## Slots\n\n";

    if (result.hasDefaultSlot) {
      const defaultSlot = result.slots.find((s) => s.isDefault);
      if (defaultSlot) {
        doc += `### Default Slot\n\n${defaultSlot.description}\n\n`;
      }
    }

    if (result.namedSlots.length > 0) {
      doc += "### Named Slots\n\n";
      doc += "| Name | Description | Content Type |\n";
      doc += "|------|-------------|-------------|\n";

      for (const slot of result.namedSlots) {
        doc += `| \`${slot.name}\` | ${slot.description} | ${slot.expectedContentType} |\n`;
      }
    }

    return doc;
  } else {
    let doc = "/**\n * @slot";

    if (result.hasDefaultSlot) {
      const defaultSlot = result.slots.find((s) => s.isDefault);
      if (defaultSlot) {
        doc += ` - ${defaultSlot.description}\n`;
      }
    }

    for (const slot of result.namedSlots) {
      doc += ` * @slot ${slot.name} - ${slot.description}\n`;
    }

    doc += " */";
    return doc;
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  SLOT_NAME_PATTERNS,
  PLACEHOLDER_PATTERNS,
  CONTAINER_COMPONENT_PATTERNS,
  DEFAULT_OPTIONS as SLOT_DETECTION_DEFAULTS,
};
