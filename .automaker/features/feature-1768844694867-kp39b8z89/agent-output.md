
🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming"
}
I'll help you implement the feature to parse text nodes with full styling. Let me start by exploring the codebase to understand the existing structure and context.

🔧 Tool: Task
Input: {
  "prompt": "Explore this codebase to understand:\n1. What is this project about? Is it related to Figma parsing/code generation?\n2. What existing parsing or Figma-related code exists?\n3. What file structure and patterns are used?\n4. Look for any existing text node handling or styling-related code\n\nBe thorough - check src/, any parsing-related directories, and understand the overall architecture.",
  "description": "Explore codebase structure",
  "subagent_type": "Explore"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/README.md"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.md\" | head -20",
  "description": "List markdown files in the project"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/ 2>/dev/null | head -30",
  "description": "List contents of src directory"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: Grep
Input: {
  "pattern": "figma",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/docs -type f -name \"*.md\" 2>/dev/null",
  "description": "List documentation files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma-export.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/typography-extractor.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/TypographyPreview.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-*.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-gradient.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-blend-mode.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-constraints.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "offset": 1,
  "limit": 150
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -E \"(route|page)\" | head -20",
  "description": "Find route and page files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "offset": 150,
  "limit": 250
}
Excellent! Now I have a comprehensive understanding. The codebase already has a sophisticated typography extraction system (`typography-extractor.ts`), but based on the feature request, I need to enhance it to handle:

1. **Full text styling** - font, size, weight, color, alignment, decoration, transformation
2. **Mixed styles within single text blocks** - when text has multiple style runs
3. **Paragraph settings and list formatting**

Let me examine the current typography extractor to understand what's already implemented and what needs to be added:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/typography-extractor.ts"
}
Now I have a clear picture. The existing typography extractor handles basic text styling but is missing:

1. **Mixed styles within single text blocks** - Figma's `characterStyleOverrides` and `styleOverrideTable`
2. **Full color extraction** - The current code doesn't extract fill colors
3. **List formatting** - List types, indentation, and markers
4. **More detailed paragraph settings** - Hanging punctuation, truncation, auto-resize modes

Let me check the Figma API types to understand what data structures are available:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}
Now I have a good understanding. I'll create a comprehensive text node parser that handles:
1. Full text styling (font, size, weight, color, alignment, decoration, transformation)
2. Mixed styles within single text blocks (character style overrides)
3. Paragraph settings and list formatting

Let me create a todo list to track this implementation:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create text-node-parser.ts with comprehensive types for text parsing",
      "status": "in_progress",
      "activeForm": "Creating text-node-parser.ts with comprehensive types"
    },
    {
      "content": "Implement mixed styles parsing (characterStyleOverrides)",
      "status": "pending",
      "activeForm": "Implementing mixed styles parsing"
    },
    {
      "content": "Add color extraction from fills",
      "status": "pending",
      "activeForm": "Adding color extraction from fills"
    },
    {
      "content": "Implement paragraph settings and list formatting",
      "status": "pending",
      "activeForm": "Implementing paragraph settings and list formatting"
    },
    {
      "content": "Add CSS/Tailwind generation for parsed text nodes",
      "status": "pending",
      "activeForm": "Adding CSS/Tailwind generation"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/text-node-parser.ts",
  "content": "/**\n * Text Node Parser\n *\n * Parses Figma text nodes with full styling support including:\n * - Font, size, weight, color, alignment, decoration, transformation\n * - Mixed styles within single text blocks (character style overrides)\n * - Paragraph settings and list formatting\n */\n\nimport type { FigmaNode, FigmaColor } from \"./figma-api\";\n\n// ============================================================================\n// Types\n// ============================================================================\n\n/** Text alignment options */\nexport type TextAlignHorizontal = \"LEFT\" | \"CENTER\" | \"RIGHT\" | \"JUSTIFIED\";\nexport type TextAlignVertical = \"TOP\" | \"CENTER\" | \"BOTTOM\";\n\n/** Text decoration options */\nexport type TextDecoration = \"NONE\" | \"UNDERLINE\" | \"STRIKETHROUGH\";\n\n/** Text case transformation */\nexport type TextCase = \"ORIGINAL\" | \"UPPER\" | \"LOWER\" | \"TITLE\" | \"SMALL_CAPS\" | \"SMALL_CAPS_FORCED\";\n\n/** Line height settings */\nexport interface LineHeightSetting {\n  value: number;\n  unit: \"PIXELS\" | \"PERCENT\" | \"AUTO\";\n}\n\n/** Letter spacing settings */\nexport interface LetterSpacingSetting {\n  value: number;\n  unit: \"PIXELS\" | \"PERCENT\";\n}\n\n/** Text truncation settings */\nexport type TextTruncation = \"DISABLED\" | \"ENDING\";\n\n/** Text auto-resize mode */\nexport type TextAutoResize = \"NONE\" | \"HEIGHT\" | \"WIDTH_AND_HEIGHT\" | \"TRUNCATE\";\n\n/** List type for text */\nexport type ListType = \"NONE\" | \"ORDERED\" | \"UNORDERED\";\n\n/** Hyperlink information */\nexport interface Hyperlink {\n  type: \"URL\" | \"NODE\";\n  url?: string;\n  nodeId?: string;\n}\n\n/** Color in multiple formats */\nexport interface ParsedColor {\n  /** Figma RGBA (0-1 range) */\n  figma: FigmaColor;\n  /** CSS rgba() string */\n  rgba: string;\n  /** CSS hex string */\n  hex: string;\n  /** CSS hsl() string */\n  hsl: string;\n}\n\n/** Fill type from Figma */\nexport type FillType = \"SOLID\" | \"GRADIENT_LINEAR\" | \"GRADIENT_RADIAL\" | \"GRADIENT_ANGULAR\" | \"GRADIENT_DIAMOND\" | \"IMAGE\" | \"EMOJI\";\n\n/** Solid fill */\nexport interface SolidFill {\n  type: \"SOLID\";\n  color: FigmaColor;\n  opacity?: number;\n  visible?: boolean;\n}\n\n/** Gradient stop */\nexport interface GradientStop {\n  position: number;\n  color: FigmaColor;\n}\n\n/** Gradient fill */\nexport interface GradientFill {\n  type: \"GRADIENT_LINEAR\" | \"GRADIENT_RADIAL\" | \"GRADIENT_ANGULAR\" | \"GRADIENT_DIAMOND\";\n  gradientStops: GradientStop[];\n  gradientHandlePositions?: Array<{ x: number; y: number }>;\n  opacity?: number;\n  visible?: boolean;\n}\n\n/** Combined fill type */\nexport type TextFill = SolidFill | GradientFill;\n\n/** OpenType features */\nexport interface OpenTypeFeatures {\n  /** Standard ligatures (liga) */\n  liga?: boolean;\n  /** Contextual alternates (calt) */\n  calt?: boolean;\n  /** Discretionary ligatures (dlig) */\n  dlig?: boolean;\n  /** Stylistic sets (ss01-ss20) */\n  stylisticSets?: number[];\n  /** Oldstyle figures (onum) */\n  onum?: boolean;\n  /** Lining figures (lnum) */\n  lnum?: boolean;\n  /** Tabular figures (tnum) */\n  tnum?: boolean;\n  /** Proportional figures (pnum) */\n  pnum?: boolean;\n  /** Fractions (frac) */\n  frac?: boolean;\n  /** Ordinals (ordn) */\n  ordn?: boolean;\n  /** Superscript (sups) */\n  sups?: boolean;\n  /** Subscript (subs) */\n  subs?: boolean;\n  /** Small caps (smcp) */\n  smcp?: boolean;\n  /** Caps to small caps (c2sc) */\n  c2sc?: boolean;\n}\n\n/** Character-level style properties */\nexport interface CharacterStyle {\n  /** Font family name */\n  fontFamily: string;\n  /** Font weight (100-900) */\n  fontWeight: number;\n  /** Font size in pixels */\n  fontSize: number;\n  /** Italic style */\n  italic: boolean;\n  /** Line height settings */\n  lineHeight: LineHeightSetting;\n  /** Letter spacing settings */\n  letterSpacing: LetterSpacingSetting;\n  /** Text case transformation */\n  textCase: TextCase;\n  /** Text decoration (underline/strikethrough) */\n  textDecoration: TextDecoration;\n  /** Text fill/color */\n  fills: TextFill[];\n  /** Parsed primary color (from first solid fill) */\n  color?: ParsedColor;\n  /** Hyperlink */\n  hyperlink?: Hyperlink;\n  /** OpenType features */\n  openTypeFeatures?: OpenTypeFeatures;\n}\n\n/** A segment of text with consistent styling */\nexport interface TextSegment {\n  /** The text content of this segment */\n  text: string;\n  /** Start index in the full text */\n  startIndex: number;\n  /** End index in the full text */\n  endIndex: number;\n  /** Style applied to this segment */\n  style: CharacterStyle;\n}\n\n/** Paragraph-level style properties */\nexport interface ParagraphStyle {\n  /** Paragraph spacing (before) in pixels */\n  paragraphSpacing: number;\n  /** First line indent in pixels */\n  paragraphIndent: number;\n  /** List type (ordered, unordered, or none) */\n  listType: ListType;\n  /** List indent level (0-based) */\n  listIndentLevel: number;\n  /** Custom list marker/bullet */\n  listMarker?: string;\n  /** List start number (for ordered lists) */\n  listStartNumber?: number;\n  /** Hanging punctuation enabled */\n  hangingPunctuation?: boolean;\n  /** Hanging list indent */\n  hangingListIndent?: number;\n}\n\n/** A paragraph within the text */\nexport interface TextParagraph {\n  /** The full text content of this paragraph */\n  text: string;\n  /** Start index in the full text */\n  startIndex: number;\n  /** End index in the full text */\n  endIndex: number;\n  /** Paragraph-level style */\n  paragraphStyle: ParagraphStyle;\n  /** Text segments within this paragraph */\n  segments: TextSegment[];\n}\n\n/** Complete parsed text node */\nexport interface ParsedTextNode {\n  /** Node ID */\n  nodeId: string;\n  /** Node name */\n  nodeName: string;\n  /** Full text content */\n  characters: string;\n  /** Text segments with character-level styling */\n  segments: TextSegment[];\n  /** Paragraphs with paragraph-level styling */\n  paragraphs: TextParagraph[];\n  /** Base/default style for the text node */\n  baseStyle: CharacterStyle;\n  /** Text alignment */\n  textAlignHorizontal: TextAlignHorizontal;\n  textAlignVertical: TextAlignVertical;\n  /** Auto-resize mode */\n  textAutoResize: TextAutoResize;\n  /** Truncation settings */\n  textTruncation: TextTruncation;\n  /** Maximum number of lines (0 = unlimited) */\n  maxLines: number;\n  /** Whether the text has mixed styles */\n  hasMixedStyles: boolean;\n  /** Whether the text contains lists */\n  hasLists: boolean;\n  /** Bounding box */\n  boundingBox?: {\n    x: number;\n    y: number;\n    width: number;\n    height: number;\n  };\n}\n\n/** Options for text parsing */\nexport interface TextParseOptions {\n  /** Include OpenType features in parsing */\n  includeOpenTypeFeatures?: boolean;\n  /** Parse hyperlinks */\n  parseHyperlinks?: boolean;\n  /** Parse list formatting */\n  parseListFormatting?: boolean;\n}\n\n// ============================================================================\n// Color Utilities\n// ============================================================================\n\n/**\n * Convert Figma color (0-1 range) to various CSS formats\n */\nexport function convertFigmaColor(color: FigmaColor, opacity?: number): ParsedColor {\n  const r = Math.round(color.r * 255);\n  const g = Math.round(color.g * 255);\n  const b = Math.round(color.b * 255);\n  const a = opacity !== undefined ? opacity : color.a;\n\n  // RGBA string\n  const rgba = a < 1\n    ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`\n    : `rgb(${r}, ${g}, ${b})`;\n\n  // Hex string\n  const toHex = (n: number) => n.toString(16).padStart(2, \"0\");\n  const hex = a < 1\n    ? `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`\n    : `#${toHex(r)}${toHex(g)}${toHex(b)}`;\n\n  // HSL conversion\n  const rNorm = r / 255;\n  const gNorm = g / 255;\n  const bNorm = b / 255;\n  const max = Math.max(rNorm, gNorm, bNorm);\n  const min = Math.min(rNorm, gNorm, bNorm);\n  const l = (max + min) / 2;\n  let h = 0;\n  let s = 0;\n\n  if (max !== min) {\n    const d = max - min;\n    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);\n\n    switch (max) {\n      case rNorm:\n        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;\n        break;\n      case gNorm:\n        h = ((bNorm - rNorm) / d + 2) / 6;\n        break;\n      case bNorm:\n        h = ((rNorm - gNorm) / d + 4) / 6;\n        break;\n    }\n  }\n\n  const hsl = a < 1\n    ? `hsla(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a.toFixed(3)})`\n    : `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;\n\n  return {\n    figma: color,\n    rgba,\n    hex,\n    hsl,\n  };\n}\n\n/**\n * Extract the primary color from fills array\n */\nfunction extractPrimaryColor(fills: TextFill[]): ParsedColor | undefined {\n  // Find the first visible solid fill\n  const solidFill = fills.find(\n    (fill): fill is SolidFill => fill.type === \"SOLID\" && fill.visible !== false\n  );\n\n  if (solidFill) {\n    return convertFigmaColor(solidFill.color, solidFill.opacity);\n  }\n\n  return undefined;\n}\n\n// ============================================================================\n// Style Extraction\n// ============================================================================\n\n/**\n * Normalize font weight from Figma style name or value\n */\nfunction normalizeFontWeight(weight: number | string | undefined): number {\n  if (typeof weight === \"number\") {\n    return weight;\n  }\n\n  if (typeof weight === \"string\") {\n    const weightMap: Record<string, number> = {\n      thin: 100,\n      hairline: 100,\n      extralight: 200,\n      ultralight: 200,\n      light: 300,\n      normal: 400,\n      regular: 400,\n      book: 400,\n      medium: 500,\n      semibold: 600,\n      demibold: 600,\n      bold: 700,\n      extrabold: 800,\n      ultrabold: 800,\n      black: 900,\n      heavy: 900,\n    };\n\n    const normalized = weight.toLowerCase().replace(/[\\s-_]/g, \"\");\n    return weightMap[normalized] ?? 400;\n  }\n\n  return 400;\n}\n\n/**\n * Parse line height from Figma format\n */\nfunction parseLineHeight(lineHeightValue: unknown, fontSize: number): LineHeightSetting {\n  if (lineHeightValue === undefined || lineHeightValue === null) {\n    return { value: fontSize * 1.5, unit: \"AUTO\" };\n  }\n\n  if (typeof lineHeightValue === \"number\") {\n    return { value: lineHeightValue, unit: \"PIXELS\" };\n  }\n\n  if (typeof lineHeightValue === \"object\" && lineHeightValue !== null) {\n    const lh = lineHeightValue as { unit?: string; value?: number };\n\n    if (lh.unit === \"PIXELS\" && lh.value !== undefined) {\n      return { value: lh.value, unit: \"PIXELS\" };\n    }\n\n    if (lh.unit === \"PERCENT\" && lh.value !== undefined) {\n      return { value: lh.value, unit: \"PERCENT\" };\n    }\n\n    if (lh.unit === \"AUTO\") {\n      return { value: fontSize * 1.5, unit: \"AUTO\" };\n    }\n  }\n\n  return { value: fontSize * 1.5, unit: \"AUTO\" };\n}\n\n/**\n * Parse letter spacing from Figma format\n */\nfunction parseLetterSpacing(letterSpacingValue: unknown, fontSize: number): LetterSpacingSetting {\n  if (letterSpacingValue === undefined || letterSpacingValue === null) {\n    return { value: 0, unit: \"PIXELS\" };\n  }\n\n  if (typeof letterSpacingValue === \"number\") {\n    return { value: letterSpacingValue, unit: \"PIXELS\" };\n  }\n\n  if (typeof letterSpacingValue === \"object\" && letterSpacingValue !== null) {\n    const ls = letterSpacingValue as { unit?: string; value?: number };\n\n    if (ls.unit === \"PIXELS\" && ls.value !== undefined) {\n      return { value: ls.value, unit: \"PIXELS\" };\n    }\n\n    if (ls.unit === \"PERCENT\" && ls.value !== undefined) {\n      return { value: ls.value, unit: \"PERCENT\" };\n    }\n  }\n\n  return { value: 0, unit: \"PIXELS\" };\n}\n\n/**\n * Parse fills from Figma node\n */\nfunction parseFills(fills: unknown[]): TextFill[] {\n  if (!Array.isArray(fills)) {\n    return [];\n  }\n\n  return fills\n    .filter((fill): fill is Record<string, unknown> => typeof fill === \"object\" && fill !== null)\n    .map((fill) => {\n      const type = fill.type as string;\n\n      if (type === \"SOLID\") {\n        return {\n          type: \"SOLID\" as const,\n          color: fill.color as FigmaColor,\n          opacity: fill.opacity as number | undefined,\n          visible: fill.visible as boolean | undefined,\n        };\n      }\n\n      if (type?.startsWith(\"GRADIENT_\")) {\n        return {\n          type: type as GradientFill[\"type\"],\n          gradientStops: (fill.gradientStops as GradientStop[]) || [],\n          gradientHandlePositions: fill.gradientHandlePositions as Array<{ x: number; y: number }> | undefined,\n          opacity: fill.opacity as number | undefined,\n          visible: fill.visible as boolean | undefined,\n        };\n      }\n\n      // Return a default solid fill for unknown types\n      return {\n        type: \"SOLID\" as const,\n        color: { r: 0, g: 0, b: 0, a: 1 },\n        visible: false,\n      };\n    })\n    .filter((fill) => fill.visible !== false);\n}\n\n/**\n * Parse OpenType features from Figma node\n */\nfunction parseOpenTypeFeatures(node: Record<string, unknown>): OpenTypeFeatures | undefined {\n  const features: OpenTypeFeatures = {};\n  let hasFeatures = false;\n\n  // Check various OpenType feature flags\n  if (node.opentypeFlags !== undefined) {\n    const flags = node.opentypeFlags as Record<string, boolean>;\n\n    if (flags.LIGA !== undefined) { features.liga = flags.LIGA; hasFeatures = true; }\n    if (flags.CALT !== undefined) { features.calt = flags.CALT; hasFeatures = true; }\n    if (flags.DLIG !== undefined) { features.dlig = flags.DLIG; hasFeatures = true; }\n    if (flags.ONUM !== undefined) { features.onum = flags.ONUM; hasFeatures = true; }\n    if (flags.LNUM !== undefined) { features.lnum = flags.LNUM; hasFeatures = true; }\n    if (flags.TNUM !== undefined) { features.tnum = flags.TNUM; hasFeatures = true; }\n    if (flags.PNUM !== undefined) { features.pnum = flags.PNUM; hasFeatures = true; }\n    if (flags.FRAC !== undefined) { features.frac = flags.FRAC; hasFeatures = true; }\n    if (flags.ORDN !== undefined) { features.ordn = flags.ORDN; hasFeatures = true; }\n    if (flags.SUPS !== undefined) { features.sups = flags.SUPS; hasFeatures = true; }\n    if (flags.SUBS !== undefined) { features.subs = flags.SUBS; hasFeatures = true; }\n    if (flags.SMCP !== undefined) { features.smcp = flags.SMCP; hasFeatures = true; }\n    if (flags.C2SC !== undefined) { features.c2sc = flags.C2SC; hasFeatures = true; }\n  }\n\n  return hasFeatures ? features : undefined;\n}\n\n/**\n * Extract character style from Figma style object\n */\nfunction extractCharacterStyle(\n  styleObj: Record<string, unknown>,\n  fills: unknown[],\n  options: TextParseOptions = {}\n): CharacterStyle {\n  const fontSize = (styleObj.fontSize as number) ?? 16;\n  const parsedFills = parseFills(fills);\n\n  const style: CharacterStyle = {\n    fontFamily: (styleObj.fontFamily as string) ?? \"Inter\",\n    fontWeight: normalizeFontWeight(styleObj.fontWeight as number | string | undefined),\n    fontSize,\n    italic: (styleObj.italic as boolean) ?? false,\n    lineHeight: parseLineHeight(styleObj.lineHeightPx ?? styleObj.lineHeight, fontSize),\n    letterSpacing: parseLetterSpacing(styleObj.letterSpacing, fontSize),\n    textCase: (styleObj.textCase as TextCase) ?? \"ORIGINAL\",\n    textDecoration: (styleObj.textDecoration as TextDecoration) ?? \"NONE\",\n    fills: parsedFills,\n    color: extractPrimaryColor(parsedFills),\n  };\n\n  if (options.includeOpenTypeFeatures) {\n    style.openTypeFeatures = parseOpenTypeFeatures(styleObj);\n  }\n\n  return style;\n}\n\n// ============================================================================\n// Paragraph & List Parsing\n// ============================================================================\n\n/**\n * Detect list type from line content\n */\nfunction detectListType(line: string): { type: ListType; marker?: string; indent: number } {\n  // Check for unordered list markers\n  const unorderedPatterns = [\n    /^(\\s*)([-•●○◦▪▸►])(\\s+)/,\n    /^(\\s*)(\\*)(\\s+)(?!\\*)/,\n  ];\n\n  for (const pattern of unorderedPatterns) {\n    const match = line.match(pattern);\n    if (match) {\n      return {\n        type: \"UNORDERED\",\n        marker: match[2],\n        indent: Math.floor(match[1].length / 2),\n      };\n    }\n  }\n\n  // Check for ordered list markers\n  const orderedPatterns = [\n    /^(\\s*)(\\d+)([.)])(\\s+)/,\n    /^(\\s*)([a-zA-Z])([.)])(\\s+)/,\n    /^(\\s*)([ivxlcdm]+)([.)])(\\s+)/i,\n  ];\n\n  for (const pattern of orderedPatterns) {\n    const match = line.match(pattern);\n    if (match) {\n      return {\n        type: \"ORDERED\",\n        marker: match[2] + match[3],\n        indent: Math.floor(match[1].length / 2),\n      };\n    }\n  }\n\n  return { type: \"NONE\", indent: 0 };\n}\n\n/**\n * Parse line indentation from Figma\n */\nfunction parseListInfo(\n  node: Record<string, unknown>,\n  lineIndex: number\n): { listType: ListType; indentLevel: number; startNumber?: number } {\n  // Check for Figma's native list properties\n  const lineTypes = node.lineTypes as string[] | undefined;\n  const lineIndentations = node.lineIndentations as number[] | undefined;\n\n  if (lineTypes && lineTypes[lineIndex]) {\n    const type = lineTypes[lineIndex];\n\n    return {\n      listType: type === \"ORDERED\" ? \"ORDERED\" : type === \"UNORDERED\" ? \"UNORDERED\" : \"NONE\",\n      indentLevel: lineIndentations?.[lineIndex] ?? 0,\n    };\n  }\n\n  return { listType: \"NONE\", indentLevel: 0 };\n}\n\n/**\n * Split text into paragraphs\n */\nfunction splitIntoParagraphs(text: string): Array<{ text: string; startIndex: number; endIndex: number }> {\n  const paragraphs: Array<{ text: string; startIndex: number; endIndex: number }> = [];\n  let currentIndex = 0;\n  const lines = text.split(/\\n/);\n\n  for (let i = 0; i < lines.length; i++) {\n    const line = lines[i];\n    const endIndex = currentIndex + line.length;\n\n    paragraphs.push({\n      text: line,\n      startIndex: currentIndex,\n      endIndex,\n    });\n\n    currentIndex = endIndex + 1; // +1 for the newline character\n  }\n\n  return paragraphs;\n}\n\n// ============================================================================\n// Main Parsing Functions\n// ============================================================================\n\n/**\n * Parse character style overrides and create text segments\n */\nfunction parseCharacterStyleOverrides(\n  node: Record<string, unknown>,\n  characters: string,\n  baseStyle: CharacterStyle,\n  options: TextParseOptions = {}\n): TextSegment[] {\n  const segments: TextSegment[] = [];\n\n  // Get style override data from the node\n  const characterStyleOverrides = node.characterStyleOverrides as number[] | undefined;\n  const styleOverrideTable = node.styleOverrideTable as Record<string, Record<string, unknown>> | undefined;\n\n  // If no overrides, return single segment with base style\n  if (!characterStyleOverrides || characterStyleOverrides.length === 0 || !styleOverrideTable) {\n    if (characters.length > 0) {\n      segments.push({\n        text: characters,\n        startIndex: 0,\n        endIndex: characters.length,\n        style: baseStyle,\n      });\n    }\n    return segments;\n  }\n\n  // Build segments from character style overrides\n  let currentStyleIndex = 0;\n  let segmentStart = 0;\n\n  for (let i = 0; i <= characters.length; i++) {\n    const styleIndex = characterStyleOverrides[i] ?? 0;\n\n    // When style changes or we reach the end\n    if (styleIndex !== currentStyleIndex || i === characters.length) {\n      // Create segment for the previous run\n      if (i > segmentStart) {\n        let segmentStyle = baseStyle;\n\n        // Apply style overrides if this isn't the base style (index 0)\n        if (currentStyleIndex !== 0 && styleOverrideTable[String(currentStyleIndex)]) {\n          const overrideObj = styleOverrideTable[String(currentStyleIndex)];\n\n          // Get fills - might be in the override or inherit from node\n          const overrideFills = (overrideObj.fills as unknown[]) ?? (node.fills as unknown[]) ?? [];\n\n          segmentStyle = {\n            ...baseStyle,\n            ...extractCharacterStyle(overrideObj, overrideFills, options),\n          };\n        }\n\n        segments.push({\n          text: characters.slice(segmentStart, i),\n          startIndex: segmentStart,\n          endIndex: i,\n          style: segmentStyle,\n        });\n      }\n\n      segmentStart = i;\n      currentStyleIndex = styleIndex;\n    }\n  }\n\n  return segments;\n}\n\n/**\n * Build paragraphs from segments\n */\nfunction buildParagraphs(\n  node: Record<string, unknown>,\n  characters: string,\n  segments: TextSegment[],\n  options: TextParseOptions = {}\n): TextParagraph[] {\n  const paragraphRanges = splitIntoParagraphs(characters);\n  const paragraphs: TextParagraph[] = [];\n\n  for (let paraIndex = 0; paraIndex < paragraphRanges.length; paraIndex++) {\n    const paraRange = paragraphRanges[paraIndex];\n\n    // Get paragraph-level settings\n    const paragraphSpacing = (node.paragraphSpacing as number) ?? 0;\n    const paragraphIndent = (node.paragraphIndent as number) ?? 0;\n\n    // Parse list information\n    let listType: ListType = \"NONE\";\n    let listIndentLevel = 0;\n    let listMarker: string | undefined;\n    let listStartNumber: number | undefined;\n\n    if (options.parseListFormatting !== false) {\n      const listInfo = parseListInfo(node, paraIndex);\n      listType = listInfo.listType;\n      listIndentLevel = listInfo.indentLevel;\n      listStartNumber = listInfo.startNumber;\n\n      // Also try to detect from content if Figma data isn't available\n      if (listType === \"NONE\") {\n        const detected = detectListType(paraRange.text);\n        listType = detected.type;\n        listMarker = detected.marker;\n        listIndentLevel = detected.indent;\n      }\n    }\n\n    // Find segments that belong to this paragraph\n    const paragraphSegments = segments\n      .filter((seg) => seg.startIndex < paraRange.endIndex && seg.endIndex > paraRange.startIndex)\n      .map((seg) => {\n        // Clip segment to paragraph boundaries\n        const clippedStart = Math.max(seg.startIndex, paraRange.startIndex);\n        const clippedEnd = Math.min(seg.endIndex, paraRange.endIndex);\n\n        return {\n          ...seg,\n          text: characters.slice(clippedStart, clippedEnd),\n          startIndex: clippedStart - paraRange.startIndex, // Relative to paragraph\n          endIndex: clippedEnd - paraRange.startIndex,\n        };\n      })\n      .filter((seg) => seg.text.length > 0);\n\n    paragraphs.push({\n      text: paraRange.text,\n      startIndex: paraRange.startIndex,\n      endIndex: paraRange.endIndex,\n      paragraphStyle: {\n        paragraphSpacing,\n        paragraphIndent,\n        listType,\n        listIndentLevel,\n        listMarker,\n        listStartNumber,\n        hangingPunctuation: (node.hangingPunctuation as boolean) ?? false,\n        hangingListIndent: node.hangingListIndent as number | undefined,\n      },\n      segments: paragraphSegments,\n    });\n  }\n\n  return paragraphs;\n}\n\n/**\n * Parse a Figma text node with full styling support\n */\nexport function parseTextNode(\n  node: FigmaNode,\n  options: TextParseOptions = {}\n): ParsedTextNode | null {\n  // Verify this is a text node\n  if (node.type !== \"TEXT\") {\n    return null;\n  }\n\n  const nodeData = node as unknown as Record<string, unknown>;\n  const characters = (nodeData.characters as string) ?? \"\";\n\n  if (characters.length === 0) {\n    return null;\n  }\n\n  // Extract base style from the node's style property\n  const styleObj = (nodeData.style as Record<string, unknown>) ?? {};\n  const fills = (nodeData.fills as unknown[]) ?? [];\n  const baseStyle = extractCharacterStyle(styleObj, fills, options);\n\n  // Parse character style overrides\n  const segments = parseCharacterStyleOverrides(nodeData, characters, baseStyle, options);\n\n  // Build paragraphs\n  const paragraphs = buildParagraphs(nodeData, characters, segments, options);\n\n  // Determine if there are mixed styles\n  const hasMixedStyles = segments.length > 1 ||\n    (segments.length === 1 && segments[0].text !== characters);\n\n  // Check for lists\n  const hasLists = paragraphs.some((p) => p.paragraphStyle.listType !== \"NONE\");\n\n  // Get bounding box\n  const boundingBox = nodeData.absoluteBoundingBox as {\n    x: number;\n    y: number;\n    width: number;\n    height: number;\n  } | undefined;\n\n  return {\n    nodeId: node.id,\n    nodeName: node.name,\n    characters,\n    segments,\n    paragraphs,\n    baseStyle,\n    textAlignHorizontal: (styleObj.textAlignHorizontal as TextAlignHorizontal) ?? \"LEFT\",\n    textAlignVertical: (styleObj.textAlignVertical as TextAlignVertical) ?? \"TOP\",\n    textAutoResize: (nodeData.textAutoResize as TextAutoResize) ?? \"NONE\",\n    textTruncation: (nodeData.textTruncation as TextTruncation) ?? \"DISABLED\",\n    maxLines: (nodeData.maxLines as number) ?? 0,\n    hasMixedStyles,\n    hasLists,\n    boundingBox,\n  };\n}\n\n/**\n * Recursively extract all text nodes from a Figma document tree\n */\nexport function extractAllTextNodes(\n  node: FigmaNode,\n  options: TextParseOptions = {}\n): ParsedTextNode[] {\n  const results: ParsedTextNode[] = [];\n\n  if (node.type === \"TEXT\") {\n    const parsed = parseTextNode(node, options);\n    if (parsed) {\n      results.push(parsed);\n    }\n  }\n\n  if (node.children) {\n    for (const child of node.children) {\n      results.push(...extractAllTextNodes(child, options));\n    }\n  }\n\n  return results;\n}\n\n// ============================================================================\n// CSS Generation\n// ============================================================================\n\n/**\n * Generate CSS for a character style\n */\nexport function generateCharacterStyleCSS(style: CharacterStyle): Record<string, string> {\n  const css: Record<string, string> = {\n    \"font-family\": `\"${style.fontFamily}\", system-ui, sans-serif`,\n    \"font-weight\": String(style.fontWeight),\n    \"font-size\": `${style.fontSize}px`,\n  };\n\n  // Italic\n  if (style.italic) {\n    css[\"font-style\"] = \"italic\";\n  }\n\n  // Line height\n  if (style.lineHeight.unit === \"PIXELS\") {\n    css[\"line-height\"] = `${style.lineHeight.value}px`;\n  } else if (style.lineHeight.unit === \"PERCENT\") {\n    css[\"line-height\"] = `${style.lineHeight.value}%`;\n  } else {\n    css[\"line-height\"] = \"normal\";\n  }\n\n  // Letter spacing\n  if (style.letterSpacing.value !== 0) {\n    if (style.letterSpacing.unit === \"PIXELS\") {\n      css[\"letter-spacing\"] = `${style.letterSpacing.value}px`;\n    } else {\n      css[\"letter-spacing\"] = `${(style.letterSpacing.value / 100).toFixed(3)}em`;\n    }\n  }\n\n  // Text case\n  switch (style.textCase) {\n    case \"UPPER\":\n      css[\"text-transform\"] = \"uppercase\";\n      break;\n    case \"LOWER\":\n      css[\"text-transform\"] = \"lowercase\";\n      break;\n    case \"TITLE\":\n      css[\"text-transform\"] = \"capitalize\";\n      break;\n    case \"SMALL_CAPS\":\n    case \"SMALL_CAPS_FORCED\":\n      css[\"font-variant-caps\"] = \"small-caps\";\n      break;\n  }\n\n  // Text decoration\n  switch (style.textDecoration) {\n    case \"UNDERLINE\":\n      css[\"text-decoration\"] = \"underline\";\n      break;\n    case \"STRIKETHROUGH\":\n      css[\"text-decoration\"] = \"line-through\";\n      break;\n  }\n\n  // Color\n  if (style.color) {\n    css[\"color\"] = style.color.rgba;\n  }\n\n  // OpenType features\n  if (style.openTypeFeatures) {\n    const features: string[] = [];\n\n    if (style.openTypeFeatures.liga) features.push('\"liga\"');\n    if (style.openTypeFeatures.calt) features.push('\"calt\"');\n    if (style.openTypeFeatures.dlig) features.push('\"dlig\"');\n    if (style.openTypeFeatures.onum) features.push('\"onum\"');\n    if (style.openTypeFeatures.lnum) features.push('\"lnum\"');\n    if (style.openTypeFeatures.tnum) features.push('\"tnum\"');\n    if (style.openTypeFeatures.pnum) features.push('\"pnum\"');\n    if (style.openTypeFeatures.frac) features.push('\"frac\"');\n    if (style.openTypeFeatures.ordn) features.push('\"ordn\"');\n    if (style.openTypeFeatures.sups) features.push('\"sups\"');\n    if (style.openTypeFeatures.subs) features.push('\"subs\"');\n    if (style.openTypeFeatures.smcp) features.push('\"smcp\"');\n    if (style.openTypeFeatures.c2sc) features.push('\"c2sc\"');\n\n    if (features.length > 0) {\n      css[\"font-feature-settings\"] = features.join(\", \");\n    }\n  }\n\n  return css;\n}\n\n/**\n * Generate CSS string from CSS object\n */\nexport function cssObjectToString(css: Record<string, string>, indent = \"  \"): string {\n  return Object.entries(css)\n    .map(([prop, value]) => `${indent}${prop}: ${value};`)\n    .join(\"\\n\");\n}\n\n/**\n * Generate Tailwind classes for a character style\n */\nexport function generateCharacterStyleTailwind(style: CharacterStyle): string[] {\n  const classes: string[] = [];\n\n  // Font weight\n  const weightMap: Record<number, string> = {\n    100: \"font-thin\",\n    200: \"font-extralight\",\n    300: \"font-light\",\n    400: \"font-normal\",\n    500: \"font-medium\",\n    600: \"font-semibold\",\n    700: \"font-bold\",\n    800: \"font-extrabold\",\n    900: \"font-black\",\n  };\n  classes.push(weightMap[style.fontWeight] ?? \"font-normal\");\n\n  // Font size (using closest Tailwind default)\n  const sizeMap: Record<number, string> = {\n    12: \"text-xs\",\n    14: \"text-sm\",\n    16: \"text-base\",\n    18: \"text-lg\",\n    20: \"text-xl\",\n    24: \"text-2xl\",\n    30: \"text-3xl\",\n    36: \"text-4xl\",\n    48: \"text-5xl\",\n    60: \"text-6xl\",\n    72: \"text-7xl\",\n    96: \"text-8xl\",\n    128: \"text-9xl\",\n  };\n\n  // Find closest size\n  const sizes = Object.keys(sizeMap).map(Number);\n  const closestSize = sizes.reduce((prev, curr) =>\n    Math.abs(curr - style.fontSize) < Math.abs(prev - style.fontSize) ? curr : prev\n  );\n  classes.push(sizeMap[closestSize] ?? `text-[${style.fontSize}px]`);\n\n  // Italic\n  if (style.italic) {\n    classes.push(\"italic\");\n  }\n\n  // Text transform\n  switch (style.textCase) {\n    case \"UPPER\":\n      classes.push(\"uppercase\");\n      break;\n    case \"LOWER\":\n      classes.push(\"lowercase\");\n      break;\n    case \"TITLE\":\n      classes.push(\"capitalize\");\n      break;\n  }\n\n  // Text decoration\n  switch (style.textDecoration) {\n    case \"UNDERLINE\":\n      classes.push(\"underline\");\n      break;\n    case \"STRIKETHROUGH\":\n      classes.push(\"line-through\");\n      break;\n  }\n\n  return classes;\n}\n\n/**\n * Generate CSS for paragraph styles\n */\nexport function generateParagraphStyleCSS(style: ParagraphStyle): Record<string, string> {\n  const css: Record<string, string> = {};\n\n  if (style.paragraphSpacing > 0) {\n    css[\"margin-bottom\"] = `${style.paragraphSpacing}px`;\n  }\n\n  if (style.paragraphIndent > 0) {\n    css[\"text-indent\"] = `${style.paragraphIndent}px`;\n  }\n\n  if (style.listType !== \"NONE\") {\n    css[\"list-style-type\"] = style.listType === \"ORDERED\" ? \"decimal\" : \"disc\";\n    css[\"padding-left\"] = `${(style.listIndentLevel + 1) * 24}px`;\n    css[\"display\"] = \"list-item\";\n  }\n\n  return css;\n}\n\n/**\n * Generate HTML for a parsed text node\n */\nexport function generateTextNodeHTML(\n  parsed: ParsedTextNode,\n  options: { useClasses?: boolean; classPrefix?: string } = {}\n): string {\n  const { useClasses = false, classPrefix = \"text\" } = options;\n\n  if (!parsed.hasMixedStyles && parsed.paragraphs.length <= 1) {\n    // Simple case: single style, single paragraph\n    const css = generateCharacterStyleCSS(parsed.baseStyle);\n    const styleAttr = useClasses ? \"\" : ` style=\"${cssObjectToString(css, \"\").replace(/\\n/g, \" \")}\"`;\n    return `<span${styleAttr}>${escapeHtml(parsed.characters)}</span>`;\n  }\n\n  // Complex case: multiple styles or paragraphs\n  const parts: string[] = [];\n\n  for (const para of parsed.paragraphs) {\n    const paraTag = para.paragraphStyle.listType !== \"NONE\" ? \"li\" : \"p\";\n    const paraCss = generateParagraphStyleCSS(para.paragraphStyle);\n    const paraStyleAttr = Object.keys(paraCss).length > 0\n      ? ` style=\"${cssObjectToString(paraCss, \"\").replace(/\\n/g, \" \")}\"`\n      : \"\";\n\n    const segmentHtml = para.segments.map((seg) => {\n      const css = generateCharacterStyleCSS(seg.style);\n      const styleAttr = useClasses ? \"\" : ` style=\"${cssObjectToString(css, \"\").replace(/\\n/g, \" \")}\"`;\n      return `<span${styleAttr}>${escapeHtml(seg.text)}</span>`;\n    }).join(\"\");\n\n    parts.push(`<${paraTag}${paraStyleAttr}>${segmentHtml}</${paraTag}>`);\n  }\n\n  // Wrap lists\n  const hasOrderedList = parsed.paragraphs.some((p) => p.paragraphStyle.listType === \"ORDERED\");\n  const hasUnorderedList = parsed.paragraphs.some((p) => p.paragraphStyle.listType === \"UNORDERED\");\n\n  if (hasOrderedList) {\n    return `<ol>${parts.join(\"\")}</ol>`;\n  } else if (hasUnorderedList) {\n    return `<ul>${parts.join(\"\")}</ul>`;\n  }\n\n  return parts.join(\"\\n\");\n}\n\n/**\n * Escape HTML special characters\n */\nfunction escapeHtml(text: string): string {\n  return text\n    .replace(/&/g, \"&amp;\")\n    .replace(/</g, \"&lt;\")\n    .replace(/>/g, \"&gt;\")\n    .replace(/\"/g, \"&quot;\")\n    .replace(/'/g, \"&#039;\");\n}\n\n// ============================================================================\n// Summary Generation\n// ============================================================================\n\n/**\n * Generate a summary of parsed text node styling\n */\nexport function generateTextNodeSummary(parsed: ParsedTextNode): string {\n  const lines: string[] = [\n    `## Text Node: ${parsed.nodeName}`,\n    \"\",\n    `**Content:** \"${parsed.characters.slice(0, 50)}${parsed.characters.length > 50 ? \"...\" : \"\"}\"`,\n    \"\",\n    \"### Base Style\",\n    `- Font: ${parsed.baseStyle.fontFamily} ${parsed.baseStyle.fontWeight}${parsed.baseStyle.italic ? \" italic\" : \"\"}`,\n    `- Size: ${parsed.baseStyle.fontSize}px`,\n    `- Color: ${parsed.baseStyle.color?.hex ?? \"inherit\"}`,\n    `- Line Height: ${parsed.baseStyle.lineHeight.unit === \"AUTO\" ? \"auto\" : `${parsed.baseStyle.lineHeight.value}${parsed.baseStyle.lineHeight.unit === \"PIXELS\" ? \"px\" : \"%\"}`}`,\n    `- Letter Spacing: ${parsed.baseStyle.letterSpacing.value}${parsed.baseStyle.letterSpacing.unit === \"PIXELS\" ? \"px\" : \"%\"}`,\n    `- Text Case: ${parsed.baseStyle.textCase}`,\n    `- Text Decoration: ${parsed.baseStyle.textDecoration}`,\n    \"\",\n    \"### Layout\",\n    `- Horizontal Align: ${parsed.textAlignHorizontal}`,\n    `- Vertical Align: ${parsed.textAlignVertical}`,\n    `- Auto Resize: ${parsed.textAutoResize}`,\n    `- Truncation: ${parsed.textTruncation}`,\n    `- Max Lines: ${parsed.maxLines === 0 ? \"unlimited\" : parsed.maxLines}`,\n  ];\n\n  if (parsed.hasMixedStyles) {\n    lines.push(\"\");\n    lines.push(\"### Style Variations\");\n    lines.push(`- Total segments: ${parsed.segments.length}`);\n\n    const uniqueFonts = new Set(parsed.segments.map((s) => s.style.fontFamily));\n    const uniqueSizes = new Set(parsed.segments.map((s) => s.style.fontSize));\n    const uniqueWeights = new Set(parsed.segments.map((s) => s.style.fontWeight));\n\n    if (uniqueFonts.size > 1) {\n      lines.push(`- Fonts used: ${[...uniqueFonts].join(\", \")}`);\n    }\n    if (uniqueSizes.size > 1) {\n      lines.push(`- Sizes used: ${[...uniqueSizes].map((s) => `${s}px`).join(\", \")}`);\n    }\n    if (uniqueWeights.size > 1) {\n      lines.push(`- Weights used: ${[...uniqueWeights].join(\", \")}`);\n    }\n  }\n\n  if (parsed.hasLists) {\n    lines.push(\"\");\n    lines.push(\"### List Formatting\");\n\n    for (const para of parsed.paragraphs) {\n      if (para.paragraphStyle.listType !== \"NONE\") {\n        lines.push(`- ${para.paragraphStyle.listType} list at indent level ${para.paragraphStyle.listIndentLevel}`);\n      }\n    }\n  }\n\n  return lines.join(\"\\n\");\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create text-node-parser.ts with comprehensive types for text parsing",
      "status": "completed",
      "activeForm": "Creating text-node-parser.ts with comprehensive types"
    },
    {
      "content": "Implement mixed styles parsing (characterStyleOverrides)",
      "status": "completed",
      "activeForm": "Implementing mixed styles parsing"
    },
    {
      "content": "Add color extraction from fills",
      "status": "completed",
      "activeForm": "Adding color extraction from fills"
    },
    {
      "content": "Implement paragraph settings and list formatting",
      "status": "completed",
      "activeForm": "Implementing paragraph settings and list formatting"
    },
    {
      "content": "Add CSS/Tailwind generation for parsed text nodes",
      "status": "completed",
      "activeForm": "Adding CSS/Tailwind generation"
    },
    {
      "content": "Create Playwright verification test",
      "status": "in_progress",
      "activeForm": "Creating Playwright verification test"
    }
  ]
}
Now let me create a Playwright test to verify the implementation. First, let me check if Playwright is installed and see the existing test structure:

🔧 Tool: Bash
Input: {
  "command": "cat package.json | grep -E \"(playwright|test|vitest)\"",
  "description": "Check for test dependencies"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.test.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.spec.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}
Playwright is installed. Let me check if there's a Playwright config and create a unit test for the text-node-parser:

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/*.config.* 2>/dev/null || echo \"No config files found in root\"",
  "description": "Check for config files"
}

🔧 Tool: Bash
Input: {
  "command": "cat /home/rainman/figma-to-code/figma-to-code/package.json | grep -A 5 '\"scripts\"'",
  "description": "Check package scripts"
}
Since Playwright is installed but there's no Playwright config, I'll create a simple test file that can be run with `npx playwright test`. The test will verify the text node parser functionality:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/text-node-parser.spec.ts",
  "content": "/**\n * Text Node Parser Verification Test\n *\n * This test verifies the text-node-parser.ts implementation\n * for parsing Figma text nodes with full styling support.\n */\n\nimport { test, expect } from \"@playwright/test\";\nimport {\n  parseTextNode,\n  extractAllTextNodes,\n  convertFigmaColor,\n  generateCharacterStyleCSS,\n  generateCharacterStyleTailwind,\n  generateTextNodeHTML,\n  generateTextNodeSummary,\n  type ParsedTextNode,\n  type CharacterStyle,\n} from \"../src/utils/text-node-parser\";\n\n// Mock Figma text node data\nconst mockSimpleTextNode = {\n  id: \"1:2\",\n  name: \"Simple Text\",\n  type: \"TEXT\",\n  characters: \"Hello World\",\n  style: {\n    fontFamily: \"Inter\",\n    fontWeight: 400,\n    fontSize: 16,\n    textAlignHorizontal: \"LEFT\",\n    textAlignVertical: \"TOP\",\n    lineHeightPx: 24,\n    letterSpacing: 0,\n    textCase: \"ORIGINAL\",\n    textDecoration: \"NONE\",\n  },\n  fills: [\n    {\n      type: \"SOLID\",\n      color: { r: 0, g: 0, b: 0, a: 1 },\n      visible: true,\n    },\n  ],\n  absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 24 },\n};\n\nconst mockMixedStyleTextNode = {\n  id: \"1:3\",\n  name: \"Mixed Style Text\",\n  type: \"TEXT\",\n  characters: \"Bold and italic text\",\n  style: {\n    fontFamily: \"Inter\",\n    fontWeight: 400,\n    fontSize: 16,\n    textAlignHorizontal: \"LEFT\",\n    textAlignVertical: \"TOP\",\n    lineHeightPx: 24,\n    letterSpacing: 0,\n    textCase: \"ORIGINAL\",\n    textDecoration: \"NONE\",\n  },\n  fills: [\n    {\n      type: \"SOLID\",\n      color: { r: 0, g: 0, b: 0, a: 1 },\n      visible: true,\n    },\n  ],\n  characterStyleOverrides: [\n    1, 1, 1, 1, // \"Bold\"\n    0, // \" \"\n    2, 2, 2, 2, 2, 2, // \"and italic\"\n    0, // \" \"\n    0, 0, 0, 0, // \"text\"\n  ],\n  styleOverrideTable: {\n    \"1\": {\n      fontWeight: 700,\n    },\n    \"2\": {\n      fontWeight: 400,\n      italic: true,\n    },\n  },\n  absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 24 },\n};\n\nconst mockColoredTextNode = {\n  id: \"1:4\",\n  name: \"Colored Text\",\n  type: \"TEXT\",\n  characters: \"Red text\",\n  style: {\n    fontFamily: \"Roboto\",\n    fontWeight: 500,\n    fontSize: 18,\n    textAlignHorizontal: \"CENTER\",\n    textAlignVertical: \"CENTER\",\n    lineHeightPx: 27,\n    letterSpacing: 0.5,\n    textCase: \"UPPER\",\n    textDecoration: \"UNDERLINE\",\n  },\n  fills: [\n    {\n      type: \"SOLID\",\n      color: { r: 1, g: 0, b: 0, a: 1 },\n      visible: true,\n    },\n  ],\n  absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 27 },\n};\n\nconst mockListTextNode = {\n  id: \"1:5\",\n  name: \"List Text\",\n  type: \"TEXT\",\n  characters: \"• First item\\n• Second item\\n• Third item\",\n  style: {\n    fontFamily: \"Inter\",\n    fontWeight: 400,\n    fontSize: 14,\n    textAlignHorizontal: \"LEFT\",\n    textAlignVertical: \"TOP\",\n    lineHeightPx: 21,\n    letterSpacing: 0,\n    textCase: \"ORIGINAL\",\n    textDecoration: \"NONE\",\n  },\n  fills: [\n    {\n      type: \"SOLID\",\n      color: { r: 0.2, g: 0.2, b: 0.2, a: 1 },\n      visible: true,\n    },\n  ],\n  lineTypes: [\"UNORDERED\", \"UNORDERED\", \"UNORDERED\"],\n  lineIndentations: [0, 0, 0],\n  absoluteBoundingBox: { x: 0, y: 0, width: 150, height: 63 },\n};\n\nconst mockParentNode = {\n  id: \"1:1\",\n  name: \"Frame\",\n  type: \"FRAME\",\n  children: [mockSimpleTextNode, mockMixedStyleTextNode, mockColoredTextNode],\n};\n\n// Test suite\ntest.describe(\"Text Node Parser\", () => {\n  test.describe(\"Color Conversion\", () => {\n    test(\"converts Figma color to CSS formats\", () => {\n      const figmaColor = { r: 1, g: 0, b: 0, a: 1 };\n      const result = convertFigmaColor(figmaColor);\n\n      expect(result.rgba).toBe(\"rgb(255, 0, 0)\");\n      expect(result.hex).toBe(\"#ff0000\");\n      expect(result.hsl).toBe(\"hsl(0, 100%, 50%)\");\n    });\n\n    test(\"handles alpha transparency\", () => {\n      const figmaColor = { r: 0, g: 0.5, b: 1, a: 0.5 };\n      const result = convertFigmaColor(figmaColor);\n\n      expect(result.rgba).toBe(\"rgba(0, 128, 255, 0.500)\");\n      expect(result.hex).toBe(\"#0080ff80\");\n      expect(result.hsl).toContain(\"hsla(\");\n    });\n\n    test(\"handles opacity override\", () => {\n      const figmaColor = { r: 1, g: 1, b: 1, a: 1 };\n      const result = convertFigmaColor(figmaColor, 0.75);\n\n      expect(result.rgba).toBe(\"rgba(255, 255, 255, 0.750)\");\n    });\n  });\n\n  test.describe(\"Simple Text Node Parsing\", () => {\n    test(\"parses basic text node properties\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n\n      expect(result).not.toBeNull();\n      expect(result!.nodeId).toBe(\"1:2\");\n      expect(result!.nodeName).toBe(\"Simple Text\");\n      expect(result!.characters).toBe(\"Hello World\");\n    });\n\n    test(\"extracts base style correctly\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n\n      expect(result!.baseStyle.fontFamily).toBe(\"Inter\");\n      expect(result!.baseStyle.fontWeight).toBe(400);\n      expect(result!.baseStyle.fontSize).toBe(16);\n    });\n\n    test(\"extracts text alignment\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n\n      expect(result!.textAlignHorizontal).toBe(\"LEFT\");\n      expect(result!.textAlignVertical).toBe(\"TOP\");\n    });\n\n    test(\"extracts color from fills\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n\n      expect(result!.baseStyle.color).toBeDefined();\n      expect(result!.baseStyle.color!.hex).toBe(\"#000000\");\n    });\n\n    test(\"creates single segment for simple text\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n\n      expect(result!.segments.length).toBe(1);\n      expect(result!.segments[0].text).toBe(\"Hello World\");\n      expect(result!.hasMixedStyles).toBe(false);\n    });\n\n    test(\"extracts bounding box\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n\n      expect(result!.boundingBox).toEqual({\n        x: 0,\n        y: 0,\n        width: 100,\n        height: 24,\n      });\n    });\n  });\n\n  test.describe(\"Mixed Style Text Parsing\", () => {\n    test(\"parses character style overrides\", () => {\n      const result = parseTextNode(mockMixedStyleTextNode as any);\n\n      expect(result).not.toBeNull();\n      expect(result!.hasMixedStyles).toBe(true);\n      expect(result!.segments.length).toBeGreaterThan(1);\n    });\n\n    test(\"identifies bold text segment\", () => {\n      const result = parseTextNode(mockMixedStyleTextNode as any);\n      const boldSegment = result!.segments.find((s) => s.style.fontWeight === 700);\n\n      expect(boldSegment).toBeDefined();\n      expect(boldSegment!.text).toBe(\"Bold\");\n    });\n\n    test(\"identifies italic text segment\", () => {\n      const result = parseTextNode(mockMixedStyleTextNode as any);\n      const italicSegment = result!.segments.find((s) => s.style.italic === true);\n\n      expect(italicSegment).toBeDefined();\n    });\n\n    test(\"preserves segment indices\", () => {\n      const result = parseTextNode(mockMixedStyleTextNode as any);\n\n      // Verify segments cover the entire text\n      const totalLength = result!.segments.reduce(\n        (sum, seg) => sum + seg.text.length,\n        0\n      );\n      expect(totalLength).toBe(result!.characters.length);\n    });\n  });\n\n  test.describe(\"Styled Text Node Parsing\", () => {\n    test(\"extracts text transformation\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n\n      expect(result!.baseStyle.textCase).toBe(\"UPPER\");\n    });\n\n    test(\"extracts text decoration\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n\n      expect(result!.baseStyle.textDecoration).toBe(\"UNDERLINE\");\n    });\n\n    test(\"extracts letter spacing\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n\n      expect(result!.baseStyle.letterSpacing.value).toBe(0.5);\n    });\n\n    test(\"extracts colored fill\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n\n      expect(result!.baseStyle.color!.hex).toBe(\"#ff0000\");\n    });\n  });\n\n  test.describe(\"List Text Parsing\", () => {\n    test(\"detects list formatting\", () => {\n      const result = parseTextNode(mockListTextNode as any, {\n        parseListFormatting: true,\n      });\n\n      expect(result).not.toBeNull();\n      expect(result!.hasLists).toBe(true);\n    });\n\n    test(\"parses multiple paragraphs\", () => {\n      const result = parseTextNode(mockListTextNode as any);\n\n      expect(result!.paragraphs.length).toBe(3);\n    });\n\n    test(\"identifies unordered list type\", () => {\n      const result = parseTextNode(mockListTextNode as any, {\n        parseListFormatting: true,\n      });\n\n      const listParagraph = result!.paragraphs.find(\n        (p) => p.paragraphStyle.listType === \"UNORDERED\"\n      );\n      expect(listParagraph).toBeDefined();\n    });\n  });\n\n  test.describe(\"Recursive Text Node Extraction\", () => {\n    test(\"extracts all text nodes from tree\", () => {\n      const results = extractAllTextNodes(mockParentNode as any);\n\n      expect(results.length).toBe(3);\n    });\n\n    test(\"returns empty array for non-text nodes without children\", () => {\n      const nonTextNode = { id: \"1:0\", name: \"Rectangle\", type: \"RECTANGLE\" };\n      const results = extractAllTextNodes(nonTextNode as any);\n\n      expect(results.length).toBe(0);\n    });\n  });\n\n  test.describe(\"CSS Generation\", () => {\n    test(\"generates correct CSS properties\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n      const css = generateCharacterStyleCSS(result!.baseStyle);\n\n      expect(css[\"font-family\"]).toContain(\"Roboto\");\n      expect(css[\"font-weight\"]).toBe(\"500\");\n      expect(css[\"font-size\"]).toBe(\"18px\");\n      expect(css[\"text-transform\"]).toBe(\"uppercase\");\n      expect(css[\"text-decoration\"]).toBe(\"underline\");\n      expect(css[\"color\"]).toBe(\"rgb(255, 0, 0)\");\n    });\n\n    test(\"generates line height CSS\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n      const css = generateCharacterStyleCSS(result!.baseStyle);\n\n      expect(css[\"line-height\"]).toBe(\"24px\");\n    });\n\n    test(\"generates letter spacing CSS\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n      const css = generateCharacterStyleCSS(result!.baseStyle);\n\n      expect(css[\"letter-spacing\"]).toBe(\"0.5px\");\n    });\n  });\n\n  test.describe(\"Tailwind Generation\", () => {\n    test(\"generates Tailwind weight classes\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n      const classes = generateCharacterStyleTailwind(result!.baseStyle);\n\n      expect(classes).toContain(\"font-medium\");\n    });\n\n    test(\"generates Tailwind text transform classes\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n      const classes = generateCharacterStyleTailwind(result!.baseStyle);\n\n      expect(classes).toContain(\"uppercase\");\n    });\n\n    test(\"generates Tailwind text decoration classes\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n      const classes = generateCharacterStyleTailwind(result!.baseStyle);\n\n      expect(classes).toContain(\"underline\");\n    });\n  });\n\n  test.describe(\"HTML Generation\", () => {\n    test(\"generates HTML for simple text\", () => {\n      const result = parseTextNode(mockSimpleTextNode as any);\n      const html = generateTextNodeHTML(result!);\n\n      expect(html).toContain(\"Hello World\");\n      expect(html).toContain(\"<span\");\n    });\n\n    test(\"escapes HTML special characters\", () => {\n      const nodeWithSpecialChars = {\n        ...mockSimpleTextNode,\n        characters: '<script>alert(\"xss\")</script>',\n      };\n      const result = parseTextNode(nodeWithSpecialChars as any);\n      const html = generateTextNodeHTML(result!);\n\n      expect(html).not.toContain(\"<script>\");\n      expect(html).toContain(\"&lt;script&gt;\");\n    });\n  });\n\n  test.describe(\"Summary Generation\", () => {\n    test(\"generates text node summary\", () => {\n      const result = parseTextNode(mockColoredTextNode as any);\n      const summary = generateTextNodeSummary(result!);\n\n      expect(summary).toContain(\"Colored Text\");\n      expect(summary).toContain(\"Roboto\");\n      expect(summary).toContain(\"18px\");\n      expect(summary).toContain(\"UPPER\");\n      expect(summary).toContain(\"UNDERLINE\");\n    });\n\n    test(\"includes mixed styles info when applicable\", () => {\n      const result = parseTextNode(mockMixedStyleTextNode as any);\n      const summary = generateTextNodeSummary(result!);\n\n      expect(summary).toContain(\"Style Variations\");\n      expect(summary).toContain(\"segments\");\n    });\n  });\n\n  test.describe(\"Edge Cases\", () => {\n    test(\"returns null for non-text nodes\", () => {\n      const nonTextNode = { id: \"1:0\", name: \"Rectangle\", type: \"RECTANGLE\" };\n      const result = parseTextNode(nonTextNode as any);\n\n      expect(result).toBeNull();\n    });\n\n    test(\"returns null for empty text\", () => {\n      const emptyTextNode = { ...mockSimpleTextNode, characters: \"\" };\n      const result = parseTextNode(emptyTextNode as any);\n\n      expect(result).toBeNull();\n    });\n\n    test(\"handles missing style object gracefully\", () => {\n      const nodeWithoutStyle = {\n        id: \"1:6\",\n        name: \"No Style\",\n        type: \"TEXT\",\n        characters: \"Test\",\n        fills: [],\n      };\n      const result = parseTextNode(nodeWithoutStyle as any);\n\n      expect(result).not.toBeNull();\n      expect(result!.baseStyle.fontFamily).toBe(\"Inter\"); // Default\n      expect(result!.baseStyle.fontWeight).toBe(400); // Default\n    });\n\n    test(\"handles missing fills gracefully\", () => {\n      const nodeWithoutFills = {\n        ...mockSimpleTextNode,\n        fills: undefined,\n      };\n      const result = parseTextNode(nodeWithoutFills as any);\n\n      expect(result).not.toBeNull();\n      expect(result!.baseStyle.color).toBeUndefined();\n    });\n  });\n});\n"
}
Now let me create a playwright config file and run the tests:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/playwright.config.ts",
  "content": "import { defineConfig } from \"@playwright/test\";\n\nexport default defineConfig({\n  testDir: \"./tests\",\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 1 : undefined,\n  reporter: \"html\",\n  use: {\n    trace: \"on-first-retry\",\n  },\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/text-node-parser.spec.ts --reporter=list 2>&1",
  "description": "Run Playwright tests",
  "timeout": 120000
}
All 36 tests pass. Now let me clean up by removing the test files as requested:

🔧 Tool: Bash
Input: {
  "command": "rm /home/rainman/figma-to-code/figma-to-code/tests/text-node-parser.spec.ts && rm /home/rainman/figma-to-code/figma-to-code/playwright.config.ts && rmdir /home/rainman/figma-to-code/figma-to-code/tests 2>/dev/null || echo \"Tests cleaned up (tests directory may have other files)\"",
  "description": "Clean up verification test files"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create text-node-parser.ts with comprehensive types for text parsing",
      "status": "completed",
      "activeForm": "Creating text-node-parser.ts with comprehensive types"
    },
    {
      "content": "Implement mixed styles parsing (characterStyleOverrides)",
      "status": "completed",
      "activeForm": "Implementing mixed styles parsing"
    },
    {
      "content": "Add color extraction from fills",
      "status": "completed",
      "activeForm": "Adding color extraction from fills"
    },
    {
      "content": "Implement paragraph settings and list formatting",
      "status": "completed",
      "activeForm": "Implementing paragraph settings and list formatting"
    },
    {
      "content": "Add CSS/Tailwind generation for parsed text nodes",
      "status": "completed",
      "activeForm": "Adding CSS/Tailwind generation"
    },
    {
      "content": "Create Playwright verification test",
      "status": "completed",
      "activeForm": "Creating Playwright verification test"
    }
  ]
}
<summary>
## Summary: Parse text nodes with full styling

### Changes Implemented
- Created comprehensive text node parser (`src/utils/text-node-parser.ts`) with ~750 lines of production code
- Full text styling extraction: font family, size, weight, color, alignment, decoration (underline/strikethrough), text transformation (uppercase/lowercase/capitalize/small-caps)
- Mixed styles support using Figma's `characterStyleOverrides` and `styleOverrideTable` for handling multiple styles within a single text block
- Color extraction from fills with conversion to multiple CSS formats (rgba, hex, hsl)
- Paragraph settings: spacing, indentation, hanging punctuation
- List formatting: ordered/unordered list detection, indent levels, list markers
- Line height and letter spacing parsing with pixel/percent unit support
- OpenType features support (ligatures, tabular figures, fractions, etc.)
- CSS generation for character and paragraph styles
- Tailwind class generation for common style properties
- HTML generation with proper escaping and segment handling
- Summary generation for debugging and documentation

### Files Modified
- `src/utils/text-node-parser.ts` (new file)

### Key Types Exported
- `ParsedTextNode` - Complete parsed text node with all styling
- `CharacterStyle` - Character-level styling properties
- `TextSegment` - Text segment with consistent styling
- `TextParagraph` - Paragraph with paragraph-level styling
- `ParsedColor` - Color in multiple formats (figma, rgba, hex, hsl)

### Key Functions Exported
- `parseTextNode()` - Parse a single Figma text node
- `extractAllTextNodes()` - Recursively extract all text nodes from a tree
- `convertFigmaColor()` - Convert Figma color to CSS formats
- `generateCharacterStyleCSS()` - Generate CSS for character styles
- `generateCharacterStyleTailwind()` - Generate Tailwind classes
- `generateTextNodeHTML()` - Generate HTML output
- `generateTextNodeSummary()` - Generate human-readable summary

### Notes for Developer
- The parser handles edge cases gracefully (missing styles, empty text, non-text nodes)
- Works alongside the existing `typography-extractor.ts` for design system extraction
- This parser focuses on individual text nodes while typography-extractor focuses on system-wide typography analysis
- List detection works both via Figma's native list properties (`lineTypes`, `lineIndentations`) and content-based detection (bullet/number patterns)

### Verification Status
- Created comprehensive Playwright test suite with 36 tests covering all functionality
- All 36 tests passed successfully
- Tests covered: color conversion, simple text parsing, mixed styles, styled text, list parsing, recursive extraction, CSS generation, Tailwind generation, HTML generation, summary generation, and edge cases
- Test files cleaned up after successful verification
</summary>