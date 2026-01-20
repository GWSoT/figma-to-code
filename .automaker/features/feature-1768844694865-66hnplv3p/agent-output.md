I'll start by understanding the codebase and then implement the gradient parsing feature. Let me first invoke the brainstorming skill since this is a creative/implementation task.

🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming",
  "args": "Implement gradient parsing for Figma designs - parse linear, radial, angular, and diamond gradients, convert to CSS gradient syntax with accurate color stops and positions, handle multiple gradient fills layered together"
}
I'll help implement gradient parsing for Figma designs. Let me first explore the codebase to understand the current project structure and any existing gradient-related code.

🔧 Tool: Task
Input: {
  "prompt": "Explore the codebase to understand:\n1. The overall project structure - is this a Figma-to-code converter?\n2. Any existing gradient parsing or CSS generation code\n3. How Figma data is structured/received in this project\n4. Any existing color/style parsing utilities\n5. The patterns used for converting Figma properties to CSS\n\nFocus on src/ directory and look for files related to:\n- Figma parsing\n- CSS generation\n- Color utilities\n- Style conversion\n\nBe thorough - this is a \"medium\" depth exploration.",
  "subagent_type": "Explore",
  "description": "Explore codebase structure"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.json\" | grep -E \"(package|tsconfig)\" | head -5",
  "description": "Check project configuration files"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*figma*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*color*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*gradient*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*style*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*css*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Grep
Input: {
  "pattern": "gradient|fill|stroke|shadow|blend",
  "path": "/home/rainman/figma-to-code/figma-to-code/src/utils",
  "output_mode": "files_with_matches"
}

🔧 Tool: Grep
Input: {
  "pattern": "export|function|const",
  "path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma.ts",
  "output_mode": "files_with_matches"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-blend-mode.ts"
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
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-constraints.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-component-resolver.ts"
}

🔧 Tool: Grep
Input: {
  "pattern": "gradient|fill|color|paint|stroke",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "type": "ts",
  "output_mode": "files_with_matches",
  "head_limit": 20
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l \"gradient\\|paint\\|fill\" | head -10",
  "description": "Search for files with gradient/paint/fill references"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/README.md"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/utils/ | grep figma",
  "description": "List Figma utilities in src/utils"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/ | grep -i figma",
  "description": "List Figma components"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/figma/*",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/figma/export-dialog.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l \"export\\|codegen\\|toCSS\\|toCss\" | grep -E \"(figma|code)\" | head -10",
  "description": "Search for code generation or export-related files"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/docs -type f -name \"*.md\" 2>/dev/null | head -10",
  "description": "List documentation files"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/db -type f -name \"*.ts\" | head -10",
  "description": "List database files"
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"gradient\\|paint\\|fill\\|stroke\\|color\" /home/rainman/figma-to-code/figma-to-code/src/db 2>/dev/null | head -5",
  "description": "Search for color/paint related database fields"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/index.ts",
  "limit": 150
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "limit": 300
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "offset": 300,
  "limit": 200
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" \\) | xargs grep -l \"FigmaExport\\|export.*Figma\" | head -5",
  "description": "Search for Figma export related files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/srcset.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/typography-extractor.ts",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "wc -l /home/rainman/figma-to-code/figma-to-code/src/utils/*.ts /home/rainman/figma-to-code/figma-to-code/src/fn/figma*.ts 2>/dev/null | sort -rn | head -15",
  "description": "Show file sizes for Figma utilities"
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"gradient\\|paint\\|fill\" /home/rainman/figma-to-code/figma-to-code/src --include=\"*.ts\" --include=\"*.tsx\" -l | head -5",
  "description": "Search for gradient/paint/fill handling files"
}
Excellent! Now I have a clear picture. The codebase has Figma utilities for blend modes, constraints, and typography, but **no gradient parsing exists yet**. Let me look at one of the existing utility files to understand the patterns better.

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-blend-mode.ts",
  "limit": 150
}
Good pattern understanding. Now let me check the Figma API types to understand how gradients are structured in the Figma API:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts",
  "limit": 200
}
I see the `fills` is typed as `unknown[]`. Now I understand the structure. Based on the Figma API documentation and the existing patterns in the codebase, let me now design the gradient parsing utility.

Given this is a feature implementation, I have enough context to proceed. Let me create the todo list and implement:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create figma-gradient.ts utility file with type definitions",
      "status": "in_progress",
      "activeForm": "Creating gradient utility types"
    },
    {
      "content": "Implement linear gradient parsing and CSS conversion",
      "status": "pending",
      "activeForm": "Implementing linear gradient parsing"
    },
    {
      "content": "Implement radial gradient parsing and CSS conversion",
      "status": "pending",
      "activeForm": "Implementing radial gradient parsing"
    },
    {
      "content": "Implement angular (conic) gradient parsing and CSS conversion",
      "status": "pending",
      "activeForm": "Implementing angular gradient parsing"
    },
    {
      "content": "Implement diamond gradient parsing with fallback",
      "status": "pending",
      "activeForm": "Implementing diamond gradient parsing"
    },
    {
      "content": "Add support for multiple layered gradient fills",
      "status": "pending",
      "activeForm": "Adding multiple gradient support"
    },
    {
      "content": "Add Tailwind class generation for gradients",
      "status": "pending",
      "activeForm": "Adding Tailwind gradient classes"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying with Playwright test"
    }
  ]
}
Now let me create the gradient parsing utility. Based on the Figma API documentation, gradients have:
- `type`: "GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"
- `gradientHandlePositions`: Array of 3 positions (start, end, and width control)
- `gradientStops`: Array of color stops with position (0-1) and color

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-gradient.ts",
  "content": "/**\n * Figma Gradient to CSS Gradient Converter\n *\n * This module handles converting Figma gradient fills to CSS gradient syntax.\n * Supports linear, radial, angular (conic), and diamond gradients with accurate\n * color stops and positions. Handles multiple gradient fills layered together.\n *\n * @see https://www.figma.com/developers/api#paint-type\n */\n\nimport type { FigmaColor } from \"./figma-api\";\n\n// ============================================================================\n// Type Definitions\n// ============================================================================\n\n/**\n * Figma gradient types as defined in the Figma API\n */\nexport type FigmaGradientType =\n  | \"GRADIENT_LINEAR\"\n  | \"GRADIENT_RADIAL\"\n  | \"GRADIENT_ANGULAR\"\n  | \"GRADIENT_DIAMOND\";\n\n/**\n * CSS gradient types\n */\nexport type CSSGradientType = \"linear-gradient\" | \"radial-gradient\" | \"conic-gradient\";\n\n/**\n * A position in the gradient handle coordinate system (0-1 normalized)\n */\nexport interface GradientHandlePosition {\n  x: number;\n  y: number;\n}\n\n/**\n * A color stop in the gradient\n */\nexport interface FigmaGradientStop {\n  /** Position along the gradient (0-1) */\n  position: number;\n  /** Color at this stop */\n  color: FigmaColor;\n}\n\n/**\n * Figma Paint object for gradient fills\n */\nexport interface FigmaGradientPaint {\n  /** Type of gradient */\n  type: FigmaGradientType;\n  /** Whether the fill is visible */\n  visible?: boolean;\n  /** Opacity of the fill (0-1) */\n  opacity?: number;\n  /** Blend mode for the fill */\n  blendMode?: string;\n  /**\n   * Gradient handle positions - array of 3 positions:\n   * [0] = start point of the gradient\n   * [1] = end point of the gradient\n   * [2] = width control point (for radial/diamond gradients)\n   */\n  gradientHandlePositions: GradientHandlePosition[];\n  /** Array of color stops */\n  gradientStops: FigmaGradientStop[];\n}\n\n/**\n * Any Figma paint type (solid or gradient)\n */\nexport interface FigmaPaint {\n  type: string;\n  visible?: boolean;\n  opacity?: number;\n  blendMode?: string;\n  color?: FigmaColor;\n  gradientHandlePositions?: GradientHandlePosition[];\n  gradientStops?: FigmaGradientStop[];\n}\n\n/**\n * Result of gradient conversion\n */\nexport interface GradientConversionResult {\n  /** The CSS gradient value */\n  cssValue: string;\n  /** The CSS gradient type used */\n  gradientType: CSSGradientType;\n  /** Whether a fallback was used (e.g., diamond → radial) */\n  usedFallback: boolean;\n  /** The original Figma gradient type */\n  originalType: FigmaGradientType;\n  /** Warning message if fallback was needed or precision was lost */\n  warning?: string;\n  /** Tailwind classes if available (limited support) */\n  tailwindClasses?: string[];\n}\n\n/**\n * Result of converting multiple fills\n */\nexport interface MultiFillConversionResult {\n  /** Combined CSS background value with all gradients layered */\n  cssBackground: string;\n  /** Individual gradient results */\n  gradients: GradientConversionResult[];\n  /** Any solid color fills included */\n  solidColors: string[];\n  /** Overall warnings */\n  warnings: string[];\n}\n\n/**\n * Options for gradient conversion\n */\nexport interface GradientConversionOptions {\n  /** Whether to include CSS comments for fallbacks and complex conversions */\n  includeComments?: boolean;\n  /** Color format for output: 'rgba' | 'hex' | 'hsl' */\n  colorFormat?: \"rgba\" | \"hex\" | \"hsl\";\n  /** Whether to optimize color stops (remove redundant stops) */\n  optimizeStops?: boolean;\n  /** Precision for position percentages (decimal places) */\n  positionPrecision?: number;\n  /** Precision for angle degrees (decimal places) */\n  anglePrecision?: number;\n  /** Diamond gradient fallback strategy */\n  diamondFallback?: \"radial\" | \"linear\" | \"none\";\n}\n\n// ============================================================================\n// Constants\n// ============================================================================\n\nconst DEFAULT_OPTIONS: Required<GradientConversionOptions> = {\n  includeComments: false,\n  colorFormat: \"rgba\",\n  optimizeStops: true,\n  positionPrecision: 2,\n  anglePrecision: 1,\n  diamondFallback: \"radial\",\n};\n\n// ============================================================================\n// Helper Functions - Color Conversion\n// ============================================================================\n\n/**\n * Converts Figma color (0-1 range) to CSS rgba string\n */\nexport function figmaColorToRgba(color: FigmaColor, opacity: number = 1): string {\n  const r = Math.round(color.r * 255);\n  const g = Math.round(color.g * 255);\n  const b = Math.round(color.b * 255);\n  const a = Number((color.a * opacity).toFixed(3));\n\n  if (a === 1) {\n    return `rgb(${r}, ${g}, ${b})`;\n  }\n  return `rgba(${r}, ${g}, ${b}, ${a})`;\n}\n\n/**\n * Converts Figma color to hex string\n */\nexport function figmaColorToHex(color: FigmaColor, opacity: number = 1): string {\n  const r = Math.round(color.r * 255);\n  const g = Math.round(color.g * 255);\n  const b = Math.round(color.b * 255);\n  const a = Math.round(color.a * opacity * 255);\n\n  const toHex = (n: number) => n.toString(16).padStart(2, \"0\");\n\n  if (a === 255) {\n    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;\n  }\n  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;\n}\n\n/**\n * Converts Figma color to HSL string\n */\nexport function figmaColorToHsl(color: FigmaColor, opacity: number = 1): string {\n  const r = color.r;\n  const g = color.g;\n  const b = color.b;\n\n  const max = Math.max(r, g, b);\n  const min = Math.min(r, g, b);\n  const l = (max + min) / 2;\n\n  let h = 0;\n  let s = 0;\n\n  if (max !== min) {\n    const d = max - min;\n    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);\n\n    switch (max) {\n      case r:\n        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;\n        break;\n      case g:\n        h = ((b - r) / d + 2) / 6;\n        break;\n      case b:\n        h = ((r - g) / d + 4) / 6;\n        break;\n    }\n  }\n\n  const hDeg = Math.round(h * 360);\n  const sPct = Math.round(s * 100);\n  const lPct = Math.round(l * 100);\n  const a = Number((color.a * opacity).toFixed(3));\n\n  if (a === 1) {\n    return `hsl(${hDeg}, ${sPct}%, ${lPct}%)`;\n  }\n  return `hsla(${hDeg}, ${sPct}%, ${lPct}%, ${a})`;\n}\n\n/**\n * Converts a Figma color to the specified format\n */\nfunction formatColor(\n  color: FigmaColor,\n  format: GradientConversionOptions[\"colorFormat\"],\n  opacity: number = 1\n): string {\n  switch (format) {\n    case \"hex\":\n      return figmaColorToHex(color, opacity);\n    case \"hsl\":\n      return figmaColorToHsl(color, opacity);\n    case \"rgba\":\n    default:\n      return figmaColorToRgba(color, opacity);\n  }\n}\n\n// ============================================================================\n// Helper Functions - Geometry\n// ============================================================================\n\n/**\n * Calculates the angle in degrees from gradient handle positions\n * Returns angle in CSS convention (0deg = to top, 90deg = to right)\n */\nexport function calculateGradientAngle(\n  start: GradientHandlePosition,\n  end: GradientHandlePosition\n): number {\n  // Calculate the vector from start to end\n  const dx = end.x - start.x;\n  const dy = end.y - start.y;\n\n  // atan2 gives angle from positive X axis, counterclockwise\n  // CSS gradients: 0deg = to top, 90deg = to right (clockwise from top)\n  // So we need to convert from math convention to CSS convention\n  const angleRad = Math.atan2(dx, -dy); // Note: -dy because Y is inverted in screen coords\n  let angleDeg = angleRad * (180 / Math.PI);\n\n  // Normalize to 0-360\n  if (angleDeg < 0) {\n    angleDeg += 360;\n  }\n\n  return angleDeg;\n}\n\n/**\n * Calculates the gradient length from handle positions\n */\nexport function calculateGradientLength(\n  start: GradientHandlePosition,\n  end: GradientHandlePosition\n): number {\n  const dx = end.x - start.x;\n  const dy = end.y - start.y;\n  return Math.sqrt(dx * dx + dy * dy);\n}\n\n/**\n * Calculates radial gradient properties from handle positions\n */\nexport function calculateRadialProperties(handles: GradientHandlePosition[]): {\n  centerX: number;\n  centerY: number;\n  radiusX: number;\n  radiusY: number;\n  angle: number;\n} {\n  const [start, end, widthHandle] = handles;\n\n  // Center is at the start position\n  const centerX = start.x * 100;\n  const centerY = start.y * 100;\n\n  // Calculate radii from handle positions\n  const dx = end.x - start.x;\n  const dy = end.y - start.y;\n  const primaryRadius = Math.sqrt(dx * dx + dy * dy);\n\n  // Width handle determines the secondary radius\n  const wdx = widthHandle.x - start.x;\n  const wdy = widthHandle.y - start.y;\n  const secondaryRadius = Math.sqrt(wdx * wdx + wdy * wdy);\n\n  // Angle of the ellipse\n  const angle = Math.atan2(dy, dx) * (180 / Math.PI);\n\n  return {\n    centerX,\n    centerY,\n    radiusX: primaryRadius * 100,\n    radiusY: secondaryRadius * 100,\n    angle,\n  };\n}\n\n/**\n * Calculates conic gradient properties from handle positions\n */\nexport function calculateConicProperties(handles: GradientHandlePosition[]): {\n  centerX: number;\n  centerY: number;\n  startAngle: number;\n} {\n  const [start, end] = handles;\n\n  // Center is at the start position\n  const centerX = start.x * 100;\n  const centerY = start.y * 100;\n\n  // Calculate start angle from the end handle position\n  const dx = end.x - start.x;\n  const dy = end.y - start.y;\n\n  // CSS conic-gradient: 0deg = top, clockwise\n  // atan2 gives angle from positive X axis, counterclockwise\n  let startAngle = Math.atan2(dx, -dy) * (180 / Math.PI);\n  if (startAngle < 0) {\n    startAngle += 360;\n  }\n\n  return {\n    centerX,\n    centerY,\n    startAngle,\n  };\n}\n\n// ============================================================================\n// Color Stop Processing\n// ============================================================================\n\n/**\n * Formats a gradient stop for CSS output\n */\nfunction formatColorStop(\n  stop: FigmaGradientStop,\n  options: Required<GradientConversionOptions>,\n  fillOpacity: number = 1\n): string {\n  const color = formatColor(stop.color, options.colorFormat, fillOpacity);\n  const position = (stop.position * 100).toFixed(options.positionPrecision);\n\n  // Optimization: don't include 0% or 100% if at start/end\n  if (options.optimizeStops) {\n    if (stop.position === 0) {\n      return color;\n    }\n    if (stop.position === 1) {\n      return color;\n    }\n  }\n\n  return `${color} ${position}%`;\n}\n\n/**\n * Processes and formats all color stops\n */\nfunction processColorStops(\n  stops: FigmaGradientStop[],\n  options: Required<GradientConversionOptions>,\n  fillOpacity: number = 1\n): string {\n  // Sort stops by position\n  const sortedStops = [...stops].sort((a, b) => a.position - b.position);\n\n  return sortedStops.map((stop) => formatColorStop(stop, options, fillOpacity)).join(\", \");\n}\n\n// ============================================================================\n// Gradient Conversion Functions\n// ============================================================================\n\n/**\n * Converts a Figma linear gradient to CSS\n */\nexport function convertLinearGradient(\n  paint: FigmaGradientPaint,\n  options: GradientConversionOptions = {}\n): GradientConversionResult {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;\n\n  const [start, end] = gradientHandlePositions;\n  const angle = calculateGradientAngle(start, end);\n  const angleStr = angle.toFixed(opts.anglePrecision);\n\n  const colorStops = processColorStops(gradientStops, opts, opacity);\n\n  const cssValue = `linear-gradient(${angleStr}deg, ${colorStops})`;\n\n  return {\n    cssValue,\n    gradientType: \"linear-gradient\",\n    usedFallback: false,\n    originalType: \"GRADIENT_LINEAR\",\n  };\n}\n\n/**\n * Converts a Figma radial gradient to CSS\n */\nexport function convertRadialGradient(\n  paint: FigmaGradientPaint,\n  options: GradientConversionOptions = {}\n): GradientConversionResult {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;\n\n  const { centerX, centerY, radiusX, radiusY, angle } =\n    calculateRadialProperties(gradientHandlePositions);\n\n  const colorStops = processColorStops(gradientStops, opts, opacity);\n\n  // Check if it's a circular gradient (equal radii)\n  const isCircular = Math.abs(radiusX - radiusY) < 0.1;\n\n  let cssValue: string;\n  let warning: string | undefined;\n\n  if (isCircular && Math.abs(angle) < 1) {\n    // Simple circular gradient\n    const centerXStr = centerX.toFixed(opts.positionPrecision);\n    const centerYStr = centerY.toFixed(opts.positionPrecision);\n    cssValue = `radial-gradient(circle at ${centerXStr}% ${centerYStr}%, ${colorStops})`;\n  } else if (Math.abs(angle) < 1) {\n    // Elliptical gradient without rotation\n    const centerXStr = centerX.toFixed(opts.positionPrecision);\n    const centerYStr = centerY.toFixed(opts.positionPrecision);\n    const rxStr = radiusX.toFixed(opts.positionPrecision);\n    const ryStr = radiusY.toFixed(opts.positionPrecision);\n    cssValue = `radial-gradient(${rxStr}% ${ryStr}% at ${centerXStr}% ${centerYStr}%, ${colorStops})`;\n  } else {\n    // Rotated elliptical gradient - CSS doesn't support rotation directly\n    // We approximate with a non-rotated ellipse\n    const centerXStr = centerX.toFixed(opts.positionPrecision);\n    const centerYStr = centerY.toFixed(opts.positionPrecision);\n    const rxStr = radiusX.toFixed(opts.positionPrecision);\n    const ryStr = radiusY.toFixed(opts.positionPrecision);\n    cssValue = `radial-gradient(${rxStr}% ${ryStr}% at ${centerXStr}% ${centerYStr}%, ${colorStops})`;\n    warning = `Rotated elliptical gradient (${angle.toFixed(1)}deg) approximated without rotation. CSS radial-gradient doesn't support rotation.`;\n  }\n\n  return {\n    cssValue,\n    gradientType: \"radial-gradient\",\n    usedFallback: !!warning,\n    originalType: \"GRADIENT_RADIAL\",\n    warning,\n  };\n}\n\n/**\n * Converts a Figma angular gradient to CSS conic-gradient\n */\nexport function convertAngularGradient(\n  paint: FigmaGradientPaint,\n  options: GradientConversionOptions = {}\n): GradientConversionResult {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;\n\n  const { centerX, centerY, startAngle } = calculateConicProperties(gradientHandlePositions);\n\n  const colorStops = processColorStops(gradientStops, opts, opacity);\n\n  const centerXStr = centerX.toFixed(opts.positionPrecision);\n  const centerYStr = centerY.toFixed(opts.positionPrecision);\n  const angleStr = startAngle.toFixed(opts.anglePrecision);\n\n  const cssValue = `conic-gradient(from ${angleStr}deg at ${centerXStr}% ${centerYStr}%, ${colorStops})`;\n\n  return {\n    cssValue,\n    gradientType: \"conic-gradient\",\n    usedFallback: false,\n    originalType: \"GRADIENT_ANGULAR\",\n  };\n}\n\n/**\n * Converts a Figma diamond gradient to CSS\n *\n * Note: CSS doesn't have a native diamond gradient. This converts to a\n * radial gradient or linear gradient approximation based on the fallback option.\n */\nexport function convertDiamondGradient(\n  paint: FigmaGradientPaint,\n  options: GradientConversionOptions = {}\n): GradientConversionResult {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n  const { gradientHandlePositions, gradientStops, opacity = 1 } = paint;\n\n  if (opts.diamondFallback === \"none\") {\n    return {\n      cssValue: \"\",\n      gradientType: \"radial-gradient\",\n      usedFallback: true,\n      originalType: \"GRADIENT_DIAMOND\",\n      warning: \"Diamond gradient skipped (diamondFallback: 'none')\",\n    };\n  }\n\n  const colorStops = processColorStops(gradientStops, opts, opacity);\n\n  if (opts.diamondFallback === \"linear\") {\n    // Approximate with linear gradient using the primary axis\n    const [start, end] = gradientHandlePositions;\n    const angle = calculateGradientAngle(start, end);\n    const angleStr = angle.toFixed(opts.anglePrecision);\n\n    const cssValue = `linear-gradient(${angleStr}deg, ${colorStops})`;\n\n    return {\n      cssValue,\n      gradientType: \"linear-gradient\",\n      usedFallback: true,\n      originalType: \"GRADIENT_DIAMOND\",\n      warning:\n        \"Diamond gradient approximated as linear-gradient. Consider using SVG for accurate diamond gradients.\",\n    };\n  }\n\n  // Default: radial fallback\n  const { centerX, centerY, radiusX, radiusY } = calculateRadialProperties(gradientHandlePositions);\n\n  const centerXStr = centerX.toFixed(opts.positionPrecision);\n  const centerYStr = centerY.toFixed(opts.positionPrecision);\n\n  // Use the average of the two radii for a circular approximation\n  const avgRadius = ((radiusX + radiusY) / 2).toFixed(opts.positionPrecision);\n\n  const cssValue = `radial-gradient(circle ${avgRadius}% at ${centerXStr}% ${centerYStr}%, ${colorStops})`;\n\n  return {\n    cssValue,\n    gradientType: \"radial-gradient\",\n    usedFallback: true,\n    originalType: \"GRADIENT_DIAMOND\",\n    warning:\n      \"Diamond gradient approximated as radial-gradient. Consider using SVG for accurate diamond gradients.\",\n  };\n}\n\n// ============================================================================\n// Main Conversion Functions\n// ============================================================================\n\n/**\n * Type guard to check if a paint is a gradient\n */\nexport function isGradientPaint(paint: FigmaPaint): paint is FigmaGradientPaint {\n  return (\n    paint.type === \"GRADIENT_LINEAR\" ||\n    paint.type === \"GRADIENT_RADIAL\" ||\n    paint.type === \"GRADIENT_ANGULAR\" ||\n    paint.type === \"GRADIENT_DIAMOND\"\n  );\n}\n\n/**\n * Type guard to check if a paint is a solid color\n */\nexport function isSolidPaint(paint: FigmaPaint): boolean {\n  return paint.type === \"SOLID\";\n}\n\n/**\n * Converts a single Figma gradient paint to CSS\n */\nexport function convertGradient(\n  paint: FigmaGradientPaint,\n  options: GradientConversionOptions = {}\n): GradientConversionResult {\n  switch (paint.type) {\n    case \"GRADIENT_LINEAR\":\n      return convertLinearGradient(paint, options);\n    case \"GRADIENT_RADIAL\":\n      return convertRadialGradient(paint, options);\n    case \"GRADIENT_ANGULAR\":\n      return convertAngularGradient(paint, options);\n    case \"GRADIENT_DIAMOND\":\n      return convertDiamondGradient(paint, options);\n    default:\n      // TypeScript should catch this, but just in case\n      return {\n        cssValue: \"\",\n        gradientType: \"linear-gradient\",\n        usedFallback: true,\n        originalType: paint.type,\n        warning: `Unknown gradient type: ${paint.type}`,\n      };\n  }\n}\n\n/**\n * Converts multiple Figma fills (including solids and gradients) to CSS background\n *\n * Figma layers fills from bottom to top (first fill is bottom-most).\n * CSS background-image layers from top to bottom (first value is top-most).\n * So we need to reverse the order.\n */\nexport function convertFillsToBackground(\n  fills: FigmaPaint[],\n  options: GradientConversionOptions = {}\n): MultiFillConversionResult {\n  const opts = { ...DEFAULT_OPTIONS, ...options };\n  const gradients: GradientConversionResult[] = [];\n  const solidColors: string[] = [];\n  const warnings: string[] = [];\n\n  // Process visible fills only\n  const visibleFills = fills.filter((fill) => fill.visible !== false);\n\n  for (const fill of visibleFills) {\n    if (isGradientPaint(fill)) {\n      const result = convertGradient(fill, opts);\n      if (result.cssValue) {\n        gradients.push(result);\n      }\n      if (result.warning) {\n        warnings.push(result.warning);\n      }\n    } else if (isSolidPaint(fill) && fill.color) {\n      const color = formatColor(fill.color, opts.colorFormat, fill.opacity ?? 1);\n      solidColors.push(color);\n    }\n  }\n\n  // Reverse order for CSS (Figma: bottom-to-top, CSS: top-to-bottom)\n  const reversedGradients = [...gradients].reverse();\n  const reversedSolids = [...solidColors].reverse();\n\n  // Build combined background value\n  const backgroundParts: string[] = [];\n\n  // Add gradients first (they layer on top)\n  for (const gradient of reversedGradients) {\n    backgroundParts.push(gradient.cssValue);\n  }\n\n  // Solid colors become the bottom-most layer as background-color\n  // Or can be converted to linear-gradient for layering\n  for (const color of reversedSolids) {\n    // Convert solid to linear-gradient so it can layer with other gradients\n    backgroundParts.push(`linear-gradient(${color}, ${color})`);\n  }\n\n  const cssBackground = backgroundParts.join(\", \");\n\n  return {\n    cssBackground,\n    gradients: reversedGradients,\n    solidColors: reversedSolids,\n    warnings,\n  };\n}\n\n// ============================================================================\n// Tailwind CSS Generation\n// ============================================================================\n\n/**\n * Tailwind gradient direction classes\n */\nconst TAILWIND_DIRECTIONS: Record<string, string> = {\n  \"0\": \"bg-gradient-to-t\",\n  \"45\": \"bg-gradient-to-tr\",\n  \"90\": \"bg-gradient-to-r\",\n  \"135\": \"bg-gradient-to-br\",\n  \"180\": \"bg-gradient-to-b\",\n  \"225\": \"bg-gradient-to-bl\",\n  \"270\": \"bg-gradient-to-l\",\n  \"315\": \"bg-gradient-to-tl\",\n};\n\n/**\n * Attempts to generate Tailwind classes for a gradient\n * Returns null if the gradient can't be represented with Tailwind utilities\n */\nexport function gradientToTailwind(\n  paint: FigmaGradientPaint\n): { classes: string[]; isApproximate: boolean; warning?: string } | null {\n  // Only linear gradients with simple stops can use Tailwind\n  if (paint.type !== \"GRADIENT_LINEAR\") {\n    return null;\n  }\n\n  const stops = paint.gradientStops;\n\n  // Tailwind only supports 2-3 color stops (from, via, to)\n  if (stops.length < 2 || stops.length > 3) {\n    return null;\n  }\n\n  // Check if stops are at standard positions (0, 0.5, 1)\n  const hasStandardPositions =\n    stops.length === 2\n      ? stops[0].position === 0 && stops[1].position === 1\n      : stops[0].position === 0 && Math.abs(stops[1].position - 0.5) < 0.1 && stops[2].position === 1;\n\n  if (!hasStandardPositions) {\n    return null;\n  }\n\n  // Calculate angle\n  const [start, end] = paint.gradientHandlePositions;\n  const angle = calculateGradientAngle(start, end);\n\n  // Find closest Tailwind direction\n  const roundedAngle = Math.round(angle / 45) * 45;\n  const normalizedAngle = roundedAngle % 360;\n  const directionClass = TAILWIND_DIRECTIONS[normalizedAngle.toString()];\n\n  if (!directionClass) {\n    return null;\n  }\n\n  const classes: string[] = [directionClass];\n  const isApproximate = Math.abs(angle - normalizedAngle) > 5;\n\n  // Generate color classes (these would need to be custom colors in Tailwind config)\n  // For now, we return the direction class and note that colors need arbitrary values\n  const fromColor = figmaColorToHex(stops[0].color);\n  const toColor = figmaColorToHex(stops[stops.length - 1].color);\n\n  classes.push(`from-[${fromColor}]`);\n\n  if (stops.length === 3) {\n    const viaColor = figmaColorToHex(stops[1].color);\n    classes.push(`via-[${viaColor}]`);\n  }\n\n  classes.push(`to-[${toColor}]`);\n\n  return {\n    classes,\n    isApproximate,\n    warning: isApproximate ? `Angle ${angle.toFixed(1)}deg approximated to ${normalizedAngle}deg for Tailwind` : undefined,\n  };\n}\n\n// ============================================================================\n// CSS Generation Utilities\n// ============================================================================\n\n/**\n * Generates a complete CSS rule for gradient background\n */\nexport function generateGradientCSS(\n  fills: FigmaPaint[],\n  options: GradientConversionOptions & {\n    selector?: string;\n    includeBackgroundColor?: boolean;\n  } = {}\n): string {\n  const { selector = \".element\", includeBackgroundColor = true, includeComments, ...convertOptions } = options;\n  const result = convertFillsToBackground(fills, convertOptions);\n\n  const lines: string[] = [];\n\n  if (includeComments && result.warnings.length > 0) {\n    lines.push(`/* Warnings: ${result.warnings.join(\"; \")} */`);\n  }\n\n  lines.push(`${selector} {`);\n\n  // If there's a solid color, use it as background-color fallback\n  if (includeBackgroundColor && result.solidColors.length > 0) {\n    lines.push(`  background-color: ${result.solidColors[result.solidColors.length - 1]};`);\n  }\n\n  if (result.cssBackground) {\n    lines.push(`  background: ${result.cssBackground};`);\n  }\n\n  lines.push(`}`);\n\n  return lines.join(\"\\n\");\n}\n\n/**\n * Generates inline style object for React/JSX\n */\nexport function generateGradientStyle(\n  fills: FigmaPaint[],\n  options: GradientConversionOptions = {}\n): React.CSSProperties {\n  const result = convertFillsToBackground(fills, options);\n\n  const style: React.CSSProperties = {};\n\n  if (result.solidColors.length > 0) {\n    style.backgroundColor = result.solidColors[result.solidColors.length - 1];\n  }\n\n  if (result.cssBackground) {\n    style.background = result.cssBackground;\n  }\n\n  return style;\n}\n\n// ============================================================================\n// Parsing Utilities\n// ============================================================================\n\n/**\n * Parses fills from a Figma node (handles the unknown[] type)\n */\nexport function parseFillsFromNode(fills: unknown[]): FigmaPaint[] {\n  if (!Array.isArray(fills)) {\n    return [];\n  }\n\n  return fills.filter((fill): fill is FigmaPaint => {\n    if (typeof fill !== \"object\" || fill === null) {\n      return false;\n    }\n\n    const f = fill as Record<string, unknown>;\n    return typeof f.type === \"string\";\n  });\n}\n\n/**\n * Extracts all gradients from a Figma node tree\n */\nexport function extractGradientsFromNode(node: {\n  fills?: unknown[];\n  children?: Array<{ fills?: unknown[]; children?: unknown[] }>;\n}): { nodeId?: string; fills: FigmaPaint[] }[] {\n  const results: { nodeId?: string; fills: FigmaPaint[] }[] = [];\n\n  const traverse = (n: { id?: string; fills?: unknown[]; children?: unknown[] }) => {\n    if (n.fills && Array.isArray(n.fills)) {\n      const parsedFills = parseFillsFromNode(n.fills);\n      const gradients = parsedFills.filter(isGradientPaint);\n\n      if (gradients.length > 0) {\n        results.push({\n          nodeId: n.id,\n          fills: parsedFills,\n        });\n      }\n    }\n\n    if (n.children && Array.isArray(n.children)) {\n      for (const child of n.children) {\n        traverse(child as { id?: string; fills?: unknown[]; children?: unknown[] });\n      }\n    }\n  };\n\n  traverse(node);\n  return results;\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create figma-gradient.ts utility file with type definitions",
      "status": "completed",
      "activeForm": "Creating gradient utility types"
    },
    {
      "content": "Implement linear gradient parsing and CSS conversion",
      "status": "completed",
      "activeForm": "Implementing linear gradient parsing"
    },
    {
      "content": "Implement radial gradient parsing and CSS conversion",
      "status": "completed",
      "activeForm": "Implementing radial gradient parsing"
    },
    {
      "content": "Implement angular (conic) gradient parsing and CSS conversion",
      "status": "completed",
      "activeForm": "Implementing angular gradient parsing"
    },
    {
      "content": "Implement diamond gradient parsing with fallback",
      "status": "completed",
      "activeForm": "Implementing diamond gradient parsing"
    },
    {
      "content": "Add support for multiple layered gradient fills",
      "status": "completed",
      "activeForm": "Adding multiple gradient support"
    },
    {
      "content": "Add Tailwind class generation for gradients",
      "status": "completed",
      "activeForm": "Adding Tailwind gradient classes"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "in_progress",
      "activeForm": "Verifying with Playwright test"
    }
  ]
}
Now let me verify the TypeScript compiles correctly and then create a Playwright test:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit src/utils/figma-gradient.ts 2>&1 | head -50",
  "description": "Type-check gradient utility"
}
The type checking needs project context. Let me run it with the project config:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit 2>&1 | grep -E \"(figma-gradient|error)\" | head -30",
  "description": "Type-check with project config"
}
The errors are in other parts of the codebase, not in my gradient utility. Let me check specifically for the gradient file:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit 2>&1 | grep \"figma-gradient\"",
  "description": "Check gradient file for errors"
}
No errors in the gradient file. Now let me create a verification test. First, let me check if Playwright is already set up:

🔧 Tool: Glob
Input: {
  "pattern": "**/playwright.config.*"
}
Playwright isn't set up. Let me check what test frameworks are available:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}
Playwright is installed as a dev dependency. Let me create a playwright config and write a verification test:

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
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/figma-gradient.spec.ts",
  "content": "/**\n * Verification tests for Figma Gradient to CSS Converter\n *\n * This test file verifies the gradient parsing and CSS conversion functionality\n * using unit-style tests run through Playwright's test runner.\n */\n\nimport { test, expect } from \"@playwright/test\";\nimport {\n  figmaColorToRgba,\n  figmaColorToHex,\n  figmaColorToHsl,\n  calculateGradientAngle,\n  convertLinearGradient,\n  convertRadialGradient,\n  convertAngularGradient,\n  convertDiamondGradient,\n  convertFillsToBackground,\n  gradientToTailwind,\n  parseFillsFromNode,\n  isGradientPaint,\n  type FigmaGradientPaint,\n  type FigmaPaint,\n} from \"../src/utils/figma-gradient\";\n\n// ============================================================================\n// Color Conversion Tests\n// ============================================================================\n\ntest.describe(\"Color Conversion\", () => {\n  test(\"figmaColorToRgba converts colors correctly\", () => {\n    // Pure red\n    expect(figmaColorToRgba({ r: 1, g: 0, b: 0, a: 1 })).toBe(\"rgb(255, 0, 0)\");\n\n    // Pure green with 50% opacity\n    expect(figmaColorToRgba({ r: 0, g: 1, b: 0, a: 0.5 })).toBe(\"rgba(0, 255, 0, 0.5)\");\n\n    // Blue with external opacity modifier\n    expect(figmaColorToRgba({ r: 0, g: 0, b: 1, a: 1 }, 0.5)).toBe(\"rgba(0, 0, 255, 0.5)\");\n\n    // Mixed color\n    expect(figmaColorToRgba({ r: 0.5, g: 0.5, b: 0.5, a: 1 })).toBe(\"rgb(128, 128, 128)\");\n  });\n\n  test(\"figmaColorToHex converts colors correctly\", () => {\n    // Pure red\n    expect(figmaColorToHex({ r: 1, g: 0, b: 0, a: 1 })).toBe(\"#ff0000\");\n\n    // Pure white\n    expect(figmaColorToHex({ r: 1, g: 1, b: 1, a: 1 })).toBe(\"#ffffff\");\n\n    // Black with 50% opacity\n    expect(figmaColorToHex({ r: 0, g: 0, b: 0, a: 0.5 })).toBe(\"#00000080\");\n  });\n\n  test(\"figmaColorToHsl converts colors correctly\", () => {\n    // Pure red\n    expect(figmaColorToHsl({ r: 1, g: 0, b: 0, a: 1 })).toBe(\"hsl(0, 100%, 50%)\");\n\n    // Pure green\n    expect(figmaColorToHsl({ r: 0, g: 1, b: 0, a: 1 })).toBe(\"hsl(120, 100%, 50%)\");\n\n    // Pure blue\n    expect(figmaColorToHsl({ r: 0, g: 0, b: 1, a: 1 })).toBe(\"hsl(240, 100%, 50%)\");\n  });\n});\n\n// ============================================================================\n// Geometry Calculation Tests\n// ============================================================================\n\ntest.describe(\"Geometry Calculations\", () => {\n  test(\"calculateGradientAngle handles horizontal gradient (left to right)\", () => {\n    const angle = calculateGradientAngle({ x: 0, y: 0.5 }, { x: 1, y: 0.5 });\n    expect(angle).toBeCloseTo(90, 0); // 90deg = to right\n  });\n\n  test(\"calculateGradientAngle handles vertical gradient (top to bottom)\", () => {\n    const angle = calculateGradientAngle({ x: 0.5, y: 0 }, { x: 0.5, y: 1 });\n    expect(angle).toBeCloseTo(180, 0); // 180deg = to bottom\n  });\n\n  test(\"calculateGradientAngle handles diagonal gradient (top-left to bottom-right)\", () => {\n    const angle = calculateGradientAngle({ x: 0, y: 0 }, { x: 1, y: 1 });\n    expect(angle).toBeCloseTo(135, 0); // 135deg = to bottom-right\n  });\n\n  test(\"calculateGradientAngle handles vertical gradient (bottom to top)\", () => {\n    const angle = calculateGradientAngle({ x: 0.5, y: 1 }, { x: 0.5, y: 0 });\n    expect(angle).toBeCloseTo(0, 0); // 0deg = to top\n  });\n});\n\n// ============================================================================\n// Linear Gradient Tests\n// ============================================================================\n\ntest.describe(\"Linear Gradient Conversion\", () => {\n  test(\"converts simple two-color linear gradient\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      gradientHandlePositions: [\n        { x: 0, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n      ],\n    };\n\n    const result = convertLinearGradient(paint);\n\n    expect(result.gradientType).toBe(\"linear-gradient\");\n    expect(result.usedFallback).toBe(false);\n    expect(result.originalType).toBe(\"GRADIENT_LINEAR\");\n    expect(result.cssValue).toContain(\"90\");\n    expect(result.cssValue).toContain(\"rgb(255, 0, 0)\");\n    expect(result.cssValue).toContain(\"rgb(0, 0, 255)\");\n  });\n\n  test(\"converts linear gradient with multiple stops\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0 },\n        { x: 0.5, y: 1 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 0.5, color: { r: 0, g: 1, b: 0, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n      ],\n    };\n\n    const result = convertLinearGradient(paint);\n\n    expect(result.cssValue).toContain(\"180\");\n    expect(result.cssValue).toContain(\"rgb(255, 0, 0)\");\n    expect(result.cssValue).toContain(\"rgb(0, 255, 0)\");\n    expect(result.cssValue).toContain(\"rgb(0, 0, 255)\");\n    expect(result.cssValue).toContain(\"50.00%\");\n  });\n\n  test(\"handles gradient with opacity\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      opacity: 0.5,\n      gradientHandlePositions: [\n        { x: 0, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n      ],\n    };\n\n    const result = convertLinearGradient(paint);\n\n    expect(result.cssValue).toContain(\"rgba(255, 0, 0, 0.5)\");\n    expect(result.cssValue).toContain(\"rgba(0, 0, 255, 0.5)\");\n  });\n});\n\n// ============================================================================\n// Radial Gradient Tests\n// ============================================================================\n\ntest.describe(\"Radial Gradient Conversion\", () => {\n  test(\"converts circular radial gradient\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_RADIAL\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0.5, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 1, b: 0, a: 1 } },\n        { position: 1, color: { r: 1, g: 0, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = convertRadialGradient(paint);\n\n    expect(result.gradientType).toBe(\"radial-gradient\");\n    expect(result.usedFallback).toBe(false);\n    expect(result.cssValue).toContain(\"radial-gradient\");\n    expect(result.cssValue).toContain(\"50.00%\");\n    expect(result.cssValue).toContain(\"rgb(255, 255, 0)\");\n    expect(result.cssValue).toContain(\"rgb(255, 0, 0)\");\n  });\n\n  test(\"converts elliptical radial gradient\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_RADIAL\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0.5, y: 0.75 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = convertRadialGradient(paint);\n\n    expect(result.gradientType).toBe(\"radial-gradient\");\n    expect(result.cssValue).toContain(\"radial-gradient\");\n    expect(result.cssValue).toContain(\"at 50.00% 50.00%\");\n  });\n});\n\n// ============================================================================\n// Angular (Conic) Gradient Tests\n// ============================================================================\n\ntest.describe(\"Angular Gradient Conversion\", () => {\n  test(\"converts angular gradient to conic-gradient\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_ANGULAR\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0.5 },\n        { x: 0.5, y: 0 },\n        { x: 1, y: 0.5 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 0.33, color: { r: 0, g: 1, b: 0, a: 1 } },\n        { position: 0.66, color: { r: 0, g: 0, b: 1, a: 1 } },\n        { position: 1, color: { r: 1, g: 0, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = convertAngularGradient(paint);\n\n    expect(result.gradientType).toBe(\"conic-gradient\");\n    expect(result.usedFallback).toBe(false);\n    expect(result.cssValue).toContain(\"conic-gradient\");\n    expect(result.cssValue).toContain(\"at 50.00% 50.00%\");\n  });\n});\n\n// ============================================================================\n// Diamond Gradient Tests\n// ============================================================================\n\ntest.describe(\"Diamond Gradient Conversion\", () => {\n  test(\"converts diamond gradient with radial fallback\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_DIAMOND\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0.5, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = convertDiamondGradient(paint);\n\n    expect(result.usedFallback).toBe(true);\n    expect(result.originalType).toBe(\"GRADIENT_DIAMOND\");\n    expect(result.warning).toContain(\"Diamond gradient approximated\");\n    expect(result.cssValue).toContain(\"radial-gradient\");\n  });\n\n  test(\"converts diamond gradient with linear fallback\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_DIAMOND\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0.5, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = convertDiamondGradient(paint, { diamondFallback: \"linear\" });\n\n    expect(result.usedFallback).toBe(true);\n    expect(result.cssValue).toContain(\"linear-gradient\");\n  });\n\n  test(\"returns empty for diamond gradient with none fallback\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_DIAMOND\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0.5, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = convertDiamondGradient(paint, { diamondFallback: \"none\" });\n\n    expect(result.cssValue).toBe(\"\");\n    expect(result.usedFallback).toBe(true);\n  });\n});\n\n// ============================================================================\n// Multiple Fill Tests\n// ============================================================================\n\ntest.describe(\"Multiple Fills Conversion\", () => {\n  test(\"combines multiple gradient fills\", () => {\n    const fills: FigmaPaint[] = [\n      {\n        type: \"GRADIENT_LINEAR\",\n        gradientHandlePositions: [\n          { x: 0, y: 0.5 },\n          { x: 1, y: 0.5 },\n          { x: 0, y: 0 },\n        ],\n        gradientStops: [\n          { position: 0, color: { r: 1, g: 0, b: 0, a: 0.5 } },\n          { position: 1, color: { r: 0, g: 0, b: 1, a: 0.5 } },\n        ],\n      },\n      {\n        type: \"GRADIENT_RADIAL\",\n        gradientHandlePositions: [\n          { x: 0.5, y: 0.5 },\n          { x: 1, y: 0.5 },\n          { x: 0.5, y: 0 },\n        ],\n        gradientStops: [\n          { position: 0, color: { r: 1, g: 1, b: 0, a: 1 } },\n          { position: 1, color: { r: 1, g: 0, b: 0, a: 0 } },\n        ],\n      },\n    ];\n\n    const result = convertFillsToBackground(fills);\n\n    expect(result.gradients).toHaveLength(2);\n    expect(result.cssBackground).toContain(\"radial-gradient\");\n    expect(result.cssBackground).toContain(\"linear-gradient\");\n    // Order is reversed for CSS (top-most first)\n    expect(result.cssBackground.indexOf(\"radial\")).toBeLessThan(result.cssBackground.indexOf(\"linear\"));\n  });\n\n  test(\"combines gradients with solid colors\", () => {\n    const fills: FigmaPaint[] = [\n      {\n        type: \"SOLID\",\n        color: { r: 1, g: 1, b: 1, a: 1 },\n      },\n      {\n        type: \"GRADIENT_LINEAR\",\n        gradientHandlePositions: [\n          { x: 0, y: 0.5 },\n          { x: 1, y: 0.5 },\n          { x: 0, y: 0 },\n        ],\n        gradientStops: [\n          { position: 0, color: { r: 0, g: 0, b: 0, a: 0 } },\n          { position: 1, color: { r: 0, g: 0, b: 0, a: 1 } },\n        ],\n      },\n    ];\n\n    const result = convertFillsToBackground(fills);\n\n    expect(result.gradients).toHaveLength(1);\n    expect(result.solidColors).toHaveLength(1);\n    expect(result.cssBackground).toContain(\"linear-gradient\");\n  });\n\n  test(\"filters out invisible fills\", () => {\n    const fills: FigmaPaint[] = [\n      {\n        type: \"GRADIENT_LINEAR\",\n        visible: false,\n        gradientHandlePositions: [\n          { x: 0, y: 0.5 },\n          { x: 1, y: 0.5 },\n          { x: 0, y: 0 },\n        ],\n        gradientStops: [\n          { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n          { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n        ],\n      },\n      {\n        type: \"GRADIENT_LINEAR\",\n        visible: true,\n        gradientHandlePositions: [\n          { x: 0.5, y: 0 },\n          { x: 0.5, y: 1 },\n          { x: 0, y: 0 },\n        ],\n        gradientStops: [\n          { position: 0, color: { r: 0, g: 1, b: 0, a: 1 } },\n          { position: 1, color: { r: 1, g: 1, b: 0, a: 1 } },\n        ],\n      },\n    ];\n\n    const result = convertFillsToBackground(fills);\n\n    expect(result.gradients).toHaveLength(1);\n    expect(result.cssBackground).toContain(\"180\");\n    expect(result.cssBackground).not.toContain(\"90\");\n  });\n});\n\n// ============================================================================\n// Tailwind Conversion Tests\n// ============================================================================\n\ntest.describe(\"Tailwind Gradient Conversion\", () => {\n  test(\"converts simple linear gradient to Tailwind\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      gradientHandlePositions: [\n        { x: 0, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n      ],\n    };\n\n    const result = gradientToTailwind(paint);\n\n    expect(result).not.toBeNull();\n    expect(result?.classes).toContain(\"bg-gradient-to-r\");\n    expect(result?.classes).toContain(\"from-[#ff0000]\");\n    expect(result?.classes).toContain(\"to-[#0000ff]\");\n  });\n\n  test(\"converts three-stop gradient to Tailwind with via\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0 },\n        { x: 0.5, y: 1 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 0.5, color: { r: 0, g: 1, b: 0, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n      ],\n    };\n\n    const result = gradientToTailwind(paint);\n\n    expect(result).not.toBeNull();\n    expect(result?.classes).toContain(\"bg-gradient-to-b\");\n    expect(result?.classes).toContain(\"from-[#ff0000]\");\n    expect(result?.classes).toContain(\"via-[#00ff00]\");\n    expect(result?.classes).toContain(\"to-[#0000ff]\");\n  });\n\n  test(\"returns null for radial gradients\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_RADIAL\",\n      gradientHandlePositions: [\n        { x: 0.5, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0.5, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = gradientToTailwind(paint);\n\n    expect(result).toBeNull();\n  });\n\n  test(\"returns null for gradients with more than 3 stops\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      gradientHandlePositions: [\n        { x: 0, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 0.33, color: { r: 0, g: 1, b: 0, a: 1 } },\n        { position: 0.66, color: { r: 0, g: 0, b: 1, a: 1 } },\n        { position: 1, color: { r: 1, g: 1, b: 0, a: 1 } },\n      ],\n    };\n\n    const result = gradientToTailwind(paint);\n\n    expect(result).toBeNull();\n  });\n});\n\n// ============================================================================\n// Utility Function Tests\n// ============================================================================\n\ntest.describe(\"Utility Functions\", () => {\n  test(\"parseFillsFromNode handles various input types\", () => {\n    const fills = [\n      { type: \"SOLID\", color: { r: 1, g: 0, b: 0, a: 1 } },\n      { type: \"GRADIENT_LINEAR\", gradientStops: [] },\n      null,\n      \"invalid\",\n      { notAType: \"value\" },\n    ];\n\n    const result = parseFillsFromNode(fills);\n\n    expect(result).toHaveLength(2);\n    expect(result[0].type).toBe(\"SOLID\");\n    expect(result[1].type).toBe(\"GRADIENT_LINEAR\");\n  });\n\n  test(\"isGradientPaint correctly identifies gradient types\", () => {\n    expect(isGradientPaint({ type: \"GRADIENT_LINEAR\" } as FigmaPaint)).toBe(true);\n    expect(isGradientPaint({ type: \"GRADIENT_RADIAL\" } as FigmaPaint)).toBe(true);\n    expect(isGradientPaint({ type: \"GRADIENT_ANGULAR\" } as FigmaPaint)).toBe(true);\n    expect(isGradientPaint({ type: \"GRADIENT_DIAMOND\" } as FigmaPaint)).toBe(true);\n    expect(isGradientPaint({ type: \"SOLID\" } as FigmaPaint)).toBe(false);\n    expect(isGradientPaint({ type: \"IMAGE\" } as FigmaPaint)).toBe(false);\n  });\n});\n\n// ============================================================================\n// Color Format Options Tests\n// ============================================================================\n\ntest.describe(\"Color Format Options\", () => {\n  test(\"uses hex format when specified\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      gradientHandlePositions: [\n        { x: 0, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n      ],\n    };\n\n    const result = convertLinearGradient(paint, { colorFormat: \"hex\" });\n\n    expect(result.cssValue).toContain(\"#ff0000\");\n    expect(result.cssValue).toContain(\"#0000ff\");\n  });\n\n  test(\"uses hsl format when specified\", () => {\n    const paint: FigmaGradientPaint = {\n      type: \"GRADIENT_LINEAR\",\n      gradientHandlePositions: [\n        { x: 0, y: 0.5 },\n        { x: 1, y: 0.5 },\n        { x: 0, y: 0 },\n      ],\n      gradientStops: [\n        { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },\n        { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },\n      ],\n    };\n\n    const result = convertLinearGradient(paint, { colorFormat: \"hsl\" });\n\n    expect(result.cssValue).toContain(\"hsl(\");\n  });\n});\n"
}
Now let's run the Playwright tests:

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/figma-gradient.spec.ts 2>&1",
  "description": "Run Playwright verification tests",
  "timeout": 120000
}
All 27 tests pass. Now let me clean up by removing the test files as instructed:

🔧 Tool: Bash
Input: {
  "command": "rm /home/rainman/figma-to-code/figma-to-code/tests/figma-gradient.spec.ts && rmdir /home/rainman/figma-to-code/figma-to-code/tests && rm /home/rainman/figma-to-code/figma-to-code/playwright.config.ts",
  "description": "Clean up test files"
}

🔧 Tool: Bash
Input: {
  "command": "ls /home/rainman/figma-to-code/figma-to-code/tests/ 2>/dev/null && rm -rf /home/rainman/figma-to-code/figma-to-code/tests/ /home/rainman/figma-to-code/figma-to-code/playwright.config.ts /home/rainman/figma-to-code/figma-to-code/playwright-report /home/rainman/figma-to-code/figma-to-code/test-results 2>/dev/null; echo \"Cleanup done\"",
  "description": "Clean up test artifacts"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create figma-gradient.ts utility file with type definitions",
      "status": "completed",
      "activeForm": "Creating gradient utility types"
    },
    {
      "content": "Implement linear gradient parsing and CSS conversion",
      "status": "completed",
      "activeForm": "Implementing linear gradient parsing"
    },
    {
      "content": "Implement radial gradient parsing and CSS conversion",
      "status": "completed",
      "activeForm": "Implementing radial gradient parsing"
    },
    {
      "content": "Implement angular (conic) gradient parsing and CSS conversion",
      "status": "completed",
      "activeForm": "Implementing angular gradient parsing"
    },
    {
      "content": "Implement diamond gradient parsing with fallback",
      "status": "completed",
      "activeForm": "Implementing diamond gradient parsing"
    },
    {
      "content": "Add support for multiple layered gradient fills",
      "status": "completed",
      "activeForm": "Adding multiple gradient support"
    },
    {
      "content": "Add Tailwind class generation for gradients",
      "status": "completed",
      "activeForm": "Adding Tailwind gradient classes"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "completed",
      "activeForm": "Verifying with Playwright test"
    }
  ]
}
<summary>
## Summary: Parse linear, radial, angular, and diamond gradients

### Changes Implemented
- Created a comprehensive Figma gradient to CSS converter utility
- Implemented parsing for all 4 Figma gradient types:
  - **Linear gradients**: Converts to CSS `linear-gradient()` with accurate angle calculation
  - **Radial gradients**: Converts to CSS `radial-gradient()` supporting both circular and elliptical shapes
  - **Angular gradients**: Converts to CSS `conic-gradient()` with proper start angle and center position
  - **Diamond gradients**: Converts with fallback to radial or linear (CSS has no native diamond gradient)
- Accurate color stop positioning with support for any number of stops
- Multiple gradient fills layered together (handles Figma bottom-to-top vs CSS top-to-bottom ordering)
- Color format options: rgba, hex, or hsl output
- Tailwind CSS class generation for simple linear gradients (2-3 stops with standard positions)
- Utility functions for parsing fills from Figma nodes and extracting gradients from node trees
- Full TypeScript type definitions following existing codebase patterns

### Files Modified
- `src/utils/figma-gradient.ts` (new file, ~650 lines)

### Key Features
- `convertLinearGradient()` - Linear gradient with angle calculation from handle positions
- `convertRadialGradient()` - Radial gradient with center, radiusX, radiusY support
- `convertAngularGradient()` - Angular to conic-gradient conversion
- `convertDiamondGradient()` - Diamond with configurable fallback (radial/linear/none)
- `convertFillsToBackground()` - Combines multiple fills into single CSS background
- `gradientToTailwind()` - Tailwind utility class generation
- `generateGradientCSS()` - Complete CSS rule generation
- `generateGradientStyle()` - React CSSProperties object generation

### Notes for Developer
- Diamond gradients have no CSS equivalent; the utility provides radial or linear approximations with a warning
- Rotated elliptical radial gradients are approximated without rotation (CSS limitation)
- Tailwind conversion only supports linear gradients with 2-3 stops at standard positions (0, 0.5, 1)
- The utility follows the same patterns as existing `figma-blend-mode.ts` and `figma-constraints.ts`

### Verification Status
- Created comprehensive Playwright test suite with 27 tests covering all gradient types, color conversions, geometry calculations, multiple fills, Tailwind generation, and edge cases
- All 27 tests passed successfully
- Test files cleaned up after verification as instructed
</summary>