/**
 * Figma Gradient to CSS Gradient Converter
 *
 * This module handles converting Figma gradient fills to CSS gradient syntax.
 * Supports linear, radial, angular (conic), and diamond gradients with accurate
 * color stops and positions. Handles multiple gradient fills layered together.
 *
 * @see https://www.figma.com/developers/api#paint-type
 */

import type { FigmaColor } from "./figma-api";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Figma gradient types as defined in the Figma API
 */
export type FigmaGradientType =
  | "GRADIENT_LINEAR"
  | "GRADIENT_RADIAL"
  | "GRADIENT_ANGULAR"
  | "GRADIENT_DIAMOND";

/**
 * CSS gradient types
 */
export type CSSGradientType = "linear-gradient" | "radial-gradient" | "conic-gradient";

/**
 * A position in the gradient handle coordinate system (0-1 normalized)
 */
export interface GradientHandlePosition {
  x: number;
  y: number;
}

/**
 * A color stop in the gradient
 */
export interface FigmaGradientStop {
  /** Position along the gradient (0-1) */
  position: number;
  /** Color at this stop */
  color: FigmaColor;
}

/**
 * Figma Paint object for gradient fills
 */
export interface FigmaGradientPaint {
  /** Type of gradient */
  type: FigmaGradientType;
  /** Whether the fill is visible */
  visible?: boolean;
  /** Opacity of the fill (0-1) */
  opacity?: number;
  /** Blend mode for the fill */
  blendMode?: string;
  /**
   * Gradient handle positions - array of 3 positions:
   * [0] = start point of the gradient
   * [1] = end point of the gradient
   * [2] = width control point (for radial/diamond gradients)
   */
  gradientHandlePositions: GradientHandlePosition[];
  /** Array of color stops */
  gradientStops: FigmaGradientStop[];
}

/**
 * Any Figma paint type (solid or gradient)
 */
export interface FigmaPaint {
  type: string;
  visible?: boolean;
  opacity?: number;
  blendMode?: string;
  color?: FigmaColor;
  gradientHandlePositions?: GradientHandlePosition[];
  gradientStops?: FigmaGradientStop[];
}

/**
 * Result of gradient conversion
 */
export interface GradientConversionResult {
  /** The CSS gradient value */
  cssValue: string;
  /** The CSS gradient type used */
  gradientType: CSSGradientType;
  /** Whether a fallback was used (e.g., diamond → radial) */
  usedFallback: boolean;
  /** The original Figma gradient type */
  originalType: FigmaGradientType;
  /** Warning message if fallback was needed or precision was lost */
  warning?: string;
  /** Tailwind classes if available (limited support) */
  tailwindClasses?: string[];
}

/**
 * Result of converting multiple fills
 */
export interface MultiFillConversionResult {
  /** Combined CSS background value with all gradients layered */
  cssBackground: string;
  /** Individual gradient results */
  gradients: GradientConversionResult[];
  /** Any solid color fills included */
  solidColors: string[];
  /** Overall warnings */
  warnings: string[];
}

/**
 * Options for gradient conversion
 */
export interface GradientConversionOptions {
  /** Whether to include CSS comments for fallbacks and complex conversions */
  includeComments?: boolean;
  /** Color format for output: 'rgba' | 'hex' | 'hsl' */
  colorFormat?: "rgba" | "hex" | "hsl";
  /** Whether to optimize color stops (remove redundant stops) */
  optimizeStops?: boolean;
  /** Precision for position percentages (decimal places) */
  positionPrecision?: number;
  /** Precision for angle degrees (decimal places) */
  anglePrecision?: number;
  /** Diamond gradient fallback strategy */
  diamondFallback?: "radial" | "linear" | "none";
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OPTIONS: Required<GradientConversionOptions> = {
  includeComments: false,
  colorFormat: "rgba",
  optimizeStops: true,
  positionPrecision: 2,
  anglePrecision: 1,
  diamondFallback: "radial",
};

// ============================================================================
// Helper Functions - Color Conversion
// ============================================================================

/**
 * Converts Figma color (0-1 range) to CSS rgba string
 */
export function figmaColorToRgba(color: FigmaColor, opacity: number = 1): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Number((color.a * opacity).toFixed(3));

  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Converts Figma color to hex string
 */
export function figmaColorToHex(color: FigmaColor, opacity: number = 1): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * opacity * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, "0");

  if (a === 255) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

/**
 * Converts Figma color to HSL string
 */
export function figmaColorToHsl(color: FigmaColor, opacity: number = 1): string {
  const r = color.r;
  const g = color.g;
  const b = color.b;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  const a = Number((color.a * opacity).toFixed(3));

  if (a === 1) {
    return `hsl(${hDeg}, ${sPct}%, ${lPct}%)`;
  }
  return `hsla(${hDeg}, ${sPct}%, ${lPct}%, ${a})`;
}

/**
 * Converts a Figma color to the specified format
 */
function formatColor(
  color: FigmaColor,
  format: GradientConversionOptions["colorFormat"],
  opacity: number = 1
): string {
  switch (format) {
    case "hex":
      return figmaColorToHex(color, opacity);
    case "hsl":
      return figmaColorToHsl(color, opacity);
    case "rgba":
    default:
      return figmaColorToRgba(color, opacity);
  }
}

// ============================================================================
// Helper Functions - Geometry
// ============================================================================

/**
 * Calculates the angle in degrees from gradient handle positions
 * Returns angle in CSS convention (0deg = to top, 90deg = to right)
 */
export function calculateGradientAngle(
  start: GradientHandlePosition,
  end: GradientHandlePosition
): number {
  // Calculate the vector from start to end
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // atan2 gives angle from positive X axis, counterclockwise
  // CSS gradients: 0deg = to top, 90deg = to right (clockwise from top)
  // So we need to convert from math convention to CSS convention
  const angleRad = Math.atan2(dx, -dy); // Note: -dy because Y is inverted in screen coords
  let angleDeg = angleRad * (180 / Math.PI);

  // Normalize to 0-360
  if (angleDeg < 0) {
    angleDeg += 360;
  }

  return angleDeg;
}

/**
 * Calculates the gradient length from handle positions
 */
export function calculateGradientLength(
  start: GradientHandlePosition,
  end: GradientHandlePosition
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates radial gradient properties from handle positions
 */
export function calculateRadialProperties(handles: GradientHandlePosition[]): {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  angle: number;
} {
  const [start, end, widthHandle] = handles;

  // Center is at the start position
  const centerX = start.x * 100;
  const centerY = start.y * 100;

  // Calculate radii from handle positions
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const primaryRadius = Math.sqrt(dx * dx + dy * dy);

  // Width handle determines the secondary radius
  const wdx = widthHandle.x - start.x;
  const wdy = widthHandle.y - start.y;
  const secondaryRadius = Math.sqrt(wdx * wdx + wdy * wdy);

  // Angle of the ellipse
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    centerX,
    centerY,
    radiusX: primaryRadius * 100,
    radiusY: secondaryRadius * 100,
    angle,
  };
}

/**
 * Calculates conic gradient properties from handle positions
 */
export function calculateConicProperties(handles: GradientHandlePosition[]): {
  centerX: number;
  centerY: number;
  startAngle: number;
} {
  const [start, end] = handles;

  // Center is at the start position
  const centerX = start.x * 100;
  const centerY = start.y * 100;

  // Calculate start angle from the end handle position
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // CSS conic-gradient: 0deg = top, clockwise
  // atan2 gives angle from positive X axis, counterclockwise
  let startAngle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (startAngle < 0) {
    startAngle += 360;
  }

  return {
    centerX,
    centerY,
    startAngle,
  };
}

// ============================================================================
// Color Stop Processing
// ============================================================================

/**
 * Formats a gradient stop for CSS output
 */
function formatColorStop(
  stop: FigmaGradientStop,
  options: Required<GradientConversionOptions>,
  fillOpacity: number = 1
): string {
  const color = formatColor(stop.color, options.colorFormat, fillOpacity);
  const position = (stop.position * 100).toFixed(options.positionPrecision);

  // Optimization: don't include 0% or 100% if at start/end
  if (options.optimizeStops) {
    if (stop.position === 0) {
      return color;
    }
    if (stop.position === 1) {
      return color;
    }
  }

  return `${color} ${position}%`;
}

/**
 * Processes and formats all color stops
 */
function processColorStops(
  stops: FigmaGradientStop[],
  options: Required<GradientConversionOptions>,
  fillOpacity: number = 1
): string {
  // Sort stops by position
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  return sortedStops.map((stop) => formatColorStop(stop, options, fillOpacity)).join(", ");
}

// ============================================================================
// Gradient Conversion Functions
// ============================================================================

/**
 * Converts a Figma linear gradient to CSS
 */
export function convertLinearGradient(
  paint: FigmaGradientPaint,
  options: GradientConversionOptions = {}
): GradientConversionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;

  const [start, end] = gradientHandlePositions;
  const angle = calculateGradientAngle(start, end);
  const angleStr = angle.toFixed(opts.anglePrecision);

  const colorStops = processColorStops(gradientStops, opts, opacity);

  const cssValue = `linear-gradient(${angleStr}deg, ${colorStops})`;

  return {
    cssValue,
    gradientType: "linear-gradient",
    usedFallback: false,
    originalType: "GRADIENT_LINEAR",
  };
}

/**
 * Converts a Figma radial gradient to CSS
 */
export function convertRadialGradient(
  paint: FigmaGradientPaint,
  options: GradientConversionOptions = {}
): GradientConversionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;

  const { centerX, centerY, radiusX, radiusY, angle } =
    calculateRadialProperties(gradientHandlePositions);

  const colorStops = processColorStops(gradientStops, opts, opacity);

  // Check if it's a circular gradient (equal radii)
  const isCircular = Math.abs(radiusX - radiusY) < 0.1;

  let cssValue: string;
  let warning: string | undefined;

  if (isCircular && Math.abs(angle) < 1) {
    // Simple circular gradient
    const centerXStr = centerX.toFixed(opts.positionPrecision);
    const centerYStr = centerY.toFixed(opts.positionPrecision);
    cssValue = `radial-gradient(circle at ${centerXStr}% ${centerYStr}%, ${colorStops})`;
  } else if (Math.abs(angle) < 1) {
    // Elliptical gradient without rotation
    const centerXStr = centerX.toFixed(opts.positionPrecision);
    const centerYStr = centerY.toFixed(opts.positionPrecision);
    const rxStr = radiusX.toFixed(opts.positionPrecision);
    const ryStr = radiusY.toFixed(opts.positionPrecision);
    cssValue = `radial-gradient(${rxStr}% ${ryStr}% at ${centerXStr}% ${centerYStr}%, ${colorStops})`;
  } else {
    // Rotated elliptical gradient - CSS doesn't support rotation directly
    // We approximate with a non-rotated ellipse
    const centerXStr = centerX.toFixed(opts.positionPrecision);
    const centerYStr = centerY.toFixed(opts.positionPrecision);
    const rxStr = radiusX.toFixed(opts.positionPrecision);
    const ryStr = radiusY.toFixed(opts.positionPrecision);
    cssValue = `radial-gradient(${rxStr}% ${ryStr}% at ${centerXStr}% ${centerYStr}%, ${colorStops})`;
    warning = `Rotated elliptical gradient (${angle.toFixed(1)}deg) approximated without rotation. CSS radial-gradient doesn't support rotation.`;
  }

  return {
    cssValue,
    gradientType: "radial-gradient",
    usedFallback: !!warning,
    originalType: "GRADIENT_RADIAL",
    warning,
  };
}

/**
 * Converts a Figma angular gradient to CSS conic-gradient
 */
export function convertAngularGradient(
  paint: FigmaGradientPaint,
  options: GradientConversionOptions = {}
): GradientConversionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;

  const { centerX, centerY, startAngle } = calculateConicProperties(gradientHandlePositions);

  const colorStops = processColorStops(gradientStops, opts, opacity);

  const centerXStr = centerX.toFixed(opts.positionPrecision);
  const centerYStr = centerY.toFixed(opts.positionPrecision);
  const angleStr = startAngle.toFixed(opts.anglePrecision);

  const cssValue = `conic-gradient(from ${angleStr}deg at ${centerXStr}% ${centerYStr}%, ${colorStops})`;

  return {
    cssValue,
    gradientType: "conic-gradient",
    usedFallback: false,
    originalType: "GRADIENT_ANGULAR",
  };
}

/**
 * Converts a Figma diamond gradient to CSS
 *
 * Note: CSS doesn't have a native diamond gradient. This converts to a
 * radial gradient or linear gradient approximation based on the fallback option.
 */
export function convertDiamondGradient(
  paint: FigmaGradientPaint,
  options: GradientConversionOptions = {}
): GradientConversionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;

  if (opts.diamondFallback === "none") {
    return {
      cssValue: "",
      gradientType: "radial-gradient",
      usedFallback: true,
      originalType: "GRADIENT_DIAMOND",
      warning: "Diamond gradient skipped (diamondFallback: 'none')",
    };
  }

  const colorStops = processColorStops(gradientStops, opts, opacity);

  if (opts.diamondFallback === "linear") {
    // Approximate with linear gradient using the primary axis
    const [start, end] = gradientHandlePositions;
    const angle = calculateGradientAngle(start, end);
    const angleStr = angle.toFixed(opts.anglePrecision);

    const cssValue = `linear-gradient(${angleStr}deg, ${colorStops})`;

    return {
      cssValue,
      gradientType: "linear-gradient",
      usedFallback: true,
      originalType: "GRADIENT_DIAMOND",
      warning:
        "Diamond gradient approximated as linear-gradient. Consider using SVG for accurate diamond gradients.",
    };
  }

  // Default: radial fallback
  const { centerX, centerY, radiusX, radiusY } = calculateRadialProperties(gradientHandlePositions);

  const centerXStr = centerX.toFixed(opts.positionPrecision);
  const centerYStr = centerY.toFixed(opts.positionPrecision);

  // Use the average of the two radii for a circular approximation
  const avgRadius = ((radiusX + radiusY) / 2).toFixed(opts.positionPrecision);

  const cssValue = `radial-gradient(circle ${avgRadius}% at ${centerXStr}% ${centerYStr}%, ${colorStops})`;

  return {
    cssValue,
    gradientType: "radial-gradient",
    usedFallback: true,
    originalType: "GRADIENT_DIAMOND",
    warning:
      "Diamond gradient approximated as radial-gradient. Consider using SVG for accurate diamond gradients.",
  };
}

// ============================================================================
// Main Conversion Functions
// ============================================================================

/**
 * Type guard to check if a paint is a gradient
 */
export function isGradientPaint(paint: FigmaPaint): paint is FigmaGradientPaint {
  return (
    paint.type === "GRADIENT_LINEAR" ||
    paint.type === "GRADIENT_RADIAL" ||
    paint.type === "GRADIENT_ANGULAR" ||
    paint.type === "GRADIENT_DIAMOND"
  );
}

/**
 * Type guard to check if a paint is a solid color
 */
export function isSolidPaint(paint: FigmaPaint): boolean {
  return paint.type === "SOLID";
}

/**
 * Converts a single Figma gradient paint to CSS
 */
export function convertGradient(
  paint: FigmaGradientPaint,
  options: GradientConversionOptions = {}
): GradientConversionResult {
  switch (paint.type) {
    case "GRADIENT_LINEAR":
      return convertLinearGradient(paint, options);
    case "GRADIENT_RADIAL":
      return convertRadialGradient(paint, options);
    case "GRADIENT_ANGULAR":
      return convertAngularGradient(paint, options);
    case "GRADIENT_DIAMOND":
      return convertDiamondGradient(paint, options);
    default:
      // TypeScript should catch this, but just in case
      return {
        cssValue: "",
        gradientType: "linear-gradient",
        usedFallback: true,
        originalType: paint.type,
        warning: `Unknown gradient type: ${paint.type}`,
      };
  }
}

/**
 * Converts multiple Figma fills (including solids and gradients) to CSS background
 *
 * Figma layers fills from bottom to top (first fill is bottom-most).
 * CSS background-image layers from top to bottom (first value is top-most).
 * So we need to reverse the order.
 */
export function convertFillsToBackground(
  fills: FigmaPaint[],
  options: GradientConversionOptions = {}
): MultiFillConversionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const gradients: GradientConversionResult[] = [];
  const solidColors: string[] = [];
  const warnings: string[] = [];

  // Process visible fills only
  const visibleFills = fills.filter((fill) => fill.visible !== false);

  for (const fill of visibleFills) {
    if (isGradientPaint(fill)) {
      const result = convertGradient(fill, opts);
      if (result.cssValue) {
        gradients.push(result);
      }
      if (result.warning) {
        warnings.push(result.warning);
      }
    } else if (isSolidPaint(fill) && fill.color) {
      const color = formatColor(fill.color, opts.colorFormat, fill.opacity ?? 1);
      solidColors.push(color);
    }
  }

  // Reverse order for CSS (Figma: bottom-to-top, CSS: top-to-bottom)
  const reversedGradients = [...gradients].reverse();
  const reversedSolids = [...solidColors].reverse();

  // Build combined background value
  const backgroundParts: string[] = [];

  // Add gradients first (they layer on top)
  for (const gradient of reversedGradients) {
    backgroundParts.push(gradient.cssValue);
  }

  // Solid colors become the bottom-most layer as background-color
  // Or can be converted to linear-gradient for layering
  for (const color of reversedSolids) {
    // Convert solid to linear-gradient so it can layer with other gradients
    backgroundParts.push(`linear-gradient(${color}, ${color})`);
  }

  const cssBackground = backgroundParts.join(", ");

  return {
    cssBackground,
    gradients: reversedGradients,
    solidColors: reversedSolids,
    warnings,
  };
}

// ============================================================================
// Tailwind CSS Generation
// ============================================================================

/**
 * Tailwind gradient direction classes
 */
const TAILWIND_DIRECTIONS: Record<string, string> = {
  "0": "bg-gradient-to-t",
  "45": "bg-gradient-to-tr",
  "90": "bg-gradient-to-r",
  "135": "bg-gradient-to-br",
  "180": "bg-gradient-to-b",
  "225": "bg-gradient-to-bl",
  "270": "bg-gradient-to-l",
  "315": "bg-gradient-to-tl",
};

/**
 * Attempts to generate Tailwind classes for a gradient
 * Returns null if the gradient can't be represented with Tailwind utilities
 */
export function gradientToTailwind(
  paint: FigmaGradientPaint
): { classes: string[]; isApproximate: boolean; warning?: string } | null {
  // Only linear gradients with simple stops can use Tailwind
  if (paint.type !== "GRADIENT_LINEAR") {
    return null;
  }

  const stops = paint.gradientStops;

  // Tailwind only supports 2-3 color stops (from, via, to)
  if (stops.length < 2 || stops.length > 3) {
    return null;
  }

  // Check if stops are at standard positions (0, 0.5, 1)
  const hasStandardPositions =
    stops.length === 2
      ? stops[0].position === 0 && stops[1].position === 1
      : stops[0].position === 0 && Math.abs(stops[1].position - 0.5) < 0.1 && stops[2].position === 1;

  if (!hasStandardPositions) {
    return null;
  }

  // Calculate angle
  const [start, end] = paint.gradientHandlePositions;
  const angle = calculateGradientAngle(start, end);

  // Find closest Tailwind direction
  const roundedAngle = Math.round(angle / 45) * 45;
  const normalizedAngle = roundedAngle % 360;
  const directionClass = TAILWIND_DIRECTIONS[normalizedAngle.toString()];

  if (!directionClass) {
    return null;
  }

  const classes: string[] = [directionClass];
  const isApproximate = Math.abs(angle - normalizedAngle) > 5;

  // Generate color classes (these would need to be custom colors in Tailwind config)
  // For now, we return the direction class and note that colors need arbitrary values
  const fromColor = figmaColorToHex(stops[0].color);
  const toColor = figmaColorToHex(stops[stops.length - 1].color);

  classes.push(`from-[${fromColor}]`);

  if (stops.length === 3) {
    const viaColor = figmaColorToHex(stops[1].color);
    classes.push(`via-[${viaColor}]`);
  }

  classes.push(`to-[${toColor}]`);

  return {
    classes,
    isApproximate,
    warning: isApproximate ? `Angle ${angle.toFixed(1)}deg approximated to ${normalizedAngle}deg for Tailwind` : undefined,
  };
}

// ============================================================================
// CSS Generation Utilities
// ============================================================================

/**
 * Generates a complete CSS rule for gradient background
 */
export function generateGradientCSS(
  fills: FigmaPaint[],
  options: GradientConversionOptions & {
    selector?: string;
    includeBackgroundColor?: boolean;
  } = {}
): string {
  const { selector = ".element", includeBackgroundColor = true, includeComments, ...convertOptions } = options;
  const result = convertFillsToBackground(fills, convertOptions);

  const lines: string[] = [];

  if (includeComments && result.warnings.length > 0) {
    lines.push(`/* Warnings: ${result.warnings.join("; ")} */`);
  }

  lines.push(`${selector} {`);

  // If there's a solid color, use it as background-color fallback
  if (includeBackgroundColor && result.solidColors.length > 0) {
    lines.push(`  background-color: ${result.solidColors[result.solidColors.length - 1]};`);
  }

  if (result.cssBackground) {
    lines.push(`  background: ${result.cssBackground};`);
  }

  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generates inline style object for React/JSX
 */
export function generateGradientStyle(
  fills: FigmaPaint[],
  options: GradientConversionOptions = {}
): React.CSSProperties {
  const result = convertFillsToBackground(fills, options);

  const style: React.CSSProperties = {};

  if (result.solidColors.length > 0) {
    style.backgroundColor = result.solidColors[result.solidColors.length - 1];
  }

  if (result.cssBackground) {
    style.background = result.cssBackground;
  }

  return style;
}

// ============================================================================
// Parsing Utilities
// ============================================================================

/**
 * Parses fills from a Figma node (handles the unknown[] type)
 */
export function parseFillsFromNode(fills: unknown[]): FigmaPaint[] {
  if (!Array.isArray(fills)) {
    return [];
  }

  return fills.filter((fill): fill is FigmaPaint => {
    if (typeof fill !== "object" || fill === null) {
      return false;
    }

    const f = fill as Record<string, unknown>;
    return typeof f.type === "string";
  });
}

/**
 * Extracts all gradients from a Figma node tree
 */
export function extractGradientsFromNode(node: {
  fills?: unknown[];
  children?: Array<{ fills?: unknown[]; children?: unknown[] }>;
}): { nodeId?: string; fills: FigmaPaint[] }[] {
  const results: { nodeId?: string; fills: FigmaPaint[] }[] = [];

  const traverse = (n: { id?: string; fills?: unknown[]; children?: unknown[] }) => {
    if (n.fills && Array.isArray(n.fills)) {
      const parsedFills = parseFillsFromNode(n.fills);
      const gradients = parsedFills.filter(isGradientPaint);

      if (gradients.length > 0) {
        results.push({
          nodeId: n.id,
          fills: parsedFills,
        });
      }
    }

    if (n.children && Array.isArray(n.children)) {
      for (const child of n.children) {
        traverse(child as { id?: string; fills?: unknown[]; children?: unknown[] });
      }
    }
  };

  traverse(node);
  return results;
}
