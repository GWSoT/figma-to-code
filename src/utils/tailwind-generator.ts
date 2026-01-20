/**
 * Tailwind CSS Class Generator
 *
 * Generates Tailwind CSS class strings from Figma design properties.
 * Supports:
 * - Color mapping to Tailwind palette or custom config
 * - Responsive variants
 * - Dark mode classes
 * - Arbitrary values for non-standard properties
 * - tailwind.config.js generation for design tokens
 *
 * @see https://tailwindcss.com/docs
 */

import type { FigmaColor, FigmaNode } from "./figma-api";
import { figmaColorToHex, figmaColorToRgba, figmaColorToHsl } from "./figma-gradient";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Tailwind breakpoints for responsive design
 */
export type TailwindBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Tailwind color format options
 */
export type TailwindColorFormat = "hex" | "rgb" | "hsl" | "oklch";

/**
 * Design token types for config generation
 */
export type DesignTokenType =
  | "color"
  | "spacing"
  | "fontSize"
  | "fontFamily"
  | "fontWeight"
  | "lineHeight"
  | "letterSpacing"
  | "borderRadius"
  | "borderWidth"
  | "boxShadow"
  | "opacity"
  | "zIndex";

/**
 * A design token extracted from Figma
 */
export interface DesignToken {
  name: string;
  value: string;
  type: DesignTokenType;
  figmaStyleId?: string;
  figmaStyleName?: string;
  description?: string;
}

/**
 * Figma design properties that can be converted to Tailwind
 */
export interface FigmaDesignProperties {
  // Layout
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
  gap?: number;

  // Flexbox/Grid
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL";
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "BASELINE";
  layoutWrap?: "NO_WRAP" | "WRAP";
  layoutGrow?: number;
  layoutSizingHorizontal?: "FIXED" | "HUG" | "FILL";
  layoutSizingVertical?: "FIXED" | "HUG" | "FILL";

  // Colors
  backgroundColor?: FigmaColor;
  fills?: Array<{ type: string; color?: FigmaColor; opacity?: number; visible?: boolean }>;

  // Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number | "auto";
  lineHeightUnit?: "PIXELS" | "PERCENT" | "AUTO";
  letterSpacing?: number;
  letterSpacingUnit?: "PIXELS" | "PERCENT";
  textCase?: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  textDecoration?: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
  textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";

  // Borders
  strokeWeight?: number;
  individualStrokeWeights?: { top: number; right: number; bottom: number; left: number };
  strokes?: Array<{ type: string; color?: FigmaColor; opacity?: number; visible?: boolean }>;
  strokeDashes?: number[];

  // Border Radius
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];

  // Effects
  effects?: Array<{
    type: string;
    visible?: boolean;
    radius?: number;
    offset?: { x: number; y: number };
    color?: FigmaColor;
    spread?: number;
  }>;

  // Opacity
  opacity?: number;

  // Overflow
  clipsContent?: boolean;

  // Position
  constraints?: { vertical: string; horizontal: string };
  layoutPositioning?: "AUTO" | "ABSOLUTE";

  // Rotation
  rotation?: number;
}

/**
 * Result of Tailwind class generation
 */
export interface TailwindGenerationResult {
  /** Generated Tailwind classes */
  classes: string[];
  /** Classes joined as a className string */
  className: string;
  /** Any warnings or notes about the conversion */
  warnings: string[];
  /** Whether arbitrary values were used */
  usedArbitraryValues: boolean;
  /** Dark mode variant classes (if applicable) */
  darkModeClasses?: string[];
  /** Responsive variant classes by breakpoint */
  responsiveClasses?: Partial<Record<TailwindBreakpoint, string[]>>;
}

/**
 * Options for Tailwind class generation
 */
export interface TailwindGenerationOptions {
  /** Tailwind version (3 or 4) */
  version?: "3" | "4";
  /** Whether to use arbitrary values for non-standard sizes */
  useArbitraryValues?: boolean;
  /** Custom color palette to map to */
  customColors?: Record<string, string>;
  /** Whether to generate dark mode variants */
  generateDarkMode?: boolean;
  /** Dark mode strategy */
  darkModeStrategy?: "class" | "media";
  /** Whether to prefix classes */
  prefixClasses?: boolean;
  /** Class prefix */
  classPrefix?: string;
  /** Responsive breakpoints to generate */
  responsiveBreakpoints?: TailwindBreakpoint[];
  /** Color format for arbitrary values */
  colorFormat?: TailwindColorFormat;
  /** Whether to optimize/deduplicate classes */
  optimizeClasses?: boolean;
}

/**
 * Options for config generation
 */
export interface TailwindConfigOptions {
  /** Whether to extend or replace default theme */
  extendTheme?: boolean;
  /** Custom prefix for config entries */
  tokenPrefix?: string;
  /** Color format */
  colorFormat?: TailwindColorFormat;
  /** Whether to generate CSS variables */
  generateCSSVariables?: boolean;
  /** Whether to include dark mode values */
  includeDarkMode?: boolean;
  /** Content paths for purging */
  contentPaths?: string[];
}

// ============================================================================
// Constants - Tailwind Mappings
// ============================================================================

/**
 * Tailwind default spacing scale (in pixels)
 */
const TAILWIND_SPACING: Record<number, string> = {
  0: "0",
  1: "px",
  4: "1",
  8: "2",
  12: "3",
  16: "4",
  20: "5",
  24: "6",
  28: "7",
  32: "8",
  36: "9",
  40: "10",
  44: "11",
  48: "12",
  56: "14",
  64: "16",
  80: "20",
  96: "24",
  112: "28",
  128: "32",
  144: "36",
  160: "40",
  176: "44",
  192: "48",
  208: "52",
  224: "56",
  240: "60",
  256: "64",
  288: "72",
  320: "80",
  384: "96",
};

/**
 * Tailwind default font sizes (in pixels)
 */
const TAILWIND_FONT_SIZES: Record<number, string> = {
  12: "xs",
  14: "sm",
  16: "base",
  18: "lg",
  20: "xl",
  24: "2xl",
  30: "3xl",
  36: "4xl",
  48: "5xl",
  60: "6xl",
  72: "7xl",
  96: "8xl",
  128: "9xl",
};

/**
 * Tailwind default font weights
 */
const TAILWIND_FONT_WEIGHTS: Record<number, string> = {
  100: "thin",
  200: "extralight",
  300: "light",
  400: "normal",
  500: "medium",
  600: "semibold",
  700: "bold",
  800: "extrabold",
  900: "black",
};

/**
 * Tailwind default line heights
 */
const TAILWIND_LINE_HEIGHTS: Record<number, string> = {
  1: "none",
  1.25: "tight",
  1.375: "snug",
  1.5: "normal",
  1.625: "relaxed",
  2: "loose",
};

/**
 * Tailwind default letter spacing (in em)
 */
const TAILWIND_LETTER_SPACING: Record<number, string> = {
  "-0.05": "tighter",
  "-0.025": "tight",
  "0": "normal",
  "0.025": "wide",
  "0.05": "wider",
  "0.1": "widest",
};

/**
 * Tailwind default border radius (in pixels)
 */
const TAILWIND_BORDER_RADIUS: Record<number, string> = {
  0: "none",
  2: "sm",
  4: "DEFAULT",
  6: "md",
  8: "lg",
  12: "xl",
  16: "2xl",
  24: "3xl",
  9999: "full",
};

/**
 * Tailwind default border widths (in pixels)
 */
const TAILWIND_BORDER_WIDTHS: Record<number, string> = {
  0: "0",
  1: "DEFAULT",
  2: "2",
  4: "4",
  8: "8",
};

/**
 * Tailwind default opacity values
 */
const TAILWIND_OPACITY: Record<number, string> = {
  0: "0",
  5: "5",
  10: "10",
  15: "15",
  20: "20",
  25: "25",
  30: "30",
  35: "35",
  40: "40",
  45: "45",
  50: "50",
  55: "55",
  60: "60",
  65: "65",
  70: "70",
  75: "75",
  80: "80",
  85: "85",
  90: "90",
  95: "95",
  100: "100",
};

/**
 * Tailwind default color palette
 * Maps common color names to their hex values
 */
const TAILWIND_COLORS: Record<string, Record<string, string>> = {
  slate: {
    "50": "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    "300": "#cbd5e1",
    "400": "#94a3b8",
    "500": "#64748b",
    "600": "#475569",
    "700": "#334155",
    "800": "#1e293b",
    "900": "#0f172a",
    "950": "#020617",
  },
  gray: {
    "50": "#f9fafb",
    "100": "#f3f4f6",
    "200": "#e5e7eb",
    "300": "#d1d5db",
    "400": "#9ca3af",
    "500": "#6b7280",
    "600": "#4b5563",
    "700": "#374151",
    "800": "#1f2937",
    "900": "#111827",
    "950": "#030712",
  },
  zinc: {
    "50": "#fafafa",
    "100": "#f4f4f5",
    "200": "#e4e4e7",
    "300": "#d4d4d8",
    "400": "#a1a1aa",
    "500": "#71717a",
    "600": "#52525b",
    "700": "#3f3f46",
    "800": "#27272a",
    "900": "#18181b",
    "950": "#09090b",
  },
  neutral: {
    "50": "#fafafa",
    "100": "#f5f5f5",
    "200": "#e5e5e5",
    "300": "#d4d4d4",
    "400": "#a3a3a3",
    "500": "#737373",
    "600": "#525252",
    "700": "#404040",
    "800": "#262626",
    "900": "#171717",
    "950": "#0a0a0a",
  },
  red: {
    "50": "#fef2f2",
    "100": "#fee2e2",
    "200": "#fecaca",
    "300": "#fca5a5",
    "400": "#f87171",
    "500": "#ef4444",
    "600": "#dc2626",
    "700": "#b91c1c",
    "800": "#991b1b",
    "900": "#7f1d1d",
    "950": "#450a0a",
  },
  orange: {
    "50": "#fff7ed",
    "100": "#ffedd5",
    "200": "#fed7aa",
    "300": "#fdba74",
    "400": "#fb923c",
    "500": "#f97316",
    "600": "#ea580c",
    "700": "#c2410c",
    "800": "#9a3412",
    "900": "#7c2d12",
    "950": "#431407",
  },
  amber: {
    "50": "#fffbeb",
    "100": "#fef3c7",
    "200": "#fde68a",
    "300": "#fcd34d",
    "400": "#fbbf24",
    "500": "#f59e0b",
    "600": "#d97706",
    "700": "#b45309",
    "800": "#92400e",
    "900": "#78350f",
    "950": "#451a03",
  },
  yellow: {
    "50": "#fefce8",
    "100": "#fef9c3",
    "200": "#fef08a",
    "300": "#fde047",
    "400": "#facc15",
    "500": "#eab308",
    "600": "#ca8a04",
    "700": "#a16207",
    "800": "#854d0e",
    "900": "#713f12",
    "950": "#422006",
  },
  lime: {
    "50": "#f7fee7",
    "100": "#ecfccb",
    "200": "#d9f99d",
    "300": "#bef264",
    "400": "#a3e635",
    "500": "#84cc16",
    "600": "#65a30d",
    "700": "#4d7c0f",
    "800": "#3f6212",
    "900": "#365314",
    "950": "#1a2e05",
  },
  green: {
    "50": "#f0fdf4",
    "100": "#dcfce7",
    "200": "#bbf7d0",
    "300": "#86efac",
    "400": "#4ade80",
    "500": "#22c55e",
    "600": "#16a34a",
    "700": "#15803d",
    "800": "#166534",
    "900": "#14532d",
    "950": "#052e16",
  },
  emerald: {
    "50": "#ecfdf5",
    "100": "#d1fae5",
    "200": "#a7f3d0",
    "300": "#6ee7b7",
    "400": "#34d399",
    "500": "#10b981",
    "600": "#059669",
    "700": "#047857",
    "800": "#065f46",
    "900": "#064e3b",
    "950": "#022c22",
  },
  teal: {
    "50": "#f0fdfa",
    "100": "#ccfbf1",
    "200": "#99f6e4",
    "300": "#5eead4",
    "400": "#2dd4bf",
    "500": "#14b8a6",
    "600": "#0d9488",
    "700": "#0f766e",
    "800": "#115e59",
    "900": "#134e4a",
    "950": "#042f2e",
  },
  cyan: {
    "50": "#ecfeff",
    "100": "#cffafe",
    "200": "#a5f3fc",
    "300": "#67e8f9",
    "400": "#22d3ee",
    "500": "#06b6d4",
    "600": "#0891b2",
    "700": "#0e7490",
    "800": "#155e75",
    "900": "#164e63",
    "950": "#083344",
  },
  sky: {
    "50": "#f0f9ff",
    "100": "#e0f2fe",
    "200": "#bae6fd",
    "300": "#7dd3fc",
    "400": "#38bdf8",
    "500": "#0ea5e9",
    "600": "#0284c7",
    "700": "#0369a1",
    "800": "#075985",
    "900": "#0c4a6e",
    "950": "#082f49",
  },
  blue: {
    "50": "#eff6ff",
    "100": "#dbeafe",
    "200": "#bfdbfe",
    "300": "#93c5fd",
    "400": "#60a5fa",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a",
    "950": "#172554",
  },
  indigo: {
    "50": "#eef2ff",
    "100": "#e0e7ff",
    "200": "#c7d2fe",
    "300": "#a5b4fc",
    "400": "#818cf8",
    "500": "#6366f1",
    "600": "#4f46e5",
    "700": "#4338ca",
    "800": "#3730a3",
    "900": "#312e81",
    "950": "#1e1b4b",
  },
  violet: {
    "50": "#f5f3ff",
    "100": "#ede9fe",
    "200": "#ddd6fe",
    "300": "#c4b5fd",
    "400": "#a78bfa",
    "500": "#8b5cf6",
    "600": "#7c3aed",
    "700": "#6d28d9",
    "800": "#5b21b6",
    "900": "#4c1d95",
    "950": "#2e1065",
  },
  purple: {
    "50": "#faf5ff",
    "100": "#f3e8ff",
    "200": "#e9d5ff",
    "300": "#d8b4fe",
    "400": "#c084fc",
    "500": "#a855f7",
    "600": "#9333ea",
    "700": "#7e22ce",
    "800": "#6b21a8",
    "900": "#581c87",
    "950": "#3b0764",
  },
  fuchsia: {
    "50": "#fdf4ff",
    "100": "#fae8ff",
    "200": "#f5d0fe",
    "300": "#f0abfc",
    "400": "#e879f9",
    "500": "#d946ef",
    "600": "#c026d3",
    "700": "#a21caf",
    "800": "#86198f",
    "900": "#701a75",
    "950": "#4a044e",
  },
  pink: {
    "50": "#fdf2f8",
    "100": "#fce7f3",
    "200": "#fbcfe8",
    "300": "#f9a8d4",
    "400": "#f472b6",
    "500": "#ec4899",
    "600": "#db2777",
    "700": "#be185d",
    "800": "#9d174d",
    "900": "#831843",
    "950": "#500724",
  },
  rose: {
    "50": "#fff1f2",
    "100": "#ffe4e6",
    "200": "#fecdd3",
    "300": "#fda4af",
    "400": "#fb7185",
    "500": "#f43f5e",
    "600": "#e11d48",
    "700": "#be123c",
    "800": "#9f1239",
    "900": "#881337",
    "950": "#4c0519",
  },
};

/**
 * Special color keywords
 */
const SPECIAL_COLORS: Record<string, string> = {
  transparent: "transparent",
  current: "currentColor",
  inherit: "inherit",
  white: "#ffffff",
  black: "#000000",
};

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_GENERATION_OPTIONS: Required<TailwindGenerationOptions> = {
  version: "4",
  useArbitraryValues: true,
  customColors: {},
  generateDarkMode: false,
  darkModeStrategy: "class",
  prefixClasses: false,
  classPrefix: "",
  responsiveBreakpoints: [],
  colorFormat: "hex",
  optimizeClasses: true,
};

const DEFAULT_CONFIG_OPTIONS: Required<TailwindConfigOptions> = {
  extendTheme: true,
  tokenPrefix: "",
  colorFormat: "hex",
  generateCSSVariables: true,
  includeDarkMode: true,
  contentPaths: ["./src/**/*.{js,ts,jsx,tsx}"],
};

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Convert Figma color to specified format
 */
export function formatFigmaColor(
  color: FigmaColor,
  format: TailwindColorFormat,
  opacity: number = 1
): string {
  switch (format) {
    case "hex":
      return figmaColorToHex(color, opacity);
    case "rgb":
      return figmaColorToRgba(color, opacity);
    case "hsl":
      return figmaColorToHsl(color, opacity);
    case "oklch":
      return figmaColorToOklch(color, opacity);
    default:
      return figmaColorToHex(color, opacity);
  }
}

/**
 * Convert Figma color to OKLCH format (Tailwind v4 preferred)
 */
export function figmaColorToOklch(color: FigmaColor, opacity: number = 1): string {
  // Convert RGB to OKLCH
  // First convert to linear RGB
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  const lr = toLinear(color.r);
  const lg = toLinear(color.g);
  const lb = toLinear(color.b);

  // Convert to XYZ
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

  // Convert to OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert OKLab to OKLCH
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  const finalOpacity = color.a * opacity;

  const lPercent = (L * 100).toFixed(2);
  const cValue = C.toFixed(4);
  const hValue = H.toFixed(2);

  if (finalOpacity === 1) {
    return `oklch(${lPercent}% ${cValue} ${hValue})`;
  }
  return `oklch(${lPercent}% ${cValue} ${hValue} / ${(finalOpacity * 100).toFixed(0)}%)`;
}

/**
 * Find the closest Tailwind color match for a given color
 */
export function findClosestTailwindColor(
  color: FigmaColor,
  customColors?: Record<string, string>
): { colorName: string; shade: string; isExact: boolean } | null {
  const hex = figmaColorToHex(color, color.a).toLowerCase();

  // Check special colors first
  for (const [name, value] of Object.entries(SPECIAL_COLORS)) {
    if (value.toLowerCase() === hex) {
      return { colorName: name, shade: "", isExact: true };
    }
  }

  // Check custom colors
  if (customColors) {
    for (const [name, value] of Object.entries(customColors)) {
      if (value.toLowerCase() === hex) {
        return { colorName: name, shade: "", isExact: true };
      }
    }
  }

  // Check Tailwind palette
  let closestMatch: { colorName: string; shade: string; distance: number } | null = null;

  for (const [colorName, shades] of Object.entries(TAILWIND_COLORS)) {
    for (const [shade, shadeHex] of Object.entries(shades)) {
      if (shadeHex.toLowerCase() === hex) {
        return { colorName, shade, isExact: true };
      }

      // Calculate color distance for approximate matching
      const distance = calculateColorDistance(hex, shadeHex);
      if (!closestMatch || distance < closestMatch.distance) {
        closestMatch = { colorName, shade, distance };
      }
    }
  }

  // Return closest match if within tolerance (distance < 15)
  if (closestMatch && closestMatch.distance < 15) {
    return { colorName: closestMatch.colorName, shade: closestMatch.shade, isExact: false };
  }

  return null;
}

/**
 * Calculate color distance using simple RGB Euclidean distance
 */
function calculateColorDistance(hex1: string, hex2: string): number {
  const parseHex = (hex: string) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  };

  const c1 = parseHex(hex1);
  const c2 = parseHex(hex2);

  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
  );
}

/**
 * Generate Tailwind color class from Figma color
 */
export function generateColorClass(
  color: FigmaColor,
  property: "bg" | "text" | "border" | "ring" | "fill" | "stroke" | "accent" | "caret" | "outline",
  options: TailwindGenerationOptions = {}
): { class: string; isArbitrary: boolean } {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };

  // Try to find matching Tailwind color
  const match = findClosestTailwindColor(color, opts.customColors);

  if (match) {
    const colorClass = match.shade ? `${match.colorName}-${match.shade}` : match.colorName;
    const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";
    return { class: `${prefix}${property}-${colorClass}`, isArbitrary: false };
  }

  // Use arbitrary value
  if (opts.useArbitraryValues) {
    const colorValue = formatFigmaColor(color, opts.colorFormat, color.a);
    const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";
    // Escape special characters in arbitrary values
    const escapedValue = colorValue.replace(/[()%,/\s]/g, (m) => `\\${m}`);
    return { class: `${prefix}${property}-[${escapedValue}]`, isArbitrary: true };
  }

  // Fallback to hex
  const hex = figmaColorToHex(color, color.a);
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";
  return { class: `${prefix}${property}-[${hex}]`, isArbitrary: true };
}

// ============================================================================
// Spacing Utilities
// ============================================================================

/**
 * Find closest Tailwind spacing value
 */
export function findClosestSpacing(pixels: number): string | null {
  // Direct match
  if (TAILWIND_SPACING[pixels] !== undefined) {
    return TAILWIND_SPACING[pixels];
  }

  // Find closest within 1px tolerance
  for (const [size, className] of Object.entries(TAILWIND_SPACING)) {
    if (Math.abs(Number(size) - pixels) <= 1) {
      return className;
    }
  }

  return null;
}

/**
 * Generate spacing class
 */
export function generateSpacingClass(
  pixels: number,
  property: "p" | "m" | "gap" | "space-x" | "space-y" | "w" | "h" | "min-w" | "max-w" | "min-h" | "max-h" | "inset" | "top" | "right" | "bottom" | "left",
  side?: "t" | "r" | "b" | "l" | "x" | "y",
  options: TailwindGenerationOptions = {}
): { class: string; isArbitrary: boolean } {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";

  // Handle negative values
  const isNegative = pixels < 0;
  const absPixels = Math.abs(pixels);
  const negativePrefix = isNegative ? "-" : "";

  // Check for special values
  if (absPixels === 0) {
    const className = side ? `${property}${side}-0` : `${property}-0`;
    return { class: `${prefix}${negativePrefix}${className}`, isArbitrary: false };
  }

  // Try to find standard spacing
  const spacingValue = findClosestSpacing(absPixels);

  if (spacingValue !== null) {
    const className = side ? `${property}${side}-${spacingValue}` : `${property}-${spacingValue}`;
    return { class: `${prefix}${negativePrefix}${className}`, isArbitrary: false };
  }

  // Use arbitrary value
  if (opts.useArbitraryValues) {
    const className = side ? `${property}${side}-[${absPixels}px]` : `${property}-[${absPixels}px]`;
    return { class: `${prefix}${negativePrefix}${className}`, isArbitrary: true };
  }

  // Fallback - return arbitrary anyway
  const className = side ? `${property}${side}-[${absPixels}px]` : `${property}-[${absPixels}px]`;
  return { class: `${prefix}${negativePrefix}${className}`, isArbitrary: true };
}

// ============================================================================
// Typography Utilities
// ============================================================================

/**
 * Find closest font size class
 */
export function findClosestFontSize(pixels: number): string | null {
  if (TAILWIND_FONT_SIZES[pixels]) {
    return TAILWIND_FONT_SIZES[pixels];
  }

  // Find closest within 1px
  for (const [size, className] of Object.entries(TAILWIND_FONT_SIZES)) {
    if (Math.abs(Number(size) - pixels) <= 1) {
      return className;
    }
  }

  return null;
}

/**
 * Find closest font weight class
 */
export function findClosestFontWeight(weight: number): string | null {
  if (TAILWIND_FONT_WEIGHTS[weight]) {
    return TAILWIND_FONT_WEIGHTS[weight];
  }

  // Find closest
  let closest: { weight: number; className: string } | null = null;
  for (const [w, className] of Object.entries(TAILWIND_FONT_WEIGHTS)) {
    const diff = Math.abs(Number(w) - weight);
    if (!closest || diff < Math.abs(closest.weight - weight)) {
      closest = { weight: Number(w), className };
    }
  }

  return closest?.className ?? null;
}

/**
 * Generate typography classes
 */
export function generateTypographyClasses(
  props: Pick<
    FigmaDesignProperties,
    | "fontFamily"
    | "fontSize"
    | "fontWeight"
    | "lineHeight"
    | "lineHeightUnit"
    | "letterSpacing"
    | "letterSpacingUnit"
    | "textCase"
    | "textDecoration"
    | "textAlignHorizontal"
  >,
  options: TailwindGenerationOptions = {}
): { classes: string[]; isArbitrary: boolean } {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const classes: string[] = [];
  let usedArbitrary = false;
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";

  // Font size
  if (props.fontSize) {
    const sizeClass = findClosestFontSize(props.fontSize);
    if (sizeClass) {
      classes.push(`${prefix}text-${sizeClass}`);
    } else if (opts.useArbitraryValues) {
      classes.push(`${prefix}text-[${props.fontSize}px]`);
      usedArbitrary = true;
    }
  }

  // Font weight
  if (props.fontWeight) {
    const weightClass = findClosestFontWeight(props.fontWeight);
    if (weightClass) {
      classes.push(`${prefix}font-${weightClass}`);
    } else if (opts.useArbitraryValues) {
      classes.push(`${prefix}font-[${props.fontWeight}]`);
      usedArbitrary = true;
    }
  }

  // Line height
  if (props.lineHeight && props.lineHeight !== "auto") {
    if (props.lineHeightUnit === "PERCENT" || props.lineHeightUnit === "AUTO") {
      // Convert to ratio
      const ratio = props.lineHeight / 100;
      const lhClass = findLineHeightClass(ratio);
      if (lhClass) {
        classes.push(`${prefix}leading-${lhClass}`);
      } else if (opts.useArbitraryValues) {
        classes.push(`${prefix}leading-[${ratio}]`);
        usedArbitrary = true;
      }
    } else {
      // Pixels
      if (opts.useArbitraryValues) {
        classes.push(`${prefix}leading-[${props.lineHeight}px]`);
        usedArbitrary = true;
      }
    }
  }

  // Letter spacing
  if (props.letterSpacing !== undefined) {
    const lsClass = findLetterSpacingClass(props.letterSpacing, props.letterSpacingUnit);
    if (lsClass) {
      classes.push(`${prefix}tracking-${lsClass}`);
    } else if (opts.useArbitraryValues) {
      const unit = props.letterSpacingUnit === "PERCENT" ? "em" : "px";
      const value = props.letterSpacingUnit === "PERCENT" ? props.letterSpacing / 100 : props.letterSpacing;
      classes.push(`${prefix}tracking-[${value}${unit}]`);
      usedArbitrary = true;
    }
  }

  // Text case
  if (props.textCase) {
    switch (props.textCase) {
      case "UPPER":
        classes.push(`${prefix}uppercase`);
        break;
      case "LOWER":
        classes.push(`${prefix}lowercase`);
        break;
      case "TITLE":
        classes.push(`${prefix}capitalize`);
        break;
    }
  }

  // Text decoration
  if (props.textDecoration) {
    switch (props.textDecoration) {
      case "UNDERLINE":
        classes.push(`${prefix}underline`);
        break;
      case "STRIKETHROUGH":
        classes.push(`${prefix}line-through`);
        break;
    }
  }

  // Text alignment
  if (props.textAlignHorizontal) {
    switch (props.textAlignHorizontal) {
      case "LEFT":
        classes.push(`${prefix}text-left`);
        break;
      case "CENTER":
        classes.push(`${prefix}text-center`);
        break;
      case "RIGHT":
        classes.push(`${prefix}text-right`);
        break;
      case "JUSTIFIED":
        classes.push(`${prefix}text-justify`);
        break;
    }
  }

  return { classes, isArbitrary: usedArbitrary };
}

/**
 * Find line height class
 */
function findLineHeightClass(ratio: number): string | null {
  // Check for standard values
  const tolerance = 0.05;
  for (const [value, className] of Object.entries(TAILWIND_LINE_HEIGHTS)) {
    if (Math.abs(Number(value) - ratio) <= tolerance) {
      return className;
    }
  }

  // Check numeric values (3-10)
  const rounded = Math.round(ratio);
  if (rounded >= 3 && rounded <= 10 && Math.abs(rounded - ratio) <= tolerance) {
    return String(rounded);
  }

  return null;
}

/**
 * Find letter spacing class
 */
function findLetterSpacingClass(
  value: number,
  unit?: "PIXELS" | "PERCENT"
): string | null {
  // Convert to em if percent
  const emValue = unit === "PERCENT" ? value / 100 : value / 16;

  for (const [em, className] of Object.entries(TAILWIND_LETTER_SPACING)) {
    if (Math.abs(Number(em) - emValue) <= 0.01) {
      return className;
    }
  }

  return null;
}

// ============================================================================
// Layout Utilities
// ============================================================================

/**
 * Generate flexbox layout classes
 */
export function generateFlexClasses(
  props: Pick<
    FigmaDesignProperties,
    | "layoutMode"
    | "primaryAxisAlignItems"
    | "counterAxisAlignItems"
    | "layoutWrap"
    | "gap"
    | "layoutGrow"
    | "layoutSizingHorizontal"
    | "layoutSizingVertical"
  >,
  options: TailwindGenerationOptions = {}
): { classes: string[]; isArbitrary: boolean } {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const classes: string[] = [];
  let usedArbitrary = false;
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";

  // Enable flex
  if (props.layoutMode === "HORIZONTAL" || props.layoutMode === "VERTICAL") {
    classes.push(`${prefix}flex`);

    // Flex direction
    if (props.layoutMode === "VERTICAL") {
      classes.push(`${prefix}flex-col`);
    }

    // Justify content (primary axis)
    if (props.primaryAxisAlignItems) {
      switch (props.primaryAxisAlignItems) {
        case "MIN":
          classes.push(`${prefix}justify-start`);
          break;
        case "CENTER":
          classes.push(`${prefix}justify-center`);
          break;
        case "MAX":
          classes.push(`${prefix}justify-end`);
          break;
        case "SPACE_BETWEEN":
          classes.push(`${prefix}justify-between`);
          break;
      }
    }

    // Align items (cross axis)
    if (props.counterAxisAlignItems) {
      switch (props.counterAxisAlignItems) {
        case "MIN":
          classes.push(`${prefix}items-start`);
          break;
        case "CENTER":
          classes.push(`${prefix}items-center`);
          break;
        case "MAX":
          classes.push(`${prefix}items-end`);
          break;
        case "BASELINE":
          classes.push(`${prefix}items-baseline`);
          break;
      }
    }

    // Flex wrap
    if (props.layoutWrap === "WRAP") {
      classes.push(`${prefix}flex-wrap`);
    }

    // Gap
    if (props.gap !== undefined && props.gap > 0) {
      const gapResult = generateSpacingClass(props.gap, "gap", undefined, opts);
      classes.push(gapResult.class);
      if (gapResult.isArbitrary) usedArbitrary = true;
    }
  }

  // Flex grow
  if (props.layoutGrow === 1) {
    classes.push(`${prefix}flex-1`);
  } else if (props.layoutGrow === 0) {
    classes.push(`${prefix}flex-none`);
  }

  // Sizing
  if (props.layoutSizingHorizontal === "FILL") {
    classes.push(`${prefix}w-full`);
  } else if (props.layoutSizingHorizontal === "HUG") {
    classes.push(`${prefix}w-fit`);
  }

  if (props.layoutSizingVertical === "FILL") {
    classes.push(`${prefix}h-full`);
  } else if (props.layoutSizingVertical === "HUG") {
    classes.push(`${prefix}h-fit`);
  }

  return { classes, isArbitrary: usedArbitrary };
}

// ============================================================================
// Border Utilities
// ============================================================================

/**
 * Generate border classes
 */
export function generateBorderClasses(
  props: Pick<
    FigmaDesignProperties,
    | "strokeWeight"
    | "individualStrokeWeights"
    | "strokes"
    | "strokeDashes"
    | "cornerRadius"
    | "rectangleCornerRadii"
  >,
  options: TailwindGenerationOptions = {}
): { classes: string[]; isArbitrary: boolean } {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const classes: string[] = [];
  let usedArbitrary = false;
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";

  // Border width
  if (props.strokeWeight !== undefined && props.strokeWeight > 0) {
    const widthClass = findBorderWidthClass(props.strokeWeight);
    if (widthClass === "DEFAULT") {
      classes.push(`${prefix}border`);
    } else if (widthClass) {
      classes.push(`${prefix}border-${widthClass}`);
    } else if (opts.useArbitraryValues) {
      classes.push(`${prefix}border-[${props.strokeWeight}px]`);
      usedArbitrary = true;
    }
  } else if (props.individualStrokeWeights) {
    // Handle individual sides
    const { top, right, bottom, left } = props.individualStrokeWeights;
    const sides = [
      { value: top, side: "t" },
      { value: right, side: "r" },
      { value: bottom, side: "b" },
      { value: left, side: "l" },
    ];

    for (const { value, side } of sides) {
      if (value > 0) {
        const widthClass = findBorderWidthClass(value);
        if (widthClass === "DEFAULT") {
          classes.push(`${prefix}border-${side}`);
        } else if (widthClass) {
          classes.push(`${prefix}border-${side}-${widthClass}`);
        } else if (opts.useArbitraryValues) {
          classes.push(`${prefix}border-${side}-[${value}px]`);
          usedArbitrary = true;
        }
      }
    }
  }

  // Border color
  if (props.strokes && props.strokes.length > 0) {
    const visibleStroke = props.strokes.find((s) => s.visible !== false && s.color);
    if (visibleStroke?.color) {
      const colorResult = generateColorClass(
        visibleStroke.color,
        "border",
        opts
      );
      classes.push(colorResult.class);
      if (colorResult.isArbitrary) usedArbitrary = true;
    }
  }

  // Border style
  if (props.strokeDashes && props.strokeDashes.length > 0) {
    if (props.strokeDashes[0] <= 2) {
      classes.push(`${prefix}border-dotted`);
    } else {
      classes.push(`${prefix}border-dashed`);
    }
  }

  // Border radius
  if (props.cornerRadius !== undefined && props.cornerRadius > 0) {
    const radiusClass = findBorderRadiusClass(props.cornerRadius);
    if (radiusClass === "DEFAULT") {
      classes.push(`${prefix}rounded`);
    } else if (radiusClass) {
      classes.push(`${prefix}rounded-${radiusClass}`);
    } else if (opts.useArbitraryValues) {
      classes.push(`${prefix}rounded-[${props.cornerRadius}px]`);
      usedArbitrary = true;
    }
  } else if (props.rectangleCornerRadii) {
    const [tl, tr, br, bl] = props.rectangleCornerRadii;

    // Check if all corners are the same
    if (tl === tr && tr === br && br === bl) {
      if (tl > 0) {
        const radiusClass = findBorderRadiusClass(tl);
        if (radiusClass === "DEFAULT") {
          classes.push(`${prefix}rounded`);
        } else if (radiusClass) {
          classes.push(`${prefix}rounded-${radiusClass}`);
        } else if (opts.useArbitraryValues) {
          classes.push(`${prefix}rounded-[${tl}px]`);
          usedArbitrary = true;
        }
      }
    } else {
      // Individual corners
      const corners = [
        { value: tl, corner: "tl" },
        { value: tr, corner: "tr" },
        { value: br, corner: "br" },
        { value: bl, corner: "bl" },
      ];

      for (const { value, corner } of corners) {
        if (value > 0) {
          const radiusClass = findBorderRadiusClass(value);
          if (radiusClass === "DEFAULT") {
            classes.push(`${prefix}rounded-${corner}`);
          } else if (radiusClass) {
            classes.push(`${prefix}rounded-${corner}-${radiusClass}`);
          } else if (opts.useArbitraryValues) {
            classes.push(`${prefix}rounded-${corner}-[${value}px]`);
            usedArbitrary = true;
          }
        }
      }
    }
  }

  return { classes, isArbitrary: usedArbitrary };
}

/**
 * Find border width class
 */
function findBorderWidthClass(width: number): string | null {
  const rounded = Math.round(width);
  if (TAILWIND_BORDER_WIDTHS[rounded] !== undefined) {
    return TAILWIND_BORDER_WIDTHS[rounded];
  }
  return null;
}

/**
 * Find border radius class
 */
function findBorderRadiusClass(radius: number): string | null {
  const rounded = Math.round(radius);
  if (TAILWIND_BORDER_RADIUS[rounded] !== undefined) {
    return TAILWIND_BORDER_RADIUS[rounded];
  }

  // Check for full rounded (very large values)
  if (radius >= 9999) {
    return "full";
  }

  // Find closest within 2px tolerance
  for (const [size, className] of Object.entries(TAILWIND_BORDER_RADIUS)) {
    if (Math.abs(Number(size) - radius) <= 2) {
      return className;
    }
  }

  return null;
}

// ============================================================================
// Effects Utilities
// ============================================================================

/**
 * Generate shadow classes
 */
export function generateShadowClasses(
  effects: FigmaDesignProperties["effects"],
  options: TailwindGenerationOptions = {}
): { classes: string[]; isArbitrary: boolean } {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const classes: string[] = [];
  let usedArbitrary = false;
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";

  if (!effects || effects.length === 0) {
    return { classes, isArbitrary: false };
  }

  // Find visible drop shadow effects
  const dropShadows = effects.filter(
    (e) => e.type === "DROP_SHADOW" && e.visible !== false
  );

  if (dropShadows.length === 0) {
    return { classes, isArbitrary: false };
  }

  // Try to match to Tailwind shadow classes
  if (dropShadows.length === 1) {
    const shadow = dropShadows[0];
    const shadowClass = matchTailwindShadow(shadow);
    if (shadowClass) {
      classes.push(`${prefix}shadow-${shadowClass}`);
      return { classes, isArbitrary: false };
    }
  }

  // Use arbitrary value
  if (opts.useArbitraryValues) {
    const shadowValues = dropShadows.map((s) => {
      const x = s.offset?.x ?? 0;
      const y = s.offset?.y ?? 0;
      const blur = s.radius ?? 0;
      const spread = s.spread ?? 0;
      const color = s.color ? formatFigmaColor(s.color, opts.colorFormat, s.color.a) : "rgba(0,0,0,0.25)";
      return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    });

    const shadowValue = shadowValues.join(",");
    classes.push(`${prefix}shadow-[${shadowValue.replace(/\s/g, "_")}]`);
    usedArbitrary = true;
  }

  return { classes, isArbitrary: usedArbitrary };
}

/**
 * Match shadow to Tailwind preset
 */
function matchTailwindShadow(
  shadow: NonNullable<FigmaDesignProperties["effects"]>[0]
): string | null {
  const x = shadow.offset?.x ?? 0;
  const y = shadow.offset?.y ?? 0;
  const blur = shadow.radius ?? 0;

  // Approximate matching to Tailwind shadows
  if (blur === 0 && x === 0 && y === 0) return "none";
  if (blur <= 2 && y <= 1) return "sm";
  if (blur <= 3 && y <= 1) return "DEFAULT";
  if (blur <= 6 && y <= 2) return "md";
  if (blur <= 10 && y <= 4) return "lg";
  if (blur <= 25 && y <= 10) return "xl";
  if (blur <= 50 && y <= 25) return "2xl";

  return null;
}

/**
 * Generate blur effect classes
 */
export function generateBlurClasses(
  effects: FigmaDesignProperties["effects"],
  options: TailwindGenerationOptions = {}
): { classes: string[]; isArbitrary: boolean } {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const classes: string[] = [];
  let usedArbitrary = false;
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";

  if (!effects) return { classes, isArbitrary: false };

  // Find layer blur effects
  const blurs = effects.filter(
    (e) => e.type === "LAYER_BLUR" && e.visible !== false
  );

  if (blurs.length === 0) return { classes, isArbitrary: false };

  const blur = blurs[0];
  const radius = blur.radius ?? 0;

  // Match to Tailwind blur classes
  const blurClass = matchTailwindBlur(radius);
  if (blurClass) {
    classes.push(`${prefix}blur-${blurClass}`);
  } else if (opts.useArbitraryValues) {
    classes.push(`${prefix}blur-[${radius}px]`);
    usedArbitrary = true;
  }

  return { classes, isArbitrary: usedArbitrary };
}

/**
 * Match blur radius to Tailwind preset
 */
function matchTailwindBlur(radius: number): string | null {
  if (radius === 0) return "none";
  if (radius <= 4) return "sm";
  if (radius <= 8) return "DEFAULT";
  if (radius <= 12) return "md";
  if (radius <= 16) return "lg";
  if (radius <= 24) return "xl";
  if (radius <= 40) return "2xl";
  if (radius <= 64) return "3xl";

  return null;
}

// ============================================================================
// Responsive Variants
// ============================================================================

/**
 * Generate responsive variant classes
 */
export function generateResponsiveClasses(
  baseClasses: string[],
  breakpoints: TailwindBreakpoint[],
  propertyOverrides?: Partial<Record<TailwindBreakpoint, FigmaDesignProperties>>
): Partial<Record<TailwindBreakpoint, string[]>> {
  const result: Partial<Record<TailwindBreakpoint, string[]>> = {};

  for (const breakpoint of breakpoints) {
    if (propertyOverrides?.[breakpoint]) {
      // If there are overrides, generate new classes for this breakpoint
      const overrideResult = generateTailwindClasses(propertyOverrides[breakpoint]!);
      result[breakpoint] = overrideResult.classes.map((cls) => `${breakpoint}:${cls}`);
    } else {
      // Otherwise, prefix base classes with breakpoint
      result[breakpoint] = baseClasses.map((cls) => `${breakpoint}:${cls}`);
    }
  }

  return result;
}

/**
 * Add responsive prefix to a class
 */
export function addResponsivePrefix(
  className: string,
  breakpoint: TailwindBreakpoint
): string {
  return `${breakpoint}:${className}`;
}

// ============================================================================
// Dark Mode
// ============================================================================

/**
 * Generate dark mode variant classes
 */
export function generateDarkModeClasses(
  lightProps: FigmaDesignProperties,
  darkProps: FigmaDesignProperties,
  options: TailwindGenerationOptions = {}
): { lightClasses: string[]; darkClasses: string[] } {
  const lightResult = generateTailwindClasses(lightProps, { ...options, generateDarkMode: false });
  const darkResult = generateTailwindClasses(darkProps, { ...options, generateDarkMode: false });

  // Prefix dark mode classes
  const darkClasses = darkResult.classes.map((cls) => `dark:${cls}`);

  return {
    lightClasses: lightResult.classes,
    darkClasses,
  };
}

/**
 * Add dark mode prefix to a class
 */
export function addDarkModePrefix(className: string): string {
  return `dark:${className}`;
}

// ============================================================================
// Main Generation Function
// ============================================================================

/**
 * Generate complete Tailwind classes from Figma design properties
 */
export function generateTailwindClasses(
  props: FigmaDesignProperties,
  options: TailwindGenerationOptions = {}
): TailwindGenerationResult {
  const opts = { ...DEFAULT_GENERATION_OPTIONS, ...options };
  const allClasses: string[] = [];
  const warnings: string[] = [];
  let usedArbitraryValues = false;
  const prefix = opts.prefixClasses && opts.classPrefix ? opts.classPrefix : "";

  // Layout classes
  const flexResult = generateFlexClasses(props, opts);
  allClasses.push(...flexResult.classes);
  if (flexResult.isArbitrary) usedArbitraryValues = true;

  // Width and height
  if (props.width !== undefined && props.layoutSizingHorizontal === "FIXED") {
    const widthResult = generateSpacingClass(props.width, "w", undefined, opts);
    allClasses.push(widthResult.class);
    if (widthResult.isArbitrary) usedArbitraryValues = true;
  }

  if (props.height !== undefined && props.layoutSizingVertical === "FIXED") {
    const heightResult = generateSpacingClass(props.height, "h", undefined, opts);
    allClasses.push(heightResult.class);
    if (heightResult.isArbitrary) usedArbitraryValues = true;
  }

  // Min/max dimensions
  if (props.minWidth !== undefined) {
    const result = generateSpacingClass(props.minWidth, "min-w", undefined, opts);
    allClasses.push(result.class);
    if (result.isArbitrary) usedArbitraryValues = true;
  }
  if (props.maxWidth !== undefined) {
    const result = generateSpacingClass(props.maxWidth, "max-w", undefined, opts);
    allClasses.push(result.class);
    if (result.isArbitrary) usedArbitraryValues = true;
  }
  if (props.minHeight !== undefined) {
    const result = generateSpacingClass(props.minHeight, "min-h", undefined, opts);
    allClasses.push(result.class);
    if (result.isArbitrary) usedArbitraryValues = true;
  }
  if (props.maxHeight !== undefined) {
    const result = generateSpacingClass(props.maxHeight, "max-h", undefined, opts);
    allClasses.push(result.class);
    if (result.isArbitrary) usedArbitraryValues = true;
  }

  // Padding
  if (props.padding) {
    const { top, right, bottom, left } = props.padding;

    // Check for uniform padding
    if (top === right && right === bottom && bottom === left && top > 0) {
      const result = generateSpacingClass(top, "p", undefined, opts);
      allClasses.push(result.class);
      if (result.isArbitrary) usedArbitraryValues = true;
    } else {
      // Check for x/y uniform padding
      if (left === right && left > 0) {
        const result = generateSpacingClass(left, "p", "x", opts);
        allClasses.push(result.class);
        if (result.isArbitrary) usedArbitraryValues = true;
      } else {
        if (left > 0) {
          const result = generateSpacingClass(left, "p", "l", opts);
          allClasses.push(result.class);
          if (result.isArbitrary) usedArbitraryValues = true;
        }
        if (right > 0) {
          const result = generateSpacingClass(right, "p", "r", opts);
          allClasses.push(result.class);
          if (result.isArbitrary) usedArbitraryValues = true;
        }
      }

      if (top === bottom && top > 0) {
        const result = generateSpacingClass(top, "p", "y", opts);
        allClasses.push(result.class);
        if (result.isArbitrary) usedArbitraryValues = true;
      } else {
        if (top > 0) {
          const result = generateSpacingClass(top, "p", "t", opts);
          allClasses.push(result.class);
          if (result.isArbitrary) usedArbitraryValues = true;
        }
        if (bottom > 0) {
          const result = generateSpacingClass(bottom, "p", "b", opts);
          allClasses.push(result.class);
          if (result.isArbitrary) usedArbitraryValues = true;
        }
      }
    }
  }

  // Background color
  if (props.backgroundColor) {
    const colorResult = generateColorClass(props.backgroundColor, "bg", opts);
    allClasses.push(colorResult.class);
    if (colorResult.isArbitrary) usedArbitraryValues = true;
  } else if (props.fills && props.fills.length > 0) {
    const visibleFill = props.fills.find((f) => f.visible !== false && f.color);
    if (visibleFill?.color) {
      const colorResult = generateColorClass(visibleFill.color, "bg", opts);
      allClasses.push(colorResult.class);
      if (colorResult.isArbitrary) usedArbitraryValues = true;
    }
  }

  // Typography
  const typoResult = generateTypographyClasses(props, opts);
  allClasses.push(...typoResult.classes);
  if (typoResult.isArbitrary) usedArbitraryValues = true;

  // Borders
  const borderResult = generateBorderClasses(props, opts);
  allClasses.push(...borderResult.classes);
  if (borderResult.isArbitrary) usedArbitraryValues = true;

  // Effects (shadows)
  const shadowResult = generateShadowClasses(props.effects, opts);
  allClasses.push(...shadowResult.classes);
  if (shadowResult.isArbitrary) usedArbitraryValues = true;

  // Blur
  const blurResult = generateBlurClasses(props.effects, opts);
  allClasses.push(...blurResult.classes);
  if (blurResult.isArbitrary) usedArbitraryValues = true;

  // Opacity
  if (props.opacity !== undefined && props.opacity < 1) {
    const opacityPercent = Math.round(props.opacity * 100);
    if (TAILWIND_OPACITY[opacityPercent] !== undefined) {
      allClasses.push(`${prefix}opacity-${TAILWIND_OPACITY[opacityPercent]}`);
    } else if (opts.useArbitraryValues) {
      allClasses.push(`${prefix}opacity-[${opacityPercent}%]`);
      usedArbitraryValues = true;
    }
  }

  // Overflow
  if (props.clipsContent === true) {
    allClasses.push(`${prefix}overflow-hidden`);
  }

  // Position
  if (props.layoutPositioning === "ABSOLUTE") {
    allClasses.push(`${prefix}absolute`);
  }

  // Rotation
  if (props.rotation !== undefined && props.rotation !== 0) {
    const degrees = Math.round(props.rotation);
    const rotateClasses: Record<number, string> = {
      0: "0",
      1: "1",
      2: "2",
      3: "3",
      6: "6",
      12: "12",
      45: "45",
      90: "90",
      180: "180",
    };

    if (rotateClasses[Math.abs(degrees)]) {
      const sign = degrees < 0 ? "-" : "";
      allClasses.push(`${prefix}${sign}rotate-${rotateClasses[Math.abs(degrees)]}`);
    } else if (opts.useArbitraryValues) {
      allClasses.push(`${prefix}rotate-[${degrees}deg]`);
      usedArbitraryValues = true;
    }
  }

  // Optimize/deduplicate classes
  const finalClasses = opts.optimizeClasses
    ? deduplicateClasses(allClasses)
    : allClasses;

  // Generate responsive variants if requested
  let responsiveClasses: Partial<Record<TailwindBreakpoint, string[]>> | undefined;
  if (opts.responsiveBreakpoints && opts.responsiveBreakpoints.length > 0) {
    responsiveClasses = generateResponsiveClasses(finalClasses, opts.responsiveBreakpoints);
  }

  // Generate dark mode variants if requested
  let darkModeClasses: string[] | undefined;
  if (opts.generateDarkMode) {
    darkModeClasses = finalClasses.map(addDarkModePrefix);
  }

  return {
    classes: finalClasses,
    className: finalClasses.join(" "),
    warnings,
    usedArbitraryValues,
    darkModeClasses,
    responsiveClasses,
  };
}

/**
 * Deduplicate and optimize classes
 */
function deduplicateClasses(classes: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const cls of classes) {
    if (!seen.has(cls)) {
      seen.add(cls);
      result.push(cls);
    }
  }

  return result;
}

// ============================================================================
// Tailwind Config Generation
// ============================================================================

/**
 * Generate design tokens from Figma file
 */
export function extractDesignTokens(
  nodes: FigmaNode[],
  styleNames?: Record<string, string>
): DesignToken[] {
  const tokens: DesignToken[] = [];

  // This would typically traverse nodes and extract colors, typography, etc.
  // For now, return empty array - to be expanded with full implementation

  return tokens;
}

/**
 * Generate tailwind.config.js content from design tokens
 */
export function generateTailwindConfig(
  tokens: DesignToken[],
  options: TailwindConfigOptions = {}
): string {
  const opts = { ...DEFAULT_CONFIG_OPTIONS, ...options };

  // Group tokens by type
  const colorTokens = tokens.filter((t) => t.type === "color");
  const spacingTokens = tokens.filter((t) => t.type === "spacing");
  const fontSizeTokens = tokens.filter((t) => t.type === "fontSize");
  const fontFamilyTokens = tokens.filter((t) => t.type === "fontFamily");
  const fontWeightTokens = tokens.filter((t) => t.type === "fontWeight");
  const borderRadiusTokens = tokens.filter((t) => t.type === "borderRadius");
  const boxShadowTokens = tokens.filter((t) => t.type === "boxShadow");

  // Build theme object
  const themeExtend: Record<string, Record<string, string>> = {};

  // Colors
  if (colorTokens.length > 0) {
    themeExtend.colors = {};
    for (const token of colorTokens) {
      const name = sanitizeTokenName(token.name, opts.tokenPrefix);
      themeExtend.colors[name] = opts.generateCSSVariables
        ? `var(--color-${name})`
        : token.value;
    }
  }

  // Spacing
  if (spacingTokens.length > 0) {
    themeExtend.spacing = {};
    for (const token of spacingTokens) {
      const name = sanitizeTokenName(token.name, opts.tokenPrefix);
      themeExtend.spacing[name] = token.value;
    }
  }

  // Font sizes
  if (fontSizeTokens.length > 0) {
    themeExtend.fontSize = {};
    for (const token of fontSizeTokens) {
      const name = sanitizeTokenName(token.name, opts.tokenPrefix);
      themeExtend.fontSize[name] = token.value;
    }
  }

  // Font families
  if (fontFamilyTokens.length > 0) {
    themeExtend.fontFamily = {};
    for (const token of fontFamilyTokens) {
      const name = sanitizeTokenName(token.name, opts.tokenPrefix);
      themeExtend.fontFamily[name] = token.value;
    }
  }

  // Font weights
  if (fontWeightTokens.length > 0) {
    themeExtend.fontWeight = {};
    for (const token of fontWeightTokens) {
      const name = sanitizeTokenName(token.name, opts.tokenPrefix);
      themeExtend.fontWeight[name] = token.value;
    }
  }

  // Border radius
  if (borderRadiusTokens.length > 0) {
    themeExtend.borderRadius = {};
    for (const token of borderRadiusTokens) {
      const name = sanitizeTokenName(token.name, opts.tokenPrefix);
      themeExtend.borderRadius[name] = token.value;
    }
  }

  // Box shadows
  if (boxShadowTokens.length > 0) {
    themeExtend.boxShadow = {};
    for (const token of boxShadowTokens) {
      const name = sanitizeTokenName(token.name, opts.tokenPrefix);
      themeExtend.boxShadow[name] = token.value;
    }
  }

  // Generate config string
  const contentPaths = opts.contentPaths.map((p) => `"${p}"`).join(",\n    ");

  const themeConfig = opts.extendTheme
    ? `extend: ${JSON.stringify(themeExtend, null, 6).replace(/"/g, "'")}`
    : JSON.stringify(themeExtend, null, 4).replace(/"/g, "'");

  const config = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    ${contentPaths}
  ],
  ${opts.includeDarkMode ? "darkMode: 'class'," : ""}
  theme: {
    ${themeConfig}
  },
  plugins: [],
};
`;

  return config;
}

/**
 * Generate CSS variables from design tokens
 */
export function generateCSSVariables(
  tokens: DesignToken[],
  options: { prefix?: string; includeDarkMode?: boolean } = {}
): string {
  const { prefix = "", includeDarkMode = true } = options;

  const lines: string[] = [":root {"];

  // Group tokens by type and generate variables
  for (const token of tokens) {
    const varName = `--${prefix}${sanitizeTokenName(token.name)}`;
    lines.push(`  ${varName}: ${token.value};`);
  }

  lines.push("}");

  // Add dark mode if requested
  if (includeDarkMode) {
    const darkTokens = tokens.filter((t) => t.name.includes("dark"));
    if (darkTokens.length > 0) {
      lines.push("");
      lines.push(".dark {");
      for (const token of darkTokens) {
        const lightName = token.name.replace("dark", "").replace("Dark", "");
        const varName = `--${prefix}${sanitizeTokenName(lightName)}`;
        lines.push(`  ${varName}: ${token.value};`);
      }
      lines.push("}");
    }
  }

  return lines.join("\n");
}

/**
 * Sanitize token name for use in config
 */
function sanitizeTokenName(name: string, prefix: string = ""): string {
  // Remove special characters, convert to kebab-case
  const sanitized = name
    .replace(/[^a-zA-Z0-9-_/]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return prefix ? `${prefix}-${sanitized}` : sanitized;
}

// ============================================================================
// Utility Exports
// ============================================================================

export {
  TAILWIND_COLORS,
  TAILWIND_SPACING,
  TAILWIND_FONT_SIZES,
  TAILWIND_FONT_WEIGHTS,
  TAILWIND_BORDER_RADIUS,
  TAILWIND_BORDER_WIDTHS,
  SPECIAL_COLORS,
  DEFAULT_GENERATION_OPTIONS,
  DEFAULT_CONFIG_OPTIONS,
};
