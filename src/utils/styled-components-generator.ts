/**
 * Styled-Components & Emotion CSS-in-JS Generator
 *
 * Generates styled-components and Emotion code with template literals from Figma design properties.
 * Supports:
 * - Dynamic props-based styling
 * - Theme integration with ThemeProvider
 * - Style composition (styled.extend, css helper)
 * - Full TypeScript type generation
 * - Responsive design support
 * - Dark mode theming
 *
 * @see https://styled-components.com/docs
 * @see https://emotion.sh/docs/introduction
 */

import type { FigmaColor, FigmaNode } from "./figma-api";
import {
  figmaColorToHex,
  figmaColorToRgba,
  figmaColorToHsl,
} from "./figma-gradient";
import type { FigmaDesignProperties, DesignToken, DesignTokenType } from "./tailwind-generator";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * CSS-in-JS library to target
 */
export type CSSInJSLibrary = "styled-components" | "emotion";

/**
 * Color format options
 */
export type ColorFormat = "hex" | "rgb" | "hsl";

/**
 * Breakpoint configuration for responsive styles
 */
export interface BreakpointConfig {
  name: string;
  minWidth: number;
}

/**
 * Theme token types
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  [key: string]: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  [key: string]: string;
}

export interface ThemeFontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
  [key: string]: string;
}

export interface ThemeFontWeights {
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  [key: string]: number;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  [key: string]: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  [key: string]: string;
}

export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  [key: string]: string;
}

export interface ThemeZIndex {
  dropdown: number;
  modal: number;
  tooltip: number;
  [key: string]: number;
}

/**
 * Complete theme configuration
 */
export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  fontSizes: ThemeFontSizes;
  fontWeights: ThemeFontWeights;
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
    [key: string]: string;
  };
  lineHeights: {
    tight: string;
    normal: string;
    relaxed: string;
    [key: string]: string;
  };
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
  zIndex: ThemeZIndex;
  transitions: {
    fast: string;
    normal: string;
    slow: string;
    [key: string]: string;
  };
}

/**
 * Dark theme overrides (typically just colors)
 */
export interface DarkTheme {
  colors: Partial<ThemeColors>;
}

/**
 * Dynamic prop definition for styled components
 */
export interface DynamicProp {
  name: string;
  type: string;
  defaultValue?: string;
  cssProperty: string;
  themeKey?: keyof Theme;
  transform?: (value: string) => string;
}

/**
 * Styled component definition
 */
export interface StyledComponentDefinition {
  name: string;
  baseElement: string;
  styles: string;
  dynamicProps: DynamicProp[];
  variants?: Record<string, Record<string, string>>;
  responsiveStyles?: Partial<Record<keyof ThemeBreakpoints, string>>;
}

/**
 * Generation options
 */
export interface StyledGenerationOptions {
  /** Target library */
  library: CSSInJSLibrary;
  /** Whether to use TypeScript */
  useTypeScript: boolean;
  /** Whether to generate theme */
  generateTheme: boolean;
  /** Whether to generate dark theme */
  generateDarkTheme: boolean;
  /** Whether to use CSS prop (emotion) */
  useCSSProp: boolean;
  /** Whether to generate Server Style Sheet (styled-components) */
  useServerStyleSheet: boolean;
  /** Whether to use SSR (emotion) */
  useSSR: boolean;
  /** Color format */
  colorFormat: ColorFormat;
  /** Custom component prefix */
  componentPrefix: string;
  /** Whether to include helper utilities */
  includeHelpers: boolean;
  /** Breakpoint configuration */
  breakpoints: BreakpointConfig[];
}

/**
 * Generated output
 */
export interface StyledGenerationResult {
  /** Styled component code */
  component: string;
  /** TypeScript types */
  types: string;
  /** Theme definition */
  theme: string;
  /** Theme provider setup */
  themeProvider: string;
  /** Helper utilities (css, keyframes, etc.) */
  helpers: string;
  /** Warnings */
  warnings: string[];
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_BREAKPOINTS: BreakpointConfig[] = [
  { name: "sm", minWidth: 640 },
  { name: "md", minWidth: 768 },
  { name: "lg", minWidth: 1024 },
  { name: "xl", minWidth: 1280 },
  { name: "2xl", minWidth: 1536 },
];

const DEFAULT_OPTIONS: StyledGenerationOptions = {
  library: "styled-components",
  useTypeScript: true,
  generateTheme: true,
  generateDarkTheme: true,
  useCSSProp: false,
  useServerStyleSheet: true,
  useSSR: true,
  colorFormat: "hex",
  componentPrefix: "",
  includeHelpers: true,
  breakpoints: DEFAULT_BREAKPOINTS,
};

const DEFAULT_LIGHT_THEME: Theme = {
  colors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    border: "#e2e8f0",
    error: "#ef4444",
    warning: "#f59e0b",
    success: "#22c55e",
    info: "#0ea5e9",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },
  lineHeights: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  zIndex: {
    dropdown: 1000,
    modal: 1100,
    tooltip: 1200,
  },
  transitions: {
    fast: "150ms ease-in-out",
    normal: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },
};

const DEFAULT_DARK_THEME: DarkTheme = {
  colors: {
    primary: "#60a5fa",
    secondary: "#94a3b8",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
    textMuted: "#94a3b8",
    border: "#334155",
    error: "#f87171",
    warning: "#fbbf24",
    success: "#4ade80",
    info: "#38bdf8",
  },
};

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Convert Figma color to specified format
 */
export function formatColor(
  color: FigmaColor,
  format: ColorFormat,
  opacity: number = 1
): string {
  switch (format) {
    case "hex":
      return figmaColorToHex(color, opacity);
    case "rgb":
      return figmaColorToRgba(color, opacity);
    case "hsl":
      return figmaColorToHsl(color, opacity);
    default:
      return figmaColorToHex(color, opacity);
  }
}

// ============================================================================
// CSS Property Generators
// ============================================================================

/**
 * Generate CSS property value for layout
 */
function generateLayoutCSS(props: FigmaDesignProperties): string[] {
  const cssProps: string[] = [];

  if (props.layoutMode === "HORIZONTAL" || props.layoutMode === "VERTICAL") {
    cssProps.push("display: flex;");
    if (props.layoutMode === "VERTICAL") {
      cssProps.push("flex-direction: column;");
    }

    // Justify content (primary axis)
    if (props.primaryAxisAlignItems) {
      const justifyMap: Record<string, string> = {
        MIN: "flex-start",
        CENTER: "center",
        MAX: "flex-end",
        SPACE_BETWEEN: "space-between",
      };
      if (justifyMap[props.primaryAxisAlignItems]) {
        cssProps.push(`justify-content: ${justifyMap[props.primaryAxisAlignItems]};`);
      }
    }

    // Align items (cross axis)
    if (props.counterAxisAlignItems) {
      const alignMap: Record<string, string> = {
        MIN: "flex-start",
        CENTER: "center",
        MAX: "flex-end",
        BASELINE: "baseline",
      };
      if (alignMap[props.counterAxisAlignItems]) {
        cssProps.push(`align-items: ${alignMap[props.counterAxisAlignItems]};`);
      }
    }

    // Flex wrap
    if (props.layoutWrap === "WRAP") {
      cssProps.push("flex-wrap: wrap;");
    }

    // Gap
    if (props.gap !== undefined && props.gap > 0) {
      cssProps.push(`gap: ${props.gap}px;`);
    }
  }

  // Flex grow
  if (props.layoutGrow === 1) {
    cssProps.push("flex: 1;");
  } else if (props.layoutGrow === 0) {
    cssProps.push("flex: none;");
  }

  // Sizing
  if (props.layoutSizingHorizontal === "FILL") {
    cssProps.push("width: 100%;");
  } else if (props.layoutSizingHorizontal === "HUG") {
    cssProps.push("width: fit-content;");
  }

  if (props.layoutSizingVertical === "FILL") {
    cssProps.push("height: 100%;");
  } else if (props.layoutSizingVertical === "HUG") {
    cssProps.push("height: fit-content;");
  }

  return cssProps;
}

/**
 * Generate CSS for dimensions
 */
function generateDimensionCSS(props: FigmaDesignProperties): string[] {
  const cssProps: string[] = [];

  if (props.width !== undefined && props.layoutSizingHorizontal === "FIXED") {
    cssProps.push(`width: ${props.width}px;`);
  }

  if (props.height !== undefined && props.layoutSizingVertical === "FIXED") {
    cssProps.push(`height: ${props.height}px;`);
  }

  if (props.minWidth !== undefined) {
    cssProps.push(`min-width: ${props.minWidth}px;`);
  }
  if (props.maxWidth !== undefined) {
    cssProps.push(`max-width: ${props.maxWidth}px;`);
  }
  if (props.minHeight !== undefined) {
    cssProps.push(`min-height: ${props.minHeight}px;`);
  }
  if (props.maxHeight !== undefined) {
    cssProps.push(`max-height: ${props.maxHeight}px;`);
  }

  return cssProps;
}

/**
 * Generate CSS for padding
 */
function generatePaddingCSS(props: FigmaDesignProperties): string[] {
  const cssProps: string[] = [];

  if (props.padding) {
    const { top, right, bottom, left } = props.padding;

    // Check for uniform padding
    if (top === right && right === bottom && bottom === left && top > 0) {
      cssProps.push(`padding: ${top}px;`);
    } else if (top === bottom && left === right) {
      // Symmetric padding
      if (top > 0 || left > 0) {
        cssProps.push(`padding: ${top}px ${left}px;`);
      }
    } else {
      // Individual paddings
      if (top > 0) cssProps.push(`padding-top: ${top}px;`);
      if (right > 0) cssProps.push(`padding-right: ${right}px;`);
      if (bottom > 0) cssProps.push(`padding-bottom: ${bottom}px;`);
      if (left > 0) cssProps.push(`padding-left: ${left}px;`);
    }
  }

  return cssProps;
}

/**
 * Generate CSS for typography
 */
function generateTypographyCSS(
  props: FigmaDesignProperties,
  options: StyledGenerationOptions
): string[] {
  const cssProps: string[] = [];

  if (props.fontSize) {
    cssProps.push(`font-size: ${props.fontSize}px;`);
  }

  if (props.fontWeight) {
    cssProps.push(`font-weight: ${props.fontWeight};`);
  }

  if (props.fontFamily) {
    cssProps.push(`font-family: "${props.fontFamily}", sans-serif;`);
  }

  if (props.lineHeight !== undefined && props.lineHeight !== "auto") {
    if (props.lineHeightUnit === "PIXELS") {
      cssProps.push(`line-height: ${props.lineHeight}px;`);
    } else {
      cssProps.push(`line-height: ${props.lineHeight / 100};`);
    }
  }

  if (props.letterSpacing !== undefined) {
    if (props.letterSpacingUnit === "PERCENT") {
      cssProps.push(`letter-spacing: ${props.letterSpacing / 100}em;`);
    } else {
      cssProps.push(`letter-spacing: ${props.letterSpacing}px;`);
    }
  }

  // Text case
  if (props.textCase) {
    switch (props.textCase) {
      case "UPPER":
        cssProps.push("text-transform: uppercase;");
        break;
      case "LOWER":
        cssProps.push("text-transform: lowercase;");
        break;
      case "TITLE":
        cssProps.push("text-transform: capitalize;");
        break;
    }
  }

  // Text decoration
  if (props.textDecoration) {
    switch (props.textDecoration) {
      case "UNDERLINE":
        cssProps.push("text-decoration: underline;");
        break;
      case "STRIKETHROUGH":
        cssProps.push("text-decoration: line-through;");
        break;
    }
  }

  // Text alignment
  if (props.textAlignHorizontal) {
    switch (props.textAlignHorizontal) {
      case "LEFT":
        cssProps.push("text-align: left;");
        break;
      case "CENTER":
        cssProps.push("text-align: center;");
        break;
      case "RIGHT":
        cssProps.push("text-align: right;");
        break;
      case "JUSTIFIED":
        cssProps.push("text-align: justify;");
        break;
    }
  }

  return cssProps;
}

/**
 * Generate CSS for colors
 */
function generateColorCSS(
  props: FigmaDesignProperties,
  options: StyledGenerationOptions
): string[] {
  const cssProps: string[] = [];

  // Background color
  if (props.backgroundColor) {
    cssProps.push(`background-color: ${formatColor(props.backgroundColor, options.colorFormat)};`);
  } else if (props.fills && props.fills.length > 0) {
    const visibleFill = props.fills.find((f) => f.visible !== false && f.color);
    if (visibleFill?.color) {
      cssProps.push(
        `background-color: ${formatColor(visibleFill.color, options.colorFormat, visibleFill.opacity ?? 1)};`
      );
    }
  }

  return cssProps;
}

/**
 * Generate CSS for borders
 */
function generateBorderCSS(
  props: FigmaDesignProperties,
  options: StyledGenerationOptions
): string[] {
  const cssProps: string[] = [];

  // Border width and color
  if (props.strokeWeight !== undefined && props.strokeWeight > 0) {
    let borderColor = "#e2e8f0"; // Default border color
    if (props.strokes && props.strokes.length > 0) {
      const visibleStroke = props.strokes.find((s) => s.visible !== false && s.color);
      if (visibleStroke?.color) {
        borderColor = formatColor(visibleStroke.color, options.colorFormat, visibleStroke.opacity ?? 1);
      }
    }

    let borderStyle = "solid";
    if (props.strokeDashes && props.strokeDashes.length > 0) {
      borderStyle = props.strokeDashes[0] <= 2 ? "dotted" : "dashed";
    }

    cssProps.push(`border: ${props.strokeWeight}px ${borderStyle} ${borderColor};`);
  } else if (props.individualStrokeWeights) {
    const { top, right, bottom, left } = props.individualStrokeWeights;
    let borderColor = "#e2e8f0";
    if (props.strokes && props.strokes.length > 0) {
      const visibleStroke = props.strokes.find((s) => s.visible !== false && s.color);
      if (visibleStroke?.color) {
        borderColor = formatColor(visibleStroke.color, options.colorFormat, visibleStroke.opacity ?? 1);
      }
    }

    if (top > 0) cssProps.push(`border-top: ${top}px solid ${borderColor};`);
    if (right > 0) cssProps.push(`border-right: ${right}px solid ${borderColor};`);
    if (bottom > 0) cssProps.push(`border-bottom: ${bottom}px solid ${borderColor};`);
    if (left > 0) cssProps.push(`border-left: ${left}px solid ${borderColor};`);
  }

  // Border radius
  if (props.cornerRadius !== undefined && props.cornerRadius > 0) {
    cssProps.push(`border-radius: ${props.cornerRadius}px;`);
  } else if (props.rectangleCornerRadii) {
    const [tl, tr, br, bl] = props.rectangleCornerRadii;
    if (tl === tr && tr === br && br === bl && tl > 0) {
      cssProps.push(`border-radius: ${tl}px;`);
    } else {
      cssProps.push(`border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`);
    }
  }

  return cssProps;
}

/**
 * Generate CSS for effects (shadows, blur)
 */
function generateEffectsCSS(
  props: FigmaDesignProperties,
  options: StyledGenerationOptions
): string[] {
  const cssProps: string[] = [];

  if (props.effects && props.effects.length > 0) {
    const shadows: string[] = [];
    const blurs: string[] = [];

    for (const effect of props.effects) {
      if (effect.visible === false) continue;

      if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
        const x = effect.offset?.x ?? 0;
        const y = effect.offset?.y ?? 0;
        const blur = effect.radius ?? 0;
        const spread = effect.spread ?? 0;
        const color = effect.color
          ? formatColor(effect.color, options.colorFormat, effect.color.a)
          : "rgba(0, 0, 0, 0.25)";
        const inset = effect.type === "INNER_SHADOW" ? "inset " : "";
        shadows.push(`${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`);
      } else if (effect.type === "LAYER_BLUR") {
        blurs.push(`blur(${effect.radius ?? 0}px)`);
      }
    }

    if (shadows.length > 0) {
      cssProps.push(`box-shadow: ${shadows.join(", ")};`);
    }
    if (blurs.length > 0) {
      cssProps.push(`filter: ${blurs.join(" ")};`);
    }
  }

  // Opacity
  if (props.opacity !== undefined && props.opacity < 1) {
    cssProps.push(`opacity: ${props.opacity};`);
  }

  return cssProps;
}

/**
 * Generate CSS for overflow and positioning
 */
function generateMiscCSS(props: FigmaDesignProperties): string[] {
  const cssProps: string[] = [];

  if (props.clipsContent === true) {
    cssProps.push("overflow: hidden;");
  }

  if (props.layoutPositioning === "ABSOLUTE") {
    cssProps.push("position: absolute;");
  }

  if (props.rotation !== undefined && props.rotation !== 0) {
    cssProps.push(`transform: rotate(${Math.round(props.rotation)}deg);`);
  }

  return cssProps;
}

// ============================================================================
// Styled Component Generation
// ============================================================================

/**
 * Generate CSS string from Figma design properties
 */
export function generateCSSFromProps(
  props: FigmaDesignProperties,
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const allProps: string[] = [];

  allProps.push(...generateLayoutCSS(props));
  allProps.push(...generateDimensionCSS(props));
  allProps.push(...generatePaddingCSS(props));
  allProps.push(...generateTypographyCSS(props, opts));
  allProps.push(...generateColorCSS(props, opts));
  allProps.push(...generateBorderCSS(props, opts));
  allProps.push(...generateEffectsCSS(props, opts));
  allProps.push(...generateMiscCSS(props));

  return allProps.join("\n  ");
}

/**
 * Generate a styled component definition
 */
export function generateStyledComponent(
  name: string,
  baseElement: string,
  props: FigmaDesignProperties,
  options: Partial<StyledGenerationOptions> = {},
  dynamicProps: DynamicProp[] = []
): StyledComponentDefinition {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cssString = generateCSSFromProps(props, opts);

  return {
    name: `${opts.componentPrefix}${name}`,
    baseElement,
    styles: cssString,
    dynamicProps,
  };
}

/**
 * Generate styled-components code
 */
export function generateStyledComponentsCode(
  definition: StyledComponentDefinition,
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { name, baseElement, styles, dynamicProps, variants, responsiveStyles } = definition;

  let code = "";

  // Generate dynamic props interface if TypeScript
  if (opts.useTypeScript && dynamicProps.length > 0) {
    code += generatePropsInterface(name, dynamicProps);
    code += "\n\n";
  }

  // Generate the styled component
  const propsType = opts.useTypeScript && dynamicProps.length > 0 ? `<${name}Props>` : "";
  code += `export const ${name} = styled.${baseElement}${propsType}\`\n`;
  code += `  ${styles}\n`;

  // Add dynamic props
  for (const prop of dynamicProps) {
    code += generateDynamicPropStyle(prop, opts);
  }

  // Add variant styles
  if (variants) {
    for (const [variantName, variantValues] of Object.entries(variants)) {
      code += generateVariantStyles(variantName, variantValues);
    }
  }

  // Add responsive styles
  if (responsiveStyles) {
    code += generateResponsiveStyles(responsiveStyles, opts);
  }

  code += "`;\n";

  return code;
}

/**
 * Generate Emotion styled code
 */
export function generateEmotionCode(
  definition: StyledComponentDefinition,
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { name, baseElement, styles, dynamicProps, variants, responsiveStyles } = definition;

  let code = "";

  // Generate dynamic props interface if TypeScript
  if (opts.useTypeScript && dynamicProps.length > 0) {
    code += generatePropsInterface(name, dynamicProps);
    code += "\n\n";
  }

  // Generate the styled component
  const propsType = opts.useTypeScript && dynamicProps.length > 0 ? `<${name}Props>` : "";
  code += `export const ${name} = styled.${baseElement}${propsType}\`\n`;
  code += `  ${styles}\n`;

  // Add dynamic props
  for (const prop of dynamicProps) {
    code += generateDynamicPropStyle(prop, opts);
  }

  // Add variant styles
  if (variants) {
    for (const [variantName, variantValues] of Object.entries(variants)) {
      code += generateVariantStyles(variantName, variantValues);
    }
  }

  // Add responsive styles
  if (responsiveStyles) {
    code += generateResponsiveStyles(responsiveStyles, opts);
  }

  code += "`;\n";

  return code;
}

/**
 * Generate props interface for TypeScript
 */
function generatePropsInterface(
  componentName: string,
  dynamicProps: DynamicProp[]
): string {
  let code = `interface ${componentName}Props {\n`;

  for (const prop of dynamicProps) {
    const optional = prop.defaultValue !== undefined ? "?" : "";
    code += `  ${prop.name}${optional}: ${prop.type};\n`;
  }

  code += "}";
  return code;
}

/**
 * Generate dynamic prop style interpolation
 */
function generateDynamicPropStyle(
  prop: DynamicProp,
  options: StyledGenerationOptions
): string {
  const { name, cssProperty, themeKey, defaultValue } = prop;

  if (themeKey) {
    // Use theme value
    if (defaultValue) {
      return `  ${cssProperty}: \${({ ${name}, theme }) => ${name} ? theme.${themeKey}[${name}] : theme.${themeKey}['${defaultValue}']};\n`;
    }
    return `  ${cssProperty}: \${({ ${name}, theme }) => theme.${themeKey}[${name}]};\n`;
  }

  // Direct prop value
  if (defaultValue) {
    return `  ${cssProperty}: \${({ ${name} }) => ${name} ?? '${defaultValue}'};\n`;
  }
  return `  ${cssProperty}: \${({ ${name} }) => ${name}};\n`;
}

/**
 * Generate variant styles
 */
function generateVariantStyles(
  variantName: string,
  variantValues: Record<string, string>
): string {
  let code = "";

  for (const [value, styles] of Object.entries(variantValues)) {
    code += `\n  \${({ ${variantName} }) => ${variantName} === '${value}' && css\`\n`;
    code += `    ${styles}\n`;
    code += `  \`}\n`;
  }

  return code;
}

/**
 * Generate responsive styles
 */
function generateResponsiveStyles(
  responsiveStyles: Partial<Record<keyof ThemeBreakpoints, string>>,
  options: StyledGenerationOptions
): string {
  let code = "";

  for (const [breakpoint, styles] of Object.entries(responsiveStyles)) {
    code += `\n  @media (min-width: \${({ theme }) => theme.breakpoints['${breakpoint}']}) {\n`;
    code += `    ${styles}\n`;
    code += `  }\n`;
  }

  return code;
}

// ============================================================================
// Theme Generation
// ============================================================================

/**
 * Generate theme object code
 */
export function generateThemeCode(
  theme: Partial<Theme> = {},
  darkTheme: Partial<DarkTheme> = {},
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const mergedTheme = { ...DEFAULT_LIGHT_THEME, ...theme };
  const mergedDarkTheme = { ...DEFAULT_DARK_THEME, ...darkTheme };

  let code = "";

  if (opts.useTypeScript) {
    code += generateThemeTypeDefinition();
    code += "\n\n";
  }

  // Light theme
  code += `export const lightTheme${opts.useTypeScript ? ": Theme" : ""} = ${JSON.stringify(mergedTheme, null, 2)};\n\n`;

  // Dark theme (merge with light theme)
  if (opts.generateDarkTheme) {
    code += `export const darkTheme${opts.useTypeScript ? ": Theme" : ""} = {\n`;
    code += `  ...lightTheme,\n`;
    code += `  colors: {\n`;
    code += `    ...lightTheme.colors,\n`;
    for (const [key, value] of Object.entries(mergedDarkTheme.colors || {})) {
      code += `    ${key}: "${value}",\n`;
    }
    code += `  },\n`;
    code += `};\n`;
  }

  return code;
}

/**
 * Generate Theme TypeScript type definition
 */
function generateThemeTypeDefinition(): string {
  return `export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    [key: string]: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    [key: string]: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    [key: string]: string;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    [key: string]: number;
  };
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
    [key: string]: string;
  };
  lineHeights: {
    tight: string;
    normal: string;
    relaxed: string;
    [key: string]: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
    [key: string]: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    [key: string]: string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    tooltip: number;
    [key: string]: number;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
    [key: string]: string;
  };
}`;
}

/**
 * Generate ThemeProvider setup code
 */
export function generateThemeProviderCode(
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.library === "styled-components") {
    return generateStyledComponentsThemeProvider(opts);
  }
  return generateEmotionThemeProvider(opts);
}

/**
 * Generate styled-components ThemeProvider
 */
function generateStyledComponentsThemeProvider(options: StyledGenerationOptions): string {
  let code = "";

  // Imports
  code += `import React, { createContext, useContext, useState, useEffect } from 'react';\n`;
  code += `import { ThemeProvider as SCThemeProvider, createGlobalStyle } from 'styled-components';\n`;
  code += `import { lightTheme, darkTheme${options.useTypeScript ? ", Theme" : ""} } from './theme';\n\n`;

  // Global styles
  code += `const GlobalStyle = createGlobalStyle\`\n`;
  code += `  *, *::before, *::after {\n`;
  code += `    box-sizing: border-box;\n`;
  code += `  }\n\n`;
  code += `  html, body {\n`;
  code += `    margin: 0;\n`;
  code += `    padding: 0;\n`;
  code += `    font-family: \${({ theme }) => theme.fontFamily.sans};\n`;
  code += `    background-color: \${({ theme }) => theme.colors.background};\n`;
  code += `    color: \${({ theme }) => theme.colors.text};\n`;
  code += `    line-height: \${({ theme }) => theme.lineHeights.normal};\n`;
  code += `  }\n`;
  code += `\`;\n\n`;

  // Theme context
  if (options.useTypeScript) {
    code += `interface ThemeContextValue {\n`;
    code += `  theme: Theme;\n`;
    code += `  isDark: boolean;\n`;
    code += `  toggleTheme: () => void;\n`;
    code += `}\n\n`;
  }

  code += `const ThemeContext = createContext${options.useTypeScript ? "<ThemeContextValue | undefined>" : ""}(undefined);\n\n`;

  // useTheme hook
  code += `export function useTheme()${options.useTypeScript ? ": ThemeContextValue" : ""} {\n`;
  code += `  const context = useContext(ThemeContext);\n`;
  code += `  if (!context) {\n`;
  code += `    throw new Error('useTheme must be used within a ThemeProvider');\n`;
  code += `  }\n`;
  code += `  return context;\n`;
  code += `}\n\n`;

  // ThemeProvider component
  if (options.useTypeScript) {
    code += `interface ThemeProviderProps {\n`;
    code += `  children: React.ReactNode;\n`;
    code += `  defaultDark?: boolean;\n`;
    code += `}\n\n`;
  }

  code += `export function ThemeProvider({ children, defaultDark = false }${options.useTypeScript ? ": ThemeProviderProps" : ""}) {\n`;
  code += `  const [isDark, setIsDark] = useState(defaultDark);\n\n`;
  code += `  useEffect(() => {\n`;
  code += `    const savedTheme = localStorage.getItem('theme');\n`;
  code += `    if (savedTheme) {\n`;
  code += `      setIsDark(savedTheme === 'dark');\n`;
  code += `    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {\n`;
  code += `      setIsDark(true);\n`;
  code += `    }\n`;
  code += `  }, []);\n\n`;
  code += `  const toggleTheme = () => {\n`;
  code += `    setIsDark((prev) => {\n`;
  code += `      const newValue = !prev;\n`;
  code += `      localStorage.setItem('theme', newValue ? 'dark' : 'light');\n`;
  code += `      return newValue;\n`;
  code += `    });\n`;
  code += `  };\n\n`;
  code += `  const theme = isDark ? darkTheme : lightTheme;\n\n`;
  code += `  return (\n`;
  code += `    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>\n`;
  code += `      <SCThemeProvider theme={theme}>\n`;
  code += `        <GlobalStyle />\n`;
  code += `        {children}\n`;
  code += `      </SCThemeProvider>\n`;
  code += `    </ThemeContext.Provider>\n`;
  code += `  );\n`;
  code += `}\n`;

  // Server style sheet setup (for SSR)
  if (options.useServerStyleSheet) {
    code += `\n// Server-side rendering setup\n`;
    code += `export { ServerStyleSheet } from 'styled-components';\n`;
    code += `\n// Usage in SSR:\n`;
    code += `// const sheet = new ServerStyleSheet();\n`;
    code += `// const html = renderToString(sheet.collectStyles(<App />));\n`;
    code += `// const styleTags = sheet.getStyleTags();\n`;
  }

  return code;
}

/**
 * Generate Emotion ThemeProvider
 */
function generateEmotionThemeProvider(options: StyledGenerationOptions): string {
  let code = "";

  // Imports
  code += `import React, { createContext, useContext, useState, useEffect } from 'react';\n`;
  code += `import { ThemeProvider as EmotionThemeProvider, Global, css } from '@emotion/react';\n`;
  code += `import { lightTheme, darkTheme${options.useTypeScript ? ", Theme" : ""} } from './theme';\n\n`;

  // Global styles
  code += `const globalStyles = (theme${options.useTypeScript ? ": Theme" : ""}) => css\`\n`;
  code += `  *, *::before, *::after {\n`;
  code += `    box-sizing: border-box;\n`;
  code += `  }\n\n`;
  code += `  html, body {\n`;
  code += `    margin: 0;\n`;
  code += `    padding: 0;\n`;
  code += `    font-family: \${theme.fontFamily.sans};\n`;
  code += `    background-color: \${theme.colors.background};\n`;
  code += `    color: \${theme.colors.text};\n`;
  code += `    line-height: \${theme.lineHeights.normal};\n`;
  code += `  }\n`;
  code += `\`;\n\n`;

  // Theme context
  if (options.useTypeScript) {
    code += `interface ThemeContextValue {\n`;
    code += `  theme: Theme;\n`;
    code += `  isDark: boolean;\n`;
    code += `  toggleTheme: () => void;\n`;
    code += `}\n\n`;
  }

  code += `const ThemeContext = createContext${options.useTypeScript ? "<ThemeContextValue | undefined>" : ""}(undefined);\n\n`;

  // useTheme hook
  code += `export function useTheme()${options.useTypeScript ? ": ThemeContextValue" : ""} {\n`;
  code += `  const context = useContext(ThemeContext);\n`;
  code += `  if (!context) {\n`;
  code += `    throw new Error('useTheme must be used within a ThemeProvider');\n`;
  code += `  }\n`;
  code += `  return context;\n`;
  code += `}\n\n`;

  // ThemeProvider component
  if (options.useTypeScript) {
    code += `interface ThemeProviderProps {\n`;
    code += `  children: React.ReactNode;\n`;
    code += `  defaultDark?: boolean;\n`;
    code += `}\n\n`;
  }

  code += `export function ThemeProvider({ children, defaultDark = false }${options.useTypeScript ? ": ThemeProviderProps" : ""}) {\n`;
  code += `  const [isDark, setIsDark] = useState(defaultDark);\n\n`;
  code += `  useEffect(() => {\n`;
  code += `    const savedTheme = localStorage.getItem('theme');\n`;
  code += `    if (savedTheme) {\n`;
  code += `      setIsDark(savedTheme === 'dark');\n`;
  code += `    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {\n`;
  code += `      setIsDark(true);\n`;
  code += `    }\n`;
  code += `  }, []);\n\n`;
  code += `  const toggleTheme = () => {\n`;
  code += `    setIsDark((prev) => {\n`;
  code += `      const newValue = !prev;\n`;
  code += `      localStorage.setItem('theme', newValue ? 'dark' : 'light');\n`;
  code += `      return newValue;\n`;
  code += `    });\n`;
  code += `  };\n\n`;
  code += `  const theme = isDark ? darkTheme : lightTheme;\n\n`;
  code += `  return (\n`;
  code += `    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>\n`;
  code += `      <EmotionThemeProvider theme={theme}>\n`;
  code += `        <Global styles={globalStyles(theme)} />\n`;
  code += `        {children}\n`;
  code += `      </EmotionThemeProvider>\n`;
  code += `    </ThemeContext.Provider>\n`;
  code += `  );\n`;
  code += `}\n`;

  // SSR setup for Emotion
  if (options.useSSR) {
    code += `\n// Server-side rendering setup\n`;
    code += `export { CacheProvider } from '@emotion/react';\n`;
    code += `export { default as createEmotionServer } from '@emotion/server/create-instance';\n`;
    code += `export { default as createCache } from '@emotion/cache';\n`;
  }

  return code;
}

// ============================================================================
// Helper Utilities Generation
// ============================================================================

/**
 * Generate helper utilities (css, keyframes, mixins)
 */
export function generateHelperUtilities(
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.library === "styled-components") {
    return generateStyledComponentsHelpers(opts);
  }
  return generateEmotionHelpers(opts);
}

/**
 * Generate styled-components helpers
 */
function generateStyledComponentsHelpers(options: StyledGenerationOptions): string {
  let code = "";

  code += `import { css, keyframes } from 'styled-components';\n\n`;

  // Media query helpers
  code += `// Media query helpers\n`;
  code += `export const media = {\n`;
  for (const bp of options.breakpoints) {
    code += `  ${bp.name}: (styles${options.useTypeScript ? ": TemplateStringsArray" : ""}) => css\`\n`;
    code += `    @media (min-width: ${bp.minWidth}px) {\n`;
    code += `      \${styles}\n`;
    code += `    }\n`;
    code += `  \`,\n`;
  }
  code += `};\n\n`;

  // Common animation keyframes
  code += `// Common animations\n`;
  code += `export const fadeIn = keyframes\`\n`;
  code += `  from { opacity: 0; }\n`;
  code += `  to { opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const slideUp = keyframes\`\n`;
  code += `  from { transform: translateY(10px); opacity: 0; }\n`;
  code += `  to { transform: translateY(0); opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const slideDown = keyframes\`\n`;
  code += `  from { transform: translateY(-10px); opacity: 0; }\n`;
  code += `  to { transform: translateY(0); opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const scale = keyframes\`\n`;
  code += `  from { transform: scale(0.95); opacity: 0; }\n`;
  code += `  to { transform: scale(1); opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const spin = keyframes\`\n`;
  code += `  from { transform: rotate(0deg); }\n`;
  code += `  to { transform: rotate(360deg); }\n`;
  code += `\`;\n\n`;

  // Common mixins
  code += `// Common mixins\n`;
  code += `export const flexCenter = css\`\n`;
  code += `  display: flex;\n`;
  code += `  align-items: center;\n`;
  code += `  justify-content: center;\n`;
  code += `\`;\n\n`;

  code += `export const flexBetween = css\`\n`;
  code += `  display: flex;\n`;
  code += `  align-items: center;\n`;
  code += `  justify-content: space-between;\n`;
  code += `\`;\n\n`;

  code += `export const absoluteFill = css\`\n`;
  code += `  position: absolute;\n`;
  code += `  top: 0;\n`;
  code += `  right: 0;\n`;
  code += `  bottom: 0;\n`;
  code += `  left: 0;\n`;
  code += `\`;\n\n`;

  code += `export const truncate = css\`\n`;
  code += `  overflow: hidden;\n`;
  code += `  text-overflow: ellipsis;\n`;
  code += `  white-space: nowrap;\n`;
  code += `\`;\n\n`;

  code += `export const visuallyHidden = css\`\n`;
  code += `  position: absolute;\n`;
  code += `  width: 1px;\n`;
  code += `  height: 1px;\n`;
  code += `  padding: 0;\n`;
  code += `  margin: -1px;\n`;
  code += `  overflow: hidden;\n`;
  code += `  clip: rect(0, 0, 0, 0);\n`;
  code += `  white-space: nowrap;\n`;
  code += `  border: 0;\n`;
  code += `\`;\n\n`;

  // Focus ring
  code += `export const focusRing = css\`\n`;
  code += `  &:focus {\n`;
  code += `    outline: none;\n`;
  code += `    box-shadow: 0 0 0 2px \${({ theme }) => theme.colors.primary}40;\n`;
  code += `  }\n`;
  code += `\`;\n\n`;

  // Transition helpers
  code += `export const transition = (properties${options.useTypeScript ? ": string" : ""} = 'all') => css\`\n`;
  code += `  transition: \${properties} \${({ theme }) => theme.transitions.normal};\n`;
  code += `\`;\n`;

  return code;
}

/**
 * Generate Emotion helpers
 */
function generateEmotionHelpers(options: StyledGenerationOptions): string {
  let code = "";

  code += `import { css, keyframes } from '@emotion/react';\n\n`;

  // Media query helpers
  code += `// Media query helpers\n`;
  code += `export const media = {\n`;
  for (const bp of options.breakpoints) {
    code += `  ${bp.name}: \`@media (min-width: ${bp.minWidth}px)\`,\n`;
  }
  code += `};\n\n`;

  // Common animation keyframes
  code += `// Common animations\n`;
  code += `export const fadeIn = keyframes\`\n`;
  code += `  from { opacity: 0; }\n`;
  code += `  to { opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const slideUp = keyframes\`\n`;
  code += `  from { transform: translateY(10px); opacity: 0; }\n`;
  code += `  to { transform: translateY(0); opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const slideDown = keyframes\`\n`;
  code += `  from { transform: translateY(-10px); opacity: 0; }\n`;
  code += `  to { transform: translateY(0); opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const scale = keyframes\`\n`;
  code += `  from { transform: scale(0.95); opacity: 0; }\n`;
  code += `  to { transform: scale(1); opacity: 1; }\n`;
  code += `\`;\n\n`;

  code += `export const spin = keyframes\`\n`;
  code += `  from { transform: rotate(0deg); }\n`;
  code += `  to { transform: rotate(360deg); }\n`;
  code += `\`;\n\n`;

  // Common mixins
  code += `// Common mixins\n`;
  code += `export const flexCenter = css\`\n`;
  code += `  display: flex;\n`;
  code += `  align-items: center;\n`;
  code += `  justify-content: center;\n`;
  code += `\`;\n\n`;

  code += `export const flexBetween = css\`\n`;
  code += `  display: flex;\n`;
  code += `  align-items: center;\n`;
  code += `  justify-content: space-between;\n`;
  code += `\`;\n\n`;

  code += `export const absoluteFill = css\`\n`;
  code += `  position: absolute;\n`;
  code += `  top: 0;\n`;
  code += `  right: 0;\n`;
  code += `  bottom: 0;\n`;
  code += `  left: 0;\n`;
  code += `\`;\n\n`;

  code += `export const truncate = css\`\n`;
  code += `  overflow: hidden;\n`;
  code += `  text-overflow: ellipsis;\n`;
  code += `  white-space: nowrap;\n`;
  code += `\`;\n\n`;

  code += `export const visuallyHidden = css\`\n`;
  code += `  position: absolute;\n`;
  code += `  width: 1px;\n`;
  code += `  height: 1px;\n`;
  code += `  padding: 0;\n`;
  code += `  margin: -1px;\n`;
  code += `  overflow: hidden;\n`;
  code += `  clip: rect(0, 0, 0, 0);\n`;
  code += `  white-space: nowrap;\n`;
  code += `  border: 0;\n`;
  code += `\`;\n`;

  return code;
}

// ============================================================================
// Style Composition Utilities
// ============================================================================

/**
 * Generate a composed/extended styled component
 */
export function generateExtendedComponent(
  name: string,
  baseComponent: string,
  additionalStyles: string,
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.library === "styled-components") {
    return `export const ${name} = styled(${baseComponent})\`\n  ${additionalStyles}\n\`;\n`;
  }
  // Emotion
  return `export const ${name} = styled(${baseComponent})\`\n  ${additionalStyles}\n\`;\n`;
}

/**
 * Generate CSS composition helper
 */
export function generateCSSComposition(
  styles: string[],
  options: Partial<StyledGenerationOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.library === "styled-components") {
    return `css\`\n  ${styles.join("\n  ")}\n\``;
  }
  // Emotion
  return `css\`\n  ${styles.join("\n  ")}\n\``;
}

// ============================================================================
// Main Generation Function
// ============================================================================

/**
 * Generate complete styled-components/emotion output from Figma properties
 */
export function generateStyledOutput(
  componentName: string,
  baseElement: string,
  props: FigmaDesignProperties,
  dynamicProps: DynamicProp[] = [],
  options: Partial<StyledGenerationOptions> = {}
): StyledGenerationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];

  // Generate the component definition
  const definition = generateStyledComponent(componentName, baseElement, props, opts, dynamicProps);

  // Generate component code
  let component = "";
  if (opts.library === "styled-components") {
    component = `import styled, { css } from 'styled-components';\n\n`;
    component += generateStyledComponentsCode(definition, opts);
  } else {
    component = `import styled from '@emotion/styled';\nimport { css } from '@emotion/react';\n\n`;
    component += generateEmotionCode(definition, opts);
  }

  // Generate types
  let types = "";
  if (opts.useTypeScript) {
    types = generatePropsInterface(componentName, dynamicProps);
  }

  // Generate theme
  let theme = "";
  if (opts.generateTheme) {
    theme = generateThemeCode({}, {}, opts);
  }

  // Generate theme provider
  let themeProvider = "";
  if (opts.generateTheme) {
    themeProvider = generateThemeProviderCode(opts);
  }

  // Generate helpers
  let helpers = "";
  if (opts.includeHelpers) {
    helpers = generateHelperUtilities(opts);
  }

  return {
    component,
    types,
    theme,
    themeProvider,
    helpers,
    warnings,
  };
}

/**
 * Generate imports based on library
 */
export function generateImports(options: Partial<StyledGenerationOptions> = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.library === "styled-components") {
    return `import styled, { css, keyframes, ThemeProvider, createGlobalStyle } from 'styled-components';`;
  }
  return `import styled from '@emotion/styled';\nimport { css, keyframes, Global, ThemeProvider } from '@emotion/react';`;
}

// ============================================================================
// Design Token Conversion
// ============================================================================

/**
 * Convert design tokens to theme object
 */
/**
 * Partial theme type for token conversion
 */
export interface PartialTheme {
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  fontSizes?: Record<string, string>;
  fontWeights?: Record<string, number>;
  borderRadius?: Record<string, string>;
  shadows?: Record<string, string>;
}

export function designTokensToTheme(
  tokens: DesignToken[],
  options: Partial<StyledGenerationOptions> = {}
): PartialTheme {
  const theme: PartialTheme = {
    colors: {},
    spacing: {},
    fontSizes: {},
    fontWeights: {},
    borderRadius: {},
    shadows: {},
  };

  for (const token of tokens) {
    switch (token.type) {
      case "color":
        if (theme.colors) {
          theme.colors[sanitizeTokenName(token.name)] = token.value;
        }
        break;
      case "spacing":
        if (theme.spacing) {
          theme.spacing[sanitizeTokenName(token.name)] = token.value;
        }
        break;
      case "fontSize":
        if (theme.fontSizes) {
          theme.fontSizes[sanitizeTokenName(token.name)] = token.value;
        }
        break;
      case "fontWeight":
        if (theme.fontWeights) {
          theme.fontWeights[sanitizeTokenName(token.name)] = parseInt(token.value, 10);
        }
        break;
      case "borderRadius":
        if (theme.borderRadius) {
          theme.borderRadius[sanitizeTokenName(token.name)] = token.value;
        }
        break;
      case "boxShadow":
        if (theme.shadows) {
          theme.shadows[sanitizeTokenName(token.name)] = token.value;
        }
        break;
    }
  }

  return theme;
}

/**
 * Sanitize token name for use in theme object
 */
function sanitizeTokenName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// ============================================================================
// Exports
// ============================================================================

export {
  DEFAULT_OPTIONS,
  DEFAULT_LIGHT_THEME,
  DEFAULT_DARK_THEME,
  DEFAULT_BREAKPOINTS,
};
