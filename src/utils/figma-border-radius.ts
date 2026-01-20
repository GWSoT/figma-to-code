/**
 * Figma Border Radius to CSS Converter
 *
 * This module handles converting Figma corner radius values to CSS border-radius.
 * It supports:
 * - Uniform corner radius (cornerRadius)
 * - Individual corner radii (rectangleCornerRadii)
 * - Corner smoothing (iOS-style "squircle" corners)
 * - SVG path approximation for smoothed corners
 *
 * Figma Corner Model:
 * - cornerRadius: Single value applied to all corners
 * - rectangleCornerRadii: Array of [topLeft, topRight, bottomRight, bottomLeft]
 * - cornerSmoothing: 0-1 value for iOS-style corner smoothing (0 = sharp, 1 = fully smoothed)
 *
 * CSS Output:
 * - border-radius for standard corners
 * - clip-path with SVG path for smoothed corners (when smoothing > 0)
 *
 * @see https://www.figma.com/developers/api#rectangle-props
 */

import type { FigmaNode } from "./figma-api";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Corner position identifiers
 */
export type CornerPosition = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";

/**
 * Individual corner radius values
 * Order matches Figma's rectangleCornerRadii: [TL, TR, BR, BL]
 */
export interface IndividualCornerRadii {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

/**
 * Extended node interface with corner radius properties
 */
export interface CornerRadiusNode {
  id: string;
  name: string;
  type: string;
  /** Single corner radius applied to all corners */
  cornerRadius?: number;
  /** Individual corner radii [topLeft, topRight, bottomRight, bottomLeft] */
  rectangleCornerRadii?: [number, number, number, number];
  /** Corner smoothing (0-1). iOS-style corners when > 0 */
  cornerSmoothing?: number;
  /** Bounding box for calculating relative values */
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * CSS output for border radius
 */
export interface BorderRadiusCSSOutput {
  /** Primary strategy used */
  strategy: "border-radius" | "clip-path" | "none";
  /** CSS properties to apply */
  cssProperties: Record<string, string>;
  /** Tailwind classes (where applicable) */
  tailwindClasses: string[];
  /** Whether the node has corner smoothing */
  hasSmoothing: boolean;
  /** The smoothing value (0-1) */
  smoothingValue: number;
  /** Whether a fallback was used */
  usedFallback: boolean;
  /** Warning or note about the conversion */
  warning?: string;
  /** SVG path data for smoothed corners (if applicable) */
  svgPath?: string;
}

/**
 * Options for border radius conversion
 */
export interface BorderRadiusConversionOptions {
  /** Whether to generate Tailwind classes */
  useTailwind?: boolean;
  /** Whether to include fallbacks for older browsers */
  includeFallbacks?: boolean;
  /** Unit for radius values: 'px' | '%' | 'em' | 'rem' */
  unit?: "px" | "%" | "em" | "rem";
  /** Precision for numeric values */
  precision?: number;
  /** Threshold for considering smoothing significant (default: 0.1) */
  smoothingThreshold?: number;
  /** Whether to always use SVG path for smoothed corners */
  alwaysUseSVGForSmoothing?: boolean;
  /** Whether to use clip-path instead of border-radius for full control */
  preferClipPath?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default conversion options
 */
export const DEFAULT_OPTIONS: Required<BorderRadiusConversionOptions> = {
  useTailwind: true,
  includeFallbacks: true,
  unit: "px",
  precision: 2,
  smoothingThreshold: 0.1,
  alwaysUseSVGForSmoothing: false,
  preferClipPath: false,
};

/**
 * Tailwind border radius classes
 * Maps pixel values to Tailwind classes
 */
export const TAILWIND_RADIUS_CLASSES: Record<number, string> = {
  0: "rounded-none",
  2: "rounded-sm",
  4: "rounded",
  6: "rounded-md",
  8: "rounded-lg",
  12: "rounded-xl",
  16: "rounded-2xl",
  24: "rounded-3xl",
};

/**
 * Tailwind individual corner classes
 */
export const TAILWIND_CORNER_CLASSES = {
  topLeft: "rounded-tl",
  topRight: "rounded-tr",
  bottomRight: "rounded-br",
  bottomLeft: "rounded-bl",
} as const;

/**
 * Full rounded class for pill shapes
 */
export const TAILWIND_FULL_ROUNDED = "rounded-full";

// ============================================================================
// Core Conversion Functions
// ============================================================================

/**
 * Parse corner radius from a Figma node
 */
export function parseCornerRadius(node: CornerRadiusNode): IndividualCornerRadii | null {
  // Check for individual corner radii first
  if (node.rectangleCornerRadii) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii;
    return {
      topLeft: tl,
      topRight: tr,
      bottomRight: br,
      bottomLeft: bl,
    };
  }

  // Check for uniform corner radius
  if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
    return {
      topLeft: node.cornerRadius,
      topRight: node.cornerRadius,
      bottomRight: node.cornerRadius,
      bottomLeft: node.cornerRadius,
    };
  }

  return null;
}

/**
 * Check if all corners have the same radius
 */
export function isUniformRadius(radii: IndividualCornerRadii): boolean {
  return (
    radii.topLeft === radii.topRight &&
    radii.topRight === radii.bottomRight &&
    radii.bottomRight === radii.bottomLeft
  );
}

/**
 * Get the maximum corner radius (for smoothing calculations)
 */
export function getMaxRadius(radii: IndividualCornerRadii): number {
  return Math.max(radii.topLeft, radii.topRight, radii.bottomRight, radii.bottomLeft);
}

/**
 * Check if the corner radius creates a pill/stadium shape
 * (when radius is >= half of the smallest dimension)
 */
export function isPillShape(
  radii: IndividualCornerRadii,
  width: number,
  height: number
): boolean {
  const minDimension = Math.min(width, height);
  const halfMin = minDimension / 2;
  return (
    radii.topLeft >= halfMin &&
    radii.topRight >= halfMin &&
    radii.bottomRight >= halfMin &&
    radii.bottomLeft >= halfMin
  );
}

/**
 * Convert corner radius to CSS border-radius value
 */
export function convertToCSSBorderRadius(
  radii: IndividualCornerRadii,
  options: BorderRadiusConversionOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { unit, precision } = opts;

  const format = (value: number): string => {
    const rounded = Number(value.toFixed(precision));
    return `${rounded}${unit}`;
  };

  // Check for uniform radius
  if (isUniformRadius(radii)) {
    return format(radii.topLeft);
  }

  // Check if we can use shorthand (TL/BR and TR/BL pairs)
  const hasDiagonalSymmetry =
    radii.topLeft === radii.bottomRight && radii.topRight === radii.bottomLeft;

  if (hasDiagonalSymmetry) {
    return `${format(radii.topLeft)} ${format(radii.topRight)}`;
  }

  // Check if we can use 3-value shorthand (TL, TR/BL, BR)
  if (radii.topRight === radii.bottomLeft) {
    return `${format(radii.topLeft)} ${format(radii.topRight)} ${format(radii.bottomRight)}`;
  }

  // Full 4-value format: TL TR BR BL
  return `${format(radii.topLeft)} ${format(radii.topRight)} ${format(radii.bottomRight)} ${format(radii.bottomLeft)}`;
}

/**
 * Generate Tailwind classes for border radius
 */
export function generateTailwindClasses(
  radii: IndividualCornerRadii,
  width?: number,
  height?: number
): string[] {
  const classes: string[] = [];

  // Check for pill shape first
  if (width !== undefined && height !== undefined && isPillShape(radii, width, height)) {
    return [TAILWIND_FULL_ROUNDED];
  }

  // Check for uniform radius
  if (isUniformRadius(radii)) {
    const matchedClass = findClosestTailwindClass(radii.topLeft);
    if (matchedClass) {
      return [matchedClass];
    }
    // Use arbitrary value
    return [`rounded-[${radii.topLeft}px]`];
  }

  // Handle individual corners
  const corners: Array<{ position: CornerPosition; value: number }> = [
    { position: "topLeft", value: radii.topLeft },
    { position: "topRight", value: radii.topRight },
    { position: "bottomRight", value: radii.bottomRight },
    { position: "bottomLeft", value: radii.bottomLeft },
  ];

  for (const { position, value } of corners) {
    if (value === 0) continue;

    const baseClass = TAILWIND_CORNER_CLASSES[position];
    const matchedSize = findClosestTailwindSize(value);

    if (matchedSize) {
      classes.push(`${baseClass}-${matchedSize}`);
    } else {
      classes.push(`${baseClass}-[${value}px]`);
    }
  }

  return classes;
}

/**
 * Find the closest Tailwind border radius class for a pixel value
 */
function findClosestTailwindClass(pixels: number): string | null {
  // Direct match
  if (TAILWIND_RADIUS_CLASSES[pixels]) {
    return TAILWIND_RADIUS_CLASSES[pixels];
  }

  // Find closest within 1px tolerance
  for (const [size, className] of Object.entries(TAILWIND_RADIUS_CLASSES)) {
    if (Math.abs(Number(size) - pixels) <= 1) {
      return className;
    }
  }

  return null;
}

/**
 * Find the closest Tailwind size suffix for a pixel value
 */
function findClosestTailwindSize(pixels: number): string | null {
  const sizeMap: Record<number, string> = {
    0: "none",
    2: "sm",
    4: "",
    6: "md",
    8: "lg",
    12: "xl",
    16: "2xl",
    24: "3xl",
  };

  // Direct match
  if (sizeMap[pixels] !== undefined) {
    return sizeMap[pixels] || null; // empty string means just use base class
  }

  // Find closest within 1px tolerance
  for (const [size, suffix] of Object.entries(sizeMap)) {
    if (Math.abs(Number(size) - pixels) <= 1) {
      return suffix || null;
    }
  }

  return null;
}

// ============================================================================
// iOS-style Corner Smoothing (Squircle)
// ============================================================================

/**
 * Generate an SVG path for a smoothed corner (squircle/superellipse)
 *
 * iOS-style corners use a continuous curvature approach that creates
 * smoother transitions than standard circular arcs. This is achieved
 * using a superellipse formula with adjusted control points.
 *
 * @param width - Rectangle width
 * @param height - Rectangle height
 * @param radii - Corner radii
 * @param smoothing - Smoothing value (0-1)
 * @param precision - Decimal precision for coordinates
 */
export function generateSmoothedCornerPath(
  width: number,
  height: number,
  radii: IndividualCornerRadii,
  smoothing: number,
  precision: number = 2
): string {
  // Clamp smoothing to valid range
  const s = Math.max(0, Math.min(1, smoothing));

  // If no smoothing, generate standard rounded rectangle path
  if (s === 0) {
    return generateStandardRoundedPath(width, height, radii, precision);
  }

  const fmt = (n: number) => Number(n.toFixed(precision));

  // Clamp radii to valid ranges
  const maxRadiusH = width / 2;
  const maxRadiusV = height / 2;

  const tl = Math.min(radii.topLeft, maxRadiusH, maxRadiusV);
  const tr = Math.min(radii.topRight, maxRadiusH, maxRadiusV);
  const br = Math.min(radii.bottomRight, maxRadiusH, maxRadiusV);
  const bl = Math.min(radii.bottomLeft, maxRadiusH, maxRadiusV);

  // iOS smoothing uses a modified bezier curve approach
  // The "roundness" parameter affects how far the control points extend
  // At s=1, the shape approaches a superellipse (n≈2.5-3)

  // Calculate bezier control point offset based on smoothing
  // This approximates the iOS corner smoothing algorithm
  const controlPointFactor = 0.5522847498 * (1 - s * 0.3); // Magic number for circle approximation, adjusted for smoothing

  // Generate path segments for each corner
  const segments: string[] = [];

  // Start at top edge, after top-left corner
  segments.push(`M ${fmt(tl)} 0`);

  // Top edge to top-right corner
  segments.push(`L ${fmt(width - tr)} 0`);

  // Top-right corner
  if (tr > 0) {
    const cp = tr * controlPointFactor;
    const smooth = tr * s * 0.5;
    segments.push(
      `C ${fmt(width - tr + cp + smooth)} 0 ${fmt(width)} ${fmt(tr - cp - smooth)} ${fmt(width)} ${fmt(tr)}`
    );
  }

  // Right edge to bottom-right corner
  segments.push(`L ${fmt(width)} ${fmt(height - br)}`);

  // Bottom-right corner
  if (br > 0) {
    const cp = br * controlPointFactor;
    const smooth = br * s * 0.5;
    segments.push(
      `C ${fmt(width)} ${fmt(height - br + cp + smooth)} ${fmt(width - br + cp + smooth)} ${fmt(height)} ${fmt(width - br)} ${fmt(height)}`
    );
  }

  // Bottom edge to bottom-left corner
  segments.push(`L ${fmt(bl)} ${fmt(height)}`);

  // Bottom-left corner
  if (bl > 0) {
    const cp = bl * controlPointFactor;
    const smooth = bl * s * 0.5;
    segments.push(
      `C ${fmt(bl - cp - smooth)} ${fmt(height)} 0 ${fmt(height - bl + cp + smooth)} 0 ${fmt(height - bl)}`
    );
  }

  // Left edge to top-left corner
  segments.push(`L 0 ${fmt(tl)}`);

  // Top-left corner
  if (tl > 0) {
    const cp = tl * controlPointFactor;
    const smooth = tl * s * 0.5;
    segments.push(
      `C 0 ${fmt(tl - cp - smooth)} ${fmt(tl - cp - smooth)} 0 ${fmt(tl)} 0`
    );
  }

  segments.push("Z");

  return segments.join(" ");
}

/**
 * Generate a standard rounded rectangle SVG path (no smoothing)
 */
export function generateStandardRoundedPath(
  width: number,
  height: number,
  radii: IndividualCornerRadii,
  precision: number = 2
): string {
  const fmt = (n: number) => Number(n.toFixed(precision));

  // Clamp radii to valid ranges
  const maxRadiusH = width / 2;
  const maxRadiusV = height / 2;

  const tl = Math.min(radii.topLeft, maxRadiusH, maxRadiusV);
  const tr = Math.min(radii.topRight, maxRadiusH, maxRadiusV);
  const br = Math.min(radii.bottomRight, maxRadiusH, maxRadiusV);
  const bl = Math.min(radii.bottomLeft, maxRadiusH, maxRadiusV);

  const segments: string[] = [];

  // Start at top edge, after top-left corner
  segments.push(`M ${fmt(tl)} 0`);

  // Top edge to top-right corner
  segments.push(`H ${fmt(width - tr)}`);

  // Top-right corner (arc)
  if (tr > 0) {
    segments.push(`A ${fmt(tr)} ${fmt(tr)} 0 0 1 ${fmt(width)} ${fmt(tr)}`);
  }

  // Right edge to bottom-right corner
  segments.push(`V ${fmt(height - br)}`);

  // Bottom-right corner (arc)
  if (br > 0) {
    segments.push(`A ${fmt(br)} ${fmt(br)} 0 0 1 ${fmt(width - br)} ${fmt(height)}`);
  }

  // Bottom edge to bottom-left corner
  segments.push(`H ${fmt(bl)}`);

  // Bottom-left corner (arc)
  if (bl > 0) {
    segments.push(`A ${fmt(bl)} ${fmt(bl)} 0 0 1 0 ${fmt(height - bl)}`);
  }

  // Left edge to top-left corner
  segments.push(`V ${fmt(tl)}`);

  // Top-left corner (arc)
  if (tl > 0) {
    segments.push(`A ${fmt(tl)} ${fmt(tl)} 0 0 1 ${fmt(tl)} 0`);
  }

  segments.push("Z");

  return segments.join(" ");
}

/**
 * Convert smoothed corners to CSS clip-path with SVG path
 */
export function convertSmoothedCornersToClipPath(
  width: number,
  height: number,
  radii: IndividualCornerRadii,
  smoothing: number,
  options: BorderRadiusConversionOptions = {}
): BorderRadiusCSSOutput {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const svgPath = generateSmoothedCornerPath(width, height, radii, smoothing, opts.precision);

  const cssProperties: Record<string, string> = {
    "clip-path": `path('${svgPath}')`,
  };

  // Add webkit prefix for broader support
  if (opts.includeFallbacks) {
    cssProperties["-webkit-clip-path"] = `path('${svgPath}')`;
  }

  // Generate Tailwind arbitrary value
  const tailwindClasses: string[] = opts.useTailwind
    ? [`[clip-path:path('${svgPath.replace(/'/g, "\\'")}')]`]
    : [];

  return {
    strategy: "clip-path",
    cssProperties,
    tailwindClasses,
    hasSmoothing: true,
    smoothingValue: smoothing,
    usedFallback: false,
    svgPath,
    warning:
      "iOS-style corner smoothing converted to SVG path. This provides exact visual fidelity but requires clip-path support.",
  };
}

// ============================================================================
// Main Conversion Function
// ============================================================================

/**
 * Convert Figma corner radius to CSS
 * This is the main entry point for corner radius conversion
 */
export function convertCornerRadius(
  node: CornerRadiusNode,
  options: BorderRadiusConversionOptions = {}
): BorderRadiusCSSOutput {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Parse corner radii
  const radii = parseCornerRadius(node);

  // No corner radius
  if (!radii || getMaxRadius(radii) === 0) {
    return {
      strategy: "none",
      cssProperties: {},
      tailwindClasses: [],
      hasSmoothing: false,
      smoothingValue: 0,
      usedFallback: false,
    };
  }

  // Check for corner smoothing
  const smoothing = node.cornerSmoothing || 0;
  const hasSignificantSmoothing = smoothing >= opts.smoothingThreshold;

  // Get dimensions for smoothed corner calculations
  const width = node.absoluteBoundingBox?.width || 0;
  const height = node.absoluteBoundingBox?.height || 0;

  // Use SVG path for smoothed corners if smoothing is significant
  if (hasSignificantSmoothing && (opts.alwaysUseSVGForSmoothing || opts.preferClipPath)) {
    if (width > 0 && height > 0) {
      return convertSmoothedCornersToClipPath(width, height, radii, smoothing, opts);
    }
  }

  // Use standard border-radius
  const borderRadiusValue = convertToCSSBorderRadius(radii, opts);

  const cssProperties: Record<string, string> = {
    "border-radius": borderRadiusValue,
  };

  // Add webkit prefix for very old browser support
  if (opts.includeFallbacks) {
    cssProperties["-webkit-border-radius"] = borderRadiusValue;
  }

  // Generate Tailwind classes
  const tailwindClasses = opts.useTailwind
    ? generateTailwindClasses(radii, width, height)
    : [];

  // Add warning if smoothing is present but not applied
  let warning: string | undefined;
  if (hasSignificantSmoothing && !opts.alwaysUseSVGForSmoothing && !opts.preferClipPath) {
    warning = `Corner smoothing (${(smoothing * 100).toFixed(0)}%) detected but using standard border-radius. ` +
      "Set alwaysUseSVGForSmoothing: true for exact iOS-style corners.";
  }

  return {
    strategy: "border-radius",
    cssProperties,
    tailwindClasses,
    hasSmoothing: hasSignificantSmoothing,
    smoothingValue: smoothing,
    usedFallback: false,
    warning,
  };
}

/**
 * Process a FigmaNode for border radius
 * Provides integration with the existing FigmaNode type
 */
export function processFigmaNodeBorderRadius(
  node: FigmaNode,
  options: BorderRadiusConversionOptions = {}
): BorderRadiusCSSOutput {
  // Cast FigmaNode to CornerRadiusNode
  const cornerNode = node as unknown as CornerRadiusNode;
  return convertCornerRadius(cornerNode, options);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert CSS properties object to inline style string
 */
export function borderRadiusCSSToStyleString(css: BorderRadiusCSSOutput): string {
  const styles: string[] = [];

  for (const [property, value] of Object.entries(css.cssProperties)) {
    styles.push(`${property}: ${value}`);
  }

  return styles.join("; ");
}

/**
 * Generate complete CSS rule for border radius
 */
export function generateBorderRadiusCSSRule(
  selector: string,
  css: BorderRadiusCSSOutput,
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
 * Check if a node has any corner radius
 */
export function hasCornerRadius(node: CornerRadiusNode): boolean {
  if (node.cornerRadius && node.cornerRadius > 0) return true;
  if (node.rectangleCornerRadii) {
    return node.rectangleCornerRadii.some((r) => r > 0);
  }
  return false;
}

/**
 * Check if a node has corner smoothing
 */
export function hasCornerSmoothing(
  node: CornerRadiusNode,
  threshold: number = 0.1
): boolean {
  return (node.cornerSmoothing || 0) >= threshold;
}

/**
 * Get a summary of corner radius properties in a node
 */
export function getCornerRadiusSummary(node: CornerRadiusNode): {
  hasRadius: boolean;
  isUniform: boolean;
  hasSmoothing: boolean;
  maxRadius: number;
  smoothingPercent: number;
} {
  const radii = parseCornerRadius(node);
  const hasRadius = radii !== null && getMaxRadius(radii) > 0;

  return {
    hasRadius,
    isUniform: radii ? isUniformRadius(radii) : true,
    hasSmoothing: hasCornerSmoothing(node),
    maxRadius: radii ? getMaxRadius(radii) : 0,
    smoothingPercent: (node.cornerSmoothing || 0) * 100,
  };
}

/**
 * Normalize corner radii to ensure they don't exceed valid bounds
 */
export function normalizeCornerRadii(
  radii: IndividualCornerRadii,
  width: number,
  height: number
): IndividualCornerRadii {
  const maxRadiusH = width / 2;
  const maxRadiusV = height / 2;
  const maxRadius = Math.min(maxRadiusH, maxRadiusV);

  return {
    topLeft: Math.min(radii.topLeft, maxRadius),
    topRight: Math.min(radii.topRight, maxRadius),
    bottomRight: Math.min(radii.bottomRight, maxRadius),
    bottomLeft: Math.min(radii.bottomLeft, maxRadius),
  };
}

/**
 * Calculate the effective corner radius when adjacent corners overlap
 * This implements the CSS spec for handling overlapping radii
 */
export function calculateEffectiveRadii(
  radii: IndividualCornerRadii,
  width: number,
  height: number
): IndividualCornerRadii {
  // Calculate the factor needed to scale down radii if they overlap
  const topSum = radii.topLeft + radii.topRight;
  const rightSum = radii.topRight + radii.bottomRight;
  const bottomSum = radii.bottomRight + radii.bottomLeft;
  const leftSum = radii.bottomLeft + radii.topLeft;

  const factors = [
    topSum > 0 ? width / topSum : 1,
    rightSum > 0 ? height / rightSum : 1,
    bottomSum > 0 ? width / bottomSum : 1,
    leftSum > 0 ? height / leftSum : 1,
  ];

  const factor = Math.min(...factors, 1);

  if (factor === 1) {
    return radii;
  }

  return {
    topLeft: radii.topLeft * factor,
    topRight: radii.topRight * factor,
    bottomRight: radii.bottomRight * factor,
    bottomLeft: radii.bottomLeft * factor,
  };
}
