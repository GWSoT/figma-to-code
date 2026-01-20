/**
 * Tailwind CSS Integration with Figma Utilities
 *
 * This module provides integration between the Tailwind CSS class generator
 * and the existing Figma conversion utilities (stroke, border-radius, gradient, etc.).
 * It orchestrates the conversion of complete Figma nodes to Tailwind CSS classes.
 */

import type { FigmaNode, FigmaColor } from "./figma-api";
import type { FigmaPaint } from "./figma-gradient";

import {
  generateTailwindClasses,
  generateColorClass,
  generateTypographyClasses,
  generateBorderClasses,
  generateFlexClasses,
  generateShadowClasses,
  generateTailwindConfig,
  generateCSSVariables,
  extractDesignTokens,
  type FigmaDesignProperties,
  type TailwindGenerationOptions,
  type TailwindGenerationResult,
  type DesignToken,
  type TailwindBreakpoint,
} from "./tailwind-generator";

import {
  convertStrokeToBorder,
  parseStrokePropertiesFromNode,
  type FigmaStrokeProperties,
} from "./figma-stroke";

import {
  convertCornerRadius,
  type CornerRadiusNode,
} from "./figma-border-radius";

import { figmaColorToHex, figmaColorToRgba } from "./figma-gradient";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for Figma to Tailwind conversion
 */
export interface FigmaToTailwindOptions extends TailwindGenerationOptions {
  /** Include layout properties */
  includeLayout?: boolean;
  /** Include typography properties */
  includeTypography?: boolean;
  /** Include border properties */
  includeBorders?: boolean;
  /** Include background properties */
  includeBackground?: boolean;
  /** Include effect properties (shadows, blur) */
  includeEffects?: boolean;
  /** Include size properties */
  includeSize?: boolean;
  /** Whether to include nested children */
  includeChildren?: boolean;
  /** Maximum depth for children processing */
  maxChildDepth?: number;
}

/**
 * Result of converting a Figma node to Tailwind
 */
export interface FigmaNodeTailwindResult {
  /** Node ID */
  nodeId: string;
  /** Node name */
  nodeName: string;
  /** Node type */
  nodeType: string;
  /** Generated Tailwind classes */
  classes: string[];
  /** Classes as className string */
  className: string;
  /** Dark mode variant classes */
  darkModeClasses?: string[];
  /** Responsive variant classes */
  responsiveClasses?: Partial<Record<TailwindBreakpoint, string[]>>;
  /** Whether arbitrary values were used */
  usedArbitraryValues: boolean;
  /** Conversion warnings */
  warnings: string[];
  /** Child node results */
  children?: FigmaNodeTailwindResult[];
}

/**
 * Result of converting a Figma file to Tailwind config
 */
export interface FigmaToTailwindConfigResult {
  /** Generated tailwind.config.js content */
  configContent: string;
  /** Generated CSS variables */
  cssVariables: string;
  /** Extracted design tokens */
  tokens: DesignToken[];
  /** Extraction warnings */
  warnings: string[];
}

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_FIGMA_OPTIONS: FigmaToTailwindOptions = {
  version: "4",
  useArbitraryValues: true,
  generateDarkMode: false,
  darkModeStrategy: "class",
  customColors: {},
  colorFormat: "hex",
  optimizeClasses: true,
  includeLayout: true,
  includeTypography: true,
  includeBorders: true,
  includeBackground: true,
  includeEffects: true,
  includeSize: true,
  includeChildren: false,
  maxChildDepth: 2,
};

// ============================================================================
// Node Property Extraction
// ============================================================================

/**
 * Extract design properties from a Figma node
 */
export function extractDesignPropertiesFromNode(
  node: FigmaNode
): FigmaDesignProperties {
  const props: FigmaDesignProperties = {};

  // Cast to access all properties (FigmaNode may have additional properties not in the type)
  const n = node as unknown as Record<string, unknown>;

  // Layout properties
  if (n.absoluteBoundingBox) {
    const box = n.absoluteBoundingBox as { width: number; height: number };
    props.width = box.width;
    props.height = box.height;
  }

  // Auto-layout properties
  if (n.layoutMode) {
    props.layoutMode = n.layoutMode as FigmaDesignProperties["layoutMode"];
  }
  if (n.primaryAxisAlignItems) {
    props.primaryAxisAlignItems = n.primaryAxisAlignItems as FigmaDesignProperties["primaryAxisAlignItems"];
  }
  if (n.counterAxisAlignItems) {
    props.counterAxisAlignItems = n.counterAxisAlignItems as FigmaDesignProperties["counterAxisAlignItems"];
  }
  if (n.layoutWrap) {
    props.layoutWrap = n.layoutWrap as FigmaDesignProperties["layoutWrap"];
  }
  if (typeof n.itemSpacing === "number") {
    props.gap = n.itemSpacing;
  }
  if (typeof n.layoutGrow === "number") {
    props.layoutGrow = n.layoutGrow;
  }
  if (n.layoutSizingHorizontal) {
    props.layoutSizingHorizontal = n.layoutSizingHorizontal as FigmaDesignProperties["layoutSizingHorizontal"];
  }
  if (n.layoutSizingVertical) {
    props.layoutSizingVertical = n.layoutSizingVertical as FigmaDesignProperties["layoutSizingVertical"];
  }

  // Padding
  if (
    typeof n.paddingTop === "number" ||
    typeof n.paddingRight === "number" ||
    typeof n.paddingBottom === "number" ||
    typeof n.paddingLeft === "number"
  ) {
    props.padding = {
      top: (n.paddingTop as number) ?? 0,
      right: (n.paddingRight as number) ?? 0,
      bottom: (n.paddingBottom as number) ?? 0,
      left: (n.paddingLeft as number) ?? 0,
    };
  }

  // Background/Fills
  if (Array.isArray(n.fills)) {
    props.fills = n.fills as FigmaDesignProperties["fills"];

    // Extract background color from first visible solid fill
    const solidFill = (n.fills as FigmaPaint[]).find(
      (f) => f.type === "SOLID" && f.visible !== false && f.color
    );
    if (solidFill?.color) {
      props.backgroundColor = solidFill.color;
    }
  }

  // Strokes
  if (Array.isArray(n.strokes)) {
    props.strokes = n.strokes as FigmaDesignProperties["strokes"];
  }
  if (typeof n.strokeWeight === "number") {
    props.strokeWeight = n.strokeWeight;
  }
  if (n.individualStrokeWeights) {
    props.individualStrokeWeights = n.individualStrokeWeights as FigmaDesignProperties["individualStrokeWeights"];
  }
  if (Array.isArray(n.strokeDashes)) {
    props.strokeDashes = n.strokeDashes as number[];
  }

  // Corner radius
  if (typeof n.cornerRadius === "number") {
    props.cornerRadius = n.cornerRadius;
  }
  if (Array.isArray(n.rectangleCornerRadii)) {
    props.rectangleCornerRadii = n.rectangleCornerRadii as [number, number, number, number];
  }

  // Typography (for text nodes)
  if (node.type === "TEXT") {
    const style = n.style as Record<string, unknown> | undefined;
    if (style) {
      if (typeof style.fontFamily === "string") {
        props.fontFamily = style.fontFamily;
      }
      if (typeof style.fontSize === "number") {
        props.fontSize = style.fontSize;
      }
      if (typeof style.fontWeight === "number") {
        props.fontWeight = style.fontWeight;
      }
      if (typeof style.lineHeightPx === "number") {
        props.lineHeight = style.lineHeightPx;
        props.lineHeightUnit = "PIXELS";
      } else if (typeof style.lineHeightPercent === "number") {
        props.lineHeight = style.lineHeightPercent;
        props.lineHeightUnit = "PERCENT";
      } else if (style.lineHeightUnit === "AUTO") {
        props.lineHeight = "auto";
        props.lineHeightUnit = "AUTO";
      }
      if (typeof style.letterSpacing === "number") {
        props.letterSpacing = style.letterSpacing;
        props.letterSpacingUnit = "PIXELS";
      }
      if (style.textCase) {
        props.textCase = style.textCase as FigmaDesignProperties["textCase"];
      }
      if (style.textDecoration) {
        props.textDecoration = style.textDecoration as FigmaDesignProperties["textDecoration"];
      }
      if (style.textAlignHorizontal) {
        props.textAlignHorizontal = style.textAlignHorizontal as FigmaDesignProperties["textAlignHorizontal"];
      }
    }
  }

  // Effects
  if (Array.isArray(n.effects)) {
    props.effects = n.effects as FigmaDesignProperties["effects"];
  }

  // Opacity
  if (typeof n.opacity === "number") {
    props.opacity = n.opacity;
  }

  // Overflow
  if (typeof n.clipsContent === "boolean") {
    props.clipsContent = n.clipsContent;
  }

  // Position
  if (n.layoutPositioning) {
    props.layoutPositioning = n.layoutPositioning as FigmaDesignProperties["layoutPositioning"];
  }
  if (n.constraints) {
    props.constraints = n.constraints as FigmaDesignProperties["constraints"];
  }

  // Rotation
  if (typeof n.rotation === "number") {
    props.rotation = n.rotation;
  }

  return props;
}

// ============================================================================
// Main Conversion Functions
// ============================================================================

/**
 * Convert a Figma node to Tailwind CSS classes
 */
export function convertFigmaNodeToTailwind(
  node: FigmaNode,
  options: FigmaToTailwindOptions = {}
): FigmaNodeTailwindResult {
  const opts = { ...DEFAULT_FIGMA_OPTIONS, ...options };
  const allClasses: string[] = [];
  const warnings: string[] = [];
  let usedArbitraryValues = false;

  // Extract design properties from node
  const props = extractDesignPropertiesFromNode(node);

  // Filter properties based on options
  const filteredProps: FigmaDesignProperties = {};

  if (opts.includeSize) {
    filteredProps.width = props.width;
    filteredProps.height = props.height;
    filteredProps.minWidth = props.minWidth;
    filteredProps.maxWidth = props.maxWidth;
    filteredProps.minHeight = props.minHeight;
    filteredProps.maxHeight = props.maxHeight;
    filteredProps.layoutSizingHorizontal = props.layoutSizingHorizontal;
    filteredProps.layoutSizingVertical = props.layoutSizingVertical;
  }

  if (opts.includeLayout) {
    filteredProps.layoutMode = props.layoutMode;
    filteredProps.primaryAxisAlignItems = props.primaryAxisAlignItems;
    filteredProps.counterAxisAlignItems = props.counterAxisAlignItems;
    filteredProps.layoutWrap = props.layoutWrap;
    filteredProps.gap = props.gap;
    filteredProps.layoutGrow = props.layoutGrow;
    filteredProps.padding = props.padding;
    filteredProps.layoutPositioning = props.layoutPositioning;
    filteredProps.clipsContent = props.clipsContent;
    filteredProps.rotation = props.rotation;
  }

  if (opts.includeBackground) {
    filteredProps.backgroundColor = props.backgroundColor;
    filteredProps.fills = props.fills;
    filteredProps.opacity = props.opacity;
  }

  if (opts.includeBorders) {
    filteredProps.strokeWeight = props.strokeWeight;
    filteredProps.individualStrokeWeights = props.individualStrokeWeights;
    filteredProps.strokes = props.strokes;
    filteredProps.strokeDashes = props.strokeDashes;
    filteredProps.cornerRadius = props.cornerRadius;
    filteredProps.rectangleCornerRadii = props.rectangleCornerRadii;
  }

  if (opts.includeTypography) {
    filteredProps.fontFamily = props.fontFamily;
    filteredProps.fontSize = props.fontSize;
    filteredProps.fontWeight = props.fontWeight;
    filteredProps.lineHeight = props.lineHeight;
    filteredProps.lineHeightUnit = props.lineHeightUnit;
    filteredProps.letterSpacing = props.letterSpacing;
    filteredProps.letterSpacingUnit = props.letterSpacingUnit;
    filteredProps.textCase = props.textCase;
    filteredProps.textDecoration = props.textDecoration;
    filteredProps.textAlignHorizontal = props.textAlignHorizontal;
  }

  if (opts.includeEffects) {
    filteredProps.effects = props.effects;
  }

  // Generate Tailwind classes
  const result = generateTailwindClasses(filteredProps, opts);
  allClasses.push(...result.classes);
  warnings.push(...result.warnings);
  usedArbitraryValues = result.usedArbitraryValues;

  // Process children if requested
  let children: FigmaNodeTailwindResult[] | undefined;
  if (opts.includeChildren && node.children && opts.maxChildDepth && opts.maxChildDepth > 0) {
    children = node.children.map((child) =>
      convertFigmaNodeToTailwind(child, {
        ...opts,
        maxChildDepth: (opts.maxChildDepth ?? 2) - 1,
      })
    );
  }

  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    classes: allClasses,
    className: allClasses.join(" "),
    darkModeClasses: result.darkModeClasses,
    responsiveClasses: result.responsiveClasses,
    usedArbitraryValues,
    warnings,
    children,
  };
}

/**
 * Convert multiple Figma nodes to Tailwind
 */
export function convertFigmaNodesToTailwind(
  nodes: FigmaNode[],
  options: FigmaToTailwindOptions = {}
): FigmaNodeTailwindResult[] {
  return nodes.map((node) => convertFigmaNodeToTailwind(node, options));
}

/**
 * Convert Figma stroke properties to Tailwind classes using existing stroke utility
 */
export function convertStrokeToTailwind(
  strokeProps: FigmaStrokeProperties,
  options: TailwindGenerationOptions = {}
): { classes: string[]; warnings: string[] } {
  const result = convertStrokeToBorder(strokeProps, {
    generateTailwind: true,
    colorFormat: options.colorFormat === "hsl" ? "hsl" : options.colorFormat === "rgb" ? "rgba" : "hex",
  });

  return {
    classes: result.tailwindClasses ?? [],
    warnings: result.warnings,
  };
}

/**
 * Convert Figma corner radius to Tailwind classes using existing utility
 */
export function convertCornerRadiusToTailwind(
  node: CornerRadiusNode,
  options: TailwindGenerationOptions = {}
): { classes: string[]; warnings: string[] } {
  const result = convertCornerRadius(node, {
    useTailwind: true,
  });

  const warnings: string[] = [];
  if (result.warning) {
    warnings.push(result.warning);
  }

  return {
    classes: result.tailwindClasses,
    warnings,
  };
}

// ============================================================================
// Design Token Extraction
// ============================================================================

/**
 * Extract color tokens from Figma styles
 */
export function extractColorTokens(
  fills: Array<{ name: string; fills: FigmaPaint[] }>
): DesignToken[] {
  const tokens: DesignToken[] = [];

  for (const fill of fills) {
    const solidFill = fill.fills.find((f) => f.type === "SOLID" && f.color);
    if (solidFill?.color) {
      tokens.push({
        name: fill.name,
        value: figmaColorToHex(solidFill.color, solidFill.opacity ?? 1),
        type: "color",
        figmaStyleName: fill.name,
      });
    }
  }

  return tokens;
}

/**
 * Extract typography tokens from Figma text styles
 */
export function extractTypographyTokens(
  textStyles: Array<{
    name: string;
    style: {
      fontFamily?: string;
      fontSize?: number;
      fontWeight?: number;
      lineHeightPx?: number;
      letterSpacing?: number;
    };
  }>
): DesignToken[] {
  const tokens: DesignToken[] = [];

  for (const textStyle of textStyles) {
    const { name, style } = textStyle;

    if (style.fontSize) {
      tokens.push({
        name: `${name}-size`,
        value: `${style.fontSize}px`,
        type: "fontSize",
        figmaStyleName: name,
      });
    }

    if (style.fontWeight) {
      tokens.push({
        name: `${name}-weight`,
        value: String(style.fontWeight),
        type: "fontWeight",
        figmaStyleName: name,
      });
    }

    if (style.lineHeightPx) {
      tokens.push({
        name: `${name}-line-height`,
        value: `${style.lineHeightPx}px`,
        type: "lineHeight",
        figmaStyleName: name,
      });
    }

    if (style.letterSpacing) {
      tokens.push({
        name: `${name}-tracking`,
        value: `${style.letterSpacing}em`,
        type: "letterSpacing",
        figmaStyleName: name,
      });
    }

    if (style.fontFamily) {
      tokens.push({
        name: `${name}-family`,
        value: `"${style.fontFamily}", sans-serif`,
        type: "fontFamily",
        figmaStyleName: name,
      });
    }
  }

  return tokens;
}

/**
 * Extract spacing tokens from Figma auto-layout settings
 */
export function extractSpacingTokens(
  layouts: Array<{
    name: string;
    itemSpacing?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  }>
): DesignToken[] {
  const tokens: DesignToken[] = [];
  const seenValues = new Set<number>();

  for (const layout of layouts) {
    const values = [
      layout.itemSpacing,
      layout.paddingTop,
      layout.paddingRight,
      layout.paddingBottom,
      layout.paddingLeft,
    ].filter((v): v is number => v !== undefined && v > 0);

    for (const value of values) {
      if (!seenValues.has(value)) {
        seenValues.add(value);
        tokens.push({
          name: `spacing-${value}`,
          value: `${value}px`,
          type: "spacing",
        });
      }
    }
  }

  return tokens;
}

/**
 * Extract border radius tokens from nodes
 */
export function extractBorderRadiusTokens(
  nodes: Array<{
    name: string;
    cornerRadius?: number;
    rectangleCornerRadii?: [number, number, number, number];
  }>
): DesignToken[] {
  const tokens: DesignToken[] = [];
  const seenValues = new Set<number>();

  for (const node of nodes) {
    const radii: number[] = [];

    if (node.cornerRadius !== undefined) {
      radii.push(node.cornerRadius);
    }

    if (node.rectangleCornerRadii) {
      radii.push(...node.rectangleCornerRadii);
    }

    for (const radius of radii) {
      if (radius > 0 && !seenValues.has(radius)) {
        seenValues.add(radius);
        tokens.push({
          name: `radius-${radius}`,
          value: `${radius}px`,
          type: "borderRadius",
        });
      }
    }
  }

  return tokens;
}

/**
 * Extract all design tokens from a Figma file structure
 */
export function extractAllDesignTokens(
  data: {
    colorStyles?: Array<{ name: string; fills: FigmaPaint[] }>;
    textStyles?: Array<{
      name: string;
      style: {
        fontFamily?: string;
        fontSize?: number;
        fontWeight?: number;
        lineHeightPx?: number;
        letterSpacing?: number;
      };
    }>;
    nodes?: Array<{
      name: string;
      cornerRadius?: number;
      rectangleCornerRadii?: [number, number, number, number];
      itemSpacing?: number;
      paddingTop?: number;
      paddingRight?: number;
      paddingBottom?: number;
      paddingLeft?: number;
    }>;
  }
): DesignToken[] {
  const tokens: DesignToken[] = [];

  if (data.colorStyles) {
    tokens.push(...extractColorTokens(data.colorStyles));
  }

  if (data.textStyles) {
    tokens.push(...extractTypographyTokens(data.textStyles));
  }

  if (data.nodes) {
    tokens.push(...extractSpacingTokens(data.nodes));
    tokens.push(...extractBorderRadiusTokens(data.nodes));
  }

  return tokens;
}

// ============================================================================
// Config Generation
// ============================================================================

/**
 * Generate complete Tailwind configuration from Figma data
 */
export function generateTailwindConfigFromFigma(
  data: Parameters<typeof extractAllDesignTokens>[0],
  options: {
    extendTheme?: boolean;
    tokenPrefix?: string;
    colorFormat?: "hex" | "rgb" | "hsl" | "oklch";
    generateCSSVariables?: boolean;
    includeDarkMode?: boolean;
    contentPaths?: string[];
  } = {}
): FigmaToTailwindConfigResult {
  const tokens = extractAllDesignTokens(data);
  const warnings: string[] = [];

  const configContent = generateTailwindConfig(tokens, {
    extendTheme: options.extendTheme ?? true,
    tokenPrefix: options.tokenPrefix ?? "",
    colorFormat: options.colorFormat ?? "hex",
    generateCSSVariables: options.generateCSSVariables ?? true,
    includeDarkMode: options.includeDarkMode ?? true,
    contentPaths: options.contentPaths ?? ["./src/**/*.{js,ts,jsx,tsx}"],
  });

  const cssVariables = generateCSSVariables(tokens, {
    prefix: options.tokenPrefix ?? "",
    includeDarkMode: options.includeDarkMode ?? true,
  });

  return {
    configContent,
    cssVariables,
    tokens,
    warnings,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Merge multiple Tailwind class strings, removing duplicates
 */
export function mergeTailwindClasses(...classStrings: (string | undefined)[]): string {
  const allClasses: string[] = [];

  for (const str of classStrings) {
    if (str) {
      allClasses.push(...str.split(/\s+/).filter(Boolean));
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const result: string[] = [];

  for (const cls of allClasses) {
    if (!seen.has(cls)) {
      seen.add(cls);
      result.push(cls);
    }
  }

  return result.join(" ");
}

/**
 * Check if a class uses arbitrary values
 */
export function isArbitraryClass(className: string): boolean {
  return className.includes("[") && className.includes("]");
}

/**
 * Extract the property from a Tailwind class
 * e.g., "bg-red-500" -> "bg", "p-4" -> "p"
 */
export function extractTailwindProperty(className: string): string | null {
  // Handle arbitrary values
  if (isArbitraryClass(className)) {
    const match = className.match(/^(-?[a-z]+)-\[/);
    return match ? match[1] : null;
  }

  // Handle standard classes
  const parts = className.split("-");
  return parts[0] || null;
}

/**
 * Group Tailwind classes by property type
 */
export function groupTailwindClasses(classes: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};

  for (const cls of classes) {
    const property = extractTailwindProperty(cls) ?? "other";

    if (!groups[property]) {
      groups[property] = [];
    }
    groups[property].push(cls);
  }

  return groups;
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_FIGMA_OPTIONS };
