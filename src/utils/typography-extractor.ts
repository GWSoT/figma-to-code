/**
 * Typography Extractor Utility
 *
 * Extracts typography settings from Figma files including:
 * - Font families, sizes, weights, line heights, letter spacing
 * - Typographic scale and hierarchy identification
 * - Web-safe font alternatives and Google Fonts mapping
 * - CSS variable and @font-face generation
 */

import type { FigmaNode, FigmaFileResponse, FigmaStyleMeta } from "./figma-api";

// ============================================================================
// Types
// ============================================================================

export interface FigmaTextStyle {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number | "auto";
  lineHeightUnit: "PIXELS" | "PERCENT" | "AUTO";
  letterSpacing: number;
  letterSpacingUnit: "PIXELS" | "PERCENT";
  textCase?: "ORIGINAL" | "UPPER" | "LOWER" | "TITLE";
  textDecoration?: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
  textAlignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textAlignVertical?: "TOP" | "CENTER" | "BOTTOM";
  paragraphIndent?: number;
  paragraphSpacing?: number;
}

export interface ExtractedTypography {
  id: string;
  name: string;
  styleName?: string;
  styleDescription?: string;
  style: FigmaTextStyle;
  nodeId: string;
  nodeName: string;
  sampleText?: string;
}

export interface FontFamily {
  figmaName: string;
  webSafe: string | null;
  googleFont: string | null;
  category: FontCategory;
  weights: number[];
  isSystem: boolean;
}

export type FontCategory =
  | "serif"
  | "sans-serif"
  | "monospace"
  | "display"
  | "handwriting"
  | "custom";

export interface TypographyScale {
  name: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
  ratio?: number; // Ratio to base size
}

export interface TypographyHierarchy {
  role: TypographyRole;
  styles: ExtractedTypography[];
  suggestedName: string;
}

export type TypographyRole =
  | "display"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "heading-4"
  | "heading-5"
  | "heading-6"
  | "body-large"
  | "body"
  | "body-small"
  | "caption"
  | "label"
  | "overline"
  | "button"
  | "link"
  | "code"
  | "quote"
  | "custom";

export interface TypographyExtractionResult {
  styles: ExtractedTypography[];
  fontFamilies: FontFamily[];
  scale: TypographyScale[];
  hierarchy: TypographyHierarchy[];
  cssVariables: string;
  fontFaceDeclarations: string;
  tailwindConfig: string;
}

// ============================================================================
// Font Mappings
// ============================================================================

// Web-safe font fallbacks for common Figma fonts
const WEB_SAFE_FONTS: Record<string, string> = {
  // Sans-serif
  "SF Pro": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  "SF Pro Display": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  "SF Pro Text": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  Helvetica: "Helvetica, Arial, sans-serif",
  "Helvetica Neue": '"Helvetica Neue", Helvetica, Arial, sans-serif',
  Arial: "Arial, Helvetica, sans-serif",
  Roboto: "Roboto, Arial, sans-serif",
  "Open Sans": '"Open Sans", Arial, sans-serif',
  Inter: "Inter, system-ui, sans-serif",
  Montserrat: "Montserrat, Arial, sans-serif",
  Lato: "Lato, Arial, sans-serif",
  Poppins: "Poppins, Arial, sans-serif",
  Nunito: "Nunito, Arial, sans-serif",
  Raleway: "Raleway, Arial, sans-serif",
  "Source Sans Pro": '"Source Sans Pro", Arial, sans-serif',
  "Work Sans": '"Work Sans", Arial, sans-serif',
  Ubuntu: "Ubuntu, Arial, sans-serif",
  Manrope: "Manrope, Arial, sans-serif",
  "DM Sans": '"DM Sans", Arial, sans-serif',
  Outfit: "Outfit, Arial, sans-serif",
  "Plus Jakarta Sans": '"Plus Jakarta Sans", Arial, sans-serif',

  // Serif
  "Times New Roman": '"Times New Roman", Times, serif',
  Georgia: "Georgia, Times, serif",
  "Playfair Display": '"Playfair Display", Georgia, serif',
  Merriweather: "Merriweather, Georgia, serif",
  Lora: "Lora, Georgia, serif",
  "Source Serif Pro": '"Source Serif Pro", Georgia, serif',
  "Libre Baskerville": '"Libre Baskerville", Georgia, serif',
  "Crimson Text": '"Crimson Text", Georgia, serif',
  "DM Serif Display": '"DM Serif Display", Georgia, serif',

  // Monospace
  "SF Mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
  Menlo: "Menlo, Monaco, Consolas, monospace",
  Monaco: "Monaco, Menlo, Consolas, monospace",
  "Courier New": '"Courier New", Courier, monospace',
  "Fira Code": '"Fira Code", Menlo, monospace',
  "JetBrains Mono": '"JetBrains Mono", Menlo, monospace',
  "Source Code Pro": '"Source Code Pro", Menlo, monospace',
  "IBM Plex Mono": '"IBM Plex Mono", Menlo, monospace',
  Inconsolata: "Inconsolata, Menlo, monospace",

  // Display
  "Bebas Neue": '"Bebas Neue", Impact, sans-serif',
  Anton: "Anton, Impact, sans-serif",
  Oswald: "Oswald, Arial, sans-serif",

  // System fonts
  system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

// Google Fonts mapping - fonts available on Google Fonts
const GOOGLE_FONTS: Record<
  string,
  { name: string; category: FontCategory; weights: number[] }
> = {
  Roboto: {
    name: "Roboto",
    category: "sans-serif",
    weights: [100, 300, 400, 500, 700, 900],
  },
  "Open Sans": {
    name: "Open+Sans",
    category: "sans-serif",
    weights: [300, 400, 500, 600, 700, 800],
  },
  Inter: {
    name: "Inter",
    category: "sans-serif",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  Montserrat: {
    name: "Montserrat",
    category: "sans-serif",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  Lato: {
    name: "Lato",
    category: "sans-serif",
    weights: [100, 300, 400, 700, 900],
  },
  Poppins: {
    name: "Poppins",
    category: "sans-serif",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  Nunito: {
    name: "Nunito",
    category: "sans-serif",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
  },
  Raleway: {
    name: "Raleway",
    category: "sans-serif",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  "Source Sans Pro": {
    name: "Source+Sans+Pro",
    category: "sans-serif",
    weights: [200, 300, 400, 600, 700, 900],
  },
  "Work Sans": {
    name: "Work+Sans",
    category: "sans-serif",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  Ubuntu: {
    name: "Ubuntu",
    category: "sans-serif",
    weights: [300, 400, 500, 700],
  },
  Manrope: {
    name: "Manrope",
    category: "sans-serif",
    weights: [200, 300, 400, 500, 600, 700, 800],
  },
  "DM Sans": {
    name: "DM+Sans",
    category: "sans-serif",
    weights: [400, 500, 700],
  },
  Outfit: {
    name: "Outfit",
    category: "sans-serif",
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  "Plus Jakarta Sans": {
    name: "Plus+Jakarta+Sans",
    category: "sans-serif",
    weights: [200, 300, 400, 500, 600, 700, 800],
  },
  "Playfair Display": {
    name: "Playfair+Display",
    category: "serif",
    weights: [400, 500, 600, 700, 800, 900],
  },
  Merriweather: {
    name: "Merriweather",
    category: "serif",
    weights: [300, 400, 700, 900],
  },
  Lora: { name: "Lora", category: "serif", weights: [400, 500, 600, 700] },
  "Source Serif Pro": {
    name: "Source+Serif+Pro",
    category: "serif",
    weights: [200, 300, 400, 600, 700, 900],
  },
  "Libre Baskerville": {
    name: "Libre+Baskerville",
    category: "serif",
    weights: [400, 700],
  },
  "Crimson Text": {
    name: "Crimson+Text",
    category: "serif",
    weights: [400, 600, 700],
  },
  "DM Serif Display": {
    name: "DM+Serif+Display",
    category: "serif",
    weights: [400],
  },
  "Fira Code": {
    name: "Fira+Code",
    category: "monospace",
    weights: [300, 400, 500, 600, 700],
  },
  "JetBrains Mono": {
    name: "JetBrains+Mono",
    category: "monospace",
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
  },
  "Source Code Pro": {
    name: "Source+Code+Pro",
    category: "monospace",
    weights: [200, 300, 400, 500, 600, 700, 900],
  },
  "IBM Plex Mono": {
    name: "IBM+Plex+Mono",
    category: "monospace",
    weights: [100, 200, 300, 400, 500, 600, 700],
  },
  Inconsolata: {
    name: "Inconsolata",
    category: "monospace",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
  },
  "Bebas Neue": {
    name: "Bebas+Neue",
    category: "display",
    weights: [400],
  },
  Anton: { name: "Anton", category: "display", weights: [400] },
  Oswald: {
    name: "Oswald",
    category: "sans-serif",
    weights: [200, 300, 400, 500, 600, 700],
  },
  "Dancing Script": {
    name: "Dancing+Script",
    category: "handwriting",
    weights: [400, 500, 600, 700],
  },
  Pacifico: { name: "Pacifico", category: "handwriting", weights: [400] },
};

// System fonts that don't need Google Fonts
const SYSTEM_FONTS = new Set([
  "SF Pro",
  "SF Pro Display",
  "SF Pro Text",
  "SF Mono",
  "Helvetica",
  "Helvetica Neue",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Menlo",
  "Monaco",
  "Courier New",
  "system",
  "system-ui",
]);

// Font weight name mapping
const FONT_WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

// Common typographic scales (ratios)
const TYPOGRAPHIC_SCALES: Record<string, number> = {
  "Minor Second": 1.067,
  "Major Second": 1.125,
  "Minor Third": 1.2,
  "Major Third": 1.25,
  "Perfect Fourth": 1.333,
  "Augmented Fourth": 1.414,
  "Perfect Fifth": 1.5,
  "Golden Ratio": 1.618,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize font weight from Figma style names like "Bold", "Medium", etc.
 */
export function normalizeFontWeight(
  weight: number | string | undefined
): number {
  if (typeof weight === "number") {
    return weight;
  }

  if (typeof weight === "string") {
    const weightMap: Record<string, number> = {
      thin: 100,
      hairline: 100,
      extralight: 200,
      ultralight: 200,
      light: 300,
      normal: 400,
      regular: 400,
      medium: 500,
      semibold: 600,
      demibold: 600,
      bold: 700,
      extrabold: 800,
      ultrabold: 800,
      black: 900,
      heavy: 900,
    };

    const normalized = weight.toLowerCase().replace(/[\s-_]/g, "");
    return weightMap[normalized] ?? 400;
  }

  return 400;
}

/**
 * Get font weight name from numeric value
 */
export function getFontWeightName(weight: number): string {
  return FONT_WEIGHT_NAMES[weight] ?? `Weight${weight}`;
}

/**
 * Detect font category from font name
 */
export function detectFontCategory(fontName: string): FontCategory {
  const name = fontName.toLowerCase();

  if (
    name.includes("mono") ||
    name.includes("code") ||
    name.includes("console")
  ) {
    return "monospace";
  }
  if (name.includes("serif") && !name.includes("sans")) {
    return "serif";
  }
  if (
    name.includes("display") ||
    name.includes("headline") ||
    name.includes("title")
  ) {
    return "display";
  }
  if (
    name.includes("script") ||
    name.includes("hand") ||
    name.includes("cursive")
  ) {
    return "handwriting";
  }

  // Check Google Fonts mapping
  const googleFont = GOOGLE_FONTS[fontName];
  if (googleFont) {
    return googleFont.category;
  }

  return "sans-serif"; // Default
}

/**
 * Map a Figma font to web-safe alternative and Google Font
 */
export function mapFontFamily(figmaName: string): FontFamily {
  const webSafe = WEB_SAFE_FONTS[figmaName] ?? null;
  const googleFont = GOOGLE_FONTS[figmaName]?.name ?? null;
  const category = detectFontCategory(figmaName);
  const isSystem = SYSTEM_FONTS.has(figmaName);
  const weights = GOOGLE_FONTS[figmaName]?.weights ?? [400, 700];

  return {
    figmaName,
    webSafe,
    googleFont,
    category,
    weights,
    isSystem,
  };
}

/**
 * Calculate line height in pixels from Figma's line height value
 */
export function calculateLineHeight(
  lineHeight: number | { unit: string; value: number } | undefined,
  fontSize: number
): { value: number; unit: "PIXELS" | "PERCENT" | "AUTO" } {
  if (lineHeight === undefined || lineHeight === null) {
    return { value: fontSize * 1.5, unit: "AUTO" };
  }

  if (typeof lineHeight === "number") {
    return { value: lineHeight, unit: "PIXELS" };
  }

  if (lineHeight.unit === "PIXELS") {
    return { value: lineHeight.value, unit: "PIXELS" };
  }

  if (lineHeight.unit === "PERCENT") {
    return { value: (lineHeight.value / 100) * fontSize, unit: "PERCENT" };
  }

  return { value: fontSize * 1.5, unit: "AUTO" };
}

/**
 * Calculate letter spacing in em from Figma's letter spacing value
 */
export function calculateLetterSpacing(
  letterSpacing: number | { unit: string; value: number } | undefined,
  fontSize: number
): { value: number; unit: "PIXELS" | "PERCENT" } {
  if (letterSpacing === undefined || letterSpacing === null) {
    return { value: 0, unit: "PIXELS" };
  }

  if (typeof letterSpacing === "number") {
    return { value: letterSpacing, unit: "PIXELS" };
  }

  if (letterSpacing.unit === "PIXELS") {
    return { value: letterSpacing.value, unit: "PIXELS" };
  }

  if (letterSpacing.unit === "PERCENT") {
    return { value: (letterSpacing.value / 100) * fontSize, unit: "PERCENT" };
  }

  return { value: 0, unit: "PIXELS" };
}

// ============================================================================
// Node Extraction
// ============================================================================

/**
 * Extract text style from a Figma text node
 */
function extractTextStyleFromNode(node: FigmaNode): FigmaTextStyle | null {
  // Check if node has text style properties (style property from Figma API)
  const style = (node as any).style;

  if (!style) {
    return null;
  }

  const fontSize = style.fontSize ?? 16;

  const lineHeightResult = calculateLineHeight(style.lineHeight, fontSize);
  const letterSpacingResult = calculateLetterSpacing(
    style.letterSpacing,
    fontSize
  );

  return {
    fontFamily: style.fontFamily ?? "Inter",
    fontWeight: normalizeFontWeight(style.fontWeight),
    fontSize,
    lineHeight:
      lineHeightResult.unit === "AUTO" ? "auto" : lineHeightResult.value,
    lineHeightUnit: lineHeightResult.unit,
    letterSpacing: letterSpacingResult.value,
    letterSpacingUnit: letterSpacingResult.unit,
    textCase: style.textCase,
    textDecoration: style.textDecoration,
    textAlignHorizontal: style.textAlignHorizontal,
    textAlignVertical: style.textAlignVertical,
    paragraphIndent: style.paragraphIndent,
    paragraphSpacing: style.paragraphSpacing,
  };
}

/**
 * Recursively extract all text nodes from a Figma document
 */
function extractTextNodes(
  node: FigmaNode,
  styles?: Record<string, FigmaStyleMeta>
): ExtractedTypography[] {
  const results: ExtractedTypography[] = [];

  if (node.type === "TEXT") {
    const textStyle = extractTextStyleFromNode(node);
    if (textStyle) {
      // Check if this text node has an associated style
      const styleId = (node as any).styles?.text;
      const styleMeta = styleId && styles ? styles[styleId] : undefined;

      results.push({
        id: `${node.id}-${textStyle.fontFamily}-${textStyle.fontSize}`,
        name: `${textStyle.fontFamily} ${textStyle.fontSize}px`,
        styleName: styleMeta?.name,
        styleDescription: styleMeta?.description,
        style: textStyle,
        nodeId: node.id,
        nodeName: node.name,
        sampleText: (node as any).characters?.slice(0, 100),
      });
    }
  }

  // Recursively process children
  if (node.children) {
    for (const child of node.children) {
      results.push(...extractTextNodes(child, styles));
    }
  }

  return results;
}

// ============================================================================
// Scale & Hierarchy Detection
// ============================================================================

/**
 * Detect the typographic scale being used
 */
export function detectTypographicScale(
  styles: ExtractedTypography[]
): TypographyScale[] {
  // Get unique font sizes, sorted from smallest to largest
  const fontSizes = [...new Set(styles.map((s) => s.style.fontSize))].sort(
    (a, b) => a - b
  );

  if (fontSizes.length < 2) {
    return [];
  }

  // Find the most common base size (likely body text, usually 14-18px)
  const sizeFrequency = new Map<number, number>();
  for (const style of styles) {
    const size = style.style.fontSize;
    sizeFrequency.set(size, (sizeFrequency.get(size) ?? 0) + 1);
  }

  // Find base size (most frequent size in body text range)
  let baseSize = 16;
  let maxFreq = 0;
  for (const [size, freq] of sizeFrequency.entries()) {
    if (size >= 14 && size <= 18 && freq > maxFreq) {
      maxFreq = freq;
      baseSize = size;
    }
  }

  // Calculate ratios and try to detect the scale
  const scale: TypographyScale[] = fontSizes.map((size) => {
    const ratio = size / baseSize;

    // Find representative style for this size
    const representativeStyle = styles.find((s) => s.style.fontSize === size);
    const lineHeight =
      representativeStyle?.style.lineHeight === "auto"
        ? size * 1.5
        : (representativeStyle?.style.lineHeight as number) ?? size * 1.5;
    const letterSpacing = representativeStyle?.style.letterSpacing ?? 0;
    const fontWeight = representativeStyle?.style.fontWeight ?? 400;

    return {
      name: getScaleName(size, baseSize),
      fontSize: size,
      lineHeight,
      letterSpacing,
      fontWeight,
      ratio: Math.round(ratio * 1000) / 1000,
    };
  });

  return scale;
}

/**
 * Get a semantic name for a size in the scale
 */
function getScaleName(size: number, baseSize: number): string {
  const ratio = size / baseSize;

  if (ratio >= 3) return "display";
  if (ratio >= 2.5) return "h1";
  if (ratio >= 2) return "h2";
  if (ratio >= 1.5) return "h3";
  if (ratio >= 1.25) return "h4";
  if (ratio >= 1.1) return "h5";
  if (Math.abs(ratio - 1) < 0.1) return "body";
  if (ratio >= 0.85) return "small";
  if (ratio >= 0.7) return "caption";
  return "xs";
}

/**
 * Identify the typographic hierarchy in the design
 */
export function identifyTypographyHierarchy(
  styles: ExtractedTypography[]
): TypographyHierarchy[] {
  // Group styles by their approximate size/weight combination
  const groups = new Map<string, ExtractedTypography[]>();

  for (const style of styles) {
    // Create a key based on rounded size and weight
    const sizeGroup = Math.round(style.style.fontSize / 4) * 4;
    const key = `${sizeGroup}-${style.style.fontWeight}`;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(style);
  }

  // Sort groups by size (largest first) then weight (heaviest first)
  const sortedGroups = [...groups.entries()].sort((a, b) => {
    const [aSize, aWeight] = a[0].split("-").map(Number);
    const [bSize, bWeight] = b[0].split("-").map(Number);
    if (bSize !== aSize) return bSize - aSize;
    return bWeight - aWeight;
  });

  // Assign roles based on position in hierarchy
  const hierarchy: TypographyHierarchy[] = [];
  const roles: TypographyRole[] = [
    "display",
    "heading-1",
    "heading-2",
    "heading-3",
    "heading-4",
    "heading-5",
    "body-large",
    "body",
    "body-small",
    "caption",
    "label",
    "overline",
  ];

  let roleIndex = 0;
  for (const [key, groupStyles] of sortedGroups) {
    const [size, weight] = key.split("-").map(Number);
    let role = roles[roleIndex] ?? "custom";

    // Adjust role based on characteristics
    if (weight >= 700 && size >= 48) {
      role = "display";
    } else if (weight >= 600 && size >= 32) {
      role = roleIndex === 0 ? "display" : "heading-1";
    } else if (size < 12) {
      role = "caption";
    } else if (size >= 14 && size <= 18 && weight === 400) {
      role = "body";
    }

    // Detect button/label styles by name patterns
    const hasButtonPattern = groupStyles.some(
      (s) =>
        s.nodeName.toLowerCase().includes("button") ||
        s.styleName?.toLowerCase().includes("button")
    );
    if (hasButtonPattern) {
      role = "button";
    }

    hierarchy.push({
      role,
      styles: groupStyles,
      suggestedName: `typography-${role}`,
    });

    roleIndex++;
  }

  return hierarchy;
}

/**
 * Detect which known typographic scale the design uses
 */
export function detectScaleRatio(fontSizes: number[]): {
  name: string;
  ratio: number;
} | null {
  if (fontSizes.length < 3) return null;

  const sorted = [...fontSizes].sort((a, b) => a - b);
  const ratios: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    ratios.push(sorted[i] / sorted[i - 1]);
  }

  // Calculate average ratio
  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

  // Find closest known scale
  let closestScale = null;
  let minDiff = Infinity;

  for (const [name, ratio] of Object.entries(TYPOGRAPHIC_SCALES)) {
    const diff = Math.abs(avgRatio - ratio);
    if (diff < minDiff && diff < 0.1) {
      minDiff = diff;
      closestScale = { name, ratio };
    }
  }

  return closestScale;
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate CSS custom properties for typography
 */
export function generateCSSVariables(
  styles: ExtractedTypography[],
  fontFamilies: FontFamily[]
): string {
  const lines: string[] = [
    "/* Typography CSS Variables",
    " * Generated from Figma design",
    " */",
    "",
    ":root {",
    "  /* Font Families */",
  ];

  // Generate font family variables
  const uniqueFamilies = new Map<string, FontFamily>();
  for (const family of fontFamilies) {
    if (!uniqueFamilies.has(family.figmaName)) {
      uniqueFamilies.set(family.figmaName, family);
    }
  }

  let familyIndex = 1;
  const familyVarNames = new Map<string, string>();

  for (const [name, family] of uniqueFamilies) {
    const varName = `--font-family-${familyIndex}`;
    familyVarNames.set(name, varName);

    const fallback = family.webSafe ?? getGenericFallback(family.category);
    lines.push(
      `  ${varName}: "${name}", ${fallback}; /* ${family.category} */`
    );
    familyIndex++;
  }

  lines.push("");
  lines.push("  /* Typography Scale */");

  // Group styles and generate scale variables
  const scale = detectTypographicScale(styles);

  for (const level of scale) {
    const cssName = level.name.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    lines.push(`  --font-size-${cssName}: ${level.fontSize}px;`);
    lines.push(
      `  --line-height-${cssName}: ${Math.round(level.lineHeight * 100) / 100}px;`
    );
    if (level.letterSpacing !== 0) {
      lines.push(
        `  --letter-spacing-${cssName}: ${level.letterSpacing.toFixed(3)}em;`
      );
    }
  }

  lines.push("");
  lines.push("  /* Font Weights */");

  // Generate font weight variables
  const uniqueWeights = [...new Set(styles.map((s) => s.style.fontWeight))];
  for (const weight of uniqueWeights.sort()) {
    const name = getFontWeightName(weight).toLowerCase();
    lines.push(`  --font-weight-${name}: ${weight};`);
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Get generic fallback for font category
 */
function getGenericFallback(category: FontCategory): string {
  switch (category) {
    case "serif":
      return "Georgia, serif";
    case "monospace":
      return "ui-monospace, monospace";
    case "display":
      return "system-ui, sans-serif";
    case "handwriting":
      return "cursive";
    default:
      return "system-ui, sans-serif";
  }
}

/**
 * Generate @font-face declarations for custom fonts
 */
export function generateFontFaceDeclarations(
  fontFamilies: FontFamily[],
  options: { useGoogleFonts?: boolean; customFontPaths?: Record<string, string> } = {}
): string {
  const { useGoogleFonts = true, customFontPaths = {} } = options;
  const lines: string[] = [
    "/* Font Face Declarations",
    " * Generated from Figma design",
    " */",
    "",
  ];

  // Track fonts that need Google Fonts import
  const googleFontsImports: string[] = [];

  for (const family of fontFamilies) {
    if (family.isSystem) {
      continue; // Skip system fonts
    }

    // Check for custom font path
    if (customFontPaths[family.figmaName]) {
      // Generate @font-face for custom font
      for (const weight of family.weights) {
        const weightName = getFontWeightName(weight);
        lines.push(`@font-face {`);
        lines.push(`  font-family: "${family.figmaName}";`);
        lines.push(`  font-style: normal;`);
        lines.push(`  font-weight: ${weight};`);
        lines.push(`  font-display: swap;`);
        lines.push(
          `  src: url("${customFontPaths[family.figmaName]}/${family.figmaName}-${weightName}.woff2") format("woff2"),`
        );
        lines.push(
          `       url("${customFontPaths[family.figmaName]}/${family.figmaName}-${weightName}.woff") format("woff");`
        );
        lines.push(`}`);
        lines.push("");
      }
    } else if (useGoogleFonts && family.googleFont) {
      // Add to Google Fonts import list
      const weightsStr = family.weights.join(";");
      googleFontsImports.push(`family=${family.googleFont}:wght@${weightsStr}`);
    } else {
      // Generate placeholder @font-face
      lines.push(`/* TODO: Add font files for "${family.figmaName}" */`);
      lines.push(`/*`);
      lines.push(`@font-face {`);
      lines.push(`  font-family: "${family.figmaName}";`);
      lines.push(`  font-style: normal;`);
      lines.push(`  font-weight: 400;`);
      lines.push(`  font-display: swap;`);
      lines.push(`  src: url("/fonts/${family.figmaName}-Regular.woff2") format("woff2");`);
      lines.push(`}`);
      lines.push(`*/`);
      lines.push("");
    }
  }

  // Add Google Fonts import if needed
  if (googleFontsImports.length > 0) {
    const importUrl = `https://fonts.googleapis.com/css2?${googleFontsImports.join("&")}&display=swap`;
    lines.unshift("");
    lines.unshift(`@import url("${importUrl}");`);
    lines.unshift("/* Google Fonts Import */");
  }

  return lines.join("\n");
}

/**
 * Generate Tailwind CSS configuration for typography
 */
export function generateTailwindConfig(
  styles: ExtractedTypography[],
  fontFamilies: FontFamily[]
): string {
  const scale = detectTypographicScale(styles);
  const uniqueFamilies = [...new Map(fontFamilies.map((f) => [f.figmaName, f])).values()];

  const config = {
    theme: {
      extend: {
        fontFamily: {} as Record<string, string[]>,
        fontSize: {} as Record<string, [string, { lineHeight: string; letterSpacing?: string }]>,
        fontWeight: {} as Record<string, string>,
      },
    },
  };

  // Add font families
  for (const family of uniqueFamilies) {
    const key = family.figmaName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const fallback = family.webSafe ?? getGenericFallback(family.category);
    config.theme.extend.fontFamily[key] = [family.figmaName, ...fallback.split(", ")];
  }

  // Add font sizes from scale
  for (const level of scale) {
    const lineHeight = `${Math.round((level.lineHeight / level.fontSize) * 100) / 100}`;
    const sizeEntry: [string, { lineHeight: string; letterSpacing?: string }] = [
      `${level.fontSize}px`,
      { lineHeight },
    ];

    if (level.letterSpacing !== 0) {
      sizeEntry[1].letterSpacing = `${level.letterSpacing.toFixed(3)}em`;
    }

    config.theme.extend.fontSize[level.name] = sizeEntry;
  }

  // Add font weights
  const uniqueWeights = [...new Set(styles.map((s) => s.style.fontWeight))];
  for (const weight of uniqueWeights.sort()) {
    const name = getFontWeightName(weight).toLowerCase();
    config.theme.extend.fontWeight[name] = String(weight);
  }

  return `// Tailwind Typography Configuration
// Generated from Figma design

/** @type {import('tailwindcss').Config} */
export default ${JSON.stringify(config, null, 2)}`;
}

// ============================================================================
// Main Extraction Function
// ============================================================================

/**
 * Extract all typography settings from a Figma file
 */
export function extractTypography(
  fileResponse: FigmaFileResponse
): TypographyExtractionResult {
  const allStyles: ExtractedTypography[] = [];

  // Extract from document
  for (const page of fileResponse.document.children) {
    allStyles.push(...extractTextNodes(page, fileResponse.styles));
  }

  // Deduplicate styles by their unique combination
  const uniqueStyles = deduplicateStyles(allStyles);

  // Extract unique font families
  const fontFamilies = extractFontFamilies(uniqueStyles);

  // Detect scale and hierarchy
  const scale = detectTypographicScale(uniqueStyles);
  const hierarchy = identifyTypographyHierarchy(uniqueStyles);

  // Generate CSS outputs
  const cssVariables = generateCSSVariables(uniqueStyles, fontFamilies);
  const fontFaceDeclarations = generateFontFaceDeclarations(fontFamilies);
  const tailwindConfig = generateTailwindConfig(uniqueStyles, fontFamilies);

  return {
    styles: uniqueStyles,
    fontFamilies,
    scale,
    hierarchy,
    cssVariables,
    fontFaceDeclarations,
    tailwindConfig,
  };
}

/**
 * Deduplicate typography styles
 */
function deduplicateStyles(
  styles: ExtractedTypography[]
): ExtractedTypography[] {
  const seen = new Map<string, ExtractedTypography>();

  for (const style of styles) {
    const key = `${style.style.fontFamily}-${style.style.fontSize}-${style.style.fontWeight}-${style.style.lineHeight}-${style.style.letterSpacing}`;

    if (!seen.has(key)) {
      seen.set(key, style);
    }
  }

  return [...seen.values()];
}

/**
 * Extract unique font families from styles
 */
function extractFontFamilies(styles: ExtractedTypography[]): FontFamily[] {
  const familyMap = new Map<string, FontFamily>();

  for (const style of styles) {
    const fontName = style.style.fontFamily;

    if (!familyMap.has(fontName)) {
      const family = mapFontFamily(fontName);
      familyMap.set(fontName, family);
    }

    // Add this weight to the family's weights
    const family = familyMap.get(fontName)!;
    if (!family.weights.includes(style.style.fontWeight)) {
      family.weights.push(style.style.fontWeight);
      family.weights.sort();
    }
  }

  return [...familyMap.values()];
}

/**
 * Create a summary of the typography system
 */
export function createTypographySummary(
  result: TypographyExtractionResult
): string {
  const lines: string[] = [
    "# Typography System Summary",
    "",
    `## Font Families (${result.fontFamilies.length})`,
    "",
  ];

  for (const family of result.fontFamilies) {
    const googleStatus = family.googleFont
      ? "Google Fonts"
      : family.isSystem
        ? "System Font"
        : "Custom Font";
    lines.push(`- **${family.figmaName}** (${family.category}) - ${googleStatus}`);
    lines.push(`  - Weights: ${family.weights.join(", ")}`);
    if (family.webSafe) {
      lines.push(`  - Fallback: ${family.webSafe}`);
    }
  }

  lines.push("");
  lines.push(`## Typography Scale (${result.scale.length} sizes)`);
  lines.push("");

  for (const level of result.scale) {
    lines.push(
      `- **${level.name}**: ${level.fontSize}px / ${level.lineHeight}px (ratio: ${level.ratio})`
    );
  }

  // Detect scale type
  const fontSizes = result.scale.map((s) => s.fontSize);
  const detectedScale = detectScaleRatio(fontSizes);
  if (detectedScale) {
    lines.push("");
    lines.push(`*Detected scale: **${detectedScale.name}** (${detectedScale.ratio})*`);
  }

  lines.push("");
  lines.push(`## Typography Hierarchy (${result.hierarchy.length} roles)`);
  lines.push("");

  for (const level of result.hierarchy) {
    const exampleStyle = level.styles[0];
    if (exampleStyle) {
      lines.push(`- **${level.role}**: ${exampleStyle.style.fontSize}px, weight ${exampleStyle.style.fontWeight}`);
    }
  }

  return lines.join("\n");
}
