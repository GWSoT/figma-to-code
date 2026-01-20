/**
 * Figma Text Truncation to CSS Converter
 *
 * Converts Figma text truncation settings to CSS properties.
 * Handles both single-line and multi-line truncation scenarios.
 *
 * Figma Text Properties:
 * - textTruncation: "DISABLED" | "ENDING" - Whether text truncates with ellipsis
 * - maxLines: number - Maximum lines (0 = unlimited)
 * - textAutoResize: "NONE" | "HEIGHT" | "WIDTH_AND_HEIGHT" | "TRUNCATE"
 *
 * CSS Output:
 * - Single-line: text-overflow: ellipsis, white-space: nowrap, overflow: hidden
 * - Multi-line: -webkit-line-clamp, display: -webkit-box, -webkit-box-orient: vertical
 */

import type { TextTruncation, TextAutoResize } from "./text-node-parser";

// ============================================================================
// Types
// ============================================================================

/**
 * Input settings for text truncation conversion
 */
export interface TextTruncationSettings {
  /** Whether truncation is enabled and how it behaves */
  textTruncation: TextTruncation;
  /** Maximum number of lines (0 = unlimited) */
  maxLines: number;
  /** Text auto-resize mode */
  textAutoResize: TextAutoResize;
}

/**
 * CSS output for text truncation
 */
export interface TextTruncationCSSOutput {
  /** CSS properties to apply */
  cssProperties: Record<string, string>;
  /** Tailwind classes for truncation */
  tailwindClasses: string[];
  /** Whether truncation is active */
  isTruncated: boolean;
  /** Type of truncation: single-line or multi-line */
  truncationType: "none" | "single-line" | "multi-line";
  /** Warning or note about the conversion */
  warning?: string;
}

/**
 * Options for truncation conversion
 */
export interface TruncationConversionOptions {
  /** Whether to generate Tailwind classes */
  useTailwind?: boolean;
  /** Whether to include webkit prefixes */
  includeWebkitPrefixes?: boolean;
  /** Whether to include fallback styles for older browsers */
  includeFallbacks?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** Default conversion options */
export const DEFAULT_TRUNCATION_OPTIONS: Required<TruncationConversionOptions> = {
  useTailwind: true,
  includeWebkitPrefixes: true,
  includeFallbacks: true,
};

/** Tailwind classes for truncation */
export const TAILWIND_TRUNCATION_CLASSES = {
  /** Single line truncation */
  truncate: "truncate",
  /** Multi-line clamp classes (Tailwind v3+) */
  lineClamp1: "line-clamp-1",
  lineClamp2: "line-clamp-2",
  lineClamp3: "line-clamp-3",
  lineClamp4: "line-clamp-4",
  lineClamp5: "line-clamp-5",
  lineClamp6: "line-clamp-6",
  /** Overflow hidden */
  overflowHidden: "overflow-hidden",
} as const;

// ============================================================================
// Core Conversion Functions
// ============================================================================

/**
 * Determine if text truncation should be applied based on Figma settings
 */
export function shouldTruncate(settings: TextTruncationSettings): boolean {
  // Explicit truncation mode
  if (settings.textTruncation === "ENDING") {
    return true;
  }

  // TRUNCATE auto-resize mode implies truncation
  if (settings.textAutoResize === "TRUNCATE") {
    return true;
  }

  // maxLines > 0 with NONE or HEIGHT resize implies truncation
  if (settings.maxLines > 0 && (settings.textAutoResize === "NONE" || settings.textAutoResize === "HEIGHT")) {
    return true;
  }

  return false;
}

/**
 * Determine the truncation type based on settings
 */
export function getTruncationType(settings: TextTruncationSettings): "none" | "single-line" | "multi-line" {
  if (!shouldTruncate(settings)) {
    return "none";
  }

  // Single line truncation
  if (settings.maxLines === 1) {
    return "single-line";
  }

  // Multi-line truncation (maxLines > 1 or maxLines = 0 with truncation enabled)
  if (settings.maxLines > 1) {
    return "multi-line";
  }

  // When textTruncation is ENDING but maxLines is 0, treat as single-line
  // (This is Figma's default behavior for text truncation without explicit line limit)
  if (settings.textTruncation === "ENDING" && settings.maxLines === 0) {
    return "single-line";
  }

  // TRUNCATE auto-resize without maxLines is single-line
  if (settings.textAutoResize === "TRUNCATE" && settings.maxLines === 0) {
    return "single-line";
  }

  return "none";
}

/**
 * Generate CSS for single-line text truncation
 */
export function generateSingleLineTruncationCSS(
  options: Required<TruncationConversionOptions>
): Record<string, string> {
  return {
    "overflow": "hidden",
    "text-overflow": "ellipsis",
    "white-space": "nowrap",
  };
}

/**
 * Generate CSS for multi-line text truncation (line-clamp)
 */
export function generateMultiLineTruncationCSS(
  maxLines: number,
  options: Required<TruncationConversionOptions>
): Record<string, string> {
  const css: Record<string, string> = {
    "overflow": "hidden",
    "display": "-webkit-box",
    "-webkit-box-orient": "vertical",
    "-webkit-line-clamp": String(maxLines),
  };

  // Add standard line-clamp property (CSS property, not widely supported yet)
  if (options.includeFallbacks) {
    css["line-clamp"] = String(maxLines);
  }

  return css;
}

/**
 * Generate Tailwind classes for single-line truncation
 */
export function generateSingleLineTruncationTailwind(): string[] {
  // Tailwind's 'truncate' class provides: overflow-hidden, text-overflow-ellipsis, whitespace-nowrap
  return [TAILWIND_TRUNCATION_CLASSES.truncate];
}

/**
 * Generate Tailwind classes for multi-line truncation
 */
export function generateMultiLineTruncationTailwind(maxLines: number): string[] {
  // Tailwind v3+ provides line-clamp-{n} utilities
  // For lines 1-6, use the built-in classes
  if (maxLines >= 1 && maxLines <= 6) {
    const clampClasses: Record<number, string> = {
      1: TAILWIND_TRUNCATION_CLASSES.lineClamp1,
      2: TAILWIND_TRUNCATION_CLASSES.lineClamp2,
      3: TAILWIND_TRUNCATION_CLASSES.lineClamp3,
      4: TAILWIND_TRUNCATION_CLASSES.lineClamp4,
      5: TAILWIND_TRUNCATION_CLASSES.lineClamp5,
      6: TAILWIND_TRUNCATION_CLASSES.lineClamp6,
    };
    return [clampClasses[maxLines]];
  }

  // For lines > 6, use arbitrary value syntax
  return [`line-clamp-[${maxLines}]`];
}

/**
 * Convert Figma text truncation settings to CSS
 * Main entry point for truncation conversion
 */
export function convertTextTruncation(
  settings: TextTruncationSettings,
  options: TruncationConversionOptions = {}
): TextTruncationCSSOutput {
  const opts = { ...DEFAULT_TRUNCATION_OPTIONS, ...options };

  const truncationType = getTruncationType(settings);

  if (truncationType === "none") {
    return {
      cssProperties: {},
      tailwindClasses: [],
      isTruncated: false,
      truncationType: "none",
    };
  }

  if (truncationType === "single-line") {
    const cssProperties = generateSingleLineTruncationCSS(opts);
    const tailwindClasses = opts.useTailwind ? generateSingleLineTruncationTailwind() : [];

    return {
      cssProperties,
      tailwindClasses,
      isTruncated: true,
      truncationType: "single-line",
    };
  }

  // Multi-line truncation
  const cssProperties = generateMultiLineTruncationCSS(settings.maxLines, opts);
  const tailwindClasses = opts.useTailwind ? generateMultiLineTruncationTailwind(settings.maxLines) : [];

  return {
    cssProperties,
    tailwindClasses,
    isTruncated: true,
    truncationType: "multi-line",
    warning: settings.maxLines > 6 && opts.useTailwind
      ? "Using arbitrary value for line-clamp. Ensure Tailwind JIT mode is enabled."
      : undefined,
  };
}

/**
 * Convert CSS properties object to inline style string
 */
export function truncationCSSToStyleString(output: TextTruncationCSSOutput): string {
  const styles: string[] = [];

  for (const [property, value] of Object.entries(output.cssProperties)) {
    styles.push(`${property}: ${value}`);
  }

  return styles.join("; ");
}

/**
 * Generate a complete CSS rule for truncation
 */
export function generateTruncationCSSRule(
  selector: string,
  output: TextTruncationCSSOutput,
  options: { includeComments?: boolean } = {}
): string {
  if (!output.isTruncated || Object.keys(output.cssProperties).length === 0) {
    return "";
  }

  const lines: string[] = [];

  if (options.includeComments) {
    lines.push(`/* Text truncation: ${output.truncationType} */`);
    if (output.warning) {
      lines.push(`/* Warning: ${output.warning} */`);
    }
  }

  lines.push(`${selector} {`);

  for (const [property, value] of Object.entries(output.cssProperties)) {
    lines.push(`  ${property}: ${value};`);
  }

  lines.push("}");

  return lines.join("\n");
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a ParsedTextNode needs truncation CSS
 */
export function needsTruncationCSS(settings: TextTruncationSettings): boolean {
  return shouldTruncate(settings);
}

/**
 * Get a human-readable description of the truncation settings
 */
export function describeTruncation(settings: TextTruncationSettings): string {
  const truncationType = getTruncationType(settings);

  if (truncationType === "none") {
    return "No truncation";
  }

  if (truncationType === "single-line") {
    return "Single-line truncation with ellipsis";
  }

  return `Multi-line truncation (${settings.maxLines} lines) with ellipsis`;
}

/**
 * Merge truncation CSS with existing CSS properties
 */
export function mergeTruncationCSS(
  existingCSS: Record<string, string>,
  truncationOutput: TextTruncationCSSOutput
): Record<string, string> {
  // Truncation CSS should override conflicting properties
  return {
    ...existingCSS,
    ...truncationOutput.cssProperties,
  };
}

/**
 * Merge truncation Tailwind classes with existing classes
 */
export function mergeTruncationTailwind(
  existingClasses: string[],
  truncationOutput: TextTruncationCSSOutput
): string[] {
  // Filter out any conflicting classes from existing
  const conflictingClasses = [
    "overflow-visible",
    "overflow-auto",
    "overflow-scroll",
    "whitespace-normal",
    "whitespace-pre",
    "whitespace-pre-line",
    "whitespace-pre-wrap",
  ];

  const filteredExisting = existingClasses.filter(
    (cls) => !conflictingClasses.includes(cls)
  );

  return [...filteredExisting, ...truncationOutput.tailwindClasses];
}

// ============================================================================
// Integration with ParsedTextNode
// ============================================================================

/**
 * Extract truncation settings from a ParsedTextNode-like object
 */
export function extractTruncationSettings(node: {
  textTruncation?: TextTruncation;
  maxLines?: number;
  textAutoResize?: TextAutoResize;
}): TextTruncationSettings {
  return {
    textTruncation: node.textTruncation ?? "DISABLED",
    maxLines: node.maxLines ?? 0,
    textAutoResize: node.textAutoResize ?? "NONE",
  };
}

/**
 * Process a text node and generate truncation CSS
 * Convenience function for use with ParsedTextNode
 */
export function processTextNodeTruncation(
  node: {
    textTruncation?: TextTruncation;
    maxLines?: number;
    textAutoResize?: TextAutoResize;
  },
  options: TruncationConversionOptions = {}
): TextTruncationCSSOutput {
  const settings = extractTruncationSettings(node);
  return convertTextTruncation(settings, options);
}
