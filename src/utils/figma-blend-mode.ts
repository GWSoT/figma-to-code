/**
 * Figma Blend Mode to CSS mix-blend-mode Converter
 *
 * This module handles converting Figma blend mode values to their CSS
 * mix-blend-mode equivalents, with fallback strategies for unsupported modes.
 * Supports blend modes on both individual layers and groups.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * All Figma blend modes as defined in the Figma API
 * @see https://www.figma.com/developers/api#blendmode-type
 */
export type FigmaBlendMode =
  // Normal modes
  | "PASS_THROUGH"
  | "NORMAL"
  // Darken modes
  | "DARKEN"
  | "MULTIPLY"
  | "LINEAR_BURN"
  | "COLOR_BURN"
  // Lighten modes
  | "LIGHTEN"
  | "SCREEN"
  | "LINEAR_DODGE"
  | "COLOR_DODGE"
  // Contrast modes
  | "OVERLAY"
  | "SOFT_LIGHT"
  | "HARD_LIGHT"
  // Inversion modes
  | "DIFFERENCE"
  | "EXCLUSION"
  // Component modes
  | "HUE"
  | "SATURATION"
  | "COLOR"
  | "LUMINOSITY";

/**
 * CSS mix-blend-mode values
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
 */
export type CSSBlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

/**
 * Tailwind mix-blend-mode utility classes
 */
export type TailwindBlendClass =
  | "mix-blend-normal"
  | "mix-blend-multiply"
  | "mix-blend-screen"
  | "mix-blend-overlay"
  | "mix-blend-darken"
  | "mix-blend-lighten"
  | "mix-blend-color-dodge"
  | "mix-blend-color-burn"
  | "mix-blend-hard-light"
  | "mix-blend-soft-light"
  | "mix-blend-difference"
  | "mix-blend-exclusion"
  | "mix-blend-hue"
  | "mix-blend-saturation"
  | "mix-blend-color"
  | "mix-blend-luminosity";

/**
 * Fallback strategy for unsupported blend modes
 */
export type FallbackStrategy =
  | "nearest" // Use the nearest visually similar blend mode
  | "normal" // Fall back to normal blend mode
  | "none" // Don't apply any blend mode (omit the property)
  | "custom"; // Use a custom fallback function

/**
 * Result of blend mode conversion
 */
export interface BlendModeConversionResult {
  /** The CSS mix-blend-mode value */
  cssValue: CSSBlendMode | null;
  /** The Tailwind utility class */
  tailwindClass: TailwindBlendClass | null;
  /** Whether a fallback was used */
  usedFallback: boolean;
  /** The original Figma blend mode */
  originalMode: string;
  /** Warning message if fallback was needed */
  warning?: string;
  /** Whether this is a group blend mode (pass-through behavior) */
  isGroupBlend: boolean;
}

/**
 * Options for blend mode conversion
 */
export interface BlendModeConversionOptions {
  /** Strategy for handling unsupported blend modes */
  fallbackStrategy?: FallbackStrategy;
  /** Custom fallback function (used when fallbackStrategy is 'custom') */
  customFallback?: (mode: string) => CSSBlendMode | null;
  /** Whether to include CSS comments for fallbacks */
  includeComments?: boolean;
  /** Whether the node is a group (affects PASS_THROUGH behavior) */
  isGroup?: boolean;
}

// ============================================================================
// Blend Mode Mapping
// ============================================================================

/**
 * Direct mapping from Figma blend modes to CSS mix-blend-mode values
 * null indicates the mode has no direct CSS equivalent
 */
const FIGMA_TO_CSS_BLEND_MODE: Record<FigmaBlendMode, CSSBlendMode | null> = {
  // Normal modes
  PASS_THROUGH: null, // Special case for groups - inherits parent blend mode
  NORMAL: "normal",

  // Darken modes
  DARKEN: "darken",
  MULTIPLY: "multiply",
  LINEAR_BURN: null, // No CSS equivalent
  COLOR_BURN: "color-burn",

  // Lighten modes
  LIGHTEN: "lighten",
  SCREEN: "screen",
  LINEAR_DODGE: null, // No CSS equivalent (also known as "Add")
  COLOR_DODGE: "color-dodge",

  // Contrast modes
  OVERLAY: "overlay",
  SOFT_LIGHT: "soft-light",
  HARD_LIGHT: "hard-light",

  // Inversion modes
  DIFFERENCE: "difference",
  EXCLUSION: "exclusion",

  // Component modes
  HUE: "hue",
  SATURATION: "saturation",
  COLOR: "color",
  LUMINOSITY: "luminosity",
};

/**
 * Fallback blend modes for modes that don't have direct CSS equivalents
 * Maps to the visually closest CSS blend mode
 */
const FALLBACK_BLEND_MODES: Record<string, CSSBlendMode> = {
  // LINEAR_BURN is similar to MULTIPLY but more intense
  // COLOR_BURN is the closest standard CSS mode
  LINEAR_BURN: "color-burn",

  // LINEAR_DODGE (Add) is similar to SCREEN but more intense
  // COLOR_DODGE is the closest standard CSS mode
  LINEAR_DODGE: "color-dodge",

  // PASS_THROUGH for groups defaults to normal (no isolation)
  PASS_THROUGH: "normal",
};

/**
 * CSS to Tailwind class mapping
 */
const CSS_TO_TAILWIND: Record<CSSBlendMode, TailwindBlendClass> = {
  normal: "mix-blend-normal",
  multiply: "mix-blend-multiply",
  screen: "mix-blend-screen",
  overlay: "mix-blend-overlay",
  darken: "mix-blend-darken",
  lighten: "mix-blend-lighten",
  "color-dodge": "mix-blend-color-dodge",
  "color-burn": "mix-blend-color-burn",
  "hard-light": "mix-blend-hard-light",
  "soft-light": "mix-blend-soft-light",
  difference: "mix-blend-difference",
  exclusion: "mix-blend-exclusion",
  hue: "mix-blend-hue",
  saturation: "mix-blend-saturation",
  color: "mix-blend-color",
  luminosity: "mix-blend-luminosity",
};

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert a Figma blend mode to CSS mix-blend-mode
 */
export function figmaBlendModeToCss(
  figmaBlendMode: string | undefined,
  options: BlendModeConversionOptions = {}
): BlendModeConversionResult {
  const {
    fallbackStrategy = "nearest",
    customFallback,
    isGroup = false,
  } = options;

  // Handle undefined or empty blend mode
  if (!figmaBlendMode) {
    return {
      cssValue: null,
      tailwindClass: null,
      usedFallback: false,
      originalMode: "",
      isGroupBlend: false,
    };
  }

  const normalizedMode = figmaBlendMode.toUpperCase() as FigmaBlendMode;
  const isGroupBlend = normalizedMode === "PASS_THROUGH";

  // Handle PASS_THROUGH specially for groups
  if (normalizedMode === "PASS_THROUGH") {
    if (isGroup) {
      // Groups with PASS_THROUGH don't isolate their blend context
      // This means children blend with grandparent, not the group
      // CSS equivalent is to NOT set isolation: isolate on the group
      return {
        cssValue: null,
        tailwindClass: null,
        usedFallback: false,
        originalMode: figmaBlendMode,
        isGroupBlend: true,
        warning:
          "PASS_THROUGH on groups means no blend mode isolation. " +
          "Omit isolation: isolate to achieve similar behavior.",
      };
    }
    // PASS_THROUGH on non-groups is equivalent to NORMAL
    return {
      cssValue: "normal",
      tailwindClass: "mix-blend-normal",
      usedFallback: false,
      originalMode: figmaBlendMode,
      isGroupBlend: false,
    };
  }

  // Check for direct mapping
  const directCssValue = FIGMA_TO_CSS_BLEND_MODE[normalizedMode];

  if (directCssValue !== null && directCssValue !== undefined) {
    return {
      cssValue: directCssValue,
      tailwindClass: CSS_TO_TAILWIND[directCssValue],
      usedFallback: false,
      originalMode: figmaBlendMode,
      isGroupBlend: false,
    };
  }

  // Handle unsupported blend modes with fallback strategy
  return handleUnsupportedBlendMode(
    normalizedMode,
    figmaBlendMode,
    fallbackStrategy,
    customFallback
  );
}

/**
 * Handle unsupported blend modes based on the fallback strategy
 */
function handleUnsupportedBlendMode(
  normalizedMode: string,
  originalMode: string,
  fallbackStrategy: FallbackStrategy,
  customFallback?: (mode: string) => CSSBlendMode | null
): BlendModeConversionResult {
  switch (fallbackStrategy) {
    case "nearest": {
      const fallbackMode = FALLBACK_BLEND_MODES[normalizedMode];
      if (fallbackMode) {
        return {
          cssValue: fallbackMode,
          tailwindClass: CSS_TO_TAILWIND[fallbackMode],
          usedFallback: true,
          originalMode,
          warning: `Figma blend mode '${originalMode}' has no direct CSS equivalent. Using '${fallbackMode}' as fallback.`,
          isGroupBlend: false,
        };
      }
      // If no fallback defined, fall through to 'normal'
      return {
        cssValue: "normal",
        tailwindClass: "mix-blend-normal",
        usedFallback: true,
        originalMode,
        warning: `Unknown Figma blend mode '${originalMode}'. Falling back to 'normal'.`,
        isGroupBlend: false,
      };
    }

    case "normal":
      return {
        cssValue: "normal",
        tailwindClass: "mix-blend-normal",
        usedFallback: true,
        originalMode,
        warning: `Figma blend mode '${originalMode}' is not supported in CSS. Using 'normal' as fallback.`,
        isGroupBlend: false,
      };

    case "none":
      return {
        cssValue: null,
        tailwindClass: null,
        usedFallback: true,
        originalMode,
        warning: `Figma blend mode '${originalMode}' is not supported in CSS. Blend mode omitted.`,
        isGroupBlend: false,
      };

    case "custom": {
      if (customFallback) {
        const customValue = customFallback(originalMode);
        if (customValue) {
          return {
            cssValue: customValue,
            tailwindClass: CSS_TO_TAILWIND[customValue],
            usedFallback: true,
            originalMode,
            warning: `Figma blend mode '${originalMode}' converted using custom fallback to '${customValue}'.`,
            isGroupBlend: false,
          };
        }
      }
      return {
        cssValue: null,
        tailwindClass: null,
        usedFallback: true,
        originalMode,
        warning: `Custom fallback for '${originalMode}' returned no value.`,
        isGroupBlend: false,
      };
    }

    default:
      return {
        cssValue: "normal",
        tailwindClass: "mix-blend-normal",
        usedFallback: true,
        originalMode,
        warning: `Unknown fallback strategy. Using 'normal' for '${originalMode}'.`,
        isGroupBlend: false,
      };
  }
}

/**
 * Convert CSS blend mode value to inline style string
 */
export function blendModeToCssString(
  result: BlendModeConversionResult,
  options: { includeComments?: boolean } = {}
): string {
  if (!result.cssValue) {
    return "";
  }

  let css = `mix-blend-mode: ${result.cssValue}`;

  if (options.includeComments && result.warning) {
    css = `/* ${result.warning} */\n${css}`;
  }

  return css;
}

/**
 * Get the Tailwind class for a blend mode
 */
export function getBlendModeTailwindClass(
  figmaBlendMode: string | undefined,
  options: BlendModeConversionOptions = {}
): string | null {
  const result = figmaBlendModeToCss(figmaBlendMode, options);
  return result.tailwindClass;
}

// ============================================================================
// Group and Layer Handling
// ============================================================================

/**
 * CSS properties for group blend mode handling
 */
export interface GroupBlendModeStyles {
  /** The mix-blend-mode CSS property value */
  mixBlendMode?: CSSBlendMode;
  /** Whether to apply isolation: isolate */
  isolation?: "isolate" | "auto";
  /** Tailwind classes for the group */
  tailwindClasses: string[];
  /** Warning or notes about the conversion */
  notes?: string;
}

/**
 * Generate CSS styles for a group's blend mode
 *
 * In Figma, groups can have two blend mode behaviors:
 * 1. PASS_THROUGH: Children blend with grandparent (no isolation)
 * 2. Any other mode: Group is isolated and blended as a unit
 */
export function generateGroupBlendModeStyles(
  blendMode: string | undefined,
  options: BlendModeConversionOptions = {}
): GroupBlendModeStyles {
  const result = figmaBlendModeToCss(blendMode, { ...options, isGroup: true });

  // PASS_THROUGH means no isolation
  if (result.isGroupBlend) {
    return {
      isolation: "auto",
      tailwindClasses: [],
      notes:
        "PASS_THROUGH blend mode - group children blend with grandparent. " +
        "Do not apply isolation to this group.",
    };
  }

  // No blend mode specified
  if (!result.cssValue) {
    return {
      tailwindClasses: [],
    };
  }

  // Normal blend mode - might want isolation depending on context
  if (result.cssValue === "normal") {
    return {
      mixBlendMode: "normal",
      isolation: "isolate",
      tailwindClasses: ["isolate"],
      notes: "Normal blend mode with isolation to contain children's blend modes.",
    };
  }

  // Other blend modes need both the mode and isolation
  const classes: string[] = [];
  if (result.tailwindClass) {
    classes.push(result.tailwindClass);
  }
  classes.push("isolate");

  return {
    mixBlendMode: result.cssValue,
    isolation: "isolate",
    tailwindClasses: classes,
    notes: result.warning,
  };
}

/**
 * Generate CSS styles for an individual layer's blend mode
 */
export function generateLayerBlendModeStyles(
  blendMode: string | undefined,
  options: BlendModeConversionOptions = {}
): {
  mixBlendMode?: CSSBlendMode;
  tailwindClass?: string;
  warning?: string;
} {
  const result = figmaBlendModeToCss(blendMode, { ...options, isGroup: false });

  if (!result.cssValue || result.cssValue === "normal") {
    return {
      warning: result.warning,
    };
  }

  return {
    mixBlendMode: result.cssValue,
    tailwindClass: result.tailwindClass || undefined,
    warning: result.warning,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a blend mode is supported in CSS
 */
export function isBlendModeSupported(figmaBlendMode: string): boolean {
  const normalizedMode = figmaBlendMode.toUpperCase() as FigmaBlendMode;
  const cssValue = FIGMA_TO_CSS_BLEND_MODE[normalizedMode];
  return cssValue !== null && cssValue !== undefined;
}

/**
 * Get all supported Figma blend modes
 */
export function getSupportedBlendModes(): FigmaBlendMode[] {
  return Object.entries(FIGMA_TO_CSS_BLEND_MODE)
    .filter(([, cssValue]) => cssValue !== null)
    .map(([figmaMode]) => figmaMode as FigmaBlendMode);
}

/**
 * Get all unsupported Figma blend modes
 */
export function getUnsupportedBlendModes(): FigmaBlendMode[] {
  return Object.entries(FIGMA_TO_CSS_BLEND_MODE)
    .filter(([, cssValue]) => cssValue === null)
    .map(([figmaMode]) => figmaMode as FigmaBlendMode);
}

/**
 * Get the fallback for an unsupported blend mode
 */
export function getFallbackBlendMode(figmaBlendMode: string): CSSBlendMode | null {
  const normalizedMode = figmaBlendMode.toUpperCase();
  return FALLBACK_BLEND_MODES[normalizedMode] || null;
}

/**
 * Generate a CSS comment explaining a blend mode conversion
 */
export function generateBlendModeComment(result: BlendModeConversionResult): string {
  if (!result.usedFallback) {
    return `/* Figma: ${result.originalMode} -> CSS: ${result.cssValue} */`;
  }
  return `/* Figma: ${result.originalMode} (unsupported) -> CSS: ${result.cssValue} (fallback) */`;
}

// ============================================================================
// Node Processing
// ============================================================================

/**
 * Extended node interface for blend mode processing
 */
export interface BlendModeNode {
  id: string;
  name: string;
  type: string;
  blendMode?: string;
  opacity?: number;
  children?: BlendModeNode[];
}

/**
 * Result of processing a node's blend mode
 */
export interface ProcessedBlendMode {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  blendModeResult: BlendModeConversionResult;
  cssProperties: Record<string, string>;
  tailwindClasses: string[];
}

/**
 * Process a single node's blend mode
 */
export function processNodeBlendMode(
  node: BlendModeNode,
  options: BlendModeConversionOptions = {}
): ProcessedBlendMode {
  const isGroup = node.type === "GROUP" || node.type === "FRAME";
  const blendOptions = { ...options, isGroup };

  let blendModeResult: BlendModeConversionResult;
  const cssProperties: Record<string, string> = {};
  const tailwindClasses: string[] = [];

  if (isGroup) {
    const groupStyles = generateGroupBlendModeStyles(node.blendMode, blendOptions);
    blendModeResult = figmaBlendModeToCss(node.blendMode, blendOptions);

    if (groupStyles.mixBlendMode) {
      cssProperties["mix-blend-mode"] = groupStyles.mixBlendMode;
    }
    if (groupStyles.isolation) {
      cssProperties["isolation"] = groupStyles.isolation;
    }
    tailwindClasses.push(...groupStyles.tailwindClasses);
  } else {
    const layerStyles = generateLayerBlendModeStyles(node.blendMode, blendOptions);
    blendModeResult = figmaBlendModeToCss(node.blendMode, blendOptions);

    if (layerStyles.mixBlendMode) {
      cssProperties["mix-blend-mode"] = layerStyles.mixBlendMode;
    }
    if (layerStyles.tailwindClass) {
      tailwindClasses.push(layerStyles.tailwindClass);
    }
  }

  // Handle opacity if present (often used with blend modes)
  if (node.opacity !== undefined && node.opacity < 1) {
    cssProperties["opacity"] = node.opacity.toString();
    // Tailwind opacity classes (e.g., opacity-50 for 0.5)
    const opacityPercent = Math.round(node.opacity * 100);
    // Tailwind has specific opacity values: 0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100
    const tailwindOpacities = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];
    const closestOpacity = tailwindOpacities.reduce((prev, curr) =>
      Math.abs(curr - opacityPercent) < Math.abs(prev - opacityPercent) ? curr : prev
    );
    tailwindClasses.push(`opacity-${closestOpacity}`);
  }

  return {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    blendModeResult,
    cssProperties,
    tailwindClasses,
  };
}

/**
 * Process all nodes in a tree and extract blend mode information
 */
export function processNodeTreeBlendModes(
  rootNode: BlendModeNode,
  options: BlendModeConversionOptions = {}
): ProcessedBlendMode[] {
  const results: ProcessedBlendMode[] = [];

  function traverse(node: BlendModeNode) {
    // Only process nodes that have a blend mode set
    if (node.blendMode) {
      results.push(processNodeBlendMode(node, options));
    }

    // Process children
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(rootNode);
  return results;
}

/**
 * Generate a summary of blend modes used in a node tree
 */
export function generateBlendModeSummary(
  results: ProcessedBlendMode[]
): {
  totalNodes: number;
  supportedModes: number;
  unsupportedModes: number;
  modeUsage: Record<string, number>;
  warnings: string[];
} {
  const modeUsage: Record<string, number> = {};
  const warnings: string[] = [];
  let supportedModes = 0;
  let unsupportedModes = 0;

  for (const result of results) {
    const mode = result.blendModeResult.originalMode;

    // Count mode usage
    modeUsage[mode] = (modeUsage[mode] || 0) + 1;

    // Track supported vs unsupported
    if (result.blendModeResult.usedFallback) {
      unsupportedModes++;
      if (result.blendModeResult.warning) {
        warnings.push(
          `${result.nodeName} (${result.nodeId}): ${result.blendModeResult.warning}`
        );
      }
    } else {
      supportedModes++;
    }
  }

  return {
    totalNodes: results.length,
    supportedModes,
    unsupportedModes,
    modeUsage,
    warnings,
  };
}
