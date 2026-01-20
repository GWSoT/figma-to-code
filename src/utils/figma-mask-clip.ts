/**
 * Figma Mask and Clip Relationship Processor
 *
 * This module handles converting Figma masking and clipping properties to CSS.
 * It supports:
 * - isMask property (mask groups)
 * - clipsContent property (overflow clipping)
 * - Vector mask to clip-path conversion
 * - Alpha and inverted masks via mask-image
 *
 * Figma Masking Model:
 * - When a layer has `isMask: true`, it becomes a mask for all subsequent siblings
 * - The mask shape defines the visible area for all layers below it in the group
 * - Alpha masks use the opacity/transparency of the mask layer
 * - Inverted masks show the inverse of the mask shape
 *
 * CSS Output Strategies:
 * 1. overflow: hidden - For simple rectangular clipping (clipsContent)
 * 2. clip-path - For vector shape masks (polygon, circle, ellipse, inset)
 * 3. mask-image - For alpha masks and inverted masks
 */

import type { FigmaNode } from "./figma-api";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Figma mask modes
 * - ALPHA: Uses the alpha channel of the mask layer
 * - VECTOR: Uses the shape outline for clipping
 * - LUMINANCE: Uses brightness values (less common in Figma)
 */
export type FigmaMaskType = "ALPHA" | "VECTOR" | "LUMINANCE";

/**
 * CSS mask composite operations
 */
export type CSSMaskComposite =
  | "add"
  | "subtract"
  | "intersect"
  | "exclude";

/**
 * CSS clip-path shape types we can generate
 */
export type ClipPathShape =
  | "inset"
  | "circle"
  | "ellipse"
  | "polygon"
  | "path"
  | "none";

/**
 * Extended node interface with mask-related properties
 * These properties come from the Figma API for nodes
 */
export interface MaskableNode {
  id: string;
  name: string;
  type: string;
  /** Whether this node acts as a mask for sibling nodes */
  isMask?: boolean;
  /** The type of mask (when isMask is true) */
  maskType?: FigmaMaskType;
  /** Whether the frame clips its contents */
  clipsContent?: boolean;
  /** Node opacity (used for alpha masking calculations) */
  opacity?: number;
  /** Visibility of the node */
  visible?: boolean;
  /** Child nodes */
  children?: MaskableNode[];
  /** Bounding box for position calculations */
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Fill geometry data for vector masks */
  fillGeometry?: Array<{
    path: string;
    windingRule: "NONZERO" | "EVENODD";
  }>;
  /** Stroke geometry data */
  strokeGeometry?: Array<{
    path: string;
    windingRule: "NONZERO" | "EVENODD";
  }>;
  /** Corner radius for rounded rectangles */
  cornerRadius?: number;
  /** Individual corner radii */
  rectangleCornerRadii?: [number, number, number, number];
  /** Whether effects are applied (for mask detection) */
  effects?: Array<{
    type: string;
    visible?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
  /** Fills for determining alpha mask behavior */
  fills?: Array<{
    type: string;
    opacity?: number;
    visible?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
}

/**
 * Result of analyzing a mask relationship
 */
export interface MaskAnalysis {
  /** Whether masking is present */
  hasMasking: boolean;
  /** The mask node (if found) */
  maskNode?: MaskableNode;
  /** Nodes that are masked by this mask */
  maskedNodes: MaskableNode[];
  /** Type of mask detected */
  maskType: FigmaMaskType;
  /** Whether this is an inverted mask */
  isInverted: boolean;
  /** Whether alpha values should be used */
  usesAlpha: boolean;
}

/**
 * CSS output for clipping/masking
 */
export interface MaskClipCSSOutput {
  /** The primary CSS property being used */
  strategy: "overflow" | "clip-path" | "mask-image" | "none";
  /** CSS properties to apply */
  cssProperties: Record<string, string>;
  /** Tailwind classes (where applicable) */
  tailwindClasses: string[];
  /** Whether CSS variables are needed */
  requiresCSSVariables: boolean;
  /** CSS variable definitions if needed */
  cssVariables?: Record<string, string>;
  /** Warning or note about the conversion */
  warning?: string;
  /** Whether a fallback was used */
  usedFallback: boolean;
}

/**
 * Options for mask/clip conversion
 */
export interface MaskClipConversionOptions {
  /** Whether to generate Tailwind classes */
  useTailwind?: boolean;
  /** Whether to include fallbacks for older browsers */
  includeFallbacks?: boolean;
  /** Whether to include CSS comments explaining the conversion */
  includeComments?: boolean;
  /** Custom mask image URL (for external mask images) */
  customMaskUrl?: string;
  /** Whether to use SVG path data directly in clip-path */
  useSVGPaths?: boolean;
  /** Precision for generated coordinates (decimal places) */
  coordinatePrecision?: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default conversion options
 */
export const DEFAULT_OPTIONS: Required<MaskClipConversionOptions> = {
  useTailwind: true,
  includeFallbacks: true,
  includeComments: false,
  customMaskUrl: "",
  useSVGPaths: true,
  coordinatePrecision: 2,
};

/**
 * Tailwind classes for common clipping scenarios
 */
export const TAILWIND_CLIP_CLASSES = {
  overflowHidden: "overflow-hidden",
  overflowClip: "overflow-clip",
  overflowVisible: "overflow-visible",
  overflowAuto: "overflow-auto",
  overflowScroll: "overflow-scroll",
  clipInset0: "[clip-path:inset(0)]",
  clipCircle: "[clip-path:circle(50%)]",
  clipEllipse: "[clip-path:ellipse(50%_50%)]",
} as const;

// ============================================================================
// Core Conversion Functions
// ============================================================================

/**
 * Process clipsContent property - converts to CSS overflow
 * This is the simplest form of clipping in Figma
 */
export function processClipsContent(
  clipsContent: boolean | undefined,
  options: MaskClipConversionOptions = {}
): MaskClipCSSOutput {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (clipsContent === undefined || clipsContent === false) {
    return {
      strategy: "none",
      cssProperties: {},
      tailwindClasses: [],
      requiresCSSVariables: false,
      usedFallback: false,
    };
  }

  // clipsContent: true maps to overflow: hidden
  const cssProperties: Record<string, string> = {
    overflow: "hidden",
  };

  const tailwindClasses: string[] = opts.useTailwind
    ? [TAILWIND_CLIP_CLASSES.overflowHidden]
    : [];

  return {
    strategy: "overflow",
    cssProperties,
    tailwindClasses,
    requiresCSSVariables: false,
    usedFallback: false,
  };
}

/**
 * Analyze mask relationships within a group of sibling nodes
 * In Figma, when isMask is true on a node, it masks all subsequent siblings
 */
export function analyzeMaskRelationship(
  nodes: MaskableNode[]
): MaskAnalysis {
  let maskNode: MaskableNode | undefined;
  const maskedNodes: MaskableNode[] = [];
  let maskFound = false;

  for (const node of nodes) {
    if (node.isMask && !maskFound) {
      maskNode = node;
      maskFound = true;
    } else if (maskFound && node.visible !== false) {
      // All visible nodes after the mask are masked
      maskedNodes.push(node);
    }
  }

  if (!maskNode) {
    return {
      hasMasking: false,
      maskedNodes: [],
      maskType: "VECTOR",
      isInverted: false,
      usesAlpha: false,
    };
  }

  // Determine mask type
  const maskType = maskNode.maskType || detectMaskType(maskNode);
  const usesAlpha = maskType === "ALPHA" || hasAlphaContent(maskNode);

  return {
    hasMasking: true,
    maskNode,
    maskedNodes,
    maskType,
    isInverted: false, // Inverted masks require special handling
    usesAlpha,
  };
}

/**
 * Detect the mask type based on node properties
 */
function detectMaskType(node: MaskableNode): FigmaMaskType {
  // If the node has explicit maskType, use it
  if (node.maskType) {
    return node.maskType;
  }

  // Check for alpha characteristics
  if (hasAlphaContent(node)) {
    return "ALPHA";
  }

  // Check for gradients in fills (suggests alpha mask)
  if (node.fills?.some((fill) => fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_RADIAL")) {
    return "ALPHA";
  }

  // Default to vector mask
  return "VECTOR";
}

/**
 * Check if a node has alpha content (semi-transparency)
 */
function hasAlphaContent(node: MaskableNode): boolean {
  // Check node opacity
  if (node.opacity !== undefined && node.opacity < 1) {
    return true;
  }

  // Check fill opacity
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.visible !== false && fill.opacity !== undefined && fill.opacity < 1) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Convert a vector mask to CSS clip-path
 */
export function convertToClipPath(
  maskNode: MaskableNode,
  containerBounds?: { width: number; height: number },
  options: MaskClipConversionOptions = {}
): MaskClipCSSOutput {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Try to generate appropriate clip-path based on node type
  const clipPath = generateClipPath(maskNode, containerBounds, opts);

  if (!clipPath) {
    return {
      strategy: "none",
      cssProperties: {},
      tailwindClasses: [],
      requiresCSSVariables: false,
      usedFallback: true,
      warning: "Could not generate clip-path from mask shape. Consider using mask-image instead.",
    };
  }

  const cssProperties: Record<string, string> = {
    "clip-path": clipPath,
  };

  // Add webkit prefix for broader support
  if (opts.includeFallbacks) {
    cssProperties["-webkit-clip-path"] = clipPath;
  }

  // Generate Tailwind class for inline arbitrary value
  const tailwindClasses: string[] = opts.useTailwind
    ? [`[clip-path:${escapeForTailwind(clipPath)}]`]
    : [];

  return {
    strategy: "clip-path",
    cssProperties,
    tailwindClasses,
    requiresCSSVariables: false,
    usedFallback: false,
  };
}

/**
 * Generate a clip-path value from a mask node
 */
function generateClipPath(
  node: MaskableNode,
  containerBounds: { width: number; height: number } | undefined,
  options: Required<MaskClipConversionOptions>
): string | null {
  const bbox = node.absoluteBoundingBox;
  if (!bbox) return null;

  const precision = options.coordinatePrecision;

  // Handle different node types
  switch (node.type) {
    case "RECTANGLE": {
      // Check for rounded corners
      if (node.cornerRadius && node.cornerRadius > 0) {
        const radiusPercent = calculatePercentage(node.cornerRadius, Math.min(bbox.width, bbox.height), precision);
        return `inset(0 round ${radiusPercent}%)`;
      }
      if (node.rectangleCornerRadii) {
        const [tl, tr, br, bl] = node.rectangleCornerRadii;
        const minDim = Math.min(bbox.width, bbox.height);
        return `inset(0 round ${calculatePercentage(tl, minDim, precision)}% ${calculatePercentage(tr, minDim, precision)}% ${calculatePercentage(br, minDim, precision)}% ${calculatePercentage(bl, minDim, precision)}%)`;
      }
      // Simple rectangle - use inset(0)
      return "inset(0)";
    }

    case "ELLIPSE": {
      // Perfect circle or ellipse
      const isCircle = Math.abs(bbox.width - bbox.height) < 1;
      if (isCircle) {
        return "circle(50% at 50% 50%)";
      }
      return `ellipse(50% 50% at 50% 50%)`;
    }

    case "VECTOR":
    case "STAR":
    case "POLYGON":
    case "LINE":
    case "BOOLEAN_OPERATION": {
      // Try to use SVG path data
      if (options.useSVGPaths && node.fillGeometry && node.fillGeometry.length > 0) {
        const pathData = node.fillGeometry[0].path;
        if (pathData) {
          return `path('${pathData}')`;
        }
      }

      // Fall back to polygon if we can extract points
      const polygonPath = extractPolygonPath(node, containerBounds, precision);
      if (polygonPath) {
        return `polygon(${polygonPath})`;
      }

      return null;
    }

    case "FRAME":
    case "GROUP":
    case "COMPONENT":
    case "INSTANCE": {
      // Frames with corner radius
      if (node.cornerRadius && node.cornerRadius > 0) {
        const radiusPercent = calculatePercentage(node.cornerRadius, Math.min(bbox.width, bbox.height), precision);
        return `inset(0 round ${radiusPercent}%)`;
      }
      return "inset(0)";
    }

    default:
      return null;
  }
}

/**
 * Extract polygon path points from a node
 */
function extractPolygonPath(
  node: MaskableNode,
  containerBounds?: { width: number; height: number },
  precision: number = 2
): string | null {
  // If we have fill geometry with path data, try to parse it
  if (node.fillGeometry && node.fillGeometry.length > 0) {
    const path = node.fillGeometry[0].path;
    const points = parseSVGPathToPolygon(path, precision);
    if (points && points.length >= 3) {
      return points.join(", ");
    }
  }

  return null;
}

/**
 * Parse SVG path data to polygon points
 * This is a simplified parser that handles basic paths
 */
function parseSVGPathToPolygon(pathData: string, precision: number): string[] | null {
  if (!pathData) return null;

  const points: string[] = [];
  // Simple regex to extract move (M) and line (L) commands
  const moveLineRegex = /([ML])\s*([\d.-]+)[,\s]+([\d.-]+)/gi;
  let match;

  while ((match = moveLineRegex.exec(pathData)) !== null) {
    const x = parseFloat(match[2]).toFixed(precision);
    const y = parseFloat(match[3]).toFixed(precision);
    points.push(`${x}% ${y}%`);
  }

  return points.length >= 3 ? points : null;
}

/**
 * Convert to CSS mask-image for alpha masks and inverted masks
 */
export function convertToMaskImage(
  maskNode: MaskableNode,
  options: MaskClipConversionOptions = {}
): MaskClipCSSOutput {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const cssProperties: Record<string, string> = {};
  const cssVariables: Record<string, string> = {};

  // Determine the mask source
  if (opts.customMaskUrl) {
    cssProperties["mask-image"] = `url('${opts.customMaskUrl}')`;
  } else {
    // Generate gradient-based mask or SVG mask
    const maskValue = generateMaskImage(maskNode, opts);
    if (maskValue) {
      cssProperties["mask-image"] = maskValue;
    } else {
      return {
        strategy: "none",
        cssProperties: {},
        tailwindClasses: [],
        requiresCSSVariables: false,
        usedFallback: true,
        warning: "Could not generate mask-image. Export the mask as an image and use customMaskUrl.",
      };
    }
  }

  // Standard mask properties
  cssProperties["mask-size"] = "100% 100%";
  cssProperties["mask-repeat"] = "no-repeat";
  cssProperties["mask-position"] = "center";

  // Add webkit prefixes for Safari support
  if (opts.includeFallbacks) {
    Object.keys(cssProperties).forEach((key) => {
      if (key.startsWith("mask-")) {
        cssProperties[`-webkit-${key}`] = cssProperties[key];
      }
    });
  }

  // Tailwind arbitrary values
  const tailwindClasses: string[] = opts.useTailwind
    ? [
        `[mask-size:100%_100%]`,
        `[mask-repeat:no-repeat]`,
        `[mask-position:center]`,
      ]
    : [];

  if (cssProperties["mask-image"] && opts.useTailwind) {
    tailwindClasses.unshift(`[mask-image:${escapeForTailwind(cssProperties["mask-image"])}]`);
  }

  return {
    strategy: "mask-image",
    cssProperties,
    tailwindClasses,
    requiresCSSVariables: Object.keys(cssVariables).length > 0,
    cssVariables: Object.keys(cssVariables).length > 0 ? cssVariables : undefined,
    usedFallback: false,
  };
}

/**
 * Generate a mask-image value from a mask node
 */
function generateMaskImage(
  node: MaskableNode,
  options: Required<MaskClipConversionOptions>
): string | null {
  // Check for gradient fills that could be used as mask
  if (node.fills) {
    const gradientFill = node.fills.find(
      (fill) =>
        fill.visible !== false &&
        (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_RADIAL")
    );

    if (gradientFill) {
      return generateGradientMask(gradientFill);
    }
  }

  // For solid fills with opacity, create a simple mask
  if (node.opacity !== undefined && node.opacity < 1) {
    // Use a solid color with the opacity as the mask
    return `linear-gradient(rgba(0,0,0,${node.opacity}), rgba(0,0,0,${node.opacity}))`;
  }

  // For vector shapes, try SVG inline
  if (node.fillGeometry && node.fillGeometry.length > 0 && options.useSVGPaths) {
    const path = node.fillGeometry[0].path;
    if (path) {
      // Create inline SVG mask
      const svgMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='${encodeURIComponent(path)}' fill='black'/%3E%3C/svg%3E")`;
      return svgMask;
    }
  }

  return null;
}

/**
 * Generate CSS gradient from Figma gradient fill
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateGradientMask(gradientFill: any): string {
  if (gradientFill.type === "GRADIENT_LINEAR") {
    // Linear gradient mask
    // Figma uses handle positions, but for simplicity we'll use a standard vertical gradient
    return "linear-gradient(to bottom, black, transparent)";
  }

  if (gradientFill.type === "GRADIENT_RADIAL") {
    // Radial gradient mask
    return "radial-gradient(circle, black, transparent)";
  }

  return "linear-gradient(black, black)";
}

/**
 * Convert an inverted mask to CSS
 * Inverted masks show the opposite of the mask shape
 */
export function convertInvertedMask(
  maskNode: MaskableNode,
  options: MaskClipConversionOptions = {}
): MaskClipCSSOutput {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // For inverted masks, we use mask-composite
  const baseResult = convertToMaskImage(maskNode, options);

  if (baseResult.strategy === "none") {
    return baseResult;
  }

  // Add inversion properties
  const cssProperties = { ...baseResult.cssProperties };
  cssProperties["mask-composite"] = "exclude";

  if (opts.includeFallbacks) {
    cssProperties["-webkit-mask-composite"] = "xor";
  }

  return {
    ...baseResult,
    cssProperties,
    warning: "Inverted mask using mask-composite. Browser support may vary.",
  };
}

// ============================================================================
// High-Level Processing Functions
// ============================================================================

/**
 * Process a node and generate appropriate CSS for masking/clipping
 * This is the main entry point for converting Figma masks to CSS
 */
export function processMaskClip(
  node: MaskableNode,
  options: MaskClipConversionOptions = {}
): MaskClipCSSOutput {
  // First, check for simple clipsContent
  if (node.clipsContent) {
    const clipResult = processClipsContent(node.clipsContent, options);
    // If clipsContent is true, that's the primary clipping mechanism
    return clipResult;
  }

  // Check if this node is a mask
  if (node.isMask) {
    // Masks themselves don't get CSS - they define the mask for others
    return {
      strategy: "none",
      cssProperties: {
        // Mask nodes are often hidden in CSS
        display: "none",
      },
      tailwindClasses: ["hidden"],
      requiresCSSVariables: false,
      usedFallback: false,
      warning: "This node is a mask. It should be converted to a CSS mask/clip-path on the parent container.",
    };
  }

  return {
    strategy: "none",
    cssProperties: {},
    tailwindClasses: [],
    requiresCSSVariables: false,
    usedFallback: false,
  };
}

/**
 * Process a group of sibling nodes and generate CSS for mask relationships
 */
export function processMaskGroup(
  parentNode: MaskableNode,
  options: MaskClipConversionOptions = {}
): {
  parentCSS: MaskClipCSSOutput;
  analysis: MaskAnalysis;
  maskCSS?: MaskClipCSSOutput;
} {
  if (!parentNode.children || parentNode.children.length === 0) {
    return {
      parentCSS: processMaskClip(parentNode, options),
      analysis: {
        hasMasking: false,
        maskedNodes: [],
        maskType: "VECTOR",
        isInverted: false,
        usesAlpha: false,
      },
    };
  }

  // Analyze mask relationships
  const analysis = analyzeMaskRelationship(parentNode.children);

  // Process parent clipping
  let parentCSS = processClipsContent(parentNode.clipsContent, options);

  if (analysis.hasMasking && analysis.maskNode) {
    // Generate CSS for the mask
    const containerBounds = parentNode.absoluteBoundingBox
      ? { width: parentNode.absoluteBoundingBox.width, height: parentNode.absoluteBoundingBox.height }
      : undefined;

    let maskCSS: MaskClipCSSOutput;

    if (analysis.usesAlpha || analysis.maskType === "ALPHA") {
      // Use mask-image for alpha masks
      maskCSS = convertToMaskImage(analysis.maskNode, options);
    } else {
      // Use clip-path for vector masks
      maskCSS = convertToClipPath(analysis.maskNode, containerBounds, options);
    }

    // Merge mask CSS into parent if mask conversion was successful
    if (maskCSS.strategy !== "none") {
      parentCSS = {
        strategy: maskCSS.strategy,
        cssProperties: { ...parentCSS.cssProperties, ...maskCSS.cssProperties },
        tailwindClasses: [...parentCSS.tailwindClasses, ...maskCSS.tailwindClasses],
        requiresCSSVariables: parentCSS.requiresCSSVariables || maskCSS.requiresCSSVariables,
        cssVariables: { ...parentCSS.cssVariables, ...maskCSS.cssVariables },
        usedFallback: maskCSS.usedFallback,
        warning: maskCSS.warning,
      };
    }

    return {
      parentCSS,
      analysis,
      maskCSS,
    };
  }

  return {
    parentCSS,
    analysis,
  };
}

/**
 * Process a node tree and extract all mask/clip relationships
 */
export function processNodeTreeMasks(
  rootNode: MaskableNode,
  options: MaskClipConversionOptions = {}
): Map<string, MaskClipCSSOutput> {
  const results = new Map<string, MaskClipCSSOutput>();

  function traverse(node: MaskableNode) {
    // Process current node
    const nodeResult = processMaskClip(node, options);
    if (nodeResult.strategy !== "none" || Object.keys(nodeResult.cssProperties).length > 0) {
      results.set(node.id, nodeResult);
    }

    // Process children with mask group analysis
    if (node.children && node.children.length > 0) {
      const groupResult = processMaskGroup(node, options);
      if (groupResult.analysis.hasMasking) {
        // Update or add parent CSS
        results.set(node.id, groupResult.parentCSS);
      }

      // Recurse into children
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(rootNode);
  return results;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate percentage value
 */
function calculatePercentage(value: number, total: number, precision: number): string {
  if (total === 0) return "0";
  return ((value / total) * 100).toFixed(precision);
}

/**
 * Escape a CSS value for use in Tailwind arbitrary value syntax
 */
function escapeForTailwind(value: string): string {
  return value
    .replace(/\s+/g, "_")
    .replace(/,/g, "_")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

/**
 * Convert CSS properties object to inline style string
 */
export function maskClipCSSToStyleString(css: MaskClipCSSOutput): string {
  const styles: string[] = [];

  for (const [property, value] of Object.entries(css.cssProperties)) {
    styles.push(`${property}: ${value}`);
  }

  return styles.join("; ");
}

/**
 * Generate complete CSS rule for a mask/clip element
 */
export function generateMaskClipCSSRule(
  selector: string,
  css: MaskClipCSSOutput,
  options: { includeComments?: boolean } = {}
): string {
  const lines: string[] = [];

  if (options.includeComments && css.warning) {
    lines.push(`/* ${css.warning} */`);
  }

  if (Object.keys(css.cssProperties).length === 0) {
    return "";
  }

  lines.push(`${selector} {`);

  for (const [property, value] of Object.entries(css.cssProperties)) {
    lines.push(`  ${property}: ${value};`);
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Check if a node has any masking or clipping that needs CSS
 */
export function hasClipOrMask(node: MaskableNode): boolean {
  if (node.clipsContent) return true;
  if (node.isMask) return true;

  // Check children for masks
  if (node.children) {
    return node.children.some((child) => child.isMask);
  }

  return false;
}

/**
 * Get a summary of mask/clip usage in a node tree
 */
export function getMaskClipSummary(rootNode: MaskableNode): {
  totalNodes: number;
  nodesWithClipping: number;
  nodesWithMasks: number;
  maskTypes: Record<FigmaMaskType, number>;
  clipsContentCount: number;
} {
  let totalNodes = 0;
  let nodesWithClipping = 0;
  let nodesWithMasks = 0;
  let clipsContentCount = 0;
  const maskTypes: Record<FigmaMaskType, number> = {
    ALPHA: 0,
    VECTOR: 0,
    LUMINANCE: 0,
  };

  function traverse(node: MaskableNode) {
    totalNodes++;

    if (node.clipsContent) {
      clipsContentCount++;
      nodesWithClipping++;
    }

    if (node.isMask) {
      nodesWithMasks++;
      const type = node.maskType || detectMaskType(node);
      maskTypes[type]++;
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(rootNode);

  return {
    totalNodes,
    nodesWithClipping,
    nodesWithMasks,
    maskTypes,
    clipsContentCount,
  };
}

// ============================================================================
// FigmaNode Integration
// ============================================================================

/**
 * Process a standard FigmaNode for mask/clip relationships
 * This provides integration with the existing FigmaNode type
 */
export function processFigmaNodeMaskClip(
  node: FigmaNode,
  options: MaskClipConversionOptions = {}
): MaskClipCSSOutput {
  // Cast FigmaNode to MaskableNode (they share the core properties)
  const maskableNode = node as unknown as MaskableNode;
  return processMaskClip(maskableNode, options);
}

/**
 * Process a FigmaNode tree for all mask/clip relationships
 */
export function processFigmaNodeTreeMasks(
  rootNode: FigmaNode,
  options: MaskClipConversionOptions = {}
): Map<string, MaskClipCSSOutput> {
  const maskableNode = rootNode as unknown as MaskableNode;
  return processNodeTreeMasks(maskableNode, options);
}
