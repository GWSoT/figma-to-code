
🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming"
}
I'll help you implement the Figma blend mode to CSS mix-blend-mode conversion feature. Let me start by exploring the codebase to understand the existing structure and how Figma-to-code conversion is currently handled.

🔧 Tool: Task
Input: {
  "prompt": "Explore the codebase to understand:\n1. How Figma designs are currently converted to code\n2. Any existing blend mode handling\n3. The overall structure for Figma-to-CSS conversion\n4. Look for files related to: Figma parsing, CSS generation, style conversion, blend modes\n\nFocus on finding:\n- Files that handle Figma node/layer properties\n- CSS style generation utilities\n- Any existing blend mode or mix-blend-mode code\n- The main conversion pipeline\n\nBe thorough - search for keywords like \"blend\", \"figma\", \"style\", \"css\", \"convert\", \"transform\"",
  "description": "Explore Figma conversion codebase",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.md\" | head -20",
  "description": "List documentation files"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Grep
Input: {
  "pattern": "figma",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Grep
Input: {
  "pattern": "blend",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Grep
Input: {
  "pattern": "css|style|convert",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-component-resolver.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-constraints.ts"
}

🔧 Tool: Grep
Input: {
  "pattern": "mix-blend-mode|blendMode|blend",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*style*",
  "path": "/home/rainman/figma-to-code/figma-to-code/src"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*css*",
  "path": "/home/rainman/figma-to-code/figma-to-code/src"
}

🔧 Tool: Grep
Input: {
  "pattern": "convert|transform|generate.*css|toCss|toStyle",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -name \"*converter*\" -o -name \"*transform*\" -o -name \"*generator*\" 2>/dev/null",
  "description": "Find conversion/transform/generator files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/figma-exports.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | xargs grep -l \"export.*style\\|export.*css\\|export.*code\" | head -10",
  "description": "Find files exporting styles or CSS"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l \"node.*style\\|figma.*code\\|figma.*css\" 2>/dev/null | head -20",
  "description": "Find files handling Figma to code conversion"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/utils/ | grep figma",
  "description": "List Figma-related utility files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-token.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/typography-extractor.ts"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/fn/ | grep figma",
  "description": "List Figma-related function files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma-files.ts"
}

🔧 Tool: Bash
Input: {
  "command": "grep -A 30 \"figma\" /home/rainman/figma-to-code/figma-to-code/src/db/schema.ts | head -100",
  "description": "Show Figma-related schema"
}

🔧 Tool: Bash
Input: {
  "command": "wc -l /home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "description": "Check schema file size"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "offset": 1,
  "limit": 540
}
Now I have a clear picture of the codebase. Let me read the key files to understand the exact patterns being used:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-constraints.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-component-resolver.ts"
}
Now I have a clear understanding of the codebase. Let me create a task list and implement the blend mode conversion feature.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create blend mode converter utility",
      "status": "in_progress",
      "activeForm": "Creating blend mode converter utility"
    },
    {
      "content": "Add comprehensive Figma to CSS blend mode mapping",
      "status": "pending",
      "activeForm": "Adding Figma to CSS blend mode mapping"
    },
    {
      "content": "Implement fallback strategies for unsupported modes",
      "status": "pending",
      "activeForm": "Implementing fallback strategies"
    },
    {
      "content": "Add Tailwind class conversion support",
      "status": "pending",
      "activeForm": "Adding Tailwind class conversion"
    },
    {
      "content": "Support blend modes on groups and layers",
      "status": "pending",
      "activeForm": "Supporting group/layer blend modes"
    },
    {
      "content": "Create Playwright verification test",
      "status": "pending",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run and verify the implementation",
      "status": "pending",
      "activeForm": "Running verification test"
    }
  ]
}
Now let me create the blend mode converter utility. Based on my analysis:

1. The `FigmaNode` interface has `blendMode?: string` property
2. The existing CSS generation utilities follow a consistent pattern (see `figma-constraints.ts`)
3. I need to map Figma blend modes to CSS `mix-blend-mode` values

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-blend-mode.ts",
  "content": "/**\n * Figma Blend Mode to CSS mix-blend-mode Converter\n *\n * This module handles converting Figma blend mode values to their CSS\n * mix-blend-mode equivalents, with fallback strategies for unsupported modes.\n * Supports blend modes on both individual layers and groups.\n */\n\n// ============================================================================\n// Type Definitions\n// ============================================================================\n\n/**\n * All Figma blend modes as defined in the Figma API\n * @see https://www.figma.com/developers/api#blendmode-type\n */\nexport type FigmaBlendMode =\n  // Normal modes\n  | \"PASS_THROUGH\"\n  | \"NORMAL\"\n  // Darken modes\n  | \"DARKEN\"\n  | \"MULTIPLY\"\n  | \"LINEAR_BURN\"\n  | \"COLOR_BURN\"\n  // Lighten modes\n  | \"LIGHTEN\"\n  | \"SCREEN\"\n  | \"LINEAR_DODGE\"\n  | \"COLOR_DODGE\"\n  // Contrast modes\n  | \"OVERLAY\"\n  | \"SOFT_LIGHT\"\n  | \"HARD_LIGHT\"\n  // Inversion modes\n  | \"DIFFERENCE\"\n  | \"EXCLUSION\"\n  // Component modes\n  | \"HUE\"\n  | \"SATURATION\"\n  | \"COLOR\"\n  | \"LUMINOSITY\";\n\n/**\n * CSS mix-blend-mode values\n * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode\n */\nexport type CSSBlendMode =\n  | \"normal\"\n  | \"multiply\"\n  | \"screen\"\n  | \"overlay\"\n  | \"darken\"\n  | \"lighten\"\n  | \"color-dodge\"\n  | \"color-burn\"\n  | \"hard-light\"\n  | \"soft-light\"\n  | \"difference\"\n  | \"exclusion\"\n  | \"hue\"\n  | \"saturation\"\n  | \"color\"\n  | \"luminosity\";\n\n/**\n * Tailwind mix-blend-mode utility classes\n */\nexport type TailwindBlendClass =\n  | \"mix-blend-normal\"\n  | \"mix-blend-multiply\"\n  | \"mix-blend-screen\"\n  | \"mix-blend-overlay\"\n  | \"mix-blend-darken\"\n  | \"mix-blend-lighten\"\n  | \"mix-blend-color-dodge\"\n  | \"mix-blend-color-burn\"\n  | \"mix-blend-hard-light\"\n  | \"mix-blend-soft-light\"\n  | \"mix-blend-difference\"\n  | \"mix-blend-exclusion\"\n  | \"mix-blend-hue\"\n  | \"mix-blend-saturation\"\n  | \"mix-blend-color\"\n  | \"mix-blend-luminosity\";\n\n/**\n * Fallback strategy for unsupported blend modes\n */\nexport type FallbackStrategy =\n  | \"nearest\" // Use the nearest visually similar blend mode\n  | \"normal\" // Fall back to normal blend mode\n  | \"none\" // Don't apply any blend mode (omit the property)\n  | \"custom\"; // Use a custom fallback function\n\n/**\n * Result of blend mode conversion\n */\nexport interface BlendModeConversionResult {\n  /** The CSS mix-blend-mode value */\n  cssValue: CSSBlendMode | null;\n  /** The Tailwind utility class */\n  tailwindClass: TailwindBlendClass | null;\n  /** Whether a fallback was used */\n  usedFallback: boolean;\n  /** The original Figma blend mode */\n  originalMode: string;\n  /** Warning message if fallback was needed */\n  warning?: string;\n  /** Whether this is a group blend mode (pass-through behavior) */\n  isGroupBlend: boolean;\n}\n\n/**\n * Options for blend mode conversion\n */\nexport interface BlendModeConversionOptions {\n  /** Strategy for handling unsupported blend modes */\n  fallbackStrategy?: FallbackStrategy;\n  /** Custom fallback function (used when fallbackStrategy is 'custom') */\n  customFallback?: (mode: string) => CSSBlendMode | null;\n  /** Whether to include CSS comments for fallbacks */\n  includeComments?: boolean;\n  /** Whether the node is a group (affects PASS_THROUGH behavior) */\n  isGroup?: boolean;\n}\n\n// ============================================================================\n// Blend Mode Mapping\n// ============================================================================\n\n/**\n * Direct mapping from Figma blend modes to CSS mix-blend-mode values\n * null indicates the mode has no direct CSS equivalent\n */\nconst FIGMA_TO_CSS_BLEND_MODE: Record<FigmaBlendMode, CSSBlendMode | null> = {\n  // Normal modes\n  PASS_THROUGH: null, // Special case for groups - inherits parent blend mode\n  NORMAL: \"normal\",\n\n  // Darken modes\n  DARKEN: \"darken\",\n  MULTIPLY: \"multiply\",\n  LINEAR_BURN: null, // No CSS equivalent\n  COLOR_BURN: \"color-burn\",\n\n  // Lighten modes\n  LIGHTEN: \"lighten\",\n  SCREEN: \"screen\",\n  LINEAR_DODGE: null, // No CSS equivalent (also known as \"Add\")\n  COLOR_DODGE: \"color-dodge\",\n\n  // Contrast modes\n  OVERLAY: \"overlay\",\n  SOFT_LIGHT: \"soft-light\",\n  HARD_LIGHT: \"hard-light\",\n\n  // Inversion modes\n  DIFFERENCE: \"difference\",\n  EXCLUSION: \"exclusion\",\n\n  // Component modes\n  HUE: \"hue\",\n  SATURATION: \"saturation\",\n  COLOR: \"color\",\n  LUMINOSITY: \"luminosity\",\n};\n\n/**\n * Fallback blend modes for modes that don't have direct CSS equivalents\n * Maps to the visually closest CSS blend mode\n */\nconst FALLBACK_BLEND_MODES: Record<string, CSSBlendMode> = {\n  // LINEAR_BURN is similar to MULTIPLY but more intense\n  // COLOR_BURN is the closest standard CSS mode\n  LINEAR_BURN: \"color-burn\",\n\n  // LINEAR_DODGE (Add) is similar to SCREEN but more intense\n  // COLOR_DODGE is the closest standard CSS mode\n  LINEAR_DODGE: \"color-dodge\",\n\n  // PASS_THROUGH for groups defaults to normal (no isolation)\n  PASS_THROUGH: \"normal\",\n};\n\n/**\n * CSS to Tailwind class mapping\n */\nconst CSS_TO_TAILWIND: Record<CSSBlendMode, TailwindBlendClass> = {\n  normal: \"mix-blend-normal\",\n  multiply: \"mix-blend-multiply\",\n  screen: \"mix-blend-screen\",\n  overlay: \"mix-blend-overlay\",\n  darken: \"mix-blend-darken\",\n  lighten: \"mix-blend-lighten\",\n  \"color-dodge\": \"mix-blend-color-dodge\",\n  \"color-burn\": \"mix-blend-color-burn\",\n  \"hard-light\": \"mix-blend-hard-light\",\n  \"soft-light\": \"mix-blend-soft-light\",\n  difference: \"mix-blend-difference\",\n  exclusion: \"mix-blend-exclusion\",\n  hue: \"mix-blend-hue\",\n  saturation: \"mix-blend-saturation\",\n  color: \"mix-blend-color\",\n  luminosity: \"mix-blend-luminosity\",\n};\n\n// ============================================================================\n// Conversion Functions\n// ============================================================================\n\n/**\n * Convert a Figma blend mode to CSS mix-blend-mode\n */\nexport function figmaBlendModeToCss(\n  figmaBlendMode: string | undefined,\n  options: BlendModeConversionOptions = {}\n): BlendModeConversionResult {\n  const {\n    fallbackStrategy = \"nearest\",\n    customFallback,\n    isGroup = false,\n  } = options;\n\n  // Handle undefined or empty blend mode\n  if (!figmaBlendMode) {\n    return {\n      cssValue: null,\n      tailwindClass: null,\n      usedFallback: false,\n      originalMode: \"\",\n      isGroupBlend: false,\n    };\n  }\n\n  const normalizedMode = figmaBlendMode.toUpperCase() as FigmaBlendMode;\n  const isGroupBlend = normalizedMode === \"PASS_THROUGH\";\n\n  // Handle PASS_THROUGH specially for groups\n  if (normalizedMode === \"PASS_THROUGH\") {\n    if (isGroup) {\n      // Groups with PASS_THROUGH don't isolate their blend context\n      // This means children blend with grandparent, not the group\n      // CSS equivalent is to NOT set isolation: isolate on the group\n      return {\n        cssValue: null,\n        tailwindClass: null,\n        usedFallback: false,\n        originalMode: figmaBlendMode,\n        isGroupBlend: true,\n        warning:\n          \"PASS_THROUGH on groups means no blend mode isolation. \" +\n          \"Omit isolation: isolate to achieve similar behavior.\",\n      };\n    }\n    // PASS_THROUGH on non-groups is equivalent to NORMAL\n    return {\n      cssValue: \"normal\",\n      tailwindClass: \"mix-blend-normal\",\n      usedFallback: false,\n      originalMode: figmaBlendMode,\n      isGroupBlend: false,\n    };\n  }\n\n  // Check for direct mapping\n  const directCssValue = FIGMA_TO_CSS_BLEND_MODE[normalizedMode];\n\n  if (directCssValue !== null && directCssValue !== undefined) {\n    return {\n      cssValue: directCssValue,\n      tailwindClass: CSS_TO_TAILWIND[directCssValue],\n      usedFallback: false,\n      originalMode: figmaBlendMode,\n      isGroupBlend: false,\n    };\n  }\n\n  // Handle unsupported blend modes with fallback strategy\n  return handleUnsupportedBlendMode(\n    normalizedMode,\n    figmaBlendMode,\n    fallbackStrategy,\n    customFallback\n  );\n}\n\n/**\n * Handle unsupported blend modes based on the fallback strategy\n */\nfunction handleUnsupportedBlendMode(\n  normalizedMode: string,\n  originalMode: string,\n  fallbackStrategy: FallbackStrategy,\n  customFallback?: (mode: string) => CSSBlendMode | null\n): BlendModeConversionResult {\n  switch (fallbackStrategy) {\n    case \"nearest\": {\n      const fallbackMode = FALLBACK_BLEND_MODES[normalizedMode];\n      if (fallbackMode) {\n        return {\n          cssValue: fallbackMode,\n          tailwindClass: CSS_TO_TAILWIND[fallbackMode],\n          usedFallback: true,\n          originalMode,\n          warning: `Figma blend mode '${originalMode}' has no direct CSS equivalent. Using '${fallbackMode}' as fallback.`,\n          isGroupBlend: false,\n        };\n      }\n      // If no fallback defined, fall through to 'normal'\n      return {\n        cssValue: \"normal\",\n        tailwindClass: \"mix-blend-normal\",\n        usedFallback: true,\n        originalMode,\n        warning: `Unknown Figma blend mode '${originalMode}'. Falling back to 'normal'.`,\n        isGroupBlend: false,\n      };\n    }\n\n    case \"normal\":\n      return {\n        cssValue: \"normal\",\n        tailwindClass: \"mix-blend-normal\",\n        usedFallback: true,\n        originalMode,\n        warning: `Figma blend mode '${originalMode}' is not supported in CSS. Using 'normal' as fallback.`,\n        isGroupBlend: false,\n      };\n\n    case \"none\":\n      return {\n        cssValue: null,\n        tailwindClass: null,\n        usedFallback: true,\n        originalMode,\n        warning: `Figma blend mode '${originalMode}' is not supported in CSS. Blend mode omitted.`,\n        isGroupBlend: false,\n      };\n\n    case \"custom\": {\n      if (customFallback) {\n        const customValue = customFallback(originalMode);\n        if (customValue) {\n          return {\n            cssValue: customValue,\n            tailwindClass: CSS_TO_TAILWIND[customValue],\n            usedFallback: true,\n            originalMode,\n            warning: `Figma blend mode '${originalMode}' converted using custom fallback to '${customValue}'.`,\n            isGroupBlend: false,\n          };\n        }\n      }\n      return {\n        cssValue: null,\n        tailwindClass: null,\n        usedFallback: true,\n        originalMode,\n        warning: `Custom fallback for '${originalMode}' returned no value.`,\n        isGroupBlend: false,\n      };\n    }\n\n    default:\n      return {\n        cssValue: \"normal\",\n        tailwindClass: \"mix-blend-normal\",\n        usedFallback: true,\n        originalMode,\n        warning: `Unknown fallback strategy. Using 'normal' for '${originalMode}'.`,\n        isGroupBlend: false,\n      };\n  }\n}\n\n/**\n * Convert CSS blend mode value to inline style string\n */\nexport function blendModeToCssString(\n  result: BlendModeConversionResult,\n  options: { includeComments?: boolean } = {}\n): string {\n  if (!result.cssValue) {\n    return \"\";\n  }\n\n  let css = `mix-blend-mode: ${result.cssValue}`;\n\n  if (options.includeComments && result.warning) {\n    css = `/* ${result.warning} */\\n${css}`;\n  }\n\n  return css;\n}\n\n/**\n * Get the Tailwind class for a blend mode\n */\nexport function getBlendModeTailwindClass(\n  figmaBlendMode: string | undefined,\n  options: BlendModeConversionOptions = {}\n): string | null {\n  const result = figmaBlendModeToCss(figmaBlendMode, options);\n  return result.tailwindClass;\n}\n\n// ============================================================================\n// Group and Layer Handling\n// ============================================================================\n\n/**\n * CSS properties for group blend mode handling\n */\nexport interface GroupBlendModeStyles {\n  /** The mix-blend-mode CSS property value */\n  mixBlendMode?: CSSBlendMode;\n  /** Whether to apply isolation: isolate */\n  isolation?: \"isolate\" | \"auto\";\n  /** Tailwind classes for the group */\n  tailwindClasses: string[];\n  /** Warning or notes about the conversion */\n  notes?: string;\n}\n\n/**\n * Generate CSS styles for a group's blend mode\n *\n * In Figma, groups can have two blend mode behaviors:\n * 1. PASS_THROUGH: Children blend with grandparent (no isolation)\n * 2. Any other mode: Group is isolated and blended as a unit\n */\nexport function generateGroupBlendModeStyles(\n  blendMode: string | undefined,\n  options: BlendModeConversionOptions = {}\n): GroupBlendModeStyles {\n  const result = figmaBlendModeToCss(blendMode, { ...options, isGroup: true });\n\n  // PASS_THROUGH means no isolation\n  if (result.isGroupBlend) {\n    return {\n      isolation: \"auto\",\n      tailwindClasses: [],\n      notes:\n        \"PASS_THROUGH blend mode - group children blend with grandparent. \" +\n        \"Do not apply isolation to this group.\",\n    };\n  }\n\n  // No blend mode specified\n  if (!result.cssValue) {\n    return {\n      tailwindClasses: [],\n    };\n  }\n\n  // Normal blend mode - might want isolation depending on context\n  if (result.cssValue === \"normal\") {\n    return {\n      mixBlendMode: \"normal\",\n      isolation: \"isolate\",\n      tailwindClasses: [\"isolate\"],\n      notes: \"Normal blend mode with isolation to contain children's blend modes.\",\n    };\n  }\n\n  // Other blend modes need both the mode and isolation\n  const classes: string[] = [];\n  if (result.tailwindClass) {\n    classes.push(result.tailwindClass);\n  }\n  classes.push(\"isolate\");\n\n  return {\n    mixBlendMode: result.cssValue,\n    isolation: \"isolate\",\n    tailwindClasses: classes,\n    notes: result.warning,\n  };\n}\n\n/**\n * Generate CSS styles for an individual layer's blend mode\n */\nexport function generateLayerBlendModeStyles(\n  blendMode: string | undefined,\n  options: BlendModeConversionOptions = {}\n): {\n  mixBlendMode?: CSSBlendMode;\n  tailwindClass?: string;\n  warning?: string;\n} {\n  const result = figmaBlendModeToCss(blendMode, { ...options, isGroup: false });\n\n  if (!result.cssValue || result.cssValue === \"normal\") {\n    return {\n      warning: result.warning,\n    };\n  }\n\n  return {\n    mixBlendMode: result.cssValue,\n    tailwindClass: result.tailwindClass || undefined,\n    warning: result.warning,\n  };\n}\n\n// ============================================================================\n// Utility Functions\n// ============================================================================\n\n/**\n * Check if a blend mode is supported in CSS\n */\nexport function isBlendModeSupported(figmaBlendMode: string): boolean {\n  const normalizedMode = figmaBlendMode.toUpperCase() as FigmaBlendMode;\n  const cssValue = FIGMA_TO_CSS_BLEND_MODE[normalizedMode];\n  return cssValue !== null && cssValue !== undefined;\n}\n\n/**\n * Get all supported Figma blend modes\n */\nexport function getSupportedBlendModes(): FigmaBlendMode[] {\n  return Object.entries(FIGMA_TO_CSS_BLEND_MODE)\n    .filter(([, cssValue]) => cssValue !== null)\n    .map(([figmaMode]) => figmaMode as FigmaBlendMode);\n}\n\n/**\n * Get all unsupported Figma blend modes\n */\nexport function getUnsupportedBlendModes(): FigmaBlendMode[] {\n  return Object.entries(FIGMA_TO_CSS_BLEND_MODE)\n    .filter(([, cssValue]) => cssValue === null)\n    .map(([figmaMode]) => figmaMode as FigmaBlendMode);\n}\n\n/**\n * Get the fallback for an unsupported blend mode\n */\nexport function getFallbackBlendMode(figmaBlendMode: string): CSSBlendMode | null {\n  const normalizedMode = figmaBlendMode.toUpperCase();\n  return FALLBACK_BLEND_MODES[normalizedMode] || null;\n}\n\n/**\n * Generate a CSS comment explaining a blend mode conversion\n */\nexport function generateBlendModeComment(result: BlendModeConversionResult): string {\n  if (!result.usedFallback) {\n    return `/* Figma: ${result.originalMode} -> CSS: ${result.cssValue} */`;\n  }\n  return `/* Figma: ${result.originalMode} (unsupported) -> CSS: ${result.cssValue} (fallback) */`;\n}\n\n// ============================================================================\n// Node Processing\n// ============================================================================\n\n/**\n * Extended node interface for blend mode processing\n */\nexport interface BlendModeNode {\n  id: string;\n  name: string;\n  type: string;\n  blendMode?: string;\n  opacity?: number;\n  children?: BlendModeNode[];\n}\n\n/**\n * Result of processing a node's blend mode\n */\nexport interface ProcessedBlendMode {\n  nodeId: string;\n  nodeName: string;\n  nodeType: string;\n  blendModeResult: BlendModeConversionResult;\n  cssProperties: Record<string, string>;\n  tailwindClasses: string[];\n}\n\n/**\n * Process a single node's blend mode\n */\nexport function processNodeBlendMode(\n  node: BlendModeNode,\n  options: BlendModeConversionOptions = {}\n): ProcessedBlendMode {\n  const isGroup = node.type === \"GROUP\" || node.type === \"FRAME\";\n  const blendOptions = { ...options, isGroup };\n\n  let blendModeResult: BlendModeConversionResult;\n  const cssProperties: Record<string, string> = {};\n  const tailwindClasses: string[] = [];\n\n  if (isGroup) {\n    const groupStyles = generateGroupBlendModeStyles(node.blendMode, blendOptions);\n    blendModeResult = figmaBlendModeToCss(node.blendMode, blendOptions);\n\n    if (groupStyles.mixBlendMode) {\n      cssProperties[\"mix-blend-mode\"] = groupStyles.mixBlendMode;\n    }\n    if (groupStyles.isolation) {\n      cssProperties[\"isolation\"] = groupStyles.isolation;\n    }\n    tailwindClasses.push(...groupStyles.tailwindClasses);\n  } else {\n    const layerStyles = generateLayerBlendModeStyles(node.blendMode, blendOptions);\n    blendModeResult = figmaBlendModeToCss(node.blendMode, blendOptions);\n\n    if (layerStyles.mixBlendMode) {\n      cssProperties[\"mix-blend-mode\"] = layerStyles.mixBlendMode;\n    }\n    if (layerStyles.tailwindClass) {\n      tailwindClasses.push(layerStyles.tailwindClass);\n    }\n  }\n\n  // Handle opacity if present (often used with blend modes)\n  if (node.opacity !== undefined && node.opacity < 1) {\n    cssProperties[\"opacity\"] = node.opacity.toString();\n    // Tailwind opacity classes (e.g., opacity-50 for 0.5)\n    const opacityPercent = Math.round(node.opacity * 100);\n    // Tailwind has specific opacity values: 0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100\n    const tailwindOpacities = [0, 5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100];\n    const closestOpacity = tailwindOpacities.reduce((prev, curr) =>\n      Math.abs(curr - opacityPercent) < Math.abs(prev - opacityPercent) ? curr : prev\n    );\n    tailwindClasses.push(`opacity-${closestOpacity}`);\n  }\n\n  return {\n    nodeId: node.id,\n    nodeName: node.name,\n    nodeType: node.type,\n    blendModeResult,\n    cssProperties,\n    tailwindClasses,\n  };\n}\n\n/**\n * Process all nodes in a tree and extract blend mode information\n */\nexport function processNodeTreeBlendModes(\n  rootNode: BlendModeNode,\n  options: BlendModeConversionOptions = {}\n): ProcessedBlendMode[] {\n  const results: ProcessedBlendMode[] = [];\n\n  function traverse(node: BlendModeNode) {\n    // Only process nodes that have a blend mode set\n    if (node.blendMode) {\n      results.push(processNodeBlendMode(node, options));\n    }\n\n    // Process children\n    if (node.children) {\n      for (const child of node.children) {\n        traverse(child);\n      }\n    }\n  }\n\n  traverse(rootNode);\n  return results;\n}\n\n/**\n * Generate a summary of blend modes used in a node tree\n */\nexport function generateBlendModeSummary(\n  results: ProcessedBlendMode[]\n): {\n  totalNodes: number;\n  supportedModes: number;\n  unsupportedModes: number;\n  modeUsage: Record<string, number>;\n  warnings: string[];\n} {\n  const modeUsage: Record<string, number> = {};\n  const warnings: string[] = [];\n  let supportedModes = 0;\n  let unsupportedModes = 0;\n\n  for (const result of results) {\n    const mode = result.blendModeResult.originalMode;\n\n    // Count mode usage\n    modeUsage[mode] = (modeUsage[mode] || 0) + 1;\n\n    // Track supported vs unsupported\n    if (result.blendModeResult.usedFallback) {\n      unsupportedModes++;\n      if (result.blendModeResult.warning) {\n        warnings.push(\n          `${result.nodeName} (${result.nodeId}): ${result.blendModeResult.warning}`\n        );\n      }\n    } else {\n      supportedModes++;\n    }\n  }\n\n  return {\n    totalNodes: results.length,\n    supportedModes,\n    unsupportedModes,\n    modeUsage,\n    warnings,\n  };\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create blend mode converter utility",
      "status": "completed",
      "activeForm": "Creating blend mode converter utility"
    },
    {
      "content": "Add comprehensive Figma to CSS blend mode mapping",
      "status": "completed",
      "activeForm": "Adding Figma to CSS blend mode mapping"
    },
    {
      "content": "Implement fallback strategies for unsupported modes",
      "status": "completed",
      "activeForm": "Implementing fallback strategies"
    },
    {
      "content": "Add Tailwind class conversion support",
      "status": "completed",
      "activeForm": "Adding Tailwind class conversion"
    },
    {
      "content": "Support blend modes on groups and layers",
      "status": "completed",
      "activeForm": "Supporting group/layer blend modes"
    },
    {
      "content": "Create Playwright verification test",
      "status": "in_progress",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run and verify the implementation",
      "status": "pending",
      "activeForm": "Running verification test"
    }
  ]
}
Now let me check if Playwright is set up in the project and create a verification test:

🔧 Tool: Glob
Input: {
  "pattern": "**/playwright*.{ts,js,json}"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}
Playwright is installed. Let me check for existing test patterns and configuration:

🔧 Tool: Glob
Input: {
  "pattern": "**/*.spec.{ts,tsx}"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.test.{ts,tsx}"
}
No existing project test files - only tests from node_modules. Let me create a Playwright configuration and a verification test. Since this is a utility library (not a UI component), I'll create a test that verifies the blend mode conversion logic. For this type of pure utility test, I'll use a simpler test approach with Node.js rather than browser-based Playwright since the blend mode utility doesn't require a browser:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/playwright.config.ts",
  "content": "import { defineConfig } from \"@playwright/test\";\n\nexport default defineConfig({\n  testDir: \"./tests\",\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 1 : undefined,\n  reporter: \"html\",\n  use: {\n    trace: \"on-first-retry\",\n  },\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "mkdir -p /home/rainman/figma-to-code/figma-to-code/tests",
  "description": "Create tests directory"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/figma-blend-mode.spec.ts",
  "content": "import { test, expect } from \"@playwright/test\";\nimport {\n  figmaBlendModeToCss,\n  getBlendModeTailwindClass,\n  isBlendModeSupported,\n  getSupportedBlendModes,\n  getUnsupportedBlendModes,\n  getFallbackBlendMode,\n  generateGroupBlendModeStyles,\n  generateLayerBlendModeStyles,\n  processNodeBlendMode,\n  processNodeTreeBlendModes,\n  generateBlendModeSummary,\n  blendModeToCssString,\n  type BlendModeNode,\n} from \"../src/utils/figma-blend-mode\";\n\ntest.describe(\"Figma Blend Mode Converter\", () => {\n  test.describe(\"figmaBlendModeToCss - Direct Conversions\", () => {\n    test(\"converts NORMAL to normal\", () => {\n      const result = figmaBlendModeToCss(\"NORMAL\");\n      expect(result.cssValue).toBe(\"normal\");\n      expect(result.tailwindClass).toBe(\"mix-blend-normal\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts MULTIPLY to multiply\", () => {\n      const result = figmaBlendModeToCss(\"MULTIPLY\");\n      expect(result.cssValue).toBe(\"multiply\");\n      expect(result.tailwindClass).toBe(\"mix-blend-multiply\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts SCREEN to screen\", () => {\n      const result = figmaBlendModeToCss(\"SCREEN\");\n      expect(result.cssValue).toBe(\"screen\");\n      expect(result.tailwindClass).toBe(\"mix-blend-screen\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts OVERLAY to overlay\", () => {\n      const result = figmaBlendModeToCss(\"OVERLAY\");\n      expect(result.cssValue).toBe(\"overlay\");\n      expect(result.tailwindClass).toBe(\"mix-blend-overlay\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts DARKEN to darken\", () => {\n      const result = figmaBlendModeToCss(\"DARKEN\");\n      expect(result.cssValue).toBe(\"darken\");\n      expect(result.tailwindClass).toBe(\"mix-blend-darken\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts LIGHTEN to lighten\", () => {\n      const result = figmaBlendModeToCss(\"LIGHTEN\");\n      expect(result.cssValue).toBe(\"lighten\");\n      expect(result.tailwindClass).toBe(\"mix-blend-lighten\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts COLOR_DODGE to color-dodge\", () => {\n      const result = figmaBlendModeToCss(\"COLOR_DODGE\");\n      expect(result.cssValue).toBe(\"color-dodge\");\n      expect(result.tailwindClass).toBe(\"mix-blend-color-dodge\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts COLOR_BURN to color-burn\", () => {\n      const result = figmaBlendModeToCss(\"COLOR_BURN\");\n      expect(result.cssValue).toBe(\"color-burn\");\n      expect(result.tailwindClass).toBe(\"mix-blend-color-burn\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts HARD_LIGHT to hard-light\", () => {\n      const result = figmaBlendModeToCss(\"HARD_LIGHT\");\n      expect(result.cssValue).toBe(\"hard-light\");\n      expect(result.tailwindClass).toBe(\"mix-blend-hard-light\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts SOFT_LIGHT to soft-light\", () => {\n      const result = figmaBlendModeToCss(\"SOFT_LIGHT\");\n      expect(result.cssValue).toBe(\"soft-light\");\n      expect(result.tailwindClass).toBe(\"mix-blend-soft-light\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts DIFFERENCE to difference\", () => {\n      const result = figmaBlendModeToCss(\"DIFFERENCE\");\n      expect(result.cssValue).toBe(\"difference\");\n      expect(result.tailwindClass).toBe(\"mix-blend-difference\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts EXCLUSION to exclusion\", () => {\n      const result = figmaBlendModeToCss(\"EXCLUSION\");\n      expect(result.cssValue).toBe(\"exclusion\");\n      expect(result.tailwindClass).toBe(\"mix-blend-exclusion\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts HUE to hue\", () => {\n      const result = figmaBlendModeToCss(\"HUE\");\n      expect(result.cssValue).toBe(\"hue\");\n      expect(result.tailwindClass).toBe(\"mix-blend-hue\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts SATURATION to saturation\", () => {\n      const result = figmaBlendModeToCss(\"SATURATION\");\n      expect(result.cssValue).toBe(\"saturation\");\n      expect(result.tailwindClass).toBe(\"mix-blend-saturation\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts COLOR to color\", () => {\n      const result = figmaBlendModeToCss(\"COLOR\");\n      expect(result.cssValue).toBe(\"color\");\n      expect(result.tailwindClass).toBe(\"mix-blend-color\");\n      expect(result.usedFallback).toBe(false);\n    });\n\n    test(\"converts LUMINOSITY to luminosity\", () => {\n      const result = figmaBlendModeToCss(\"LUMINOSITY\");\n      expect(result.cssValue).toBe(\"luminosity\");\n      expect(result.tailwindClass).toBe(\"mix-blend-luminosity\");\n      expect(result.usedFallback).toBe(false);\n    });\n  });\n\n  test.describe(\"figmaBlendModeToCss - Unsupported Modes with Fallbacks\", () => {\n    test(\"converts LINEAR_BURN to color-burn (nearest fallback)\", () => {\n      const result = figmaBlendModeToCss(\"LINEAR_BURN\", { fallbackStrategy: \"nearest\" });\n      expect(result.cssValue).toBe(\"color-burn\");\n      expect(result.usedFallback).toBe(true);\n      expect(result.warning).toContain(\"LINEAR_BURN\");\n      expect(result.warning).toContain(\"color-burn\");\n    });\n\n    test(\"converts LINEAR_DODGE to color-dodge (nearest fallback)\", () => {\n      const result = figmaBlendModeToCss(\"LINEAR_DODGE\", { fallbackStrategy: \"nearest\" });\n      expect(result.cssValue).toBe(\"color-dodge\");\n      expect(result.usedFallback).toBe(true);\n      expect(result.warning).toContain(\"LINEAR_DODGE\");\n    });\n\n    test(\"uses normal fallback strategy\", () => {\n      const result = figmaBlendModeToCss(\"LINEAR_BURN\", { fallbackStrategy: \"normal\" });\n      expect(result.cssValue).toBe(\"normal\");\n      expect(result.usedFallback).toBe(true);\n    });\n\n    test(\"uses none fallback strategy\", () => {\n      const result = figmaBlendModeToCss(\"LINEAR_BURN\", { fallbackStrategy: \"none\" });\n      expect(result.cssValue).toBe(null);\n      expect(result.tailwindClass).toBe(null);\n      expect(result.usedFallback).toBe(true);\n    });\n\n    test(\"uses custom fallback strategy\", () => {\n      const result = figmaBlendModeToCss(\"LINEAR_BURN\", {\n        fallbackStrategy: \"custom\",\n        customFallback: () => \"multiply\",\n      });\n      expect(result.cssValue).toBe(\"multiply\");\n      expect(result.usedFallback).toBe(true);\n    });\n  });\n\n  test.describe(\"figmaBlendModeToCss - PASS_THROUGH Handling\", () => {\n    test(\"PASS_THROUGH on non-group returns normal\", () => {\n      const result = figmaBlendModeToCss(\"PASS_THROUGH\", { isGroup: false });\n      expect(result.cssValue).toBe(\"normal\");\n      expect(result.isGroupBlend).toBe(false);\n    });\n\n    test(\"PASS_THROUGH on group returns null with note\", () => {\n      const result = figmaBlendModeToCss(\"PASS_THROUGH\", { isGroup: true });\n      expect(result.cssValue).toBe(null);\n      expect(result.isGroupBlend).toBe(true);\n      expect(result.warning).toContain(\"isolation\");\n    });\n  });\n\n  test.describe(\"figmaBlendModeToCss - Edge Cases\", () => {\n    test(\"handles undefined blend mode\", () => {\n      const result = figmaBlendModeToCss(undefined);\n      expect(result.cssValue).toBe(null);\n      expect(result.tailwindClass).toBe(null);\n    });\n\n    test(\"handles empty string blend mode\", () => {\n      const result = figmaBlendModeToCss(\"\");\n      expect(result.cssValue).toBe(null);\n    });\n\n    test(\"handles lowercase blend mode\", () => {\n      const result = figmaBlendModeToCss(\"multiply\");\n      expect(result.cssValue).toBe(\"multiply\");\n    });\n\n    test(\"handles mixed case blend mode\", () => {\n      const result = figmaBlendModeToCss(\"Multiply\");\n      expect(result.cssValue).toBe(\"multiply\");\n    });\n  });\n\n  test.describe(\"blendModeToCssString\", () => {\n    test(\"generates CSS string without comments\", () => {\n      const result = figmaBlendModeToCss(\"MULTIPLY\");\n      const css = blendModeToCssString(result);\n      expect(css).toBe(\"mix-blend-mode: multiply\");\n    });\n\n    test(\"generates CSS string with comments for fallbacks\", () => {\n      const result = figmaBlendModeToCss(\"LINEAR_BURN\");\n      const css = blendModeToCssString(result, { includeComments: true });\n      expect(css).toContain(\"/* \");\n      expect(css).toContain(\"mix-blend-mode: color-burn\");\n    });\n\n    test(\"returns empty string for null CSS value\", () => {\n      const result = figmaBlendModeToCss(undefined);\n      const css = blendModeToCssString(result);\n      expect(css).toBe(\"\");\n    });\n  });\n\n  test.describe(\"getBlendModeTailwindClass\", () => {\n    test(\"returns correct Tailwind class\", () => {\n      expect(getBlendModeTailwindClass(\"MULTIPLY\")).toBe(\"mix-blend-multiply\");\n      expect(getBlendModeTailwindClass(\"SCREEN\")).toBe(\"mix-blend-screen\");\n      expect(getBlendModeTailwindClass(\"OVERLAY\")).toBe(\"mix-blend-overlay\");\n    });\n\n    test(\"returns null for undefined mode\", () => {\n      expect(getBlendModeTailwindClass(undefined)).toBe(null);\n    });\n  });\n\n  test.describe(\"isBlendModeSupported\", () => {\n    test(\"returns true for supported modes\", () => {\n      expect(isBlendModeSupported(\"MULTIPLY\")).toBe(true);\n      expect(isBlendModeSupported(\"SCREEN\")).toBe(true);\n      expect(isBlendModeSupported(\"OVERLAY\")).toBe(true);\n    });\n\n    test(\"returns false for unsupported modes\", () => {\n      expect(isBlendModeSupported(\"LINEAR_BURN\")).toBe(false);\n      expect(isBlendModeSupported(\"LINEAR_DODGE\")).toBe(false);\n      expect(isBlendModeSupported(\"PASS_THROUGH\")).toBe(false);\n    });\n  });\n\n  test.describe(\"getSupportedBlendModes and getUnsupportedBlendModes\", () => {\n    test(\"getSupportedBlendModes returns array of supported modes\", () => {\n      const supported = getSupportedBlendModes();\n      expect(supported).toContain(\"NORMAL\");\n      expect(supported).toContain(\"MULTIPLY\");\n      expect(supported).toContain(\"SCREEN\");\n      expect(supported).not.toContain(\"LINEAR_BURN\");\n      expect(supported).not.toContain(\"PASS_THROUGH\");\n    });\n\n    test(\"getUnsupportedBlendModes returns array of unsupported modes\", () => {\n      const unsupported = getUnsupportedBlendModes();\n      expect(unsupported).toContain(\"LINEAR_BURN\");\n      expect(unsupported).toContain(\"LINEAR_DODGE\");\n      expect(unsupported).toContain(\"PASS_THROUGH\");\n      expect(unsupported).not.toContain(\"MULTIPLY\");\n    });\n  });\n\n  test.describe(\"getFallbackBlendMode\", () => {\n    test(\"returns fallback for LINEAR_BURN\", () => {\n      expect(getFallbackBlendMode(\"LINEAR_BURN\")).toBe(\"color-burn\");\n    });\n\n    test(\"returns fallback for LINEAR_DODGE\", () => {\n      expect(getFallbackBlendMode(\"LINEAR_DODGE\")).toBe(\"color-dodge\");\n    });\n\n    test(\"returns null for supported mode\", () => {\n      expect(getFallbackBlendMode(\"MULTIPLY\")).toBe(null);\n    });\n  });\n\n  test.describe(\"generateGroupBlendModeStyles\", () => {\n    test(\"handles PASS_THROUGH group\", () => {\n      const styles = generateGroupBlendModeStyles(\"PASS_THROUGH\", { isGroup: true });\n      expect(styles.isolation).toBe(\"auto\");\n      expect(styles.mixBlendMode).toBeUndefined();\n      expect(styles.tailwindClasses).toEqual([]);\n    });\n\n    test(\"handles MULTIPLY group\", () => {\n      const styles = generateGroupBlendModeStyles(\"MULTIPLY\", { isGroup: true });\n      expect(styles.mixBlendMode).toBe(\"multiply\");\n      expect(styles.isolation).toBe(\"isolate\");\n      expect(styles.tailwindClasses).toContain(\"mix-blend-multiply\");\n      expect(styles.tailwindClasses).toContain(\"isolate\");\n    });\n\n    test(\"handles NORMAL group with isolation\", () => {\n      const styles = generateGroupBlendModeStyles(\"NORMAL\", { isGroup: true });\n      expect(styles.mixBlendMode).toBe(\"normal\");\n      expect(styles.isolation).toBe(\"isolate\");\n      expect(styles.tailwindClasses).toContain(\"isolate\");\n    });\n  });\n\n  test.describe(\"generateLayerBlendModeStyles\", () => {\n    test(\"returns mix-blend-mode for non-normal modes\", () => {\n      const styles = generateLayerBlendModeStyles(\"MULTIPLY\");\n      expect(styles.mixBlendMode).toBe(\"multiply\");\n      expect(styles.tailwindClass).toBe(\"mix-blend-multiply\");\n    });\n\n    test(\"returns undefined for NORMAL mode\", () => {\n      const styles = generateLayerBlendModeStyles(\"NORMAL\");\n      expect(styles.mixBlendMode).toBeUndefined();\n    });\n  });\n\n  test.describe(\"processNodeBlendMode\", () => {\n    test(\"processes layer node with blend mode\", () => {\n      const node: BlendModeNode = {\n        id: \"node-1\",\n        name: \"Layer 1\",\n        type: \"RECTANGLE\",\n        blendMode: \"MULTIPLY\",\n      };\n\n      const result = processNodeBlendMode(node);\n      expect(result.nodeId).toBe(\"node-1\");\n      expect(result.cssProperties[\"mix-blend-mode\"]).toBe(\"multiply\");\n      expect(result.tailwindClasses).toContain(\"mix-blend-multiply\");\n    });\n\n    test(\"processes group node with blend mode and isolation\", () => {\n      const node: BlendModeNode = {\n        id: \"group-1\",\n        name: \"Group 1\",\n        type: \"GROUP\",\n        blendMode: \"MULTIPLY\",\n      };\n\n      const result = processNodeBlendMode(node);\n      expect(result.cssProperties[\"mix-blend-mode\"]).toBe(\"multiply\");\n      expect(result.cssProperties[\"isolation\"]).toBe(\"isolate\");\n      expect(result.tailwindClasses).toContain(\"isolate\");\n    });\n\n    test(\"processes node with opacity\", () => {\n      const node: BlendModeNode = {\n        id: \"node-1\",\n        name: \"Layer 1\",\n        type: \"RECTANGLE\",\n        blendMode: \"MULTIPLY\",\n        opacity: 0.5,\n      };\n\n      const result = processNodeBlendMode(node);\n      expect(result.cssProperties[\"opacity\"]).toBe(\"0.5\");\n      expect(result.tailwindClasses).toContain(\"opacity-50\");\n    });\n  });\n\n  test.describe(\"processNodeTreeBlendModes\", () => {\n    test(\"processes tree with nested blend modes\", () => {\n      const tree: BlendModeNode = {\n        id: \"root\",\n        name: \"Frame\",\n        type: \"FRAME\",\n        blendMode: \"NORMAL\",\n        children: [\n          {\n            id: \"layer-1\",\n            name: \"Layer 1\",\n            type: \"RECTANGLE\",\n            blendMode: \"MULTIPLY\",\n          },\n          {\n            id: \"layer-2\",\n            name: \"Layer 2\",\n            type: \"RECTANGLE\",\n            blendMode: \"SCREEN\",\n          },\n          {\n            id: \"group-1\",\n            name: \"Group 1\",\n            type: \"GROUP\",\n            blendMode: \"OVERLAY\",\n            children: [\n              {\n                id: \"layer-3\",\n                name: \"Layer 3\",\n                type: \"RECTANGLE\",\n                blendMode: \"DIFFERENCE\",\n              },\n            ],\n          },\n        ],\n      };\n\n      const results = processNodeTreeBlendModes(tree);\n      expect(results.length).toBe(5);\n\n      const nodeIds = results.map((r) => r.nodeId);\n      expect(nodeIds).toContain(\"root\");\n      expect(nodeIds).toContain(\"layer-1\");\n      expect(nodeIds).toContain(\"layer-2\");\n      expect(nodeIds).toContain(\"group-1\");\n      expect(nodeIds).toContain(\"layer-3\");\n    });\n  });\n\n  test.describe(\"generateBlendModeSummary\", () => {\n    test(\"generates summary of blend mode usage\", () => {\n      const tree: BlendModeNode = {\n        id: \"root\",\n        name: \"Frame\",\n        type: \"FRAME\",\n        blendMode: \"NORMAL\",\n        children: [\n          {\n            id: \"layer-1\",\n            name: \"Layer 1\",\n            type: \"RECTANGLE\",\n            blendMode: \"MULTIPLY\",\n          },\n          {\n            id: \"layer-2\",\n            name: \"Layer 2\",\n            type: \"RECTANGLE\",\n            blendMode: \"MULTIPLY\",\n          },\n          {\n            id: \"layer-3\",\n            name: \"Layer 3\",\n            type: \"RECTANGLE\",\n            blendMode: \"LINEAR_BURN\",\n          },\n        ],\n      };\n\n      const results = processNodeTreeBlendModes(tree);\n      const summary = generateBlendModeSummary(results);\n\n      expect(summary.totalNodes).toBe(4);\n      expect(summary.supportedModes).toBe(3);\n      expect(summary.unsupportedModes).toBe(1);\n      expect(summary.modeUsage[\"MULTIPLY\"]).toBe(2);\n      expect(summary.modeUsage[\"LINEAR_BURN\"]).toBe(1);\n      expect(summary.warnings.length).toBe(1);\n      expect(summary.warnings[0]).toContain(\"LINEAR_BURN\");\n    });\n  });\n});\n"
}
Now let me run the tests to verify the implementation:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create blend mode converter utility",
      "status": "completed",
      "activeForm": "Creating blend mode converter utility"
    },
    {
      "content": "Add comprehensive Figma to CSS blend mode mapping",
      "status": "completed",
      "activeForm": "Adding Figma to CSS blend mode mapping"
    },
    {
      "content": "Implement fallback strategies for unsupported modes",
      "status": "completed",
      "activeForm": "Implementing fallback strategies"
    },
    {
      "content": "Add Tailwind class conversion support",
      "status": "completed",
      "activeForm": "Adding Tailwind class conversion"
    },
    {
      "content": "Support blend modes on groups and layers",
      "status": "completed",
      "activeForm": "Supporting group/layer blend modes"
    },
    {
      "content": "Create Playwright verification test",
      "status": "completed",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run and verify the implementation",
      "status": "in_progress",
      "activeForm": "Running verification test"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/figma-blend-mode.spec.ts 2>&1 | head -100",
  "description": "Run Playwright verification tests",
  "timeout": 120000
}
All 49 tests pass. Now let me delete the test files as instructed (these are temporary verification tests):

🔧 Tool: Bash
Input: {
  "command": "rm /home/rainman/figma-to-code/figma-to-code/tests/figma-blend-mode.spec.ts && rm /home/rainman/figma-to-code/figma-to-code/playwright.config.ts && rmdir /home/rainman/figma-to-code/figma-to-code/tests 2>/dev/null || true",
  "description": "Remove temporary test files"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create blend mode converter utility",
      "status": "completed",
      "activeForm": "Creating blend mode converter utility"
    },
    {
      "content": "Add comprehensive Figma to CSS blend mode mapping",
      "status": "completed",
      "activeForm": "Adding Figma to CSS blend mode mapping"
    },
    {
      "content": "Implement fallback strategies for unsupported modes",
      "status": "completed",
      "activeForm": "Implementing fallback strategies"
    },
    {
      "content": "Add Tailwind class conversion support",
      "status": "completed",
      "activeForm": "Adding Tailwind class conversion"
    },
    {
      "content": "Support blend modes on groups and layers",
      "status": "completed",
      "activeForm": "Supporting group/layer blend modes"
    },
    {
      "content": "Create Playwright verification test",
      "status": "completed",
      "activeForm": "Creating Playwright verification test"
    },
    {
      "content": "Run and verify the implementation",
      "status": "completed",
      "activeForm": "Running verification test"
    }
  ]
}
<summary>
## Summary: Convert Figma Blend Modes to CSS mix-blend-mode Values

### Changes Implemented
- Created comprehensive blend mode conversion utility (`figma-blend-mode.ts`)
- Added mapping for all 18 Figma blend modes to CSS `mix-blend-mode` values
- Implemented 4 fallback strategies for unsupported modes: `nearest`, `normal`, `none`, and `custom`
- Added Tailwind CSS class conversion support (`mix-blend-*` utilities)
- Special handling for groups with `PASS_THROUGH` blend mode (no isolation)
- Automatic isolation handling for groups with blend modes
- Support for opacity combined with blend modes
- Node tree processing for batch blend mode extraction
- Summary generation for blend mode usage analysis

### Files Modified
- `src/utils/figma-blend-mode.ts` (new file - 513 lines)

### Key Features

**Supported Figma Blend Modes (direct CSS mapping):**
- NORMAL, MULTIPLY, SCREEN, OVERLAY, DARKEN, LIGHTEN
- COLOR_DODGE, COLOR_BURN, HARD_LIGHT, SOFT_LIGHT
- DIFFERENCE, EXCLUSION, HUE, SATURATION, COLOR, LUMINOSITY

**Unsupported Modes with Fallbacks:**
- LINEAR_BURN → `color-burn` (nearest visual match)
- LINEAR_DODGE → `color-dodge` (nearest visual match)
- PASS_THROUGH → Group-specific behavior (no isolation)

**API Functions:**
- `figmaBlendModeToCss()` - Core conversion function
- `getBlendModeTailwindClass()` - Get Tailwind utility class
- `generateGroupBlendModeStyles()` - Handle group blend modes with isolation
- `generateLayerBlendModeStyles()` - Handle individual layer blend modes
- `processNodeBlendMode()` - Process a single node
- `processNodeTreeBlendModes()` - Process entire node tree
- `generateBlendModeSummary()` - Generate usage statistics

### Notes for Developer
- The utility follows the existing patterns in `figma-constraints.ts` and `typography-extractor.ts`
- Groups with blend modes automatically get `isolation: isolate` to contain children's blend modes
- PASS_THROUGH on groups means children blend with grandparent - handled by NOT applying isolation
- All unsupported modes emit warnings that can be included in CSS comments
- TypeScript types are fully exported for type safety

### Verification Status
- Created 49 Playwright tests covering all functions and edge cases
- All tests passed successfully (944ms execution time)
- Tests verified: direct conversions, fallback strategies, PASS_THROUGH handling, edge cases, group/layer handling, tree processing, and summary generation
- Test files removed after successful verification as per instructions
</summary>