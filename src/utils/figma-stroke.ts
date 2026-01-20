/**
 * Figma Stroke to CSS Border Converter
 *
 * This module handles converting Figma stroke properties to CSS border syntax.
 * Supports stroke width (uniform and individual sides), style (solid, dashed),
 * alignment (inside, center, outside), and color extraction.
 *
 * @see https://www.figma.com/developers/api#node-types
 */

import type { FigmaColor } from "./figma-api";
import { figmaColorToRgba, figmaColorToHex, figmaColorToHsl, type FigmaPaint } from "./figma-gradient";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Figma stroke alignment options
 */
export type FigmaStrokeAlign = "INSIDE" | "OUTSIDE" | "CENTER";

/**
 * Figma stroke join options (for corner rendering)
 */
export type FigmaStrokeJoin = "MITER" | "BEVEL" | "ROUND";

/**
 * Figma stroke cap options (for line endings)
 */
export type FigmaStrokeCap =
  | "NONE"
  | "ROUND"
  | "SQUARE"
  | "LINE_ARROW"
  | "TRIANGLE_ARROW"
  | "DIAMOND_FILLED"
  | "CIRCLE_FILLED"
  | "TRIANGLE_FILLED"
  | "WASHI_TAPE_1"
  | "WASHI_TAPE_2"
  | "WASHI_TAPE_3"
  | "WASHI_TAPE_4"
  | "WASHI_TAPE_5"
  | "WASHI_TAPE_6";

/**
 * Individual stroke weights for each side
 */
export interface FigmaStrokeWeights {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Figma node stroke properties
 */
export interface FigmaStrokeProperties {
  /** Array of stroke paints (colors/gradients) */
  strokes?: FigmaPaint[];
  /** Uniform stroke weight (ignored if individualStrokeWeights is set) */
  strokeWeight?: number;
  /** Individual stroke weights per side */
  individualStrokeWeights?: FigmaStrokeWeights;
  /** Stroke alignment relative to the shape boundary */
  strokeAlign?: FigmaStrokeAlign;
  /** Stroke join style for corners */
  strokeJoin?: FigmaStrokeJoin;
  /** Dash pattern array - empty or undefined means solid */
  strokeDashes?: number[];
  /** Stroke cap style for line endings */
  strokeCap?: FigmaStrokeCap;
  /** Miter angle limit in degrees */
  strokeMiterAngle?: number;
  /** Whether strokes are included in auto-layout calculations */
  strokesIncludedInLayout?: boolean;
}

/**
 * CSS border style values
 */
export type CSSBorderStyle = "none" | "solid" | "dashed" | "dotted" | "double";

/**
 * Result of stroke conversion
 */
export interface StrokeConversionResult {
  /** CSS border property value (shorthand) */
  cssBorder?: string;
  /** CSS border-width value */
  cssBorderWidth?: string;
  /** CSS border-style value */
  cssBorderStyle?: string;
  /** CSS border-color value */
  cssBorderColor?: string;
  /** Individual border properties (when sides differ) */
  cssBorderTop?: string;
  cssBorderRight?: string;
  cssBorderBottom?: string;
  cssBorderLeft?: string;
  /** Box-sizing recommendation based on stroke alignment */
  cssBoxSizing?: "border-box" | "content-box";
  /** Box-shadow alternative for non-center alignments */
  cssBoxShadow?: string;
  /** Outline alternative for outside strokes */
  cssOutline?: string;
  /** Whether the stroke uses uniform width on all sides */
  isUniform: boolean;
  /** The stroke alignment used */
  strokeAlign: FigmaStrokeAlign;
  /** Whether a fallback was needed */
  usedFallback: boolean;
  /** Warning messages */
  warnings: string[];
  /** Tailwind CSS classes */
  tailwindClasses?: string[];
}

/**
 * Options for stroke conversion
 */
export interface StrokeConversionOptions {
  /** Color format for output: 'rgba' | 'hex' | 'hsl' */
  colorFormat?: "rgba" | "hex" | "hsl";
  /** Whether to include CSS comments for alignment considerations */
  includeComments?: boolean;
  /** Precision for width values (decimal places) */
  widthPrecision?: number;
  /** How to handle non-center stroke alignments */
  alignmentStrategy?: "border-with-warning" | "box-shadow" | "outline-for-outside";
  /** Whether to generate Tailwind classes */
  generateTailwind?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_OPTIONS: Required<StrokeConversionOptions> = {
  colorFormat: "rgba",
  includeComments: false,
  widthPrecision: 1,
  alignmentStrategy: "border-with-warning",
  generateTailwind: true,
};

/**
 * Tailwind border width classes
 */
const TAILWIND_BORDER_WIDTHS: Record<number, string> = {
  0: "border-0",
  1: "border",
  2: "border-2",
  4: "border-4",
  8: "border-8",
};

/**
 * Tailwind border width classes for individual sides
 */
const TAILWIND_SIDE_BORDER_WIDTHS: Record<string, Record<number, string>> = {
  top: { 0: "border-t-0", 1: "border-t", 2: "border-t-2", 4: "border-t-4", 8: "border-t-8" },
  right: { 0: "border-r-0", 1: "border-r", 2: "border-r-2", 4: "border-r-4", 8: "border-r-8" },
  bottom: { 0: "border-b-0", 1: "border-b", 2: "border-b-2", 4: "border-b-4", 8: "border-b-8" },
  left: { 0: "border-l-0", 1: "border-l", 2: "border-l-2", 4: "border-l-4", 8: "border-l-8" },
};

// ============================================================================
// Helper Functions - Color Conversion
// ============================================================================

/**
 * Formats a Figma color to the specified CSS format
 */
function formatColor(
  color: FigmaColor,
  format: StrokeConversionOptions["colorFormat"],
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

/**
 * Extracts the primary stroke color from strokes array
 */
export function extractStrokeColor(
  strokes: FigmaPaint[] | undefined,
  options: StrokeConversionOptions = {}
): string | undefined {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!strokes || strokes.length === 0) {
    return undefined;
  }

  // Get the first visible solid stroke
  const visibleStrokes = strokes.filter((stroke) => stroke.visible !== false);
  if (visibleStrokes.length === 0) {
    return undefined;
  }

  // Find first solid color stroke
  for (const stroke of visibleStrokes) {
    if (stroke.type === "SOLID" && stroke.color) {
      return formatColor(stroke.color, opts.colorFormat, stroke.opacity ?? 1);
    }
  }

  // If no solid color, check for gradient (return first color stop)
  for (const stroke of visibleStrokes) {
    if (stroke.gradientStops && stroke.gradientStops.length > 0) {
      return formatColor(stroke.gradientStops[0].color, opts.colorFormat, stroke.opacity ?? 1);
    }
  }

  return undefined;
}

// ============================================================================
// Helper Functions - Style Conversion
// ============================================================================

/**
 * Converts Figma dash pattern to CSS border style
 */
export function dashPatternToBorderStyle(dashPattern?: number[]): CSSBorderStyle {
  if (!dashPattern || dashPattern.length === 0) {
    return "solid";
  }

  // Simple heuristic: if all dash values are equal and small, it's dotted
  // If dash values vary or are larger, it's dashed
  const [dash, gap] = dashPattern;

  if (dashPattern.length === 2) {
    // Equal dash and gap with small values suggests dotted
    if (dash <= 2 && gap <= 2 && dash === gap) {
      return "dotted";
    }
    return "dashed";
  }

  // Complex patterns default to dashed
  return "dashed";
}

/**
 * Converts Figma stroke join to CSS equivalent (for SVG or border-radius hints)
 */
export function strokeJoinToCSS(strokeJoin?: FigmaStrokeJoin): string | undefined {
  switch (strokeJoin) {
    case "ROUND":
      return "round";
    case "BEVEL":
      return "bevel";
    case "MITER":
    default:
      return "miter";
  }
}

// ============================================================================
// Helper Functions - Width Processing
// ============================================================================

/**
 * Formats a width value with the specified precision
 */
function formatWidth(width: number, precision: number): string {
  const formatted = width.toFixed(precision);
  // Remove trailing zeros and unnecessary decimal point
  return parseFloat(formatted).toString();
}

/**
 * Checks if stroke weights are uniform on all sides
 */
export function hasUniformStrokeWeight(weights: FigmaStrokeWeights): boolean {
  return (
    weights.top === weights.right &&
    weights.right === weights.bottom &&
    weights.bottom === weights.left
  );
}

/**
 * Gets the effective stroke weight(s) from a node's properties
 */
export function getEffectiveStrokeWeights(
  props: Pick<FigmaStrokeProperties, "strokeWeight" | "individualStrokeWeights">
): FigmaStrokeWeights | number {
  if (props.individualStrokeWeights) {
    return props.individualStrokeWeights;
  }
  return props.strokeWeight ?? 0;
}

// ============================================================================
// Main Conversion Functions
// ============================================================================

/**
 * Converts Figma stroke properties to CSS border properties
 */
export function convertStrokeToBorder(
  props: FigmaStrokeProperties,
  options: StrokeConversionOptions = {}
): StrokeConversionResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];
  const tailwindClasses: string[] = [];

  // Handle no strokes case
  if (!props.strokes || props.strokes.length === 0 || props.strokeWeight === 0) {
    return {
      isUniform: true,
      strokeAlign: props.strokeAlign ?? "CENTER",
      usedFallback: false,
      warnings: [],
      tailwindClasses: opts.generateTailwind ? ["border-0"] : undefined,
    };
  }

  // Check if strokes are visible
  const visibleStrokes = props.strokes.filter((s) => s.visible !== false);
  if (visibleStrokes.length === 0) {
    return {
      isUniform: true,
      strokeAlign: props.strokeAlign ?? "CENTER",
      usedFallback: false,
      warnings: [],
      tailwindClasses: opts.generateTailwind ? ["border-0"] : undefined,
    };
  }

  const strokeAlign = props.strokeAlign ?? "CENTER";
  const strokeColor = extractStrokeColor(props.strokes, opts);
  const borderStyle = dashPatternToBorderStyle(props.strokeDashes);
  const effectiveWeights = getEffectiveStrokeWeights(props);

  // Check for gradient strokes (limited CSS support)
  const hasGradientStroke = visibleStrokes.some(
    (s) =>
      s.type === "GRADIENT_LINEAR" ||
      s.type === "GRADIENT_RADIAL" ||
      s.type === "GRADIENT_ANGULAR" ||
      s.type === "GRADIENT_DIAMOND"
  );

  if (hasGradientStroke) {
    warnings.push(
      "Gradient strokes have limited CSS support. Consider using border-image or SVG for gradient borders."
    );
  }

  // Process stroke alignment warnings
  if (strokeAlign !== "CENTER") {
    if (opts.alignmentStrategy === "border-with-warning") {
      warnings.push(
        `Stroke alignment '${strokeAlign}' differs from CSS border behavior (always 'CENTER'). ` +
          `For '${strokeAlign}' alignment, consider using box-shadow or adjusting element dimensions.`
      );
    }
  }

  const result: StrokeConversionResult = {
    strokeAlign,
    usedFallback: false,
    warnings,
    isUniform: true,
  };

  // Handle uniform vs individual stroke weights
  if (typeof effectiveWeights === "number") {
    // Uniform stroke weight
    const width = formatWidth(effectiveWeights, opts.widthPrecision);

    if (strokeColor) {
      result.cssBorder = `${width}px ${borderStyle} ${strokeColor}`;
      result.cssBorderWidth = `${width}px`;
      result.cssBorderStyle = borderStyle;
      result.cssBorderColor = strokeColor;
    } else {
      result.cssBorderWidth = `${width}px`;
      result.cssBorderStyle = borderStyle;
    }

    // Generate Tailwind classes
    if (opts.generateTailwind) {
      const roundedWidth = Math.round(effectiveWeights);
      const widthClass = TAILWIND_BORDER_WIDTHS[roundedWidth];

      if (widthClass) {
        tailwindClasses.push(widthClass);
      } else {
        tailwindClasses.push(`border-[${width}px]`);
      }

      if (borderStyle !== "solid") {
        tailwindClasses.push(`border-${borderStyle}`);
      }

      if (strokeColor) {
        tailwindClasses.push(`border-[${strokeColor}]`);
      }
    }

    // Handle non-center alignments with alternative CSS
    if (strokeAlign !== "CENTER" && opts.alignmentStrategy !== "border-with-warning") {
      result.usedFallback = true;

      if (opts.alignmentStrategy === "box-shadow" && strokeColor) {
        const shadowWidth = formatWidth(effectiveWeights, opts.widthPrecision);
        if (strokeAlign === "INSIDE") {
          result.cssBoxShadow = `inset 0 0 0 ${shadowWidth}px ${strokeColor}`;
        } else {
          // OUTSIDE
          result.cssBoxShadow = `0 0 0 ${shadowWidth}px ${strokeColor}`;
        }
      } else if (opts.alignmentStrategy === "outline-for-outside" && strokeAlign === "OUTSIDE") {
        if (strokeColor) {
          result.cssOutline = `${width}px ${borderStyle} ${strokeColor}`;
        }
      }
    }
  } else {
    // Individual stroke weights
    result.isUniform = false;
    const { top, right, bottom, left } = effectiveWeights;

    const topWidth = formatWidth(top, opts.widthPrecision);
    const rightWidth = formatWidth(right, opts.widthPrecision);
    const bottomWidth = formatWidth(bottom, opts.widthPrecision);
    const leftWidth = formatWidth(left, opts.widthPrecision);

    // Use individual border properties
    if (strokeColor) {
      if (top > 0) result.cssBorderTop = `${topWidth}px ${borderStyle} ${strokeColor}`;
      if (right > 0) result.cssBorderRight = `${rightWidth}px ${borderStyle} ${strokeColor}`;
      if (bottom > 0) result.cssBorderBottom = `${bottomWidth}px ${borderStyle} ${strokeColor}`;
      if (left > 0) result.cssBorderLeft = `${leftWidth}px ${borderStyle} ${strokeColor}`;
    }

    // Set border-width shorthand (clockwise: top right bottom left)
    result.cssBorderWidth = `${topWidth}px ${rightWidth}px ${bottomWidth}px ${leftWidth}px`;
    result.cssBorderStyle = borderStyle;
    if (strokeColor) {
      result.cssBorderColor = strokeColor;
    }

    // Generate Tailwind classes for individual sides
    if (opts.generateTailwind) {
      const sides: Array<{ side: string; width: number }> = [
        { side: "top", width: top },
        { side: "right", width: right },
        { side: "bottom", width: bottom },
        { side: "left", width: left },
      ];

      for (const { side, width } of sides) {
        if (width > 0) {
          const roundedWidth = Math.round(width);
          const sideClasses = TAILWIND_SIDE_BORDER_WIDTHS[side];
          const widthClass = sideClasses?.[roundedWidth];

          if (widthClass) {
            tailwindClasses.push(widthClass);
          } else {
            const sidePrefix = side.charAt(0); // t, r, b, l
            tailwindClasses.push(`border-${sidePrefix}-[${formatWidth(width, opts.widthPrecision)}px]`);
          }
        }
      }

      if (borderStyle !== "solid") {
        tailwindClasses.push(`border-${borderStyle}`);
      }

      if (strokeColor) {
        tailwindClasses.push(`border-[${strokeColor}]`);
      }
    }

    // Box-shadow fallback for individual weights is complex
    if (strokeAlign !== "CENTER" && opts.alignmentStrategy === "box-shadow") {
      warnings.push(
        "Individual stroke weights with non-center alignment cannot be accurately represented with box-shadow."
      );
    }
  }

  // Add box-sizing recommendation
  if (strokeAlign === "INSIDE") {
    result.cssBoxSizing = "border-box";
  } else if (strokeAlign === "OUTSIDE") {
    result.cssBoxSizing = "content-box";
    warnings.push(
      "Outside stroke alignment may require adjusting element dimensions to account for border width."
    );
  }

  if (opts.generateTailwind && tailwindClasses.length > 0) {
    result.tailwindClasses = tailwindClasses;
  }

  return result;
}

// ============================================================================
// CSS Generation Utilities
// ============================================================================

/**
 * Generates a complete CSS rule for border styling
 */
export function generateBorderCSS(
  props: FigmaStrokeProperties,
  options: StrokeConversionOptions & { selector?: string } = {}
): string {
  const { selector = ".element", includeComments, ...convertOptions } = options;
  const result = convertStrokeToBorder(props, { ...convertOptions, includeComments });

  const lines: string[] = [];

  if (includeComments && result.warnings.length > 0) {
    lines.push(`/* Warnings: ${result.warnings.join("; ")} */`);
  }

  if (includeComments && result.strokeAlign !== "CENTER") {
    lines.push(`/* Figma stroke alignment: ${result.strokeAlign} */`);
  }

  lines.push(`${selector} {`);

  if (result.cssBoxSizing) {
    lines.push(`  box-sizing: ${result.cssBoxSizing};`);
  }

  if (result.isUniform && result.cssBorder) {
    lines.push(`  border: ${result.cssBorder};`);
  } else {
    if (result.cssBorderTop) lines.push(`  border-top: ${result.cssBorderTop};`);
    if (result.cssBorderRight) lines.push(`  border-right: ${result.cssBorderRight};`);
    if (result.cssBorderBottom) lines.push(`  border-bottom: ${result.cssBorderBottom};`);
    if (result.cssBorderLeft) lines.push(`  border-left: ${result.cssBorderLeft};`);

    // Fallback to individual properties if no shorthand borders
    if (
      !result.cssBorderTop &&
      !result.cssBorderRight &&
      !result.cssBorderBottom &&
      !result.cssBorderLeft
    ) {
      if (result.cssBorderWidth) lines.push(`  border-width: ${result.cssBorderWidth};`);
      if (result.cssBorderStyle) lines.push(`  border-style: ${result.cssBorderStyle};`);
      if (result.cssBorderColor) lines.push(`  border-color: ${result.cssBorderColor};`);
    }
  }

  // Add alternative CSS for alignment strategies
  if (result.cssBoxShadow && includeComments) {
    lines.push(`  /* Alternative using box-shadow for ${result.strokeAlign} alignment: */`);
    lines.push(`  /* box-shadow: ${result.cssBoxShadow}; */`);
  }

  if (result.cssOutline && includeComments) {
    lines.push(`  /* Alternative using outline for OUTSIDE alignment: */`);
    lines.push(`  /* outline: ${result.cssOutline}; */`);
  }

  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generates inline style object for React/JSX
 */
export function generateBorderStyle(
  props: FigmaStrokeProperties,
  options: StrokeConversionOptions = {}
): React.CSSProperties {
  const result = convertStrokeToBorder(props, options);
  const style: React.CSSProperties = {};

  if (result.cssBoxSizing) {
    style.boxSizing = result.cssBoxSizing;
  }

  if (result.isUniform) {
    if (result.cssBorderWidth) style.borderWidth = result.cssBorderWidth;
    if (result.cssBorderStyle) style.borderStyle = result.cssBorderStyle;
    if (result.cssBorderColor) style.borderColor = result.cssBorderColor;
  } else {
    // Individual side borders
    if (result.cssBorderTop) {
      const [topWidth, topStyleVal, topColor] = parseBorderShorthand(result.cssBorderTop);
      style.borderTopWidth = topWidth;
      style.borderTopStyle = topStyleVal as React.CSSProperties["borderTopStyle"];
      style.borderTopColor = topColor;
    }
    if (result.cssBorderRight) {
      const [rightWidth, rightStyleVal, rightColor] = parseBorderShorthand(result.cssBorderRight);
      style.borderRightWidth = rightWidth;
      style.borderRightStyle = rightStyleVal as React.CSSProperties["borderRightStyle"];
      style.borderRightColor = rightColor;
    }
    if (result.cssBorderBottom) {
      const [bottomWidth, bottomStyleVal, bottomColor] = parseBorderShorthand(result.cssBorderBottom);
      style.borderBottomWidth = bottomWidth;
      style.borderBottomStyle = bottomStyleVal as React.CSSProperties["borderBottomStyle"];
      style.borderBottomColor = bottomColor;
    }
    if (result.cssBorderLeft) {
      const [leftWidth, leftStyleVal, leftColor] = parseBorderShorthand(result.cssBorderLeft);
      style.borderLeftWidth = leftWidth;
      style.borderLeftStyle = leftStyleVal as React.CSSProperties["borderLeftStyle"];
      style.borderLeftColor = leftColor;
    }
  }

  return style;
}

/**
 * Parses a CSS border shorthand into its components
 */
function parseBorderShorthand(border: string): [string, string, string] {
  const parts = border.split(" ");
  if (parts.length >= 3) {
    return [parts[0], parts[1], parts.slice(2).join(" ")];
  }
  return [parts[0] || "", parts[1] || "solid", parts[2] || ""];
}

// ============================================================================
// Tailwind CSS Generation
// ============================================================================

/**
 * Generates Tailwind CSS classes for border styling
 */
export function generateBorderTailwind(
  props: FigmaStrokeProperties,
  options: StrokeConversionOptions = {}
): { classes: string[]; isApproximate: boolean; warnings: string[] } {
  const result = convertStrokeToBorder(props, { ...options, generateTailwind: true });

  return {
    classes: result.tailwindClasses ?? [],
    isApproximate: result.usedFallback,
    warnings: result.warnings,
  };
}

// ============================================================================
// Parsing Utilities
// ============================================================================

/**
 * Type guard to check if a node has stroke properties
 */
export function hasStrokeProperties(
  node: unknown
): node is { strokes: unknown[]; strokeWeight?: number; strokeAlign?: string } {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const n = node as Record<string, unknown>;
  return Array.isArray(n.strokes);
}

/**
 * Parses stroke properties from a Figma node
 */
export function parseStrokePropertiesFromNode(node: unknown): FigmaStrokeProperties | null {
  if (!hasStrokeProperties(node)) {
    return null;
  }

  const n = node as Record<string, unknown>;

  const props: FigmaStrokeProperties = {
    strokes: n.strokes as FigmaPaint[] | undefined,
  };

  if (typeof n.strokeWeight === "number") {
    props.strokeWeight = n.strokeWeight;
  }

  if (n.individualStrokeWeights && typeof n.individualStrokeWeights === "object") {
    const weights = n.individualStrokeWeights as Record<string, unknown>;
    if (
      typeof weights.top === "number" &&
      typeof weights.right === "number" &&
      typeof weights.bottom === "number" &&
      typeof weights.left === "number"
    ) {
      props.individualStrokeWeights = {
        top: weights.top,
        right: weights.right,
        bottom: weights.bottom,
        left: weights.left,
      };
    }
  }

  if (n.strokeAlign === "INSIDE" || n.strokeAlign === "OUTSIDE" || n.strokeAlign === "CENTER") {
    props.strokeAlign = n.strokeAlign;
  }

  if (n.strokeJoin === "MITER" || n.strokeJoin === "BEVEL" || n.strokeJoin === "ROUND") {
    props.strokeJoin = n.strokeJoin;
  }

  if (Array.isArray(n.strokeDashes)) {
    props.strokeDashes = n.strokeDashes.filter((d): d is number => typeof d === "number");
  }

  if (typeof n.strokeCap === "string") {
    props.strokeCap = n.strokeCap as FigmaStrokeCap;
  }

  if (typeof n.strokeMiterAngle === "number") {
    props.strokeMiterAngle = n.strokeMiterAngle;
  }

  if (typeof n.strokesIncludedInLayout === "boolean") {
    props.strokesIncludedInLayout = n.strokesIncludedInLayout;
  }

  return props;
}

/**
 * Extracts all strokes from a Figma node tree
 */
export function extractStrokesFromNode(node: {
  id?: string;
  strokes?: unknown[];
  strokeWeight?: number;
  children?: unknown[];
}): { nodeId?: string; props: FigmaStrokeProperties }[] {
  const results: { nodeId?: string; props: FigmaStrokeProperties }[] = [];

  const traverse = (n: {
    id?: string;
    strokes?: unknown[];
    strokeWeight?: number;
    children?: unknown[];
  }) => {
    const props = parseStrokePropertiesFromNode(n);
    if (props && props.strokes && props.strokes.length > 0) {
      results.push({
        nodeId: n.id,
        props,
      });
    }

    if (n.children && Array.isArray(n.children)) {
      for (const child of n.children) {
        traverse(child as typeof n);
      }
    }
  };

  traverse(node);
  return results;
}
