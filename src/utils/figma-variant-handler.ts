/**
 * Figma Component Variant Handler
 *
 * Handles Figma component variants in code generation:
 * - Detects variant properties from Figma component data
 * - Maps variant properties to component props
 * - Generates variant-aware styling (compound variants)
 * - Supports boolean, enum, and multi-select variants
 */

import type { FigmaNode } from "./figma-api";
import type { VariantInfo, InteractiveState } from "./figma-interactive-elements";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Types of variant properties that can be detected
 */
export type VariantPropertyType =
  | "boolean"
  | "enum"
  | "multi-select"
  | "state"
  | "size"
  | "color"
  | "style"
  | "unknown";

/**
 * A single variant property definition
 */
export interface VariantPropertyDefinition {
  /** Original Figma property name */
  originalName: string;
  /** Normalized camelCase name for props */
  propName: string;
  /** Detected type of the variant property */
  type: VariantPropertyType;
  /** All possible values for this property */
  values: string[];
  /** Default value (if determinable) */
  defaultValue?: string;
  /** Whether this property is required */
  required: boolean;
  /** Description for documentation */
  description: string;
  /** TypeScript type string */
  typeString: string;
  /** Whether this affects styling */
  affectsStyles: boolean;
}

/**
 * A compound variant definition (when multiple properties combine)
 */
export interface CompoundVariantDefinition {
  /** Conditions that must all be true */
  conditions: Record<string, string>;
  /** CSS styles or class names to apply */
  styles: string;
  /** Optional description */
  description?: string;
  /** Priority for style resolution (higher = applied later) */
  priority: number;
}

/**
 * Variant style mapping for a specific variant value
 */
export interface VariantStyleMapping {
  /** Property name */
  property: string;
  /** Property value */
  value: string;
  /** CSS styles for this variant */
  css: Record<string, string>;
  /** Tailwind classes */
  tailwindClasses: string[];
  /** CSS-in-JS template literal */
  styledTemplate: string;
}

/**
 * Complete variant analysis result
 */
export interface VariantAnalysisResult {
  /** The component set name */
  componentSetName: string;
  /** All variant properties */
  properties: VariantPropertyDefinition[];
  /** All variants in the set */
  variants: VariantInfo[];
  /** Detected compound variants */
  compoundVariants: CompoundVariantDefinition[];
  /** Style mappings for each variant */
  styleMappings: VariantStyleMapping[];
  /** Generated TypeScript props interface */
  propsInterface: string;
  /** Generated CVA (class-variance-authority) config */
  cvaConfig: string;
  /** Generated styled-components variant handling */
  styledVariants: string;
  /** Warnings during analysis */
  warnings: string[];
}

/**
 * Options for variant analysis
 */
export interface VariantAnalysisOptions {
  /** Whether to generate TypeScript */
  useTypeScript: boolean;
  /** Whether to generate CVA config */
  generateCVA: boolean;
  /** Whether to generate styled-components variant code */
  generateStyledVariants: boolean;
  /** Whether to generate Tailwind variant classes */
  generateTailwind: boolean;
  /** Prefix for generated class names */
  classPrefix: string;
  /** Whether to include state variants (hover, focus, etc.) */
  includeStateVariants: boolean;
}

const DEFAULT_OPTIONS: VariantAnalysisOptions = {
  useTypeScript: true,
  generateCVA: true,
  generateStyledVariants: true,
  generateTailwind: true,
  classPrefix: "",
  includeStateVariants: true,
};

// ============================================================================
// Pattern Detection
// ============================================================================

/**
 * Patterns for detecting boolean variant properties
 */
const BOOLEAN_PATTERNS = {
  exactPairs: [
    ["true", "false"],
    ["yes", "no"],
    ["on", "off"],
    ["enabled", "disabled"],
    ["show", "hide"],
    ["visible", "hidden"],
    ["active", "inactive"],
    ["checked", "unchecked"],
    ["selected", "unselected"],
  ] as const,
  prefixPatterns: [
    /^is[A-Z]/,      // isDisabled, isLoading
    /^has[A-Z]/,     // hasIcon, hasBorder
    /^with[A-Z]/,    // withIcon, withLabel
    /^show[A-Z]?/,   // showLabel, show
    /^hide[A-Z]?/,   // hideIcon, hide
    /^enable[A-Z]?/, // enabled
    /^disable[A-Z]?/,
  ],
};

/**
 * Patterns for detecting size variant properties
 */
const SIZE_PATTERNS = {
  valuePatterns: [
    ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"],
    ["small", "medium", "large"],
    ["compact", "default", "comfortable"],
    ["mini", "tiny", "small", "regular", "large", "huge"],
  ],
  namePatterns: [/size/i, /scale/i, /density/i],
};

/**
 * Patterns for detecting state variant properties
 */
const STATE_PATTERNS = {
  values: [
    "default", "hover", "focus", "active", "pressed",
    "disabled", "loading", "selected", "error", "success",
    "warning", "readonly", "expanded", "collapsed",
  ],
  namePatterns: [/state/i, /status/i, /condition/i, /mode/i],
};

/**
 * Patterns for detecting color/theme variant properties
 */
const COLOR_PATTERNS = {
  values: [
    "primary", "secondary", "tertiary", "accent",
    "success", "error", "warning", "info", "neutral",
    "ghost", "outline", "solid", "subtle", "link",
    "light", "dark",
  ],
  namePatterns: [/color/i, /theme/i, /appearance/i, /tone/i, /intent/i],
};

/**
 * Patterns for detecting style/variant type properties
 */
const STYLE_PATTERNS = {
  values: [
    "filled", "outlined", "ghost", "link", "text",
    "contained", "elevated", "tonal",
  ],
  namePatterns: [/variant/i, /type/i, /style/i, /kind/i],
};

// ============================================================================
// Core Analysis Functions
// ============================================================================

/**
 * Analyze a component set to extract variant information
 */
export function analyzeComponentVariants(
  componentSetNode: FigmaNode,
  childVariants: FigmaNode[],
  options: Partial<VariantAnalysisOptions> = {}
): VariantAnalysisResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];

  // Extract variant properties from the component set
  const variantProperties = extractVariantProperties(componentSetNode, childVariants);

  // Analyze each property to determine its type
  const properties = variantProperties.map(([name, values]) =>
    analyzeVariantProperty(name, values)
  );

  // Build variant info from child nodes
  const variants = buildVariantInfoList(childVariants, properties);

  // Detect compound variants
  const compoundVariants = detectCompoundVariants(variants, properties);

  // Generate style mappings by analyzing visual differences
  const styleMappings = generateStyleMappings(variants, properties, childVariants);

  // Generate TypeScript props interface
  const propsInterface = opts.useTypeScript
    ? generatePropsInterfaceCode(componentSetNode.name, properties)
    : "";

  // Generate CVA config
  const cvaConfig = opts.generateCVA
    ? generateCVAConfig(componentSetNode.name, properties, compoundVariants, styleMappings)
    : "";

  // Generate styled-components variant handling
  const styledVariants = opts.generateStyledVariants
    ? generateStyledVariantsCode(componentSetNode.name, properties, compoundVariants, styleMappings)
    : "";

  return {
    componentSetName: componentSetNode.name,
    properties,
    variants,
    compoundVariants,
    styleMappings,
    propsInterface,
    cvaConfig,
    styledVariants,
    warnings,
  };
}

/**
 * Extract variant properties from a component set
 */
function extractVariantProperties(
  componentSetNode: FigmaNode,
  childVariants: FigmaNode[]
): [string, string[]][] {
  const propertyMap = new Map<string, Set<string>>();

  // Parse each child variant's name (Figma uses "Property=Value, Property=Value" format)
  for (const variant of childVariants) {
    const parts = variant.name.split(",").map((p) => p.trim());

    for (const part of parts) {
      const [propName, propValue] = part.split("=").map((s) => s.trim());
      if (propName && propValue) {
        const existing = propertyMap.get(propName) || new Set<string>();
        existing.add(propValue);
        propertyMap.set(propName, existing);
      }
    }

    // Also check component properties
    if (variant.componentProperties) {
      for (const [propName, propInfo] of Object.entries(variant.componentProperties)) {
        if (propInfo.type === "VARIANT" && propInfo.value !== undefined) {
          const existing = propertyMap.get(propName) || new Set<string>();
          existing.add(String(propInfo.value));
          propertyMap.set(propName, existing);
        }
      }
    }
  }

  // Convert to array of [name, values[]]
  return Array.from(propertyMap.entries()).map(([name, values]) => [
    name,
    Array.from(values),
  ]);
}

/**
 * Analyze a single variant property to determine its type and generate metadata
 */
function analyzeVariantProperty(
  originalName: string,
  values: string[]
): VariantPropertyDefinition {
  const propName = normalizePropertyName(originalName);
  const lowerValues = values.map((v) => v.toLowerCase());
  const type = detectPropertyType(originalName, values);
  const defaultValue = detectDefaultValue(originalName, values, type);
  const typeString = generateTypeString(type, values);
  const description = generatePropertyDescription(originalName, values, type);

  return {
    originalName,
    propName,
    type,
    values,
    defaultValue,
    required: type !== "boolean", // Boolean props typically have defaults
    description,
    typeString,
    affectsStyles: type !== "multi-select", // Most variants affect styles
  };
}

/**
 * Detect the type of a variant property based on its name and values
 */
function detectPropertyType(name: string, values: string[]): VariantPropertyType {
  const lowerName = name.toLowerCase();
  const lowerValues = values.map((v) => v.toLowerCase());
  const sortedLowerValues = [...lowerValues].sort();

  // Check for boolean patterns
  if (values.length === 2) {
    for (const [trueVal, falseVal] of BOOLEAN_PATTERNS.exactPairs) {
      const sortedPair = [falseVal, trueVal].sort();
      if (
        sortedLowerValues[0] === sortedPair[0] &&
        sortedLowerValues[1] === sortedPair[1]
      ) {
        return "boolean";
      }
    }

    // Check prefix patterns for boolean naming
    for (const pattern of BOOLEAN_PATTERNS.prefixPatterns) {
      if (pattern.test(name)) {
        return "boolean";
      }
    }
  }

  // Check for size patterns
  for (const sizeValues of SIZE_PATTERNS.valuePatterns) {
    if (values.every((v) => sizeValues.includes(v.toLowerCase()))) {
      return "size";
    }
  }
  if (SIZE_PATTERNS.namePatterns.some((p) => p.test(name))) {
    return "size";
  }

  // Check for state patterns
  if (
    lowerValues.every((v) => STATE_PATTERNS.values.includes(v)) ||
    STATE_PATTERNS.namePatterns.some((p) => p.test(name))
  ) {
    return "state";
  }

  // Check for color/theme patterns
  if (
    lowerValues.every((v) => COLOR_PATTERNS.values.includes(v)) ||
    COLOR_PATTERNS.namePatterns.some((p) => p.test(name))
  ) {
    return "color";
  }

  // Check for style/variant patterns
  if (
    lowerValues.every((v) => STYLE_PATTERNS.values.includes(v)) ||
    STYLE_PATTERNS.namePatterns.some((p) => p.test(name))
  ) {
    return "style";
  }

  // Default to enum if we have multiple discrete values
  if (values.length > 1 && values.length <= 20) {
    return "enum";
  }

  return "unknown";
}

/**
 * Detect the default value for a variant property
 */
function detectDefaultValue(
  name: string,
  values: string[],
  type: VariantPropertyType
): string | undefined {
  const lowerName = name.toLowerCase();
  const lowerValues = values.map((v) => v.toLowerCase());

  // Boolean types default based on prefix
  if (type === "boolean") {
    const negativePrefixes = ["is", "has", "with", "show", "enable"];
    const negativeDefault = negativePrefixes.some((p) =>
      lowerName.startsWith(p)
    );

    // Find the "false" value
    for (const [trueVal, falseVal] of BOOLEAN_PATTERNS.exactPairs) {
      if (lowerValues.includes(trueVal) && lowerValues.includes(falseVal)) {
        return negativeDefault ? values[lowerValues.indexOf(falseVal)] : values[lowerValues.indexOf(trueVal)];
      }
    }
    return values[0];
  }

  // Size types default to "md" or "medium"
  if (type === "size") {
    const mediumValues = ["md", "medium", "default", "regular"];
    for (const mv of mediumValues) {
      const idx = lowerValues.indexOf(mv);
      if (idx !== -1) return values[idx];
    }
  }

  // State types default to "default"
  if (type === "state") {
    const defaultStates = ["default", "normal", "rest", "idle"];
    for (const ds of defaultStates) {
      const idx = lowerValues.indexOf(ds);
      if (idx !== -1) return values[idx];
    }
  }

  // Color types default to "primary"
  if (type === "color") {
    const defaultColors = ["primary", "default", "neutral"];
    for (const dc of defaultColors) {
      const idx = lowerValues.indexOf(dc);
      if (idx !== -1) return values[idx];
    }
  }

  // Style types default to common defaults
  if (type === "style") {
    const defaultStyles = ["default", "filled", "solid", "contained"];
    for (const ds of defaultStyles) {
      const idx = lowerValues.indexOf(ds);
      if (idx !== -1) return values[idx];
    }
  }

  // Generic default: look for "default" or first value
  const defaultIdx = lowerValues.indexOf("default");
  if (defaultIdx !== -1) return values[defaultIdx];

  return values[0];
}

/**
 * Generate TypeScript type string for a variant property
 */
function generateTypeString(type: VariantPropertyType, values: string[]): string {
  if (type === "boolean") {
    return "boolean";
  }

  // For enums, create a union type
  if (values.length > 0 && values.length <= 20) {
    return values.map((v) => `"${v}"`).join(" | ");
  }

  return "string";
}

/**
 * Generate a description for a variant property
 */
function generatePropertyDescription(
  name: string,
  values: string[],
  type: VariantPropertyType
): string {
  const propName = normalizePropertyName(name);

  switch (type) {
    case "boolean":
      return `Whether ${propName} is enabled.`;
    case "size":
      return `The size of the component. Options: ${values.join(", ")}.`;
    case "state":
      return `The interactive state. Options: ${values.join(", ")}.`;
    case "color":
      return `The color/theme variant. Options: ${values.join(", ")}.`;
    case "style":
      return `The visual style variant. Options: ${values.join(", ")}.`;
    case "enum":
      return `${name} variant. Options: ${values.join(", ")}.`;
    default:
      return `The ${propName} variant of the component.`;
  }
}

/**
 * Normalize a Figma property name to a valid camelCase prop name
 */
function normalizePropertyName(name: string): string {
  return name
    .trim()
    .split(/[\s\-_]+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

// ============================================================================
// Variant Info Building
// ============================================================================

/**
 * Build variant info list from child nodes
 */
function buildVariantInfoList(
  childVariants: FigmaNode[],
  properties: VariantPropertyDefinition[]
): VariantInfo[] {
  return childVariants.map((variant) => {
    const props: Record<string, string> = {};

    // Parse variant name for properties
    const parts = variant.name.split(",").map((p) => p.trim());
    for (const part of parts) {
      const [propName, propValue] = part.split("=").map((s) => s.trim());
      if (propName && propValue) {
        const normalized = normalizePropertyName(propName);
        props[normalized] = propValue;
      }
    }

    // Determine state from properties
    const stateProp = properties.find((p) => p.type === "state");
    let state: InteractiveState = "default";
    if (stateProp && props[stateProp.propName]) {
      state = props[stateProp.propName] as InteractiveState;
    }

    return {
      nodeId: variant.id,
      name: variant.name,
      properties: props,
      state,
    };
  });
}

// ============================================================================
// Compound Variant Detection
// ============================================================================

/**
 * Detect compound variants from the variant list
 * Compound variants are special styling rules that apply when multiple
 * properties have specific values simultaneously
 */
function detectCompoundVariants(
  variants: VariantInfo[],
  properties: VariantPropertyDefinition[]
): CompoundVariantDefinition[] {
  const compoundVariants: CompoundVariantDefinition[] = [];

  // Skip if we have less than 2 properties
  if (properties.length < 2) {
    return compoundVariants;
  }

  // Look for common compound patterns

  // Pattern 1: Size + Color/Variant combinations
  const sizeProp = properties.find((p) => p.type === "size");
  const colorProp = properties.find((p) => p.type === "color" || p.type === "style");

  if (sizeProp && colorProp) {
    // Create compound variants for each combination
    for (const sizeValue of sizeProp.values) {
      for (const colorValue of colorProp.values) {
        compoundVariants.push({
          conditions: {
            [sizeProp.propName]: sizeValue,
            [colorProp.propName]: colorValue,
          },
          styles: `/* ${sizeProp.propName}=${sizeValue} + ${colorProp.propName}=${colorValue} */`,
          description: `Compound style for ${sizeValue} ${colorValue}`,
          priority: 1,
        });
      }
    }
  }

  // Pattern 2: State + Boolean combinations (e.g., disabled + loading)
  const stateProp = properties.find((p) => p.type === "state");
  const booleanProps = properties.filter((p) => p.type === "boolean");

  if (stateProp && booleanProps.length > 0) {
    for (const boolProp of booleanProps) {
      // Find the "true" value for this boolean
      const trueValue = boolProp.values.find((v) =>
        ["true", "yes", "on", "enabled", "show", "visible", "active", "checked", "selected"].includes(
          v.toLowerCase()
        )
      );

      if (trueValue) {
        for (const stateValue of stateProp.values) {
          if (stateValue.toLowerCase() !== "default") {
            compoundVariants.push({
              conditions: {
                [stateProp.propName]: stateValue,
                [boolProp.propName]: trueValue,
              },
              styles: `/* ${stateProp.propName}=${stateValue} + ${boolProp.propName}=${trueValue} */`,
              description: `${stateValue} state with ${boolProp.propName}`,
              priority: 2,
            });
          }
        }
      }
    }
  }

  return compoundVariants;
}

// ============================================================================
// Style Mapping Generation
// ============================================================================

/**
 * Generate style mappings by analyzing visual differences between variants
 */
function generateStyleMappings(
  variants: VariantInfo[],
  properties: VariantPropertyDefinition[],
  childNodes: FigmaNode[]
): VariantStyleMapping[] {
  const mappings: VariantStyleMapping[] = [];

  for (const prop of properties) {
    for (const value of prop.values) {
      // Find variants that have this property value
      const matchingVariants = variants.filter(
        (v) => v.properties[prop.propName] === value
      );

      if (matchingVariants.length === 0) continue;

      // Find the corresponding node to extract visual styles
      const variantNode = childNodes.find(
        (n) => matchingVariants.some((v) => v.nodeId === n.id)
      );

      // Generate CSS based on the property type and value
      const css = generateCSSForVariant(prop, value, variantNode);
      const tailwindClasses = generateTailwindForVariant(prop, value);
      const styledTemplate = generateStyledTemplateForVariant(prop, value, css);

      mappings.push({
        property: prop.propName,
        value,
        css,
        tailwindClasses,
        styledTemplate,
      });
    }
  }

  return mappings;
}

/**
 * Generate CSS for a specific variant value
 */
function generateCSSForVariant(
  prop: VariantPropertyDefinition,
  value: string,
  node?: FigmaNode
): Record<string, string> {
  const css: Record<string, string> = {};
  const lowerValue = value.toLowerCase();

  // Size variants
  if (prop.type === "size") {
    const sizeMap: Record<string, { padding: string; fontSize: string; height: string }> = {
      xs: { padding: "4px 8px", fontSize: "12px", height: "24px" },
      sm: { padding: "6px 12px", fontSize: "14px", height: "32px" },
      md: { padding: "8px 16px", fontSize: "16px", height: "40px" },
      lg: { padding: "12px 24px", fontSize: "18px", height: "48px" },
      xl: { padding: "16px 32px", fontSize: "20px", height: "56px" },
      small: { padding: "6px 12px", fontSize: "14px", height: "32px" },
      medium: { padding: "8px 16px", fontSize: "16px", height: "40px" },
      large: { padding: "12px 24px", fontSize: "18px", height: "48px" },
    };

    const sizing = sizeMap[lowerValue];
    if (sizing) {
      css.padding = sizing.padding;
      css.fontSize = sizing.fontSize;
      css.height = sizing.height;
    }
  }

  // Color/variant styles
  if (prop.type === "color" || prop.type === "style") {
    const colorMap: Record<string, { background: string; color: string; border?: string }> = {
      primary: { background: "var(--color-primary, #3b82f6)", color: "#ffffff" },
      secondary: { background: "var(--color-secondary, #64748b)", color: "#ffffff" },
      success: { background: "var(--color-success, #22c55e)", color: "#ffffff" },
      error: { background: "var(--color-error, #ef4444)", color: "#ffffff" },
      warning: { background: "var(--color-warning, #f59e0b)", color: "#000000" },
      info: { background: "var(--color-info, #0ea5e9)", color: "#ffffff" },
      ghost: { background: "transparent", color: "inherit", border: "none" },
      outline: { background: "transparent", color: "var(--color-primary, #3b82f6)", border: "1px solid currentColor" },
      link: { background: "transparent", color: "var(--color-primary, #3b82f6)" },
    };

    const colors = colorMap[lowerValue];
    if (colors) {
      css.backgroundColor = colors.background;
      css.color = colors.color;
      if (colors.border) css.border = colors.border;
    }
  }

  // State styles
  if (prop.type === "state") {
    const stateMap: Record<string, Record<string, string>> = {
      hover: { filter: "brightness(1.1)" },
      focus: { outline: "2px solid var(--color-focus, #3b82f6)", outlineOffset: "2px" },
      active: { transform: "scale(0.98)" },
      pressed: { transform: "scale(0.98)" },
      disabled: { opacity: "0.5", cursor: "not-allowed", pointerEvents: "none" },
      loading: { opacity: "0.7", cursor: "wait" },
      selected: { backgroundColor: "var(--color-selected, rgba(59, 130, 246, 0.1))" },
      error: { borderColor: "var(--color-error, #ef4444)" },
      success: { borderColor: "var(--color-success, #22c55e)" },
    };

    const stateStyles = stateMap[lowerValue];
    if (stateStyles) {
      Object.assign(css, stateStyles);
    }
  }

  // Boolean variants (typically modify existing styles)
  if (prop.type === "boolean") {
    // Extract the property purpose from name
    const propName = prop.propName.toLowerCase();

    if (propName.includes("icon") || propName.includes("hasicon")) {
      // No additional CSS needed for icon presence
    }
    if (propName.includes("rounded") || propName.includes("pill")) {
      if (lowerValue === "true" || lowerValue === "yes" || lowerValue === "on") {
        css.borderRadius = "9999px";
      }
    }
    if (propName.includes("shadow") || propName.includes("elevated")) {
      if (lowerValue === "true" || lowerValue === "yes" || lowerValue === "on") {
        css.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
      }
    }
    if (propName.includes("fullwidth") || propName.includes("block")) {
      if (lowerValue === "true" || lowerValue === "yes" || lowerValue === "on") {
        css.width = "100%";
      }
    }
  }

  return css;
}

/**
 * Generate Tailwind classes for a specific variant value
 */
function generateTailwindForVariant(
  prop: VariantPropertyDefinition,
  value: string
): string[] {
  const classes: string[] = [];
  const lowerValue = value.toLowerCase();

  // Size variants
  if (prop.type === "size") {
    const sizeMap: Record<string, string[]> = {
      xs: ["text-xs", "py-1", "px-2", "h-6"],
      sm: ["text-sm", "py-1.5", "px-3", "h-8"],
      md: ["text-base", "py-2", "px-4", "h-10"],
      lg: ["text-lg", "py-3", "px-6", "h-12"],
      xl: ["text-xl", "py-4", "px-8", "h-14"],
      small: ["text-sm", "py-1.5", "px-3", "h-8"],
      medium: ["text-base", "py-2", "px-4", "h-10"],
      large: ["text-lg", "py-3", "px-6", "h-12"],
    };

    const sizeClasses = sizeMap[lowerValue];
    if (sizeClasses) classes.push(...sizeClasses);
  }

  // Color/variant styles
  if (prop.type === "color" || prop.type === "style") {
    const colorMap: Record<string, string[]> = {
      primary: ["bg-blue-500", "text-white", "hover:bg-blue-600"],
      secondary: ["bg-slate-500", "text-white", "hover:bg-slate-600"],
      success: ["bg-green-500", "text-white", "hover:bg-green-600"],
      error: ["bg-red-500", "text-white", "hover:bg-red-600"],
      warning: ["bg-amber-500", "text-black", "hover:bg-amber-600"],
      ghost: ["bg-transparent", "hover:bg-gray-100"],
      outline: ["bg-transparent", "border", "border-current", "hover:bg-gray-50"],
      link: ["bg-transparent", "text-blue-500", "hover:underline"],
    };

    const colorClasses = colorMap[lowerValue];
    if (colorClasses) classes.push(...colorClasses);
  }

  // State variants
  if (prop.type === "state") {
    const stateMap: Record<string, string[]> = {
      disabled: ["opacity-50", "cursor-not-allowed", "pointer-events-none"],
      loading: ["opacity-70", "cursor-wait"],
      error: ["border-red-500"],
      success: ["border-green-500"],
    };

    const stateClasses = stateMap[lowerValue];
    if (stateClasses) classes.push(...stateClasses);
  }

  return classes;
}

/**
 * Generate styled-components template literal for a variant
 */
function generateStyledTemplateForVariant(
  prop: VariantPropertyDefinition,
  value: string,
  css: Record<string, string>
): string {
  const cssEntries = Object.entries(css);
  if (cssEntries.length === 0) return "";

  const cssString = cssEntries
    .map(([key, val]) => `${kebabCase(key)}: ${val};`)
    .join("\n    ");

  return `\${({ ${prop.propName} }) => ${prop.propName} === '${value}' && css\`
    ${cssString}
  \`}`;
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// ============================================================================
// Code Generation
// ============================================================================

/**
 * Generate TypeScript props interface
 */
function generatePropsInterfaceCode(
  componentName: string,
  properties: VariantPropertyDefinition[]
): string {
  const sanitizedName = componentName
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  let code = `/**\n * Props for the ${sanitizedName} component.\n */\n`;
  code += `export interface ${sanitizedName}Props {\n`;

  for (const prop of properties) {
    // Add JSDoc
    code += `  /**\n`;
    code += `   * ${prop.description}\n`;
    if (prop.defaultValue) {
      code += `   * @default ${prop.type === "boolean" ? prop.defaultValue : `"${prop.defaultValue}"`}\n`;
    }
    code += `   */\n`;

    // Add property
    const optional = !prop.required ? "?" : "";
    code += `  ${prop.propName}${optional}: ${prop.typeString};\n`;
  }

  code += "}\n";

  return code;
}

/**
 * Generate CVA (class-variance-authority) config
 */
function generateCVAConfig(
  componentName: string,
  properties: VariantPropertyDefinition[],
  compoundVariants: CompoundVariantDefinition[],
  styleMappings: VariantStyleMapping[]
): string {
  const variantName = componentName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase() + "Variants";

  let code = `import { cva, type VariantProps } from "class-variance-authority";\n\n`;
  code += `export const ${variantName} = cva(\n`;
  code += `  "/* base classes */",\n`;
  code += `  {\n`;
  code += `    variants: {\n`;

  // Group mappings by property
  const propertyMappings = new Map<string, VariantStyleMapping[]>();
  for (const mapping of styleMappings) {
    const existing = propertyMappings.get(mapping.property) || [];
    existing.push(mapping);
    propertyMappings.set(mapping.property, existing);
  }

  // Generate each variant
  for (const prop of properties) {
    code += `      ${prop.propName}: {\n`;

    const mappings = propertyMappings.get(prop.propName) || [];
    for (const mapping of mappings) {
      const classes = mapping.tailwindClasses.join(" ") || `/* ${mapping.value} styles */`;
      code += `        "${mapping.value}": "${classes}",\n`;
    }

    code += `      },\n`;
  }

  code += `    },\n`;

  // Compound variants
  if (compoundVariants.length > 0) {
    code += `    compoundVariants: [\n`;
    for (const cv of compoundVariants) {
      code += `      {\n`;
      for (const [key, value] of Object.entries(cv.conditions)) {
        code += `        ${key}: "${value}",\n`;
      }
      code += `        class: "/* compound styles */",\n`;
      code += `      },\n`;
    }
    code += `    ],\n`;
  }

  // Default variants
  code += `    defaultVariants: {\n`;
  for (const prop of properties) {
    if (prop.defaultValue) {
      const value = prop.type === "boolean"
        ? (["true", "yes", "on", "enabled"].includes(prop.defaultValue.toLowerCase()) ? "true" : "false")
        : `"${prop.defaultValue}"`;
      code += `      ${prop.propName}: ${value},\n`;
    }
  }
  code += `    },\n`;
  code += `  }\n`;
  code += `);\n\n`;

  // Export type
  code += `export type ${variantName.charAt(0).toUpperCase() + variantName.slice(1)} = VariantProps<typeof ${variantName}>;\n`;

  return code;
}

/**
 * Generate styled-components variant handling code
 */
function generateStyledVariantsCode(
  componentName: string,
  properties: VariantPropertyDefinition[],
  compoundVariants: CompoundVariantDefinition[],
  styleMappings: VariantStyleMapping[]
): string {
  const sanitizedName = componentName
    .replace(/[^a-zA-Z0-9]/g, "")
    .split(/(?=[A-Z])/)
    .join("")
    .replace(/^(.)/, (m) => m.toUpperCase());

  let code = `import styled, { css } from 'styled-components';\n\n`;

  // Generate props interface
  code += `interface ${sanitizedName}StyledProps {\n`;
  for (const prop of properties) {
    const optional = !prop.required ? "?" : "";
    code += `  ${prop.propName}${optional}: ${prop.typeString};\n`;
  }
  code += `}\n\n`;

  // Generate the styled component
  code += `export const Styled${sanitizedName} = styled.div<${sanitizedName}StyledProps>\`\n`;
  code += `  /* Base styles */\n`;
  code += `  display: inline-flex;\n`;
  code += `  align-items: center;\n`;
  code += `  justify-content: center;\n`;
  code += `  transition: all 0.2s ease-in-out;\n\n`;

  // Add variant interpolations
  for (const prop of properties) {
    if (prop.type === "boolean") {
      // Boolean props
      const trueValue = prop.values.find((v) =>
        ["true", "yes", "on", "enabled", "show", "visible", "active", "checked"].includes(v.toLowerCase())
      );
      const mapping = styleMappings.find(
        (m) => m.property === prop.propName && m.value === trueValue
      );

      if (mapping && Object.keys(mapping.css).length > 0) {
        code += `  \${({ ${prop.propName} }) => ${prop.propName} && css\`\n`;
        for (const [key, value] of Object.entries(mapping.css)) {
          code += `    ${kebabCase(key)}: ${value};\n`;
        }
        code += `  \`}\n\n`;
      }
    } else {
      // Enum-like props
      const mappings = styleMappings.filter((m) => m.property === prop.propName);
      for (const mapping of mappings) {
        if (Object.keys(mapping.css).length > 0) {
          code += `  \${({ ${prop.propName} }) => ${prop.propName} === '${mapping.value}' && css\`\n`;
          for (const [key, value] of Object.entries(mapping.css)) {
            code += `    ${kebabCase(key)}: ${value};\n`;
          }
          code += `  \`}\n\n`;
        }
      }
    }
  }

  // Add compound variants
  if (compoundVariants.length > 0) {
    code += `  /* Compound variants */\n`;
    for (const cv of compoundVariants) {
      const conditions = Object.entries(cv.conditions)
        .map(([key, value]) => `${key} === '${value}'`)
        .join(" && ");

      code += `  \${({ ${Object.keys(cv.conditions).join(", ")} }) => ${conditions} && css\`\n`;
      code += `    ${cv.styles}\n`;
      code += `  \`}\n`;
    }
  }

  code += `\`;\n`;

  return code;
}

// ============================================================================
// High-Level API
// ============================================================================

/**
 * Analyze a Figma component set and generate all variant-related code
 */
export function processComponentVariants(
  componentSetNode: FigmaNode,
  childVariants: FigmaNode[],
  options: Partial<VariantAnalysisOptions> = {}
): VariantAnalysisResult {
  return analyzeComponentVariants(componentSetNode, childVariants, options);
}

/**
 * Extract variant properties from a single component instance
 */
export function extractVariantPropsFromInstance(
  instanceNode: FigmaNode
): Record<string, string> {
  const props: Record<string, string> = {};

  // Parse from name if it uses Figma's variant naming convention
  const parts = instanceNode.name.split(",").map((p) => p.trim());
  for (const part of parts) {
    const [propName, propValue] = part.split("=").map((s) => s.trim());
    if (propName && propValue) {
      props[normalizePropertyName(propName)] = propValue;
    }
  }

  // Also check component properties
  if (instanceNode.componentProperties) {
    for (const [propName, propInfo] of Object.entries(instanceNode.componentProperties)) {
      if (propInfo.type === "VARIANT" && propInfo.value !== undefined) {
        props[normalizePropertyName(propName)] = String(propInfo.value);
      } else if (propInfo.type === "BOOLEAN" && propInfo.value !== undefined) {
        props[normalizePropertyName(propName)] = String(propInfo.value);
      }
    }
  }

  return props;
}

/**
 * Map Figma variant values to component props
 */
export function mapVariantToProps(
  variantInfo: VariantInfo,
  propertyDefinitions: VariantPropertyDefinition[]
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  for (const [propName, value] of Object.entries(variantInfo.properties)) {
    const definition = propertyDefinitions.find((d) => d.propName === propName);

    if (definition) {
      // Convert value based on type
      if (definition.type === "boolean") {
        const isTrue = ["true", "yes", "on", "enabled", "show", "visible", "active", "checked", "selected"]
          .includes(value.toLowerCase());
        props[propName] = isTrue;
      } else {
        props[propName] = value;
      }
    } else {
      // Unknown property, pass through as string
      props[propName] = value;
    }
  }

  return props;
}

// ============================================================================
// Exports
// ============================================================================

export {
  normalizePropertyName,
  detectPropertyType,
  detectDefaultValue,
  generateTypeString,
};
