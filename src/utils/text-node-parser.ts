/**
 * Text Node Parser
 *
 * Parses Figma text nodes with full styling support including:
 * - Font, size, weight, color, alignment, decoration, transformation
 * - Mixed styles within single text blocks (character style overrides)
 * - Paragraph settings and list formatting
 */

import type { FigmaNode, FigmaColor } from "./figma-api";
import {
  convertTextTruncation,
  processTextNodeTruncation,
  mergeTruncationCSS,
  mergeTruncationTailwind,
  describeTruncation,
  type TextTruncationCSSOutput,
  type TruncationConversionOptions,
} from "./figma-text-truncation";

// ============================================================================
// Types
// ============================================================================

/** Text alignment options */
export type TextAlignHorizontal = "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
export type TextAlignVertical = "TOP" | "CENTER" | "BOTTOM";

/** Text decoration options */
export type TextDecoration = "NONE" | "UNDERLINE" | "STRIKETHROUGH";

/** Text case transformation */
export type TextCase = "ORIGINAL" | "UPPER" | "LOWER" | "TITLE" | "SMALL_CAPS" | "SMALL_CAPS_FORCED";

/** Line height settings */
export interface LineHeightSetting {
  value: number;
  unit: "PIXELS" | "PERCENT" | "AUTO";
}

/** Letter spacing settings */
export interface LetterSpacingSetting {
  value: number;
  unit: "PIXELS" | "PERCENT";
}

/** Text truncation settings */
export type TextTruncation = "DISABLED" | "ENDING";

/** Text auto-resize mode */
export type TextAutoResize = "NONE" | "HEIGHT" | "WIDTH_AND_HEIGHT" | "TRUNCATE";

/** List type for text */
export type ListType = "NONE" | "ORDERED" | "UNORDERED";

/** Hyperlink information */
export interface Hyperlink {
  type: "URL" | "NODE";
  url?: string;
  nodeId?: string;
}

/** Color in multiple formats */
export interface ParsedColor {
  /** Figma RGBA (0-1 range) */
  figma: FigmaColor;
  /** CSS rgba() string */
  rgba: string;
  /** CSS hex string */
  hex: string;
  /** CSS hsl() string */
  hsl: string;
}

/** Fill type from Figma */
export type FillType = "SOLID" | "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND" | "IMAGE" | "EMOJI";

/** Solid fill */
export interface SolidFill {
  type: "SOLID";
  color: FigmaColor;
  opacity?: number;
  visible?: boolean;
}

/** Gradient stop */
export interface GradientStop {
  position: number;
  color: FigmaColor;
}

/** Gradient fill */
export interface GradientFill {
  type: "GRADIENT_LINEAR" | "GRADIENT_RADIAL" | "GRADIENT_ANGULAR" | "GRADIENT_DIAMOND";
  gradientStops: GradientStop[];
  gradientHandlePositions?: Array<{ x: number; y: number }>;
  opacity?: number;
  visible?: boolean;
}

/** Combined fill type */
export type TextFill = SolidFill | GradientFill;

/** OpenType features */
export interface OpenTypeFeatures {
  /** Standard ligatures (liga) */
  liga?: boolean;
  /** Contextual alternates (calt) */
  calt?: boolean;
  /** Discretionary ligatures (dlig) */
  dlig?: boolean;
  /** Stylistic sets (ss01-ss20) */
  stylisticSets?: number[];
  /** Oldstyle figures (onum) */
  onum?: boolean;
  /** Lining figures (lnum) */
  lnum?: boolean;
  /** Tabular figures (tnum) */
  tnum?: boolean;
  /** Proportional figures (pnum) */
  pnum?: boolean;
  /** Fractions (frac) */
  frac?: boolean;
  /** Ordinals (ordn) */
  ordn?: boolean;
  /** Superscript (sups) */
  sups?: boolean;
  /** Subscript (subs) */
  subs?: boolean;
  /** Small caps (smcp) */
  smcp?: boolean;
  /** Caps to small caps (c2sc) */
  c2sc?: boolean;
}

/** Character-level style properties */
export interface CharacterStyle {
  /** Font family name */
  fontFamily: string;
  /** Font weight (100-900) */
  fontWeight: number;
  /** Font size in pixels */
  fontSize: number;
  /** Italic style */
  italic: boolean;
  /** Line height settings */
  lineHeight: LineHeightSetting;
  /** Letter spacing settings */
  letterSpacing: LetterSpacingSetting;
  /** Text case transformation */
  textCase: TextCase;
  /** Text decoration (underline/strikethrough) */
  textDecoration: TextDecoration;
  /** Text fill/color */
  fills: TextFill[];
  /** Parsed primary color (from first solid fill) */
  color?: ParsedColor;
  /** Hyperlink */
  hyperlink?: Hyperlink;
  /** OpenType features */
  openTypeFeatures?: OpenTypeFeatures;
}

/** A segment of text with consistent styling */
export interface TextSegment {
  /** The text content of this segment */
  text: string;
  /** Start index in the full text */
  startIndex: number;
  /** End index in the full text */
  endIndex: number;
  /** Style applied to this segment */
  style: CharacterStyle;
}

/** Paragraph-level style properties */
export interface ParagraphStyle {
  /** Paragraph spacing (before) in pixels */
  paragraphSpacing: number;
  /** First line indent in pixels */
  paragraphIndent: number;
  /** List type (ordered, unordered, or none) */
  listType: ListType;
  /** List indent level (0-based) */
  listIndentLevel: number;
  /** Custom list marker/bullet */
  listMarker?: string;
  /** List start number (for ordered lists) */
  listStartNumber?: number;
  /** Hanging punctuation enabled */
  hangingPunctuation?: boolean;
  /** Hanging list indent */
  hangingListIndent?: number;
}

/** A paragraph within the text */
export interface TextParagraph {
  /** The full text content of this paragraph */
  text: string;
  /** Start index in the full text */
  startIndex: number;
  /** End index in the full text */
  endIndex: number;
  /** Paragraph-level style */
  paragraphStyle: ParagraphStyle;
  /** Text segments within this paragraph */
  segments: TextSegment[];
}

/** Complete parsed text node */
export interface ParsedTextNode {
  /** Node ID */
  nodeId: string;
  /** Node name */
  nodeName: string;
  /** Full text content */
  characters: string;
  /** Text segments with character-level styling */
  segments: TextSegment[];
  /** Paragraphs with paragraph-level styling */
  paragraphs: TextParagraph[];
  /** Base/default style for the text node */
  baseStyle: CharacterStyle;
  /** Text alignment */
  textAlignHorizontal: TextAlignHorizontal;
  textAlignVertical: TextAlignVertical;
  /** Auto-resize mode */
  textAutoResize: TextAutoResize;
  /** Truncation settings */
  textTruncation: TextTruncation;
  /** Maximum number of lines (0 = unlimited) */
  maxLines: number;
  /** Whether the text has mixed styles */
  hasMixedStyles: boolean;
  /** Whether the text contains lists */
  hasLists: boolean;
  /** Bounding box */
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/** Options for text parsing */
export interface TextParseOptions {
  /** Include OpenType features in parsing */
  includeOpenTypeFeatures?: boolean;
  /** Parse hyperlinks */
  parseHyperlinks?: boolean;
  /** Parse list formatting */
  parseListFormatting?: boolean;
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Convert Figma color (0-1 range) to various CSS formats
 */
export function convertFigmaColor(color: FigmaColor, opacity?: number): ParsedColor {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity !== undefined ? opacity : color.a;

  // RGBA string
  const rgba = a < 1
    ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`
    : `rgb(${r}, ${g}, ${b})`;

  // Hex string
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const hex = a < 1
    ? `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`
    : `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // HSL conversion
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
        break;
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6;
        break;
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6;
        break;
    }
  }

  const hsl = a < 1
    ? `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a.toFixed(3)})`
    : `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

  return {
    figma: color,
    rgba,
    hex,
    hsl,
  };
}

/**
 * Extract the primary color from fills array
 */
function extractPrimaryColor(fills: TextFill[]): ParsedColor | undefined {
  // Find the first visible solid fill
  const solidFill = fills.find(
    (fill): fill is SolidFill => fill.type === "SOLID" && fill.visible !== false
  );

  if (solidFill) {
    return convertFigmaColor(solidFill.color, solidFill.opacity);
  }

  return undefined;
}

// ============================================================================
// Style Extraction
// ============================================================================

/**
 * Normalize font weight from Figma style name or value
 */
function normalizeFontWeight(weight: number | string | undefined): number {
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
      book: 400,
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
 * Parse line height from Figma format
 */
function parseLineHeight(lineHeightValue: unknown, fontSize: number): LineHeightSetting {
  if (lineHeightValue === undefined || lineHeightValue === null) {
    return { value: fontSize * 1.5, unit: "AUTO" };
  }

  if (typeof lineHeightValue === "number") {
    return { value: lineHeightValue, unit: "PIXELS" };
  }

  if (typeof lineHeightValue === "object" && lineHeightValue !== null) {
    const lh = lineHeightValue as { unit?: string; value?: number };

    if (lh.unit === "PIXELS" && lh.value !== undefined) {
      return { value: lh.value, unit: "PIXELS" };
    }

    if (lh.unit === "PERCENT" && lh.value !== undefined) {
      return { value: lh.value, unit: "PERCENT" };
    }

    if (lh.unit === "AUTO") {
      return { value: fontSize * 1.5, unit: "AUTO" };
    }
  }

  return { value: fontSize * 1.5, unit: "AUTO" };
}

/**
 * Parse letter spacing from Figma format
 */
function parseLetterSpacing(letterSpacingValue: unknown, fontSize: number): LetterSpacingSetting {
  if (letterSpacingValue === undefined || letterSpacingValue === null) {
    return { value: 0, unit: "PIXELS" };
  }

  if (typeof letterSpacingValue === "number") {
    return { value: letterSpacingValue, unit: "PIXELS" };
  }

  if (typeof letterSpacingValue === "object" && letterSpacingValue !== null) {
    const ls = letterSpacingValue as { unit?: string; value?: number };

    if (ls.unit === "PIXELS" && ls.value !== undefined) {
      return { value: ls.value, unit: "PIXELS" };
    }

    if (ls.unit === "PERCENT" && ls.value !== undefined) {
      return { value: ls.value, unit: "PERCENT" };
    }
  }

  return { value: 0, unit: "PIXELS" };
}

/**
 * Parse fills from Figma node
 */
function parseFills(fills: unknown[]): TextFill[] {
  if (!Array.isArray(fills)) {
    return [];
  }

  return fills
    .filter((fill): fill is Record<string, unknown> => typeof fill === "object" && fill !== null)
    .map((fill) => {
      const type = fill.type as string;

      if (type === "SOLID") {
        return {
          type: "SOLID" as const,
          color: fill.color as FigmaColor,
          opacity: fill.opacity as number | undefined,
          visible: fill.visible as boolean | undefined,
        };
      }

      if (type?.startsWith("GRADIENT_")) {
        return {
          type: type as GradientFill["type"],
          gradientStops: (fill.gradientStops as GradientStop[]) || [],
          gradientHandlePositions: fill.gradientHandlePositions as Array<{ x: number; y: number }> | undefined,
          opacity: fill.opacity as number | undefined,
          visible: fill.visible as boolean | undefined,
        };
      }

      // Return a default solid fill for unknown types
      return {
        type: "SOLID" as const,
        color: { r: 0, g: 0, b: 0, a: 1 },
        visible: false,
      };
    })
    .filter((fill) => fill.visible !== false);
}

/**
 * Parse OpenType features from Figma node
 */
function parseOpenTypeFeatures(node: Record<string, unknown>): OpenTypeFeatures | undefined {
  const features: OpenTypeFeatures = {};
  let hasFeatures = false;

  // Check various OpenType feature flags
  if (node.opentypeFlags !== undefined) {
    const flags = node.opentypeFlags as Record<string, boolean>;

    if (flags.LIGA !== undefined) { features.liga = flags.LIGA; hasFeatures = true; }
    if (flags.CALT !== undefined) { features.calt = flags.CALT; hasFeatures = true; }
    if (flags.DLIG !== undefined) { features.dlig = flags.DLIG; hasFeatures = true; }
    if (flags.ONUM !== undefined) { features.onum = flags.ONUM; hasFeatures = true; }
    if (flags.LNUM !== undefined) { features.lnum = flags.LNUM; hasFeatures = true; }
    if (flags.TNUM !== undefined) { features.tnum = flags.TNUM; hasFeatures = true; }
    if (flags.PNUM !== undefined) { features.pnum = flags.PNUM; hasFeatures = true; }
    if (flags.FRAC !== undefined) { features.frac = flags.FRAC; hasFeatures = true; }
    if (flags.ORDN !== undefined) { features.ordn = flags.ORDN; hasFeatures = true; }
    if (flags.SUPS !== undefined) { features.sups = flags.SUPS; hasFeatures = true; }
    if (flags.SUBS !== undefined) { features.subs = flags.SUBS; hasFeatures = true; }
    if (flags.SMCP !== undefined) { features.smcp = flags.SMCP; hasFeatures = true; }
    if (flags.C2SC !== undefined) { features.c2sc = flags.C2SC; hasFeatures = true; }
  }

  return hasFeatures ? features : undefined;
}

/**
 * Extract character style from Figma style object
 */
function extractCharacterStyle(
  styleObj: Record<string, unknown>,
  fills: unknown[],
  options: TextParseOptions = {}
): CharacterStyle {
  const fontSize = (styleObj.fontSize as number) ?? 16;
  const parsedFills = parseFills(fills);

  const style: CharacterStyle = {
    fontFamily: (styleObj.fontFamily as string) ?? "Inter",
    fontWeight: normalizeFontWeight(styleObj.fontWeight as number | string | undefined),
    fontSize,
    italic: (styleObj.italic as boolean) ?? false,
    lineHeight: parseLineHeight(styleObj.lineHeightPx ?? styleObj.lineHeight, fontSize),
    letterSpacing: parseLetterSpacing(styleObj.letterSpacing, fontSize),
    textCase: (styleObj.textCase as TextCase) ?? "ORIGINAL",
    textDecoration: (styleObj.textDecoration as TextDecoration) ?? "NONE",
    fills: parsedFills,
    color: extractPrimaryColor(parsedFills),
  };

  if (options.includeOpenTypeFeatures) {
    style.openTypeFeatures = parseOpenTypeFeatures(styleObj);
  }

  return style;
}

// ============================================================================
// Paragraph & List Parsing
// ============================================================================

/**
 * Detect list type from line content
 */
function detectListType(line: string): { type: ListType; marker?: string; indent: number } {
  // Check for unordered list markers
  const unorderedPatterns = [
    /^(\s*)([-•●○◦▪▸►])(\s+)/,
    /^(\s*)(\*)(\s+)(?!\*)/,
  ];

  for (const pattern of unorderedPatterns) {
    const match = line.match(pattern);
    if (match) {
      return {
        type: "UNORDERED",
        marker: match[2],
        indent: Math.floor(match[1].length / 2),
      };
    }
  }

  // Check for ordered list markers
  const orderedPatterns = [
    /^(\s*)(\d+)([.)])(\s+)/,
    /^(\s*)([a-zA-Z])([.)])(\s+)/,
    /^(\s*)([ivxlcdm]+)([.)])(\s+)/i,
  ];

  for (const pattern of orderedPatterns) {
    const match = line.match(pattern);
    if (match) {
      return {
        type: "ORDERED",
        marker: match[2] + match[3],
        indent: Math.floor(match[1].length / 2),
      };
    }
  }

  return { type: "NONE", indent: 0 };
}

/**
 * Parse line indentation from Figma
 */
function parseListInfo(
  node: Record<string, unknown>,
  lineIndex: number
): { listType: ListType; indentLevel: number; startNumber?: number } {
  // Check for Figma's native list properties
  const lineTypes = node.lineTypes as string[] | undefined;
  const lineIndentations = node.lineIndentations as number[] | undefined;

  if (lineTypes && lineTypes[lineIndex]) {
    const type = lineTypes[lineIndex];

    return {
      listType: type === "ORDERED" ? "ORDERED" : type === "UNORDERED" ? "UNORDERED" : "NONE",
      indentLevel: lineIndentations?.[lineIndex] ?? 0,
    };
  }

  return { listType: "NONE", indentLevel: 0 };
}

/**
 * Split text into paragraphs
 */
function splitIntoParagraphs(text: string): Array<{ text: string; startIndex: number; endIndex: number }> {
  const paragraphs: Array<{ text: string; startIndex: number; endIndex: number }> = [];
  let currentIndex = 0;
  const lines = text.split(/\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const endIndex = currentIndex + line.length;

    paragraphs.push({
      text: line,
      startIndex: currentIndex,
      endIndex,
    });

    currentIndex = endIndex + 1; // +1 for the newline character
  }

  return paragraphs;
}

// ============================================================================
// Main Parsing Functions
// ============================================================================

/**
 * Parse character style overrides and create text segments
 */
function parseCharacterStyleOverrides(
  node: Record<string, unknown>,
  characters: string,
  baseStyle: CharacterStyle,
  options: TextParseOptions = {}
): TextSegment[] {
  const segments: TextSegment[] = [];

  // Get style override data from the node
  const characterStyleOverrides = node.characterStyleOverrides as number[] | undefined;
  const styleOverrideTable = node.styleOverrideTable as Record<string, Record<string, unknown>> | undefined;

  // If no overrides, return single segment with base style
  if (!characterStyleOverrides || characterStyleOverrides.length === 0 || !styleOverrideTable) {
    if (characters.length > 0) {
      segments.push({
        text: characters,
        startIndex: 0,
        endIndex: characters.length,
        style: baseStyle,
      });
    }
    return segments;
  }

  // Build segments from character style overrides
  let currentStyleIndex = 0;
  let segmentStart = 0;

  for (let i = 0; i <= characters.length; i++) {
    const styleIndex = characterStyleOverrides[i] ?? 0;

    // When style changes or we reach the end
    if (styleIndex !== currentStyleIndex || i === characters.length) {
      // Create segment for the previous run
      if (i > segmentStart) {
        let segmentStyle = baseStyle;

        // Apply style overrides if this isn't the base style (index 0)
        if (currentStyleIndex !== 0 && styleOverrideTable[String(currentStyleIndex)]) {
          const overrideObj = styleOverrideTable[String(currentStyleIndex)];

          // Get fills - might be in the override or inherit from node
          const overrideFills = (overrideObj.fills as unknown[]) ?? (node.fills as unknown[]) ?? [];

          segmentStyle = {
            ...baseStyle,
            ...extractCharacterStyle(overrideObj, overrideFills, options),
          };
        }

        segments.push({
          text: characters.slice(segmentStart, i),
          startIndex: segmentStart,
          endIndex: i,
          style: segmentStyle,
        });
      }

      segmentStart = i;
      currentStyleIndex = styleIndex;
    }
  }

  return segments;
}

/**
 * Build paragraphs from segments
 */
function buildParagraphs(
  node: Record<string, unknown>,
  characters: string,
  segments: TextSegment[],
  options: TextParseOptions = {}
): TextParagraph[] {
  const paragraphRanges = splitIntoParagraphs(characters);
  const paragraphs: TextParagraph[] = [];

  for (let paraIndex = 0; paraIndex < paragraphRanges.length; paraIndex++) {
    const paraRange = paragraphRanges[paraIndex];

    // Get paragraph-level settings
    const paragraphSpacing = (node.paragraphSpacing as number) ?? 0;
    const paragraphIndent = (node.paragraphIndent as number) ?? 0;

    // Parse list information
    let listType: ListType = "NONE";
    let listIndentLevel = 0;
    let listMarker: string | undefined;
    let listStartNumber: number | undefined;

    if (options.parseListFormatting !== false) {
      const listInfo = parseListInfo(node, paraIndex);
      listType = listInfo.listType;
      listIndentLevel = listInfo.indentLevel;
      listStartNumber = listInfo.startNumber;

      // Also try to detect from content if Figma data isn't available
      if (listType === "NONE") {
        const detected = detectListType(paraRange.text);
        listType = detected.type;
        listMarker = detected.marker;
        listIndentLevel = detected.indent;
      }
    }

    // Find segments that belong to this paragraph
    const paragraphSegments = segments
      .filter((seg) => seg.startIndex < paraRange.endIndex && seg.endIndex > paraRange.startIndex)
      .map((seg) => {
        // Clip segment to paragraph boundaries
        const clippedStart = Math.max(seg.startIndex, paraRange.startIndex);
        const clippedEnd = Math.min(seg.endIndex, paraRange.endIndex);

        return {
          ...seg,
          text: characters.slice(clippedStart, clippedEnd),
          startIndex: clippedStart - paraRange.startIndex, // Relative to paragraph
          endIndex: clippedEnd - paraRange.startIndex,
        };
      })
      .filter((seg) => seg.text.length > 0);

    paragraphs.push({
      text: paraRange.text,
      startIndex: paraRange.startIndex,
      endIndex: paraRange.endIndex,
      paragraphStyle: {
        paragraphSpacing,
        paragraphIndent,
        listType,
        listIndentLevel,
        listMarker,
        listStartNumber,
        hangingPunctuation: (node.hangingPunctuation as boolean) ?? false,
        hangingListIndent: node.hangingListIndent as number | undefined,
      },
      segments: paragraphSegments,
    });
  }

  return paragraphs;
}

/**
 * Parse a Figma text node with full styling support
 */
export function parseTextNode(
  node: FigmaNode,
  options: TextParseOptions = {}
): ParsedTextNode | null {
  // Verify this is a text node
  if (node.type !== "TEXT") {
    return null;
  }

  const nodeData = node as unknown as Record<string, unknown>;
  const characters = (nodeData.characters as string) ?? "";

  if (characters.length === 0) {
    return null;
  }

  // Extract base style from the node's style property
  const styleObj = (nodeData.style as Record<string, unknown>) ?? {};
  const fills = (nodeData.fills as unknown[]) ?? [];
  const baseStyle = extractCharacterStyle(styleObj, fills, options);

  // Parse character style overrides
  const segments = parseCharacterStyleOverrides(nodeData, characters, baseStyle, options);

  // Build paragraphs
  const paragraphs = buildParagraphs(nodeData, characters, segments, options);

  // Determine if there are mixed styles
  const hasMixedStyles = segments.length > 1 ||
    (segments.length === 1 && segments[0].text !== characters);

  // Check for lists
  const hasLists = paragraphs.some((p) => p.paragraphStyle.listType !== "NONE");

  // Get bounding box
  const boundingBox = nodeData.absoluteBoundingBox as {
    x: number;
    y: number;
    width: number;
    height: number;
  } | undefined;

  return {
    nodeId: node.id,
    nodeName: node.name,
    characters,
    segments,
    paragraphs,
    baseStyle,
    textAlignHorizontal: (styleObj.textAlignHorizontal as TextAlignHorizontal) ?? "LEFT",
    textAlignVertical: (styleObj.textAlignVertical as TextAlignVertical) ?? "TOP",
    textAutoResize: (nodeData.textAutoResize as TextAutoResize) ?? "NONE",
    textTruncation: (nodeData.textTruncation as TextTruncation) ?? "DISABLED",
    maxLines: (nodeData.maxLines as number) ?? 0,
    hasMixedStyles,
    hasLists,
    boundingBox,
  };
}

/**
 * Recursively extract all text nodes from a Figma document tree
 */
export function extractAllTextNodes(
  node: FigmaNode,
  options: TextParseOptions = {}
): ParsedTextNode[] {
  const results: ParsedTextNode[] = [];

  if (node.type === "TEXT") {
    const parsed = parseTextNode(node, options);
    if (parsed) {
      results.push(parsed);
    }
  }

  if (node.children) {
    for (const child of node.children) {
      results.push(...extractAllTextNodes(child, options));
    }
  }

  return results;
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate CSS for a character style
 */
export function generateCharacterStyleCSS(style: CharacterStyle): Record<string, string> {
  const css: Record<string, string> = {
    "font-family": `"${style.fontFamily}", system-ui, sans-serif`,
    "font-weight": String(style.fontWeight),
    "font-size": `${style.fontSize}px`,
  };

  // Italic
  if (style.italic) {
    css["font-style"] = "italic";
  }

  // Line height
  if (style.lineHeight.unit === "PIXELS") {
    css["line-height"] = `${style.lineHeight.value}px`;
  } else if (style.lineHeight.unit === "PERCENT") {
    css["line-height"] = `${style.lineHeight.value}%`;
  } else {
    css["line-height"] = "normal";
  }

  // Letter spacing
  if (style.letterSpacing.value !== 0) {
    if (style.letterSpacing.unit === "PIXELS") {
      css["letter-spacing"] = `${style.letterSpacing.value}px`;
    } else {
      css["letter-spacing"] = `${(style.letterSpacing.value / 100).toFixed(3)}em`;
    }
  }

  // Text case
  switch (style.textCase) {
    case "UPPER":
      css["text-transform"] = "uppercase";
      break;
    case "LOWER":
      css["text-transform"] = "lowercase";
      break;
    case "TITLE":
      css["text-transform"] = "capitalize";
      break;
    case "SMALL_CAPS":
    case "SMALL_CAPS_FORCED":
      css["font-variant-caps"] = "small-caps";
      break;
  }

  // Text decoration
  switch (style.textDecoration) {
    case "UNDERLINE":
      css["text-decoration"] = "underline";
      break;
    case "STRIKETHROUGH":
      css["text-decoration"] = "line-through";
      break;
  }

  // Color
  if (style.color) {
    css["color"] = style.color.rgba;
  }

  // OpenType features
  if (style.openTypeFeatures) {
    const features: string[] = [];

    if (style.openTypeFeatures.liga) features.push('"liga"');
    if (style.openTypeFeatures.calt) features.push('"calt"');
    if (style.openTypeFeatures.dlig) features.push('"dlig"');
    if (style.openTypeFeatures.onum) features.push('"onum"');
    if (style.openTypeFeatures.lnum) features.push('"lnum"');
    if (style.openTypeFeatures.tnum) features.push('"tnum"');
    if (style.openTypeFeatures.pnum) features.push('"pnum"');
    if (style.openTypeFeatures.frac) features.push('"frac"');
    if (style.openTypeFeatures.ordn) features.push('"ordn"');
    if (style.openTypeFeatures.sups) features.push('"sups"');
    if (style.openTypeFeatures.subs) features.push('"subs"');
    if (style.openTypeFeatures.smcp) features.push('"smcp"');
    if (style.openTypeFeatures.c2sc) features.push('"c2sc"');

    if (features.length > 0) {
      css["font-feature-settings"] = features.join(", ");
    }
  }

  return css;
}

/**
 * Generate CSS string from CSS object
 */
export function cssObjectToString(css: Record<string, string>, indent = "  "): string {
  return Object.entries(css)
    .map(([prop, value]) => `${indent}${prop}: ${value};`)
    .join("\n");
}

/**
 * Generate Tailwind classes for a character style
 */
export function generateCharacterStyleTailwind(style: CharacterStyle): string[] {
  const classes: string[] = [];

  // Font weight
  const weightMap: Record<number, string> = {
    100: "font-thin",
    200: "font-extralight",
    300: "font-light",
    400: "font-normal",
    500: "font-medium",
    600: "font-semibold",
    700: "font-bold",
    800: "font-extrabold",
    900: "font-black",
  };
  classes.push(weightMap[style.fontWeight] ?? "font-normal");

  // Font size (using closest Tailwind default)
  const sizeMap: Record<number, string> = {
    12: "text-xs",
    14: "text-sm",
    16: "text-base",
    18: "text-lg",
    20: "text-xl",
    24: "text-2xl",
    30: "text-3xl",
    36: "text-4xl",
    48: "text-5xl",
    60: "text-6xl",
    72: "text-7xl",
    96: "text-8xl",
    128: "text-9xl",
  };

  // Find closest size
  const sizes = Object.keys(sizeMap).map(Number);
  const closestSize = sizes.reduce((prev, curr) =>
    Math.abs(curr - style.fontSize) < Math.abs(prev - style.fontSize) ? curr : prev
  );
  classes.push(sizeMap[closestSize] ?? `text-[${style.fontSize}px]`);

  // Italic
  if (style.italic) {
    classes.push("italic");
  }

  // Text transform
  switch (style.textCase) {
    case "UPPER":
      classes.push("uppercase");
      break;
    case "LOWER":
      classes.push("lowercase");
      break;
    case "TITLE":
      classes.push("capitalize");
      break;
  }

  // Text decoration
  switch (style.textDecoration) {
    case "UNDERLINE":
      classes.push("underline");
      break;
    case "STRIKETHROUGH":
      classes.push("line-through");
      break;
  }

  return classes;
}

/**
 * Generate CSS for paragraph styles
 */
export function generateParagraphStyleCSS(style: ParagraphStyle): Record<string, string> {
  const css: Record<string, string> = {};

  if (style.paragraphSpacing > 0) {
    css["margin-bottom"] = `${style.paragraphSpacing}px`;
  }

  if (style.paragraphIndent > 0) {
    css["text-indent"] = `${style.paragraphIndent}px`;
  }

  if (style.listType !== "NONE") {
    css["list-style-type"] = style.listType === "ORDERED" ? "decimal" : "disc";
    css["padding-left"] = `${(style.listIndentLevel + 1) * 24}px`;
    css["display"] = "list-item";
  }

  return css;
}

// ============================================================================
// Text Truncation CSS Generation
// ============================================================================

/**
 * Generate CSS for a text node including truncation styles
 * This combines character styles with truncation CSS
 */
export function generateTextNodeCSS(
  parsed: ParsedTextNode,
  options: TruncationConversionOptions = {}
): Record<string, string> {
  // Get base character styles
  const css = generateCharacterStyleCSS(parsed.baseStyle);

  // Add text alignment
  const alignmentMap: Record<TextAlignHorizontal, string> = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    JUSTIFIED: "justify",
  };
  css["text-align"] = alignmentMap[parsed.textAlignHorizontal];

  // Add truncation CSS if applicable
  const truncationOutput = processTextNodeTruncation(parsed, options);
  if (truncationOutput.isTruncated) {
    return mergeTruncationCSS(css, truncationOutput);
  }

  return css;
}

/**
 * Generate Tailwind classes for a text node including truncation
 */
export function generateTextNodeTailwind(
  parsed: ParsedTextNode,
  options: TruncationConversionOptions = {}
): string[] {
  // Get base character style classes
  const classes = generateCharacterStyleTailwind(parsed.baseStyle);

  // Add text alignment
  const alignmentMap: Record<TextAlignHorizontal, string> = {
    LEFT: "text-left",
    CENTER: "text-center",
    RIGHT: "text-right",
    JUSTIFIED: "text-justify",
  };
  classes.push(alignmentMap[parsed.textAlignHorizontal]);

  // Add truncation classes if applicable
  const truncationOutput = processTextNodeTruncation(parsed, options);
  if (truncationOutput.isTruncated) {
    return mergeTruncationTailwind(classes, truncationOutput);
  }

  return classes;
}

/**
 * Get truncation information for a parsed text node
 */
export function getTextNodeTruncationInfo(
  parsed: ParsedTextNode,
  options: TruncationConversionOptions = {}
): TextTruncationCSSOutput {
  return processTextNodeTruncation(parsed, options);
}

/**
 * Get a human-readable description of the text node's truncation settings
 */
export function getTextNodeTruncationDescription(parsed: ParsedTextNode): string {
  return describeTruncation({
    textTruncation: parsed.textTruncation,
    maxLines: parsed.maxLines,
    textAutoResize: parsed.textAutoResize,
  });
}

/**
 * Options for generating text node HTML
 */
export interface TextNodeHTMLOptions {
  /** Use class names instead of inline styles */
  useClasses?: boolean;
  /** Prefix for generated class names */
  classPrefix?: string;
  /** Include truncation styles */
  includeTruncation?: boolean;
  /** Options for truncation conversion */
  truncationOptions?: TruncationConversionOptions;
}

/**
 * Generate HTML for a parsed text node
 */
export function generateTextNodeHTML(
  parsed: ParsedTextNode,
  options: TextNodeHTMLOptions = {}
): string {
  const {
    useClasses = false,
    classPrefix = "text",
    includeTruncation = true,
    truncationOptions = {},
  } = options;

  // Get truncation CSS if enabled
  const truncationOutput = includeTruncation
    ? processTextNodeTruncation(parsed, truncationOptions)
    : null;

  if (!parsed.hasMixedStyles && parsed.paragraphs.length <= 1) {
    // Simple case: single style, single paragraph
    let css = generateCharacterStyleCSS(parsed.baseStyle);

    // Merge truncation CSS if applicable
    if (truncationOutput?.isTruncated) {
      css = mergeTruncationCSS(css, truncationOutput);
    }

    const styleAttr = useClasses ? "" : ` style="${cssObjectToString(css, "").replace(/\n/g, " ")}"`;
    return `<span${styleAttr}>${escapeHtml(parsed.characters)}</span>`;
  }

  // Complex case: multiple styles or paragraphs
  const parts: string[] = [];

  for (const para of parsed.paragraphs) {
    const paraTag = para.paragraphStyle.listType !== "NONE" ? "li" : "p";
    let paraCss = generateParagraphStyleCSS(para.paragraphStyle);

    // For multi-line truncation, we need to apply truncation CSS to the container
    // For single paragraph scenarios with truncation, merge the styles
    if (truncationOutput?.isTruncated && parsed.paragraphs.length === 1) {
      paraCss = mergeTruncationCSS(paraCss, truncationOutput);
    }

    const paraStyleAttr = Object.keys(paraCss).length > 0
      ? ` style="${cssObjectToString(paraCss, "").replace(/\n/g, " ")}"`
      : "";

    const segmentHtml = para.segments.map((seg) => {
      const css = generateCharacterStyleCSS(seg.style);
      const styleAttr = useClasses ? "" : ` style="${cssObjectToString(css, "").replace(/\n/g, " ")}"`;
      return `<span${styleAttr}>${escapeHtml(seg.text)}</span>`;
    }).join("");

    parts.push(`<${paraTag}${paraStyleAttr}>${segmentHtml}</${paraTag}>`);
  }

  // Wrap lists
  const hasOrderedList = parsed.paragraphs.some((p) => p.paragraphStyle.listType === "ORDERED");
  const hasUnorderedList = parsed.paragraphs.some((p) => p.paragraphStyle.listType === "UNORDERED");

  // For multi-paragraph text with truncation, wrap in a container div with truncation styles
  if (truncationOutput?.isTruncated && parsed.paragraphs.length > 1) {
    const truncationStyle = cssObjectToString(truncationOutput.cssProperties, "").replace(/\n/g, " ");
    const wrapperOpen = `<div style="${truncationStyle}">`;
    const wrapperClose = "</div>";

    if (hasOrderedList) {
      return `${wrapperOpen}<ol>${parts.join("")}</ol>${wrapperClose}`;
    } else if (hasUnorderedList) {
      return `${wrapperOpen}<ul>${parts.join("")}</ul>${wrapperClose}`;
    }
    return `${wrapperOpen}${parts.join("\n")}${wrapperClose}`;
  }

  if (hasOrderedList) {
    return `<ol>${parts.join("")}</ol>`;
  } else if (hasUnorderedList) {
    return `<ul>${parts.join("")}</ul>`;
  }

  return parts.join("\n");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// Summary Generation
// ============================================================================

/**
 * Generate a summary of parsed text node styling
 */
export function generateTextNodeSummary(parsed: ParsedTextNode): string {
  const lines: string[] = [
    `## Text Node: ${parsed.nodeName}`,
    "",
    `**Content:** "${parsed.characters.slice(0, 50)}${parsed.characters.length > 50 ? "..." : ""}"`,
    "",
    "### Base Style",
    `- Font: ${parsed.baseStyle.fontFamily} ${parsed.baseStyle.fontWeight}${parsed.baseStyle.italic ? " italic" : ""}`,
    `- Size: ${parsed.baseStyle.fontSize}px`,
    `- Color: ${parsed.baseStyle.color?.hex ?? "inherit"}`,
    `- Line Height: ${parsed.baseStyle.lineHeight.unit === "AUTO" ? "auto" : `${parsed.baseStyle.lineHeight.value}${parsed.baseStyle.lineHeight.unit === "PIXELS" ? "px" : "%"}`}`,
    `- Letter Spacing: ${parsed.baseStyle.letterSpacing.value}${parsed.baseStyle.letterSpacing.unit === "PIXELS" ? "px" : "%"}`,
    `- Text Case: ${parsed.baseStyle.textCase}`,
    `- Text Decoration: ${parsed.baseStyle.textDecoration}`,
    "",
    "### Layout",
    `- Horizontal Align: ${parsed.textAlignHorizontal}`,
    `- Vertical Align: ${parsed.textAlignVertical}`,
    `- Auto Resize: ${parsed.textAutoResize}`,
    `- Truncation: ${parsed.textTruncation}`,
    `- Max Lines: ${parsed.maxLines === 0 ? "unlimited" : parsed.maxLines}`,
  ];

  // Add truncation CSS information if applicable
  const truncationOutput = processTextNodeTruncation(parsed);
  if (truncationOutput.isTruncated) {
    lines.push("");
    lines.push("### Text Truncation CSS");
    lines.push(`- Type: ${truncationOutput.truncationType}`);
    lines.push(`- CSS Properties:`);
    for (const [prop, value] of Object.entries(truncationOutput.cssProperties)) {
      lines.push(`  - ${prop}: ${value}`);
    }
    if (truncationOutput.tailwindClasses.length > 0) {
      lines.push(`- Tailwind Classes: ${truncationOutput.tailwindClasses.join(" ")}`);
    }
    if (truncationOutput.warning) {
      lines.push(`- Warning: ${truncationOutput.warning}`);
    }
  }

  if (parsed.hasMixedStyles) {
    lines.push("");
    lines.push("### Style Variations");
    lines.push(`- Total segments: ${parsed.segments.length}`);

    const uniqueFonts = new Set(parsed.segments.map((s) => s.style.fontFamily));
    const uniqueSizes = new Set(parsed.segments.map((s) => s.style.fontSize));
    const uniqueWeights = new Set(parsed.segments.map((s) => s.style.fontWeight));

    if (uniqueFonts.size > 1) {
      lines.push(`- Fonts used: ${[...uniqueFonts].join(", ")}`);
    }
    if (uniqueSizes.size > 1) {
      lines.push(`- Sizes used: ${[...uniqueSizes].map((s) => `${s}px`).join(", ")}`);
    }
    if (uniqueWeights.size > 1) {
      lines.push(`- Weights used: ${[...uniqueWeights].join(", ")}`);
    }
  }

  if (parsed.hasLists) {
    lines.push("");
    lines.push("### List Formatting");

    for (const para of parsed.paragraphs) {
      if (para.paragraphStyle.listType !== "NONE") {
        lines.push(`- ${para.paragraphStyle.listType} list at indent level ${para.paragraphStyle.listIndentLevel}`);
      }
    }
  }

  return lines.join("\n");
}
