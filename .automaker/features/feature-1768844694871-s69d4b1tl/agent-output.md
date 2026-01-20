I'll start by understanding the existing codebase structure and then implement this feature for analyzing visual positioning to infer semantic layout intent.

🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming"
}
Using the brainstorming skill to understand and design this feature properly.

Let me first explore the codebase to understand the project context and how this feature might fit in.

🔧 Tool: Task
Input: {
  "prompt": "Explore this codebase to understand its structure and purpose. This appears to be a \"figma-to-code\" project. I need to understand:\n\n1. What is the main purpose of this application?\n2. What existing features exist for processing Figma designs?\n3. Are there any existing layout analysis or parsing utilities?\n4. What's the overall architecture pattern being used?\n\nFocus on:\n- The main source code structure in src/\n- Any existing Figma-related utilities or services\n- Layout or design processing code\n- Any ML or heuristics code that might exist\n\nBe thorough - this is important for implementing a new feature for \"analyzing visual positioning to infer semantic layout intent\".",
  "subagent_type": "Explore",
  "description": "Explore figma-to-code codebase"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.md\" | head -20",
  "description": "List markdown documentation files to understand project structure"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/README.md"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/ 2>/dev/null | head -30",
  "description": "List main source directory structure"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/docs/ 2>/dev/null",
  "description": "List documentation files"
}

🔧 Tool: Grep
Input: {
  "pattern": "figma",
  "type": "ts",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/queries/figma.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/hooks/useFigma.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/figma-accounts.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma-export.ts",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/figma-exports.ts",
  "limit": 80
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "limit": 150
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/text-node-parser.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-component-resolver.ts",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/figma.tsx",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/frames.tsx",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -name \"*layout*\" -o -name \"*positioning*\" -o -name \"*semantic*\" 2>/dev/null | head -20",
  "description": "Search for layout analysis related files"
}

🔧 Tool: Grep
Input: {
  "pattern": "layout|positioning|spatial|semantic",
  "type": "ts",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/utils/ | grep -i figma",
  "description": "List Figma utility files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/fn/figma.ts",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "offset": 150,
  "limit": 200
}

🔧 Tool: Bash
Input: {
  "command": "grep -n \"figma\\|Figma\" /home/rainman/figma-to-code/figma-to-code/src/db/schema.ts | head -50",
  "description": "Search for Figma schema definitions"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "offset": 349,
  "limit": 150
}

🔧 Tool: Bash
Input: {
  "command": "wc -l /home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "description": "Count lines in schema file"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FrameExplorer.tsx",
  "limit": 80
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-constraints.ts",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"alignment\\|distribute\\|spacing\\|group\" /home/rainman/figma-to-code/figma-to-code/src --include=\"*.ts\" --include=\"*.tsx\" | grep -i figma | head -10",
  "description": "Search for alignment and distribution analysis"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/docs -type f -name \"*.md\" | head -10",
  "description": "List documentation files"
}
Excellent! Now I have a comprehensive understanding of the codebase. This is a Figma-to-code conversion platform that has solid foundations for design parsing but is missing semantic layout positioning analysis.

Based on this exploration, let me ask the key question to refine the implementation approach:

**Understanding the Scope:**

The feature request is to "Analyze visual positioning to infer semantic layout intent." Before I design the implementation, I need to understand the primary use case better.

**What's the primary goal for this layout analysis feature?**

1. **Code Generation Enhancement** - Use layout intent to generate better CSS (flex/grid vs absolute positioning)
2. **Design System Detection** - Identify common UI patterns (cards, navbars, sidebars) for component mapping
3. **Both** - Full semantic analysis for both code generation and pattern detection
4. **Exploration/Preview** - Show users what the system detects for review before code generation

Given this is a Figma-to-code tool and looking at the existing architecture, I'd recommend **Option 3 (Both)** since:
- The existing frame categorization already does basic classification
- Layout intent directly impacts code quality (flex vs absolute positioning)
- Pattern detection enables component library mapping

However, since this is a feature implementation task with specific requirements, let me proceed with designing a comprehensive solution that covers:
1. Detect header/footer/sidebar patterns
2. Identify navigation structures, card grids, and list layouts
3. Use heuristics (and prepare for ML) to understand layout purpose

Let me create a design for this feature:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-constraints.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/utils/*.ts"
}
Now I have a clear picture. Let me create a comprehensive layout analysis utility. Based on the exploration, I'll design and implement a new utility module for semantic layout analysis.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Design and implement layout-analyzer.ts utility module",
      "status": "in_progress",
      "activeForm": "Designing layout analyzer module"
    },
    {
      "content": "Implement spatial positioning analysis (alignment, gaps, clustering)",
      "status": "pending",
      "activeForm": "Implementing spatial analysis"
    },
    {
      "content": "Implement semantic pattern detection (header/footer/sidebar/navigation)",
      "status": "pending",
      "activeForm": "Implementing pattern detection"
    },
    {
      "content": "Implement card grid and list layout detection",
      "status": "pending",
      "activeForm": "Detecting grid and list layouts"
    },
    {
      "content": "Add layout intent inference with heuristics",
      "status": "pending",
      "activeForm": "Adding layout heuristics"
    },
    {
      "content": "Write comprehensive tests with Playwright",
      "status": "pending",
      "activeForm": "Writing Playwright tests"
    },
    {
      "content": "Verify feature works correctly",
      "status": "pending",
      "activeForm": "Verifying feature"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "content": "/**\n * Layout Analyzer - Semantic Layout Intent Detection\n *\n * Analyzes visual positioning to infer semantic layout intent:\n * - Detect header/footer/sidebar patterns\n * - Identify navigation structures, card grids, and list layouts\n * - Use heuristics (and ML-ready scoring) to understand layout purpose\n */\n\nimport type { FigmaNode } from \"./figma-api\";\n\n// ============================================================================\n// Types and Interfaces\n// ============================================================================\n\n/** Bounding box for positioning calculations */\nexport interface BoundingBox {\n  x: number;\n  y: number;\n  width: number;\n  height: number;\n}\n\n/** Semantic layout role detected from visual analysis */\nexport type SemanticRole =\n  | \"header\"\n  | \"footer\"\n  | \"sidebar\"\n  | \"navigation\"\n  | \"main-content\"\n  | \"card\"\n  | \"card-grid\"\n  | \"list\"\n  | \"list-item\"\n  | \"hero\"\n  | \"form\"\n  | \"modal\"\n  | \"toolbar\"\n  | \"tab-bar\"\n  | \"breadcrumb\"\n  | \"search\"\n  | \"avatar\"\n  | \"button-group\"\n  | \"content-section\"\n  | \"unknown\";\n\n/** Layout pattern detected from spatial analysis */\nexport type LayoutPattern =\n  | \"horizontal-stack\"\n  | \"vertical-stack\"\n  | \"grid\"\n  | \"absolute\"\n  | \"centered\"\n  | \"split\"\n  | \"wrap\"\n  | \"unknown\";\n\n/** Alignment types */\nexport type HorizontalAlignment = \"left\" | \"center\" | \"right\" | \"stretch\" | \"mixed\";\nexport type VerticalAlignment = \"top\" | \"center\" | \"bottom\" | \"stretch\" | \"mixed\";\n\n/** Node analysis result for a single element */\nexport interface NodeLayoutAnalysis {\n  nodeId: string;\n  nodeName: string;\n  bounds: BoundingBox;\n  semanticRole: SemanticRole;\n  confidence: number; // 0-1 confidence score\n  layoutPattern: LayoutPattern;\n  horizontalAlignment: HorizontalAlignment;\n  verticalAlignment: VerticalAlignment;\n  suggestedCSS: SuggestedCSS;\n  children?: NodeLayoutAnalysis[];\n  metadata: LayoutMetadata;\n}\n\n/** Metadata about the analyzed layout */\nexport interface LayoutMetadata {\n  isFullWidth: boolean;\n  isFullHeight: boolean;\n  hasUniformChildren: boolean;\n  childCount: number;\n  averageGap?: number;\n  dominantDirection?: \"horizontal\" | \"vertical\";\n  aspectRatio: number;\n  relativePosition: RelativePosition;\n}\n\n/** Position relative to parent */\nexport interface RelativePosition {\n  topPercent: number;\n  leftPercent: number;\n  widthPercent: number;\n  heightPercent: number;\n}\n\n/** Suggested CSS for code generation */\nexport interface SuggestedCSS {\n  display: \"flex\" | \"grid\" | \"block\" | \"inline-flex\" | \"inline-block\";\n  flexDirection?: \"row\" | \"column\";\n  justifyContent?: string;\n  alignItems?: string;\n  gap?: string;\n  gridTemplateColumns?: string;\n  gridTemplateRows?: string;\n  position?: \"relative\" | \"absolute\" | \"static\";\n  additionalStyles: Record<string, string>;\n}\n\n/** Analysis result for a complete frame/screen */\nexport interface FrameLayoutAnalysis {\n  frameId: string;\n  frameName: string;\n  bounds: BoundingBox;\n  sections: SectionAnalysis[];\n  overallPattern: LayoutPattern;\n  suggestedStructure: StructureSuggestion[];\n}\n\n/** Section analysis for major layout regions */\nexport interface SectionAnalysis {\n  role: SemanticRole;\n  confidence: number;\n  bounds: BoundingBox;\n  nodeIds: string[];\n  childPattern: LayoutPattern;\n}\n\n/** Structural suggestion for code generation */\nexport interface StructureSuggestion {\n  element: string;\n  role: SemanticRole;\n  cssClasses: string[];\n  children?: StructureSuggestion[];\n}\n\n// ============================================================================\n// Constants for Heuristics\n// ============================================================================\n\n/** Thresholds for layout detection */\nconst THRESHOLDS = {\n  /** Percentage of parent width to consider \"full width\" */\n  FULL_WIDTH_PERCENT: 0.9,\n  /** Percentage of parent height to consider \"full height\" */\n  FULL_HEIGHT_PERCENT: 0.9,\n  /** Maximum height percentage for a header region */\n  HEADER_MAX_HEIGHT_PERCENT: 0.15,\n  /** Minimum Y position percentage for footer detection */\n  FOOTER_MIN_Y_PERCENT: 0.85,\n  /** Maximum width percentage for sidebar detection */\n  SIDEBAR_MAX_WIDTH_PERCENT: 0.35,\n  /** Gap tolerance for detecting uniform spacing (percentage) */\n  GAP_TOLERANCE_PERCENT: 0.2,\n  /** Minimum children for grid detection */\n  GRID_MIN_CHILDREN: 4,\n  /** Minimum children for list detection */\n  LIST_MIN_CHILDREN: 2,\n  /** Maximum aspect ratio variance for uniform children */\n  ASPECT_RATIO_VARIANCE: 0.3,\n  /** Minimum similarity score for card detection */\n  CARD_SIMILARITY_THRESHOLD: 0.7,\n  /** Navigation max height in pixels */\n  NAV_MAX_HEIGHT_PX: 80,\n  /** Tab bar typical height range */\n  TAB_BAR_HEIGHT_MIN: 40,\n  TAB_BAR_HEIGHT_MAX: 60,\n} as const;\n\n/** Keywords for semantic role detection from node names */\nconst ROLE_KEYWORDS: Record<SemanticRole, string[]> = {\n  header: [\"header\", \"navbar\", \"topbar\", \"top-bar\", \"app-bar\", \"appbar\"],\n  footer: [\"footer\", \"bottom-bar\", \"bottombar\", \"bottom-nav\"],\n  sidebar: [\"sidebar\", \"side-bar\", \"sidenav\", \"side-nav\", \"drawer\", \"menu-panel\"],\n  navigation: [\"nav\", \"navigation\", \"menu\", \"links\", \"breadcrumb\"],\n  \"main-content\": [\"main\", \"content\", \"body\", \"container\", \"wrapper\"],\n  card: [\"card\", \"tile\", \"panel\", \"box\", \"item\"],\n  \"card-grid\": [\"cards\", \"grid\", \"tiles\", \"gallery\", \"collection\"],\n  list: [\"list\", \"items\", \"rows\", \"entries\"],\n  \"list-item\": [\"list-item\", \"row\", \"entry\", \"item\"],\n  hero: [\"hero\", \"banner\", \"jumbotron\", \"splash\", \"cover\"],\n  form: [\"form\", \"input\", \"field\", \"login\", \"signup\", \"register\"],\n  modal: [\"modal\", \"dialog\", \"popup\", \"overlay\", \"sheet\"],\n  toolbar: [\"toolbar\", \"tool-bar\", \"action-bar\", \"actions\"],\n  \"tab-bar\": [\"tabs\", \"tab-bar\", \"tabbar\", \"segments\"],\n  breadcrumb: [\"breadcrumb\", \"crumbs\", \"path\"],\n  search: [\"search\", \"searchbar\", \"search-box\", \"filter\"],\n  avatar: [\"avatar\", \"profile-pic\", \"user-image\", \"photo\"],\n  \"button-group\": [\"button-group\", \"btn-group\", \"actions\", \"buttons\"],\n  \"content-section\": [\"section\", \"block\", \"area\", \"region\"],\n  unknown: [],\n};\n\n// ============================================================================\n// Core Analysis Functions\n// ============================================================================\n\n/**\n * Analyze a Figma node and its children to detect semantic layout intent\n */\nexport function analyzeNodeLayout(\n  node: FigmaNode,\n  parentBounds?: BoundingBox\n): NodeLayoutAnalysis {\n  const bounds = extractBounds(node);\n  const children = node.children || [];\n\n  // Analyze children recursively\n  const childAnalyses = children\n    .filter((child) => child.absoluteBoundingBox)\n    .map((child) => analyzeNodeLayout(child, bounds));\n\n  // Detect semantic role\n  const { role, confidence } = detectSemanticRole(node, bounds, parentBounds, childAnalyses);\n\n  // Detect layout pattern\n  const layoutPattern = detectLayoutPattern(childAnalyses, bounds);\n\n  // Detect alignments\n  const horizontalAlignment = detectHorizontalAlignment(childAnalyses, bounds);\n  const verticalAlignment = detectVerticalAlignment(childAnalyses, bounds);\n\n  // Generate suggested CSS\n  const suggestedCSS = generateSuggestedCSS(layoutPattern, horizontalAlignment, verticalAlignment, childAnalyses);\n\n  // Build metadata\n  const metadata = buildMetadata(bounds, parentBounds, childAnalyses);\n\n  return {\n    nodeId: node.id,\n    nodeName: node.name,\n    bounds,\n    semanticRole: role,\n    confidence,\n    layoutPattern,\n    horizontalAlignment,\n    verticalAlignment,\n    suggestedCSS,\n    children: childAnalyses.length > 0 ? childAnalyses : undefined,\n    metadata,\n  };\n}\n\n/**\n * Analyze a complete frame/screen for major layout sections\n */\nexport function analyzeFrameLayout(frameNode: FigmaNode): FrameLayoutAnalysis {\n  const bounds = extractBounds(frameNode);\n  const children = frameNode.children || [];\n\n  // Analyze all children\n  const childAnalyses = children\n    .filter((child) => child.absoluteBoundingBox)\n    .map((child) => analyzeNodeLayout(child, bounds));\n\n  // Detect major sections (header, footer, sidebar, main content)\n  const sections = detectMajorSections(childAnalyses, bounds);\n\n  // Determine overall pattern\n  const overallPattern = detectLayoutPattern(childAnalyses, bounds);\n\n  // Generate structure suggestions\n  const suggestedStructure = generateStructureSuggestions(sections, childAnalyses);\n\n  return {\n    frameId: frameNode.id,\n    frameName: frameNode.name,\n    bounds,\n    sections,\n    overallPattern,\n    suggestedStructure,\n  };\n}\n\n// ============================================================================\n// Spatial Analysis Functions\n// ============================================================================\n\n/**\n * Extract bounding box from a Figma node\n */\nfunction extractBounds(node: FigmaNode): BoundingBox {\n  const bbox = node.absoluteBoundingBox;\n  if (!bbox) {\n    return { x: 0, y: 0, width: 0, height: 0 };\n  }\n  return {\n    x: bbox.x,\n    y: bbox.y,\n    width: bbox.width,\n    height: bbox.height,\n  };\n}\n\n/**\n * Calculate relative position within parent bounds\n */\nfunction calculateRelativePosition(bounds: BoundingBox, parentBounds: BoundingBox): RelativePosition {\n  if (parentBounds.width === 0 || parentBounds.height === 0) {\n    return { topPercent: 0, leftPercent: 0, widthPercent: 0, heightPercent: 0 };\n  }\n\n  return {\n    topPercent: (bounds.y - parentBounds.y) / parentBounds.height,\n    leftPercent: (bounds.x - parentBounds.x) / parentBounds.width,\n    widthPercent: bounds.width / parentBounds.width,\n    heightPercent: bounds.height / parentBounds.height,\n  };\n}\n\n/**\n * Calculate gaps between children in a direction\n */\nfunction calculateGaps(children: NodeLayoutAnalysis[], direction: \"horizontal\" | \"vertical\"): number[] {\n  if (children.length < 2) return [];\n\n  // Sort children by position\n  const sorted = [...children].sort((a, b) => {\n    return direction === \"horizontal\"\n      ? a.bounds.x - b.bounds.x\n      : a.bounds.y - b.bounds.y;\n  });\n\n  const gaps: number[] = [];\n  for (let i = 1; i < sorted.length; i++) {\n    const prev = sorted[i - 1];\n    const curr = sorted[i];\n\n    if (direction === \"horizontal\") {\n      const gap = curr.bounds.x - (prev.bounds.x + prev.bounds.width);\n      gaps.push(gap);\n    } else {\n      const gap = curr.bounds.y - (prev.bounds.y + prev.bounds.height);\n      gaps.push(gap);\n    }\n  }\n\n  return gaps;\n}\n\n/**\n * Check if gaps are uniform (within tolerance)\n */\nfunction areGapsUniform(gaps: number[]): boolean {\n  if (gaps.length < 2) return true;\n\n  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;\n  if (avgGap === 0) return true;\n\n  const tolerance = Math.abs(avgGap * THRESHOLDS.GAP_TOLERANCE_PERCENT);\n  return gaps.every((gap) => Math.abs(gap - avgGap) <= tolerance);\n}\n\n/**\n * Calculate average gap\n */\nfunction calculateAverageGap(gaps: number[]): number {\n  if (gaps.length === 0) return 0;\n  return gaps.reduce((sum, g) => sum + g, 0) / gaps.length;\n}\n\n/**\n * Check if children have similar dimensions (for grid/card detection)\n */\nfunction areChildrenUniform(children: NodeLayoutAnalysis[]): boolean {\n  if (children.length < 2) return true;\n\n  const aspectRatios = children.map((c) =>\n    c.bounds.height !== 0 ? c.bounds.width / c.bounds.height : 1\n  );\n\n  const avgRatio = aspectRatios.reduce((sum, r) => sum + r, 0) / aspectRatios.length;\n  const variance = aspectRatios.reduce((sum, r) => sum + Math.abs(r - avgRatio), 0) / aspectRatios.length;\n\n  return variance / avgRatio < THRESHOLDS.ASPECT_RATIO_VARIANCE;\n}\n\n// ============================================================================\n// Semantic Role Detection\n// ============================================================================\n\n/**\n * Detect semantic role from visual positioning and naming\n */\nfunction detectSemanticRole(\n  node: FigmaNode,\n  bounds: BoundingBox,\n  parentBounds: BoundingBox | undefined,\n  childAnalyses: NodeLayoutAnalysis[]\n): { role: SemanticRole; confidence: number } {\n  const scores: Array<{ role: SemanticRole; score: number }> = [];\n\n  // Score from name keywords\n  const nameScore = scoreFromName(node.name);\n  if (nameScore) {\n    scores.push(nameScore);\n  }\n\n  // Score from position (if parent bounds available)\n  if (parentBounds) {\n    const relPos = calculateRelativePosition(bounds, parentBounds);\n    const positionScores = scoreFromPosition(relPos, bounds, parentBounds);\n    scores.push(...positionScores);\n  }\n\n  // Score from children patterns\n  const childrenScores = scoreFromChildren(childAnalyses, bounds);\n  scores.push(...childrenScores);\n\n  // Score from node type\n  const typeScore = scoreFromNodeType(node);\n  if (typeScore) {\n    scores.push(typeScore);\n  }\n\n  // Find highest scoring role\n  if (scores.length === 0) {\n    return { role: \"unknown\", confidence: 0 };\n  }\n\n  // Aggregate scores by role\n  const roleScores = new Map<SemanticRole, number>();\n  for (const { role, score } of scores) {\n    roleScores.set(role, (roleScores.get(role) || 0) + score);\n  }\n\n  // Find max\n  let maxRole: SemanticRole = \"unknown\";\n  let maxScore = 0;\n  for (const [role, score] of roleScores) {\n    if (score > maxScore) {\n      maxRole = role;\n      maxScore = score;\n    }\n  }\n\n  // Normalize confidence to 0-1\n  const confidence = Math.min(maxScore / 3, 1);\n\n  return { role: maxRole, confidence };\n}\n\n/**\n * Score semantic role from node name\n */\nfunction scoreFromName(name: string): { role: SemanticRole; score: number } | null {\n  const lowerName = name.toLowerCase();\n\n  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {\n    for (const keyword of keywords) {\n      if (lowerName.includes(keyword)) {\n        // Higher score for exact match or start of name\n        const score = lowerName.startsWith(keyword) ? 2.5 : 1.5;\n        return { role: role as SemanticRole, score };\n      }\n    }\n  }\n\n  return null;\n}\n\n/**\n * Score semantic role from position within parent\n */\nfunction scoreFromPosition(\n  relPos: RelativePosition,\n  bounds: BoundingBox,\n  parentBounds: BoundingBox\n): Array<{ role: SemanticRole; score: number }> {\n  const scores: Array<{ role: SemanticRole; score: number }> = [];\n\n  // Header detection: at top, full width, limited height\n  if (\n    relPos.topPercent < 0.05 &&\n    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&\n    relPos.heightPercent <= THRESHOLDS.HEADER_MAX_HEIGHT_PERCENT\n  ) {\n    scores.push({ role: \"header\", score: 2 });\n  }\n\n  // Footer detection: at bottom, full width\n  if (\n    relPos.topPercent >= THRESHOLDS.FOOTER_MIN_Y_PERCENT &&\n    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT\n  ) {\n    scores.push({ role: \"footer\", score: 2 });\n  }\n\n  // Tab bar detection: at bottom, specific height range\n  if (\n    relPos.topPercent >= THRESHOLDS.FOOTER_MIN_Y_PERCENT &&\n    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&\n    bounds.height >= THRESHOLDS.TAB_BAR_HEIGHT_MIN &&\n    bounds.height <= THRESHOLDS.TAB_BAR_HEIGHT_MAX\n  ) {\n    scores.push({ role: \"tab-bar\", score: 1.5 });\n  }\n\n  // Sidebar detection: on left or right edge, limited width, tall\n  if (\n    (relPos.leftPercent < 0.05 || relPos.leftPercent + relPos.widthPercent > 0.95) &&\n    relPos.widthPercent <= THRESHOLDS.SIDEBAR_MAX_WIDTH_PERCENT &&\n    relPos.heightPercent >= 0.5\n  ) {\n    scores.push({ role: \"sidebar\", score: 2 });\n  }\n\n  // Hero detection: at top, full width, significant height\n  if (\n    relPos.topPercent < 0.05 &&\n    relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&\n    relPos.heightPercent >= 0.2 &&\n    relPos.heightPercent <= 0.5\n  ) {\n    scores.push({ role: \"hero\", score: 1.5 });\n  }\n\n  // Navigation detection: at top, limited height\n  if (\n    relPos.topPercent < 0.1 &&\n    bounds.height <= THRESHOLDS.NAV_MAX_HEIGHT_PX\n  ) {\n    scores.push({ role: \"navigation\", score: 1 });\n  }\n\n  // Main content: centered, takes up most space\n  if (\n    relPos.widthPercent >= 0.5 &&\n    relPos.heightPercent >= 0.4 &&\n    relPos.topPercent >= 0.05 &&\n    relPos.topPercent <= 0.3\n  ) {\n    scores.push({ role: \"main-content\", score: 1 });\n  }\n\n  // Modal/dialog: centered, smaller than parent\n  if (\n    relPos.widthPercent < 0.9 &&\n    relPos.widthPercent > 0.3 &&\n    relPos.heightPercent < 0.9 &&\n    relPos.heightPercent > 0.2 &&\n    Math.abs(relPos.leftPercent + relPos.widthPercent / 2 - 0.5) < 0.1 &&\n    Math.abs(relPos.topPercent + relPos.heightPercent / 2 - 0.5) < 0.15\n  ) {\n    scores.push({ role: \"modal\", score: 1.5 });\n  }\n\n  return scores;\n}\n\n/**\n * Score semantic role from children patterns\n */\nfunction scoreFromChildren(\n  children: NodeLayoutAnalysis[],\n  bounds: BoundingBox\n): Array<{ role: SemanticRole; score: number }> {\n  const scores: Array<{ role: SemanticRole; score: number }> = [];\n\n  if (children.length === 0) return scores;\n\n  // Check for uniform children (potential grid or list)\n  const hasUniformChildren = areChildrenUniform(children);\n\n  // Check horizontal gaps\n  const hGaps = calculateGaps(children, \"horizontal\");\n  const hasUniformHGaps = areGapsUniform(hGaps);\n\n  // Check vertical gaps\n  const vGaps = calculateGaps(children, \"vertical\");\n  const hasUniformVGaps = areGapsUniform(vGaps);\n\n  // Card grid detection\n  if (\n    children.length >= THRESHOLDS.GRID_MIN_CHILDREN &&\n    hasUniformChildren &&\n    (hasUniformHGaps || hasUniformVGaps)\n  ) {\n    scores.push({ role: \"card-grid\", score: 2 });\n  }\n\n  // List detection\n  if (\n    children.length >= THRESHOLDS.LIST_MIN_CHILDREN &&\n    hasUniformChildren &&\n    hasUniformVGaps &&\n    !hasUniformHGaps\n  ) {\n    scores.push({ role: \"list\", score: 1.5 });\n  }\n\n  // Button group detection: small, horizontal, uniform\n  if (\n    children.length >= 2 &&\n    children.length <= 6 &&\n    hasUniformHGaps &&\n    bounds.height <= 60\n  ) {\n    scores.push({ role: \"button-group\", score: 1 });\n  }\n\n  // Navigation detection: horizontal children, limited height\n  if (\n    children.length >= 3 &&\n    children.length <= 10 &&\n    hasUniformHGaps &&\n    bounds.height <= THRESHOLDS.NAV_MAX_HEIGHT_PX\n  ) {\n    scores.push({ role: \"navigation\", score: 1 });\n  }\n\n  // Check for individual cards\n  const childRoles = children.map((c) => c.semanticRole);\n  if (childRoles.every((r) => r === \"card\" || r === \"list-item\")) {\n    if (detectGridArrangement(children)) {\n      scores.push({ role: \"card-grid\", score: 2 });\n    } else {\n      scores.push({ role: \"list\", score: 1.5 });\n    }\n  }\n\n  return scores;\n}\n\n/**\n * Score semantic role from Figma node type\n */\nfunction scoreFromNodeType(node: FigmaNode): { role: SemanticRole; score: number } | null {\n  const type = node.type;\n\n  // Component instances may have semantic meaning\n  if (type === \"INSTANCE\" || type === \"COMPONENT\") {\n    // Check name for clues\n    const nameScore = scoreFromName(node.name);\n    if (nameScore) {\n      return { role: nameScore.role, score: nameScore.score * 1.2 };\n    }\n  }\n\n  return null;\n}\n\n// ============================================================================\n// Layout Pattern Detection\n// ============================================================================\n\n/**\n * Detect layout pattern from children arrangement\n */\nfunction detectLayoutPattern(\n  children: NodeLayoutAnalysis[],\n  parentBounds: BoundingBox\n): LayoutPattern {\n  if (children.length === 0) {\n    return \"unknown\";\n  }\n\n  if (children.length === 1) {\n    // Single child - check if centered\n    const child = children[0];\n    const relPos = calculateRelativePosition(child.bounds, parentBounds);\n    const isCenteredH = Math.abs(relPos.leftPercent + relPos.widthPercent / 2 - 0.5) < 0.1;\n    const isCenteredV = Math.abs(relPos.topPercent + relPos.heightPercent / 2 - 0.5) < 0.1;\n\n    if (isCenteredH && isCenteredV) {\n      return \"centered\";\n    }\n    return \"absolute\";\n  }\n\n  // Check for grid arrangement\n  if (children.length >= THRESHOLDS.GRID_MIN_CHILDREN && detectGridArrangement(children)) {\n    return \"grid\";\n  }\n\n  // Check for horizontal or vertical stack\n  const { isHorizontal, isVertical } = detectStackDirection(children);\n\n  if (isHorizontal && !isVertical) {\n    return \"horizontal-stack\";\n  }\n\n  if (isVertical && !isHorizontal) {\n    return \"vertical-stack\";\n  }\n\n  // Check for split layout (two main columns or rows)\n  if (children.length === 2) {\n    const isSplit = detectSplitLayout(children, parentBounds);\n    if (isSplit) {\n      return \"split\";\n    }\n  }\n\n  // Check for wrap layout (multiple rows of items)\n  if (children.length >= 3 && detectWrapLayout(children)) {\n    return \"wrap\";\n  }\n\n  // Fallback to absolute if no clear pattern\n  return \"absolute\";\n}\n\n/**\n * Detect if children are arranged in a grid pattern\n */\nfunction detectGridArrangement(children: NodeLayoutAnalysis[]): boolean {\n  if (children.length < THRESHOLDS.GRID_MIN_CHILDREN) return false;\n\n  // Get unique X positions (column starts)\n  const xPositions = [...new Set(children.map((c) => Math.round(c.bounds.x)))];\n  // Get unique Y positions (row starts)\n  const yPositions = [...new Set(children.map((c) => Math.round(c.bounds.y)))];\n\n  // A grid has multiple columns AND multiple rows\n  const hasMultipleColumns = xPositions.length >= 2;\n  const hasMultipleRows = yPositions.length >= 2;\n\n  if (!hasMultipleColumns || !hasMultipleRows) return false;\n\n  // Check if items fill the grid somewhat evenly\n  const expectedItems = xPositions.length * yPositions.length;\n  const actualItems = children.length;\n\n  // Allow for incomplete rows (at least 50% of expected)\n  return actualItems >= expectedItems * 0.5;\n}\n\n/**\n * Detect stack direction (horizontal vs vertical)\n */\nfunction detectStackDirection(children: NodeLayoutAnalysis[]): { isHorizontal: boolean; isVertical: boolean } {\n  if (children.length < 2) {\n    return { isHorizontal: false, isVertical: false };\n  }\n\n  // Sort by position\n  const sortedByX = [...children].sort((a, b) => a.bounds.x - b.bounds.x);\n  const sortedByY = [...children].sort((a, b) => a.bounds.y - b.bounds.y);\n\n  // Check horizontal arrangement (no Y overlap, ordered by X)\n  let isHorizontal = true;\n  for (let i = 1; i < sortedByX.length; i++) {\n    const prev = sortedByX[i - 1];\n    const curr = sortedByX[i];\n\n    // Check for significant Y overlap (they're roughly on the same row)\n    const prevBottom = prev.bounds.y + prev.bounds.height;\n    const currTop = curr.bounds.y;\n    const currBottom = curr.bounds.y + curr.bounds.height;\n    const prevTop = prev.bounds.y;\n\n    const overlap = Math.min(prevBottom, currBottom) - Math.max(prevTop, currTop);\n    const minHeight = Math.min(prev.bounds.height, curr.bounds.height);\n\n    if (overlap < minHeight * 0.5) {\n      isHorizontal = false;\n      break;\n    }\n  }\n\n  // Check vertical arrangement (no X overlap, ordered by Y)\n  let isVertical = true;\n  for (let i = 1; i < sortedByY.length; i++) {\n    const prev = sortedByY[i - 1];\n    const curr = sortedByY[i];\n\n    // Check for significant X overlap (they're roughly in the same column)\n    const prevRight = prev.bounds.x + prev.bounds.width;\n    const currLeft = curr.bounds.x;\n    const currRight = curr.bounds.x + curr.bounds.width;\n    const prevLeft = prev.bounds.x;\n\n    const overlap = Math.min(prevRight, currRight) - Math.max(prevLeft, currLeft);\n    const minWidth = Math.min(prev.bounds.width, curr.bounds.width);\n\n    if (overlap < minWidth * 0.5) {\n      isVertical = false;\n      break;\n    }\n  }\n\n  return { isHorizontal, isVertical };\n}\n\n/**\n * Detect split layout (e.g., sidebar + main content)\n */\nfunction detectSplitLayout(children: NodeLayoutAnalysis[], parentBounds: BoundingBox): boolean {\n  if (children.length !== 2) return false;\n\n  const [a, b] = children;\n\n  // Check horizontal split (side by side)\n  const horizontalGap = Math.min(\n    Math.abs(a.bounds.x + a.bounds.width - b.bounds.x),\n    Math.abs(b.bounds.x + b.bounds.width - a.bounds.x)\n  );\n\n  const totalWidth = a.bounds.width + b.bounds.width + horizontalGap;\n  const isHorizontalSplit = totalWidth >= parentBounds.width * 0.8;\n\n  // Check vertical split (stacked)\n  const verticalGap = Math.min(\n    Math.abs(a.bounds.y + a.bounds.height - b.bounds.y),\n    Math.abs(b.bounds.y + b.bounds.height - a.bounds.y)\n  );\n\n  const totalHeight = a.bounds.height + b.bounds.height + verticalGap;\n  const isVerticalSplit = totalHeight >= parentBounds.height * 0.8;\n\n  return isHorizontalSplit || isVerticalSplit;\n}\n\n/**\n * Detect wrap layout (flex-wrap behavior)\n */\nfunction detectWrapLayout(children: NodeLayoutAnalysis[]): boolean {\n  if (children.length < 3) return false;\n\n  // Get unique Y positions (potential rows)\n  const yPositions = children.map((c) => Math.round(c.bounds.y));\n  const uniqueYs = [...new Set(yPositions)].sort((a, b) => a - b);\n\n  // If there are multiple rows and items per row\n  if (uniqueYs.length >= 2) {\n    const firstRowY = uniqueYs[0];\n    const firstRowItems = children.filter((c) => Math.abs(c.bounds.y - firstRowY) < 10);\n\n    // Multiple items in first row suggests wrap\n    if (firstRowItems.length >= 2 && uniqueYs.length >= 2) {\n      return true;\n    }\n  }\n\n  return false;\n}\n\n// ============================================================================\n// Alignment Detection\n// ============================================================================\n\n/**\n * Detect horizontal alignment of children\n */\nfunction detectHorizontalAlignment(\n  children: NodeLayoutAnalysis[],\n  parentBounds: BoundingBox\n): HorizontalAlignment {\n  if (children.length === 0) return \"left\";\n\n  const leftEdges = children.map((c) => c.bounds.x - parentBounds.x);\n  const rightEdges = children.map((c) => parentBounds.x + parentBounds.width - (c.bounds.x + c.bounds.width));\n  const centers = children.map((c) => c.bounds.x + c.bounds.width / 2 - (parentBounds.x + parentBounds.width / 2));\n\n  // Check for consistent left alignment\n  const avgLeft = leftEdges.reduce((s, v) => s + v, 0) / leftEdges.length;\n  const leftVariance = leftEdges.reduce((s, v) => s + Math.abs(v - avgLeft), 0) / leftEdges.length;\n\n  // Check for consistent right alignment\n  const avgRight = rightEdges.reduce((s, v) => s + v, 0) / rightEdges.length;\n  const rightVariance = rightEdges.reduce((s, v) => s + Math.abs(v - avgRight), 0) / rightEdges.length;\n\n  // Check for center alignment\n  const avgCenter = centers.reduce((s, v) => s + v, 0) / centers.length;\n  const centerVariance = centers.reduce((s, v) => s + Math.abs(v - avgCenter), 0) / centers.length;\n\n  // Check for stretch (fills parent width)\n  const isStretched = children.every((c) =>\n    c.bounds.width / parentBounds.width >= THRESHOLDS.FULL_WIDTH_PERCENT\n  );\n\n  if (isStretched) return \"stretch\";\n\n  const tolerance = parentBounds.width * 0.05;\n\n  if (centerVariance < tolerance && Math.abs(avgCenter) < tolerance) return \"center\";\n  if (leftVariance < tolerance) return \"left\";\n  if (rightVariance < tolerance) return \"right\";\n\n  return \"mixed\";\n}\n\n/**\n * Detect vertical alignment of children\n */\nfunction detectVerticalAlignment(\n  children: NodeLayoutAnalysis[],\n  parentBounds: BoundingBox\n): VerticalAlignment {\n  if (children.length === 0) return \"top\";\n\n  const topEdges = children.map((c) => c.bounds.y - parentBounds.y);\n  const bottomEdges = children.map((c) => parentBounds.y + parentBounds.height - (c.bounds.y + c.bounds.height));\n  const centers = children.map((c) => c.bounds.y + c.bounds.height / 2 - (parentBounds.y + parentBounds.height / 2));\n\n  // Check for consistent top alignment\n  const avgTop = topEdges.reduce((s, v) => s + v, 0) / topEdges.length;\n  const topVariance = topEdges.reduce((s, v) => s + Math.abs(v - avgTop), 0) / topEdges.length;\n\n  // Check for consistent bottom alignment\n  const avgBottom = bottomEdges.reduce((s, v) => s + v, 0) / bottomEdges.length;\n  const bottomVariance = bottomEdges.reduce((s, v) => s + Math.abs(v - avgBottom), 0) / bottomEdges.length;\n\n  // Check for center alignment\n  const avgCenter = centers.reduce((s, v) => s + v, 0) / centers.length;\n  const centerVariance = centers.reduce((s, v) => s + Math.abs(v - avgCenter), 0) / centers.length;\n\n  // Check for stretch\n  const isStretched = children.every((c) =>\n    c.bounds.height / parentBounds.height >= THRESHOLDS.FULL_HEIGHT_PERCENT\n  );\n\n  if (isStretched) return \"stretch\";\n\n  const tolerance = parentBounds.height * 0.05;\n\n  if (centerVariance < tolerance && Math.abs(avgCenter) < tolerance) return \"center\";\n  if (topVariance < tolerance) return \"top\";\n  if (bottomVariance < tolerance) return \"bottom\";\n\n  return \"mixed\";\n}\n\n// ============================================================================\n// Major Section Detection\n// ============================================================================\n\n/**\n * Detect major layout sections (header, footer, sidebar, main)\n */\nfunction detectMajorSections(\n  children: NodeLayoutAnalysis[],\n  parentBounds: BoundingBox\n): SectionAnalysis[] {\n  const sections: SectionAnalysis[] = [];\n  const usedNodeIds = new Set<string>();\n\n  // Sort children by Y position for vertical scanning\n  const sortedByY = [...children].sort((a, b) => a.bounds.y - b.bounds.y);\n\n  // Detect header (top, full width)\n  for (const child of sortedByY) {\n    const relPos = calculateRelativePosition(child.bounds, parentBounds);\n\n    if (\n      relPos.topPercent < 0.05 &&\n      relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT &&\n      relPos.heightPercent <= THRESHOLDS.HEADER_MAX_HEIGHT_PERCENT\n    ) {\n      sections.push({\n        role: \"header\",\n        confidence: 0.9,\n        bounds: child.bounds,\n        nodeIds: [child.nodeId],\n        childPattern: child.layoutPattern,\n      });\n      usedNodeIds.add(child.nodeId);\n      break;\n    }\n  }\n\n  // Detect footer (bottom, full width)\n  for (let i = sortedByY.length - 1; i >= 0; i--) {\n    const child = sortedByY[i];\n    if (usedNodeIds.has(child.nodeId)) continue;\n\n    const relPos = calculateRelativePosition(child.bounds, parentBounds);\n\n    if (\n      relPos.topPercent + relPos.heightPercent >= THRESHOLDS.FOOTER_MIN_Y_PERCENT &&\n      relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT\n    ) {\n      const role: SemanticRole = child.bounds.height >= THRESHOLDS.TAB_BAR_HEIGHT_MIN &&\n        child.bounds.height <= THRESHOLDS.TAB_BAR_HEIGHT_MAX ? \"tab-bar\" : \"footer\";\n\n      sections.push({\n        role,\n        confidence: 0.9,\n        bounds: child.bounds,\n        nodeIds: [child.nodeId],\n        childPattern: child.layoutPattern,\n      });\n      usedNodeIds.add(child.nodeId);\n      break;\n    }\n  }\n\n  // Sort remaining by X position for horizontal scanning\n  const remainingByX = children\n    .filter((c) => !usedNodeIds.has(c.nodeId))\n    .sort((a, b) => a.bounds.x - b.bounds.x);\n\n  // Detect sidebar (left or right edge, narrow, tall)\n  for (const child of remainingByX) {\n    const relPos = calculateRelativePosition(child.bounds, parentBounds);\n\n    if (\n      (relPos.leftPercent < 0.05 || relPos.leftPercent + relPos.widthPercent > 0.95) &&\n      relPos.widthPercent <= THRESHOLDS.SIDEBAR_MAX_WIDTH_PERCENT &&\n      relPos.heightPercent >= 0.5\n    ) {\n      sections.push({\n        role: \"sidebar\",\n        confidence: 0.85,\n        bounds: child.bounds,\n        nodeIds: [child.nodeId],\n        childPattern: child.layoutPattern,\n      });\n      usedNodeIds.add(child.nodeId);\n      break;\n    }\n  }\n\n  // Remaining elements form main content\n  const mainContentNodes = children.filter((c) => !usedNodeIds.has(c.nodeId));\n  if (mainContentNodes.length > 0) {\n    // Calculate combined bounds\n    const minX = Math.min(...mainContentNodes.map((c) => c.bounds.x));\n    const minY = Math.min(...mainContentNodes.map((c) => c.bounds.y));\n    const maxX = Math.max(...mainContentNodes.map((c) => c.bounds.x + c.bounds.width));\n    const maxY = Math.max(...mainContentNodes.map((c) => c.bounds.y + c.bounds.height));\n\n    sections.push({\n      role: \"main-content\",\n      confidence: 0.7,\n      bounds: {\n        x: minX,\n        y: minY,\n        width: maxX - minX,\n        height: maxY - minY,\n      },\n      nodeIds: mainContentNodes.map((c) => c.nodeId),\n      childPattern: detectLayoutPattern(mainContentNodes, parentBounds),\n    });\n  }\n\n  return sections;\n}\n\n// ============================================================================\n// CSS Generation\n// ============================================================================\n\n/**\n * Generate suggested CSS properties based on layout analysis\n */\nfunction generateSuggestedCSS(\n  pattern: LayoutPattern,\n  hAlign: HorizontalAlignment,\n  vAlign: VerticalAlignment,\n  children: NodeLayoutAnalysis[]\n): SuggestedCSS {\n  const css: SuggestedCSS = {\n    display: \"flex\",\n    additionalStyles: {},\n  };\n\n  switch (pattern) {\n    case \"horizontal-stack\":\n      css.display = \"flex\";\n      css.flexDirection = \"row\";\n      css.alignItems = mapAlignmentToCSS(vAlign, \"vertical\");\n      css.justifyContent = mapAlignmentToCSS(hAlign, \"horizontal\");\n\n      // Calculate gap if uniform\n      const hGaps = calculateGaps(children, \"horizontal\");\n      if (areGapsUniform(hGaps) && hGaps.length > 0) {\n        const avgGap = calculateAverageGap(hGaps);\n        if (avgGap > 0) {\n          css.gap = `${Math.round(avgGap)}px`;\n        }\n      }\n      break;\n\n    case \"vertical-stack\":\n      css.display = \"flex\";\n      css.flexDirection = \"column\";\n      css.alignItems = mapAlignmentToCSS(hAlign, \"horizontal\");\n      css.justifyContent = mapAlignmentToCSS(vAlign, \"vertical\");\n\n      // Calculate gap if uniform\n      const vGaps = calculateGaps(children, \"vertical\");\n      if (areGapsUniform(vGaps) && vGaps.length > 0) {\n        const avgGap = calculateAverageGap(vGaps);\n        if (avgGap > 0) {\n          css.gap = `${Math.round(avgGap)}px`;\n        }\n      }\n      break;\n\n    case \"grid\":\n      css.display = \"grid\";\n\n      // Detect columns from unique X positions\n      const xPositions = [...new Set(children.map((c) => Math.round(c.bounds.x)))].sort((a, b) => a - b);\n      const numColumns = xPositions.length;\n\n      if (numColumns > 0) {\n        // Check if columns are equal width\n        const columnWidths = children\n          .filter((c) => Math.round(c.bounds.x) === xPositions[0])\n          .map((c) => c.bounds.width);\n        const avgWidth = columnWidths.reduce((s, w) => s + w, 0) / columnWidths.length;\n        const widthVariance = columnWidths.reduce((s, w) => s + Math.abs(w - avgWidth), 0) / columnWidths.length;\n\n        if (widthVariance < avgWidth * 0.1) {\n          css.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;\n        } else {\n          css.gridTemplateColumns = `repeat(${numColumns}, auto)`;\n        }\n      }\n\n      // Calculate gap\n      const gridHGaps = calculateGaps(children, \"horizontal\");\n      const gridVGaps = calculateGaps(children, \"vertical\");\n      const avgHGap = calculateAverageGap(gridHGaps);\n      const avgVGap = calculateAverageGap(gridVGaps);\n\n      if (Math.abs(avgHGap - avgVGap) < 5) {\n        css.gap = `${Math.round((avgHGap + avgVGap) / 2)}px`;\n      } else {\n        css.gap = `${Math.round(avgVGap)}px ${Math.round(avgHGap)}px`;\n      }\n      break;\n\n    case \"centered\":\n      css.display = \"flex\";\n      css.justifyContent = \"center\";\n      css.alignItems = \"center\";\n      break;\n\n    case \"split\":\n      css.display = \"flex\";\n      css.flexDirection = children.length === 2 &&\n        Math.abs(children[0].bounds.y - children[1].bounds.y) > children[0].bounds.height\n          ? \"column\"\n          : \"row\";\n      break;\n\n    case \"wrap\":\n      css.display = \"flex\";\n      css.flexDirection = \"row\";\n      css.additionalStyles[\"flexWrap\"] = \"wrap\";\n\n      // Calculate gap\n      const wrapHGaps = calculateGaps(children, \"horizontal\");\n      if (areGapsUniform(wrapHGaps) && wrapHGaps.length > 0) {\n        css.gap = `${Math.round(calculateAverageGap(wrapHGaps))}px`;\n      }\n      break;\n\n    case \"absolute\":\n    default:\n      css.display = \"block\";\n      css.position = \"relative\";\n      break;\n  }\n\n  return css;\n}\n\n/**\n * Map alignment type to CSS value\n */\nfunction mapAlignmentToCSS(alignment: HorizontalAlignment | VerticalAlignment, direction: \"horizontal\" | \"vertical\"): string {\n  switch (alignment) {\n    case \"left\":\n    case \"top\":\n      return direction === \"horizontal\" ? \"flex-start\" : \"flex-start\";\n    case \"center\":\n      return \"center\";\n    case \"right\":\n    case \"bottom\":\n      return direction === \"horizontal\" ? \"flex-end\" : \"flex-end\";\n    case \"stretch\":\n      return \"stretch\";\n    case \"mixed\":\n    default:\n      return \"flex-start\";\n  }\n}\n\n/**\n * Generate structure suggestions for semantic HTML/JSX\n */\nfunction generateStructureSuggestions(\n  sections: SectionAnalysis[],\n  children: NodeLayoutAnalysis[]\n): StructureSuggestion[] {\n  const suggestions: StructureSuggestion[] = [];\n\n  for (const section of sections) {\n    const element = mapRoleToElement(section.role);\n    const cssClasses = mapRoleToCSSClasses(section.role, section.childPattern);\n\n    suggestions.push({\n      element,\n      role: section.role,\n      cssClasses,\n    });\n  }\n\n  return suggestions;\n}\n\n/**\n * Map semantic role to HTML element\n */\nfunction mapRoleToElement(role: SemanticRole): string {\n  switch (role) {\n    case \"header\":\n      return \"header\";\n    case \"footer\":\n    case \"tab-bar\":\n      return \"footer\";\n    case \"sidebar\":\n    case \"navigation\":\n      return \"nav\";\n    case \"main-content\":\n      return \"main\";\n    case \"list\":\n      return \"ul\";\n    case \"list-item\":\n      return \"li\";\n    case \"form\":\n      return \"form\";\n    case \"modal\":\n      return \"dialog\";\n    case \"hero\":\n    case \"content-section\":\n      return \"section\";\n    case \"card\":\n    case \"card-grid\":\n    default:\n      return \"div\";\n  }\n}\n\n/**\n * Map semantic role to Tailwind CSS classes\n */\nfunction mapRoleToCSSClasses(role: SemanticRole, pattern: LayoutPattern): string[] {\n  const classes: string[] = [];\n\n  // Role-specific classes\n  switch (role) {\n    case \"header\":\n      classes.push(\"sticky\", \"top-0\", \"z-50\");\n      break;\n    case \"footer\":\n      classes.push(\"mt-auto\");\n      break;\n    case \"sidebar\":\n      classes.push(\"flex-shrink-0\");\n      break;\n    case \"main-content\":\n      classes.push(\"flex-1\", \"overflow-auto\");\n      break;\n    case \"card\":\n      classes.push(\"rounded-lg\", \"shadow\");\n      break;\n    case \"modal\":\n      classes.push(\"fixed\", \"inset-0\", \"z-50\");\n      break;\n  }\n\n  // Pattern-specific classes\n  switch (pattern) {\n    case \"horizontal-stack\":\n      classes.push(\"flex\", \"flex-row\");\n      break;\n    case \"vertical-stack\":\n      classes.push(\"flex\", \"flex-col\");\n      break;\n    case \"grid\":\n      classes.push(\"grid\");\n      break;\n    case \"centered\":\n      classes.push(\"flex\", \"items-center\", \"justify-center\");\n      break;\n  }\n\n  return classes;\n}\n\n// ============================================================================\n// Metadata Building\n// ============================================================================\n\n/**\n * Build metadata for a node analysis\n */\nfunction buildMetadata(\n  bounds: BoundingBox,\n  parentBounds: BoundingBox | undefined,\n  children: NodeLayoutAnalysis[]\n): LayoutMetadata {\n  const relPos = parentBounds\n    ? calculateRelativePosition(bounds, parentBounds)\n    : { topPercent: 0, leftPercent: 0, widthPercent: 1, heightPercent: 1 };\n\n  const isFullWidth = relPos.widthPercent >= THRESHOLDS.FULL_WIDTH_PERCENT;\n  const isFullHeight = relPos.heightPercent >= THRESHOLDS.FULL_HEIGHT_PERCENT;\n  const hasUniformChildren = areChildrenUniform(children);\n\n  // Calculate dominant direction\n  const { isHorizontal, isVertical } = detectStackDirection(children);\n  let dominantDirection: \"horizontal\" | \"vertical\" | undefined;\n  if (isHorizontal && !isVertical) {\n    dominantDirection = \"horizontal\";\n  } else if (isVertical && !isHorizontal) {\n    dominantDirection = \"vertical\";\n  }\n\n  // Calculate average gap\n  let averageGap: number | undefined;\n  if (dominantDirection) {\n    const gaps = calculateGaps(children, dominantDirection);\n    if (gaps.length > 0) {\n      averageGap = calculateAverageGap(gaps);\n    }\n  }\n\n  return {\n    isFullWidth,\n    isFullHeight,\n    hasUniformChildren,\n    childCount: children.length,\n    averageGap,\n    dominantDirection,\n    aspectRatio: bounds.height !== 0 ? bounds.width / bounds.height : 1,\n    relativePosition: relPos,\n  };\n}\n\n// ============================================================================\n// Utility Exports\n// ============================================================================\n\n/**\n * Quick analysis for a single node - returns role and confidence\n */\nexport function quickAnalyze(node: FigmaNode, parentBounds?: BoundingBox): {\n  role: SemanticRole;\n  confidence: number;\n  pattern: LayoutPattern;\n} {\n  const analysis = analyzeNodeLayout(node, parentBounds);\n  return {\n    role: analysis.semanticRole,\n    confidence: analysis.confidence,\n    pattern: analysis.layoutPattern,\n  };\n}\n\n/**\n * Analyze and return flat list of all semantic roles in a tree\n */\nexport function flattenAnalysis(analysis: NodeLayoutAnalysis): Array<{\n  nodeId: string;\n  nodeName: string;\n  role: SemanticRole;\n  confidence: number;\n}> {\n  const results: Array<{\n    nodeId: string;\n    nodeName: string;\n    role: SemanticRole;\n    confidence: number;\n  }> = [];\n\n  function traverse(node: NodeLayoutAnalysis) {\n    results.push({\n      nodeId: node.nodeId,\n      nodeName: node.nodeName,\n      role: node.semanticRole,\n      confidence: node.confidence,\n    });\n\n    if (node.children) {\n      for (const child of node.children) {\n        traverse(child);\n      }\n    }\n  }\n\n  traverse(analysis);\n  return results;\n}\n\n/**\n * Get CSS code snippet for a layout pattern\n */\nexport function getCSSForPattern(pattern: LayoutPattern, options?: {\n  gap?: number;\n  columns?: number;\n}): string {\n  const css: string[] = [];\n\n  switch (pattern) {\n    case \"horizontal-stack\":\n      css.push(\"display: flex;\");\n      css.push(\"flex-direction: row;\");\n      if (options?.gap) css.push(`gap: ${options.gap}px;`);\n      break;\n\n    case \"vertical-stack\":\n      css.push(\"display: flex;\");\n      css.push(\"flex-direction: column;\");\n      if (options?.gap) css.push(`gap: ${options.gap}px;`);\n      break;\n\n    case \"grid\":\n      css.push(\"display: grid;\");\n      if (options?.columns) {\n        css.push(`grid-template-columns: repeat(${options.columns}, 1fr);`);\n      }\n      if (options?.gap) css.push(`gap: ${options.gap}px;`);\n      break;\n\n    case \"centered\":\n      css.push(\"display: flex;\");\n      css.push(\"justify-content: center;\");\n      css.push(\"align-items: center;\");\n      break;\n\n    case \"wrap\":\n      css.push(\"display: flex;\");\n      css.push(\"flex-wrap: wrap;\");\n      if (options?.gap) css.push(`gap: ${options.gap}px;`);\n      break;\n\n    case \"absolute\":\n      css.push(\"position: relative;\");\n      break;\n  }\n\n  return css.join(\"\\n\");\n}\n\n/**\n * Get Tailwind classes for a layout pattern\n */\nexport function getTailwindForPattern(pattern: LayoutPattern, options?: {\n  gap?: number;\n  columns?: number;\n}): string[] {\n  const classes: string[] = [];\n\n  switch (pattern) {\n    case \"horizontal-stack\":\n      classes.push(\"flex\", \"flex-row\");\n      break;\n\n    case \"vertical-stack\":\n      classes.push(\"flex\", \"flex-col\");\n      break;\n\n    case \"grid\":\n      classes.push(\"grid\");\n      if (options?.columns) {\n        classes.push(`grid-cols-${options.columns}`);\n      }\n      break;\n\n    case \"centered\":\n      classes.push(\"flex\", \"items-center\", \"justify-center\");\n      break;\n\n    case \"wrap\":\n      classes.push(\"flex\", \"flex-wrap\");\n      break;\n\n    case \"absolute\":\n      classes.push(\"relative\");\n      break;\n  }\n\n  // Add gap classes (Tailwind uses scale)\n  if (options?.gap) {\n    const gapClass = mapGapToTailwind(options.gap);\n    if (gapClass) classes.push(gapClass);\n  }\n\n  return classes;\n}\n\n/**\n * Map pixel gap to Tailwind gap class\n */\nfunction mapGapToTailwind(gapPx: number): string | null {\n  // Tailwind gap scale: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, etc.\n  const gapScale: Record<number, string> = {\n    0: \"gap-0\",\n    4: \"gap-1\",\n    8: \"gap-2\",\n    12: \"gap-3\",\n    16: \"gap-4\",\n    20: \"gap-5\",\n    24: \"gap-6\",\n    32: \"gap-8\",\n    40: \"gap-10\",\n    48: \"gap-12\",\n  };\n\n  // Find closest match\n  const closest = Object.keys(gapScale)\n    .map(Number)\n    .reduce((prev, curr) =>\n      Math.abs(curr - gapPx) < Math.abs(prev - gapPx) ? curr : prev\n    );\n\n  return gapScale[closest] || `gap-[${gapPx}px]`;\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Design and implement layout-analyzer.ts utility module",
      "status": "completed",
      "activeForm": "Designing layout analyzer module"
    },
    {
      "content": "Implement spatial positioning analysis (alignment, gaps, clustering)",
      "status": "completed",
      "activeForm": "Implementing spatial analysis"
    },
    {
      "content": "Implement semantic pattern detection (header/footer/sidebar/navigation)",
      "status": "completed",
      "activeForm": "Implementing pattern detection"
    },
    {
      "content": "Implement card grid and list layout detection",
      "status": "completed",
      "activeForm": "Detecting grid and list layouts"
    },
    {
      "content": "Add layout intent inference with heuristics",
      "status": "completed",
      "activeForm": "Adding layout heuristics"
    },
    {
      "content": "Create integration with existing Figma utilities",
      "status": "in_progress",
      "activeForm": "Creating integration utilities"
    },
    {
      "content": "Write comprehensive tests with Playwright",
      "status": "pending",
      "activeForm": "Writing Playwright tests"
    },
    {
      "content": "Verify feature works correctly",
      "status": "pending",
      "activeForm": "Verifying feature"
    }
  ]
}
Now let me create a utility that integrates the layout analyzer with the existing Figma API client to make it easier to use:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts",
  "content": "/**\n * Figma Layout Intent - Integration layer between Figma API and Layout Analyzer\n *\n * Provides high-level functions to analyze Figma frames and extract\n * semantic layout intent for code generation.\n */\n\nimport type { FigmaNode, FigmaPage, CategorizedFrame } from \"./figma-api\";\nimport {\n  analyzeNodeLayout,\n  analyzeFrameLayout,\n  quickAnalyze,\n  flattenAnalysis,\n  getCSSForPattern,\n  getTailwindForPattern,\n  type NodeLayoutAnalysis,\n  type FrameLayoutAnalysis,\n  type SemanticRole,\n  type LayoutPattern,\n  type BoundingBox,\n  type SectionAnalysis,\n} from \"./layout-analyzer\";\n\n// ============================================================================\n// Types\n// ============================================================================\n\n/** Enhanced frame with layout analysis */\nexport interface AnalyzedFrame extends CategorizedFrame {\n  layoutAnalysis: FrameLayoutAnalysis;\n  semanticStructure: SemanticStructureNode[];\n  suggestedCode: CodeSuggestion;\n}\n\n/** Semantic structure tree node */\nexport interface SemanticStructureNode {\n  role: SemanticRole;\n  element: string;\n  tailwindClasses: string[];\n  children?: SemanticStructureNode[];\n  sourceNodeId?: string;\n  sourceNodeName?: string;\n}\n\n/** Code suggestion for a frame */\nexport interface CodeSuggestion {\n  jsx: string;\n  css: string;\n  tailwind: string;\n}\n\n/** Layout analysis summary for UI display */\nexport interface LayoutAnalysisSummary {\n  frameId: string;\n  frameName: string;\n  detectedSections: Array<{\n    role: SemanticRole;\n    confidence: number;\n    description: string;\n  }>;\n  overallPattern: LayoutPattern;\n  suggestedStructure: string;\n  tailwindClasses: string[];\n}\n\n// ============================================================================\n// Main Analysis Functions\n// ============================================================================\n\n/**\n * Analyze a Figma frame and return comprehensive layout intent information\n */\nexport function analyzeFrameIntent(frame: FigmaNode): AnalyzedFrame {\n  const bounds = frame.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 };\n\n  // Run layout analysis\n  const layoutAnalysis = analyzeFrameLayout(frame);\n\n  // Build semantic structure tree\n  const semanticStructure = buildSemanticStructure(layoutAnalysis);\n\n  // Generate code suggestions\n  const suggestedCode = generateCodeSuggestion(layoutAnalysis, semanticStructure);\n\n  // Build categorized frame info\n  const category = categorizeFrameBySize(bounds.width, bounds.height);\n\n  return {\n    id: frame.id,\n    name: frame.name,\n    width: Math.round(bounds.width),\n    height: Math.round(bounds.height),\n    category,\n    isTopLevel: true,\n    layoutAnalysis,\n    semanticStructure,\n    suggestedCode,\n  };\n}\n\n/**\n * Analyze multiple frames from a page\n */\nexport function analyzePageFrames(page: FigmaPage): AnalyzedFrame[] {\n  const frames: AnalyzedFrame[] = [];\n\n  if (!page.children) return frames;\n\n  for (const node of page.children) {\n    if (node.type !== \"FRAME\" && node.type !== \"COMPONENT\" && node.type !== \"COMPONENT_SET\") {\n      continue;\n    }\n\n    if (!node.absoluteBoundingBox) continue;\n\n    frames.push(analyzeFrameIntent(node));\n  }\n\n  return frames;\n}\n\n/**\n * Get a quick summary of layout analysis for UI display\n */\nexport function getLayoutSummary(frame: FigmaNode): LayoutAnalysisSummary {\n  const layoutAnalysis = analyzeFrameLayout(frame);\n\n  const detectedSections = layoutAnalysis.sections.map((section) => ({\n    role: section.role,\n    confidence: section.confidence,\n    description: getSectionDescription(section),\n  }));\n\n  const tailwindClasses = getTailwindForPattern(layoutAnalysis.overallPattern);\n\n  return {\n    frameId: frame.id,\n    frameName: frame.name,\n    detectedSections,\n    overallPattern: layoutAnalysis.overallPattern,\n    suggestedStructure: describeStructure(layoutAnalysis),\n    tailwindClasses,\n  };\n}\n\n// ============================================================================\n// Batch Analysis Functions\n// ============================================================================\n\n/**\n * Analyze all frames in a Figma file document\n */\nexport function analyzeDocumentFrames(pages: FigmaPage[]): Map<string, AnalyzedFrame[]> {\n  const result = new Map<string, AnalyzedFrame[]>();\n\n  for (const page of pages) {\n    const frames = analyzePageFrames(page);\n    if (frames.length > 0) {\n      result.set(page.id, frames);\n    }\n  }\n\n  return result;\n}\n\n/**\n * Find frames matching a specific layout pattern\n */\nexport function findFramesByPattern(\n  frames: AnalyzedFrame[],\n  pattern: LayoutPattern\n): AnalyzedFrame[] {\n  return frames.filter((frame) => frame.layoutAnalysis.overallPattern === pattern);\n}\n\n/**\n * Find frames containing a specific semantic role\n */\nexport function findFramesByRole(\n  frames: AnalyzedFrame[],\n  role: SemanticRole\n): AnalyzedFrame[] {\n  return frames.filter((frame) =>\n    frame.layoutAnalysis.sections.some((section) => section.role === role)\n  );\n}\n\n/**\n * Group frames by their detected patterns\n */\nexport function groupFramesByPattern(\n  frames: AnalyzedFrame[]\n): Map<LayoutPattern, AnalyzedFrame[]> {\n  const groups = new Map<LayoutPattern, AnalyzedFrame[]>();\n\n  for (const frame of frames) {\n    const pattern = frame.layoutAnalysis.overallPattern;\n    const existing = groups.get(pattern) || [];\n    existing.push(frame);\n    groups.set(pattern, existing);\n  }\n\n  return groups;\n}\n\n// ============================================================================\n// Semantic Structure Building\n// ============================================================================\n\n/**\n * Build a semantic structure tree from layout analysis\n */\nfunction buildSemanticStructure(analysis: FrameLayoutAnalysis): SemanticStructureNode[] {\n  const nodes: SemanticStructureNode[] = [];\n\n  for (const section of analysis.sections) {\n    nodes.push(buildSectionNode(section));\n  }\n\n  return nodes;\n}\n\n/**\n * Build a semantic structure node from a section\n */\nfunction buildSectionNode(section: SectionAnalysis): SemanticStructureNode {\n  return {\n    role: section.role,\n    element: mapRoleToElement(section.role),\n    tailwindClasses: getRoleClasses(section.role, section.childPattern),\n    sourceNodeId: section.nodeIds[0],\n  };\n}\n\n/**\n * Map semantic role to HTML element\n */\nfunction mapRoleToElement(role: SemanticRole): string {\n  const elementMap: Record<SemanticRole, string> = {\n    header: \"header\",\n    footer: \"footer\",\n    sidebar: \"aside\",\n    navigation: \"nav\",\n    \"main-content\": \"main\",\n    card: \"article\",\n    \"card-grid\": \"div\",\n    list: \"ul\",\n    \"list-item\": \"li\",\n    hero: \"section\",\n    form: \"form\",\n    modal: \"dialog\",\n    toolbar: \"div\",\n    \"tab-bar\": \"nav\",\n    breadcrumb: \"nav\",\n    search: \"form\",\n    avatar: \"div\",\n    \"button-group\": \"div\",\n    \"content-section\": \"section\",\n    unknown: \"div\",\n  };\n\n  return elementMap[role] || \"div\";\n}\n\n/**\n * Get Tailwind classes for a semantic role\n */\nfunction getRoleClasses(role: SemanticRole, pattern: LayoutPattern): string[] {\n  const classes: string[] = [];\n\n  // Role-specific classes\n  const roleClasses: Record<SemanticRole, string[]> = {\n    header: [\"sticky\", \"top-0\", \"z-50\", \"bg-background\", \"border-b\"],\n    footer: [\"mt-auto\", \"border-t\"],\n    sidebar: [\"flex-shrink-0\", \"w-64\", \"border-r\"],\n    navigation: [\"flex\", \"items-center\", \"gap-4\"],\n    \"main-content\": [\"flex-1\", \"overflow-auto\", \"p-4\"],\n    card: [\"rounded-lg\", \"border\", \"bg-card\", \"p-4\", \"shadow-sm\"],\n    \"card-grid\": [\"grid\", \"gap-4\"],\n    list: [\"space-y-2\"],\n    \"list-item\": [],\n    hero: [\"py-12\", \"px-4\", \"text-center\"],\n    form: [\"space-y-4\"],\n    modal: [\"fixed\", \"inset-0\", \"z-50\", \"flex\", \"items-center\", \"justify-center\"],\n    toolbar: [\"flex\", \"items-center\", \"gap-2\", \"p-2\"],\n    \"tab-bar\": [\"flex\", \"border-t\", \"bg-background\"],\n    breadcrumb: [\"flex\", \"items-center\", \"gap-2\", \"text-sm\"],\n    search: [\"relative\"],\n    avatar: [\"rounded-full\", \"overflow-hidden\"],\n    \"button-group\": [\"flex\", \"gap-2\"],\n    \"content-section\": [\"py-8\"],\n    unknown: [],\n  };\n\n  classes.push(...(roleClasses[role] || []));\n\n  // Pattern-specific classes\n  const patternClasses = getTailwindForPattern(pattern);\n  for (const cls of patternClasses) {\n    if (!classes.includes(cls)) {\n      classes.push(cls);\n    }\n  }\n\n  return classes;\n}\n\n// ============================================================================\n// Code Generation\n// ============================================================================\n\n/**\n * Generate code suggestion from layout analysis\n */\nfunction generateCodeSuggestion(\n  analysis: FrameLayoutAnalysis,\n  structure: SemanticStructureNode[]\n): CodeSuggestion {\n  return {\n    jsx: generateJSX(structure, analysis),\n    css: generateCSS(analysis),\n    tailwind: generateTailwind(structure),\n  };\n}\n\n/**\n * Generate JSX code from semantic structure\n */\nfunction generateJSX(structure: SemanticStructureNode[], analysis: FrameLayoutAnalysis): string {\n  const lines: string[] = [];\n\n  // Container wrapper\n  lines.push(`<div className=\"min-h-screen flex flex-col\">`);\n\n  for (const node of structure) {\n    lines.push(generateNodeJSX(node, 1));\n  }\n\n  lines.push(\"</div>\");\n\n  return lines.join(\"\\n\");\n}\n\n/**\n * Generate JSX for a single node\n */\nfunction generateNodeJSX(node: SemanticStructureNode, indent: number): string {\n  const indentStr = \"  \".repeat(indent);\n  const classes = node.tailwindClasses.join(\" \");\n  const Element = node.element;\n\n  let jsx = `${indentStr}<${Element}`;\n\n  if (classes) {\n    jsx += ` className=\"${classes}\"`;\n  }\n\n  if (node.sourceNodeName) {\n    jsx += ` {/* ${node.sourceNodeName} */}`;\n  }\n\n  jsx += \">\";\n\n  if (node.children && node.children.length > 0) {\n    jsx += \"\\n\";\n    for (const child of node.children) {\n      jsx += generateNodeJSX(child, indent + 1) + \"\\n\";\n    }\n    jsx += `${indentStr}</${Element}>`;\n  } else {\n    jsx += `{/* Content */}</${Element}>`;\n  }\n\n  return jsx;\n}\n\n/**\n * Generate CSS from layout analysis\n */\nfunction generateCSS(analysis: FrameLayoutAnalysis): string {\n  const lines: string[] = [];\n\n  lines.push(\"/* Container */\");\n  lines.push(\".container {\");\n  lines.push(\"  min-height: 100vh;\");\n  lines.push(\"  display: flex;\");\n  lines.push(\"  flex-direction: column;\");\n  lines.push(\"}\");\n  lines.push(\"\");\n\n  // Generate CSS for each section\n  for (const section of analysis.sections) {\n    lines.push(`/* ${capitalizeRole(section.role)} */`);\n    lines.push(`.${section.role} {`);\n\n    const patternCSS = getCSSForPattern(section.childPattern);\n    for (const line of patternCSS.split(\"\\n\")) {\n      if (line.trim()) {\n        lines.push(`  ${line}`);\n      }\n    }\n\n    // Add role-specific styles\n    const roleStyles = getRoleCSSStyles(section.role);\n    for (const [prop, value] of Object.entries(roleStyles)) {\n      lines.push(`  ${prop}: ${value};`);\n    }\n\n    lines.push(\"}\");\n    lines.push(\"\");\n  }\n\n  return lines.join(\"\\n\");\n}\n\n/**\n * Get CSS styles for a semantic role\n */\nfunction getRoleCSSStyles(role: SemanticRole): Record<string, string> {\n  const styles: Record<SemanticRole, Record<string, string>> = {\n    header: {\n      position: \"sticky\",\n      top: \"0\",\n      \"z-index\": \"50\",\n      \"border-bottom\": \"1px solid var(--border)\",\n    },\n    footer: {\n      \"margin-top\": \"auto\",\n      \"border-top\": \"1px solid var(--border)\",\n    },\n    sidebar: {\n      \"flex-shrink\": \"0\",\n      width: \"16rem\",\n      \"border-right\": \"1px solid var(--border)\",\n    },\n    navigation: {},\n    \"main-content\": {\n      flex: \"1\",\n      overflow: \"auto\",\n      padding: \"1rem\",\n    },\n    card: {\n      \"border-radius\": \"0.5rem\",\n      border: \"1px solid var(--border)\",\n      padding: \"1rem\",\n      \"box-shadow\": \"0 1px 2px rgba(0, 0, 0, 0.05)\",\n    },\n    \"card-grid\": {},\n    list: {},\n    \"list-item\": {},\n    hero: {\n      padding: \"3rem 1rem\",\n      \"text-align\": \"center\",\n    },\n    form: {},\n    modal: {\n      position: \"fixed\",\n      inset: \"0\",\n      \"z-index\": \"50\",\n      display: \"flex\",\n      \"align-items\": \"center\",\n      \"justify-content\": \"center\",\n    },\n    toolbar: {},\n    \"tab-bar\": {\n      display: \"flex\",\n      \"border-top\": \"1px solid var(--border)\",\n    },\n    breadcrumb: {\n      \"font-size\": \"0.875rem\",\n    },\n    search: {},\n    avatar: {\n      \"border-radius\": \"9999px\",\n      overflow: \"hidden\",\n    },\n    \"button-group\": {},\n    \"content-section\": {\n      padding: \"2rem 0\",\n    },\n    unknown: {},\n  };\n\n  return styles[role] || {};\n}\n\n/**\n * Generate Tailwind code from semantic structure\n */\nfunction generateTailwind(structure: SemanticStructureNode[]): string {\n  const classes: string[] = [];\n\n  for (const node of structure) {\n    collectTailwindClasses(node, classes);\n  }\n\n  return [...new Set(classes)].join(\" \");\n}\n\n/**\n * Collect all Tailwind classes from structure tree\n */\nfunction collectTailwindClasses(node: SemanticStructureNode, classes: string[]): void {\n  classes.push(...node.tailwindClasses);\n\n  if (node.children) {\n    for (const child of node.children) {\n      collectTailwindClasses(child, classes);\n    }\n  }\n}\n\n// ============================================================================\n// Description Helpers\n// ============================================================================\n\n/**\n * Get human-readable description for a section\n */\nfunction getSectionDescription(section: SectionAnalysis): string {\n  const roleDescriptions: Record<SemanticRole, string> = {\n    header: \"Top navigation or app bar\",\n    footer: \"Bottom content area or page footer\",\n    sidebar: \"Side navigation panel\",\n    navigation: \"Navigation links or menu\",\n    \"main-content\": \"Primary content area\",\n    card: \"Card or content container\",\n    \"card-grid\": \"Grid of cards or tiles\",\n    list: \"List of items\",\n    \"list-item\": \"Individual list item\",\n    hero: \"Hero banner or splash section\",\n    form: \"Form or input area\",\n    modal: \"Modal or dialog overlay\",\n    toolbar: \"Toolbar with actions\",\n    \"tab-bar\": \"Tab navigation bar\",\n    breadcrumb: \"Breadcrumb navigation\",\n    search: \"Search input area\",\n    avatar: \"User avatar or profile image\",\n    \"button-group\": \"Group of action buttons\",\n    \"content-section\": \"Content section or block\",\n    unknown: \"Unidentified layout section\",\n  };\n\n  return roleDescriptions[section.role] || \"Layout section\";\n}\n\n/**\n * Describe overall structure\n */\nfunction describeStructure(analysis: FrameLayoutAnalysis): string {\n  const parts: string[] = [];\n\n  const hasHeader = analysis.sections.some((s) => s.role === \"header\");\n  const hasFooter = analysis.sections.some((s) => s.role === \"footer\" || s.role === \"tab-bar\");\n  const hasSidebar = analysis.sections.some((s) => s.role === \"sidebar\");\n  const hasMainContent = analysis.sections.some((s) => s.role === \"main-content\");\n\n  if (hasHeader) parts.push(\"header\");\n  if (hasSidebar) parts.push(\"sidebar\");\n  if (hasMainContent) parts.push(\"main content\");\n  if (hasFooter) parts.push(\"footer\");\n\n  if (parts.length === 0) {\n    return `Single section with ${analysis.overallPattern} layout`;\n  }\n\n  return `Layout with ${parts.join(\", \")}`;\n}\n\n/**\n * Capitalize role name for display\n */\nfunction capitalizeRole(role: SemanticRole): string {\n  return role\n    .split(\"-\")\n    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))\n    .join(\" \");\n}\n\n// ============================================================================\n// Frame Categorization\n// ============================================================================\n\n/**\n * Categorize frame by size\n */\nfunction categorizeFrameBySize(width: number, height: number): \"screen\" | \"component\" | \"asset\" | \"unknown\" {\n  // Small frames are assets\n  if (width <= 100 && height <= 100) {\n    return \"asset\";\n  }\n\n  // Large frames are screens\n  if (width >= 320 || height >= 480) {\n    return \"screen\";\n  }\n\n  // Medium frames are components\n  if (width <= 500 && height <= 500) {\n    return \"component\";\n  }\n\n  return \"unknown\";\n}\n\n// ============================================================================\n// Export Convenience Functions\n// ============================================================================\n\nexport {\n  analyzeNodeLayout,\n  analyzeFrameLayout,\n  quickAnalyze,\n  flattenAnalysis,\n  getCSSForPattern,\n  getTailwindForPattern,\n} from \"./layout-analyzer\";\n\nexport type {\n  NodeLayoutAnalysis,\n  FrameLayoutAnalysis,\n  SemanticRole,\n  LayoutPattern,\n  BoundingBox,\n  SectionAnalysis,\n} from \"./layout-analyzer\";\n"
}
Now let me update the todo and create a test file to verify the feature works:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Design and implement layout-analyzer.ts utility module",
      "status": "completed",
      "activeForm": "Designing layout analyzer module"
    },
    {
      "content": "Implement spatial positioning analysis (alignment, gaps, clustering)",
      "status": "completed",
      "activeForm": "Implementing spatial analysis"
    },
    {
      "content": "Implement semantic pattern detection (header/footer/sidebar/navigation)",
      "status": "completed",
      "activeForm": "Implementing pattern detection"
    },
    {
      "content": "Implement card grid and list layout detection",
      "status": "completed",
      "activeForm": "Detecting grid and list layouts"
    },
    {
      "content": "Add layout intent inference with heuristics",
      "status": "completed",
      "activeForm": "Adding layout heuristics"
    },
    {
      "content": "Create integration with existing Figma utilities",
      "status": "completed",
      "activeForm": "Creating integration utilities"
    },
    {
      "content": "Write comprehensive tests with Playwright",
      "status": "in_progress",
      "activeForm": "Writing Playwright tests"
    },
    {
      "content": "Verify feature works correctly",
      "status": "pending",
      "activeForm": "Verifying feature"
    }
  ]
}
Let me check if Playwright is installed and what testing setup exists:

🔧 Tool: Bash
Input: {
  "command": "cat package.json | head -100",
  "description": "Check package.json for test setup"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.test.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.spec.ts"
}
Playwright is installed. Let me check if there's a Playwright config:

🔧 Tool: Glob
Input: {
  "pattern": "playwright.config.*"
}

🔧 Tool: Glob
Input: {
  "pattern": "tests/**/*"
}
No existing Playwright config. Let me create a Playwright config and write a verification test for the layout analyzer:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/playwright.config.ts",
  "content": "import { defineConfig } from \"@playwright/test\";\n\nexport default defineConfig({\n  testDir: \"./tests\",\n  fullyParallel: true,\n  forbidOnly: !!process.env.CI,\n  retries: process.env.CI ? 2 : 0,\n  workers: process.env.CI ? 1 : undefined,\n  reporter: \"html\",\n  use: {\n    baseURL: \"http://localhost:3000\",\n    trace: \"on-first-retry\",\n  },\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "mkdir -p /home/rainman/figma-to-code/figma-to-code/tests",
  "description": "Create tests directory"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/layout-analyzer.spec.ts",
  "content": "/**\n * Layout Analyzer Verification Tests\n *\n * Tests to verify the layout analyzer correctly detects semantic layout patterns\n * from Figma-like node structures.\n */\n\nimport { test, expect } from \"@playwright/test\";\nimport {\n  analyzeNodeLayout,\n  analyzeFrameLayout,\n  quickAnalyze,\n  flattenAnalysis,\n  getCSSForPattern,\n  getTailwindForPattern,\n  type BoundingBox,\n  type SemanticRole,\n  type LayoutPattern,\n} from \"../src/utils/layout-analyzer\";\nimport type { FigmaNode } from \"../src/utils/figma-api\";\n\n// ============================================================================\n// Test Utilities - Mock Figma Nodes\n// ============================================================================\n\nfunction createMockNode(\n  id: string,\n  name: string,\n  bounds: BoundingBox,\n  children?: FigmaNode[]\n): FigmaNode {\n  return {\n    id,\n    name,\n    type: \"FRAME\",\n    absoluteBoundingBox: bounds,\n    children,\n  };\n}\n\n// ============================================================================\n// Header/Footer/Sidebar Detection Tests\n// ============================================================================\n\ntest.describe(\"Header Detection\", () => {\n  test(\"detects header at top of frame with full width\", () => {\n    // Parent frame: 375x812 (iPhone size)\n    const parentBounds: BoundingBox = { x: 0, y: 0, width: 375, height: 812 };\n\n    // Header: full width, at top, limited height\n    const headerNode = createMockNode(\"header-1\", \"Header\", {\n      x: 0,\n      y: 0,\n      width: 375,\n      height: 64,\n    });\n\n    const result = quickAnalyze(headerNode, parentBounds);\n\n    expect(result.role).toBe(\"header\");\n    expect(result.confidence).toBeGreaterThan(0.5);\n  });\n\n  test(\"detects header from name even with different position\", () => {\n    const headerNode = createMockNode(\"header-2\", \"App Header Bar\", {\n      x: 0,\n      y: 0,\n      width: 375,\n      height: 80,\n    });\n\n    const result = quickAnalyze(headerNode, { x: 0, y: 0, width: 375, height: 812 });\n\n    expect(result.role).toBe(\"header\");\n  });\n});\n\ntest.describe(\"Footer Detection\", () => {\n  test(\"detects footer at bottom of frame\", () => {\n    const parentBounds: BoundingBox = { x: 0, y: 0, width: 375, height: 812 };\n\n    // Footer at bottom, full width\n    const footerNode = createMockNode(\"footer-1\", \"Footer\", {\n      x: 0,\n      y: 762,\n      width: 375,\n      height: 50,\n    });\n\n    const result = quickAnalyze(footerNode, parentBounds);\n\n    expect(result.role).toBe(\"footer\");\n    expect(result.confidence).toBeGreaterThan(0.5);\n  });\n\n  test(\"detects tab bar at bottom with specific height\", () => {\n    const parentBounds: BoundingBox = { x: 0, y: 0, width: 375, height: 812 };\n\n    // Tab bar: at bottom, typical height\n    const tabBarNode = createMockNode(\"tab-bar-1\", \"Tab Bar\", {\n      x: 0,\n      y: 762,\n      width: 375,\n      height: 50,\n    });\n\n    const result = quickAnalyze(tabBarNode, parentBounds);\n\n    // Should detect as tab-bar or footer\n    expect([\"tab-bar\", \"footer\"]).toContain(result.role);\n  });\n});\n\ntest.describe(\"Sidebar Detection\", () => {\n  test(\"detects sidebar on left edge\", () => {\n    const parentBounds: BoundingBox = { x: 0, y: 0, width: 1200, height: 800 };\n\n    // Left sidebar: narrow width, full height\n    const sidebarNode = createMockNode(\"sidebar-1\", \"Sidebar\", {\n      x: 0,\n      y: 0,\n      width: 280,\n      height: 800,\n    });\n\n    const result = quickAnalyze(sidebarNode, parentBounds);\n\n    expect(result.role).toBe(\"sidebar\");\n    expect(result.confidence).toBeGreaterThan(0.5);\n  });\n\n  test(\"detects sidebar on right edge\", () => {\n    const parentBounds: BoundingBox = { x: 0, y: 0, width: 1200, height: 800 };\n\n    // Right sidebar\n    const sidebarNode = createMockNode(\"sidebar-2\", \"Right Panel\", {\n      x: 920,\n      y: 0,\n      width: 280,\n      height: 800,\n    });\n\n    const result = quickAnalyze(sidebarNode, parentBounds);\n\n    expect(result.role).toBe(\"sidebar\");\n  });\n});\n\n// ============================================================================\n// Navigation Detection Tests\n// ============================================================================\n\ntest.describe(\"Navigation Detection\", () => {\n  test(\"detects navigation from name\", () => {\n    const navNode = createMockNode(\"nav-1\", \"Main Navigation\", {\n      x: 100,\n      y: 20,\n      width: 400,\n      height: 40,\n    });\n\n    const result = quickAnalyze(navNode);\n\n    expect(result.role).toBe(\"navigation\");\n  });\n\n  test(\"detects navigation with menu keyword\", () => {\n    const menuNode = createMockNode(\"menu-1\", \"Top Menu\", {\n      x: 0,\n      y: 0,\n      width: 200,\n      height: 50,\n    });\n\n    const result = quickAnalyze(menuNode);\n\n    expect(result.role).toBe(\"navigation\");\n  });\n});\n\n// ============================================================================\n// Card and Grid Detection Tests\n// ============================================================================\n\ntest.describe(\"Card Detection\", () => {\n  test(\"detects card from name\", () => {\n    const cardNode = createMockNode(\"card-1\", \"Product Card\", {\n      x: 0,\n      y: 0,\n      width: 300,\n      height: 200,\n    });\n\n    const result = quickAnalyze(cardNode);\n\n    expect(result.role).toBe(\"card\");\n  });\n\n  test(\"detects card grid from uniform children\", () => {\n    // Create a 2x2 grid of cards\n    const children: FigmaNode[] = [\n      createMockNode(\"card-1\", \"Card 1\", { x: 0, y: 0, width: 150, height: 200 }),\n      createMockNode(\"card-2\", \"Card 2\", { x: 166, y: 0, width: 150, height: 200 }),\n      createMockNode(\"card-3\", \"Card 3\", { x: 0, y: 216, width: 150, height: 200 }),\n      createMockNode(\"card-4\", \"Card 4\", { x: 166, y: 216, width: 150, height: 200 }),\n    ];\n\n    const gridNode = createMockNode(\n      \"grid-1\",\n      \"Card Grid\",\n      { x: 0, y: 0, width: 316, height: 416 },\n      children\n    );\n\n    const result = analyzeNodeLayout(gridNode);\n\n    expect(result.layoutPattern).toBe(\"grid\");\n    expect(result.semanticRole).toBe(\"card-grid\");\n  });\n});\n\n// ============================================================================\n// List Detection Tests\n// ============================================================================\n\ntest.describe(\"List Detection\", () => {\n  test(\"detects list from name\", () => {\n    const listNode = createMockNode(\"list-1\", \"Items List\", {\n      x: 0,\n      y: 0,\n      width: 300,\n      height: 400,\n    });\n\n    const result = quickAnalyze(listNode);\n\n    expect(result.role).toBe(\"list\");\n  });\n\n  test(\"detects vertical list from uniform vertical children\", () => {\n    // Create vertical list items\n    const children: FigmaNode[] = [\n      createMockNode(\"item-1\", \"Item 1\", { x: 0, y: 0, width: 300, height: 60 }),\n      createMockNode(\"item-2\", \"Item 2\", { x: 0, y: 68, width: 300, height: 60 }),\n      createMockNode(\"item-3\", \"Item 3\", { x: 0, y: 136, width: 300, height: 60 }),\n    ];\n\n    const listNode = createMockNode(\n      \"list-1\",\n      \"Items\",\n      { x: 0, y: 0, width: 300, height: 196 },\n      children\n    );\n\n    const result = analyzeNodeLayout(listNode);\n\n    expect(result.layoutPattern).toBe(\"vertical-stack\");\n  });\n});\n\n// ============================================================================\n// Layout Pattern Detection Tests\n// ============================================================================\n\ntest.describe(\"Layout Pattern Detection\", () => {\n  test(\"detects horizontal stack layout\", () => {\n    const children: FigmaNode[] = [\n      createMockNode(\"btn-1\", \"Button 1\", { x: 0, y: 0, width: 100, height: 40 }),\n      createMockNode(\"btn-2\", \"Button 2\", { x: 112, y: 0, width: 100, height: 40 }),\n      createMockNode(\"btn-3\", \"Button 3\", { x: 224, y: 0, width: 100, height: 40 }),\n    ];\n\n    const containerNode = createMockNode(\n      \"container-1\",\n      \"Button Group\",\n      { x: 0, y: 0, width: 324, height: 40 },\n      children\n    );\n\n    const result = analyzeNodeLayout(containerNode);\n\n    expect(result.layoutPattern).toBe(\"horizontal-stack\");\n  });\n\n  test(\"detects vertical stack layout\", () => {\n    const children: FigmaNode[] = [\n      createMockNode(\"section-1\", \"Section 1\", { x: 0, y: 0, width: 300, height: 100 }),\n      createMockNode(\"section-2\", \"Section 2\", { x: 0, y: 116, width: 300, height: 100 }),\n      createMockNode(\"section-3\", \"Section 3\", { x: 0, y: 232, width: 300, height: 100 }),\n    ];\n\n    const containerNode = createMockNode(\n      \"container-1\",\n      \"Sections\",\n      { x: 0, y: 0, width: 300, height: 332 },\n      children\n    );\n\n    const result = analyzeNodeLayout(containerNode);\n\n    expect(result.layoutPattern).toBe(\"vertical-stack\");\n  });\n\n  test(\"detects grid layout with multiple rows and columns\", () => {\n    // 3x2 grid\n    const children: FigmaNode[] = [\n      createMockNode(\"item-1\", \"Item 1\", { x: 0, y: 0, width: 100, height: 100 }),\n      createMockNode(\"item-2\", \"Item 2\", { x: 116, y: 0, width: 100, height: 100 }),\n      createMockNode(\"item-3\", \"Item 3\", { x: 232, y: 0, width: 100, height: 100 }),\n      createMockNode(\"item-4\", \"Item 4\", { x: 0, y: 116, width: 100, height: 100 }),\n      createMockNode(\"item-5\", \"Item 5\", { x: 116, y: 116, width: 100, height: 100 }),\n      createMockNode(\"item-6\", \"Item 6\", { x: 232, y: 116, width: 100, height: 100 }),\n    ];\n\n    const gridNode = createMockNode(\n      \"grid-1\",\n      \"Grid Container\",\n      { x: 0, y: 0, width: 332, height: 216 },\n      children\n    );\n\n    const result = analyzeNodeLayout(gridNode);\n\n    expect(result.layoutPattern).toBe(\"grid\");\n  });\n\n  test(\"detects centered layout\", () => {\n    const parentBounds: BoundingBox = { x: 0, y: 0, width: 400, height: 400 };\n\n    // Single centered child\n    const children: FigmaNode[] = [\n      createMockNode(\"modal-1\", \"Modal Content\", { x: 100, y: 100, width: 200, height: 200 }),\n    ];\n\n    const containerNode = createMockNode(\n      \"container-1\",\n      \"Container\",\n      parentBounds,\n      children\n    );\n\n    const result = analyzeNodeLayout(containerNode, parentBounds);\n\n    expect(result.layoutPattern).toBe(\"centered\");\n  });\n});\n\n// ============================================================================\n// Frame Layout Analysis Tests\n// ============================================================================\n\ntest.describe(\"Frame Layout Analysis\", () => {\n  test(\"analyzes complete mobile screen layout\", () => {\n    // Create a typical mobile screen with header, content, footer\n    const header = createMockNode(\"header\", \"Header\", {\n      x: 0,\n      y: 0,\n      width: 375,\n      height: 64,\n    });\n\n    const content = createMockNode(\"content\", \"Content\", {\n      x: 0,\n      y: 64,\n      width: 375,\n      height: 698,\n    });\n\n    const footer = createMockNode(\"footer\", \"Tab Bar\", {\n      x: 0,\n      y: 762,\n      width: 375,\n      height: 50,\n    });\n\n    const screenNode = createMockNode(\n      \"screen-1\",\n      \"Home Screen\",\n      { x: 0, y: 0, width: 375, height: 812 },\n      [header, content, footer]\n    );\n\n    const result = analyzeFrameLayout(screenNode);\n\n    expect(result.sections.length).toBeGreaterThanOrEqual(2);\n\n    const sectionRoles = result.sections.map((s) => s.role);\n    expect(sectionRoles).toContain(\"header\");\n    expect(sectionRoles.some((r) => r === \"footer\" || r === \"tab-bar\")).toBe(true);\n  });\n\n  test(\"analyzes desktop layout with sidebar\", () => {\n    const sidebar = createMockNode(\"sidebar\", \"Sidebar\", {\n      x: 0,\n      y: 0,\n      width: 280,\n      height: 800,\n    });\n\n    const header = createMockNode(\"header\", \"Header\", {\n      x: 280,\n      y: 0,\n      width: 920,\n      height: 64,\n    });\n\n    const mainContent = createMockNode(\"main\", \"Main Content\", {\n      x: 280,\n      y: 64,\n      width: 920,\n      height: 736,\n    });\n\n    const desktopFrame = createMockNode(\n      \"desktop-1\",\n      \"Dashboard\",\n      { x: 0, y: 0, width: 1200, height: 800 },\n      [sidebar, header, mainContent]\n    );\n\n    const result = analyzeFrameLayout(desktopFrame);\n\n    const sectionRoles = result.sections.map((s) => s.role);\n    expect(sectionRoles).toContain(\"sidebar\");\n  });\n});\n\n// ============================================================================\n// CSS Generation Tests\n// ============================================================================\n\ntest.describe(\"CSS Generation\", () => {\n  test(\"generates correct CSS for horizontal stack\", () => {\n    const css = getCSSForPattern(\"horizontal-stack\");\n\n    expect(css).toContain(\"display: flex\");\n    expect(css).toContain(\"flex-direction: row\");\n  });\n\n  test(\"generates correct CSS for vertical stack\", () => {\n    const css = getCSSForPattern(\"vertical-stack\");\n\n    expect(css).toContain(\"display: flex\");\n    expect(css).toContain(\"flex-direction: column\");\n  });\n\n  test(\"generates correct CSS for grid with columns\", () => {\n    const css = getCSSForPattern(\"grid\", { columns: 3 });\n\n    expect(css).toContain(\"display: grid\");\n    expect(css).toContain(\"grid-template-columns: repeat(3, 1fr)\");\n  });\n\n  test(\"generates correct CSS for centered layout\", () => {\n    const css = getCSSForPattern(\"centered\");\n\n    expect(css).toContain(\"display: flex\");\n    expect(css).toContain(\"justify-content: center\");\n    expect(css).toContain(\"align-items: center\");\n  });\n});\n\n// ============================================================================\n// Tailwind Generation Tests\n// ============================================================================\n\ntest.describe(\"Tailwind Generation\", () => {\n  test(\"generates correct Tailwind classes for horizontal stack\", () => {\n    const classes = getTailwindForPattern(\"horizontal-stack\");\n\n    expect(classes).toContain(\"flex\");\n    expect(classes).toContain(\"flex-row\");\n  });\n\n  test(\"generates correct Tailwind classes for vertical stack\", () => {\n    const classes = getTailwindForPattern(\"vertical-stack\");\n\n    expect(classes).toContain(\"flex\");\n    expect(classes).toContain(\"flex-col\");\n  });\n\n  test(\"generates correct Tailwind classes for grid\", () => {\n    const classes = getTailwindForPattern(\"grid\", { columns: 4 });\n\n    expect(classes).toContain(\"grid\");\n    expect(classes).toContain(\"grid-cols-4\");\n  });\n\n  test(\"generates gap classes for patterns\", () => {\n    const classes = getTailwindForPattern(\"horizontal-stack\", { gap: 16 });\n\n    expect(classes.some((c) => c.startsWith(\"gap-\"))).toBe(true);\n  });\n});\n\n// ============================================================================\n// Flatten Analysis Tests\n// ============================================================================\n\ntest.describe(\"Flatten Analysis\", () => {\n  test(\"flattens nested analysis into flat list\", () => {\n    const children: FigmaNode[] = [\n      createMockNode(\"child-1\", \"Child 1\", { x: 0, y: 0, width: 100, height: 50 }),\n      createMockNode(\"child-2\", \"Child 2\", { x: 0, y: 60, width: 100, height: 50 }),\n    ];\n\n    const parentNode = createMockNode(\n      \"parent-1\",\n      \"Parent\",\n      { x: 0, y: 0, width: 100, height: 110 },\n      children\n    );\n\n    const analysis = analyzeNodeLayout(parentNode);\n    const flattened = flattenAnalysis(analysis);\n\n    // Should include parent and both children\n    expect(flattened.length).toBe(3);\n    expect(flattened[0].nodeId).toBe(\"parent-1\");\n  });\n});\n\n// ============================================================================\n// Edge Cases and Error Handling\n// ============================================================================\n\ntest.describe(\"Edge Cases\", () => {\n  test(\"handles node with no bounding box\", () => {\n    const node: FigmaNode = {\n      id: \"no-bounds\",\n      name: \"No Bounds Node\",\n      type: \"FRAME\",\n    };\n\n    const result = quickAnalyze(node);\n\n    expect(result.role).toBe(\"unknown\");\n    expect(result.confidence).toBe(0);\n  });\n\n  test(\"handles node with no children\", () => {\n    const leafNode = createMockNode(\"leaf-1\", \"Leaf Node\", {\n      x: 0,\n      y: 0,\n      width: 100,\n      height: 100,\n    });\n\n    const result = analyzeNodeLayout(leafNode);\n\n    expect(result.layoutPattern).toBe(\"unknown\");\n    expect(result.children).toBeUndefined();\n  });\n\n  test(\"handles empty children array\", () => {\n    const emptyNode = createMockNode(\n      \"empty-1\",\n      \"Empty Container\",\n      { x: 0, y: 0, width: 300, height: 300 },\n      []\n    );\n\n    const result = analyzeNodeLayout(emptyNode);\n\n    expect(result.layoutPattern).toBe(\"unknown\");\n  });\n\n  test(\"handles single child\", () => {\n    const children: FigmaNode[] = [\n      createMockNode(\"only-child\", \"Only Child\", { x: 50, y: 50, width: 200, height: 200 }),\n    ];\n\n    const parentNode = createMockNode(\n      \"parent-1\",\n      \"Parent\",\n      { x: 0, y: 0, width: 300, height: 300 },\n      children\n    );\n\n    const result = analyzeNodeLayout(parentNode);\n\n    // Single centered child should be detected as centered\n    expect([\"centered\", \"absolute\", \"unknown\"]).toContain(result.layoutPattern);\n  });\n});\n\n// ============================================================================\n// Complex Real-World Scenarios\n// ============================================================================\n\ntest.describe(\"Real-World Scenarios\", () => {\n  test(\"analyzes e-commerce product grid\", () => {\n    // 3-column product grid\n    const products: FigmaNode[] = [];\n    for (let row = 0; row < 2; row++) {\n      for (let col = 0; col < 3; col++) {\n        products.push(\n          createMockNode(\n            `product-${row * 3 + col}`,\n            `Product Card`,\n            {\n              x: col * 120,\n              y: row * 200,\n              width: 100,\n              height: 180,\n            }\n          )\n        );\n      }\n    }\n\n    const gridNode = createMockNode(\n      \"product-grid\",\n      \"Products Grid\",\n      { x: 0, y: 0, width: 340, height: 380 },\n      products\n    );\n\n    const result = analyzeNodeLayout(gridNode);\n\n    expect(result.layoutPattern).toBe(\"grid\");\n    expect(result.metadata.childCount).toBe(6);\n    expect(result.metadata.hasUniformChildren).toBe(true);\n  });\n\n  test(\"analyzes form layout\", () => {\n    // Vertical form with labels and inputs\n    const formFields: FigmaNode[] = [\n      createMockNode(\"field-1\", \"Email Field\", { x: 0, y: 0, width: 300, height: 70 }),\n      createMockNode(\"field-2\", \"Password Field\", { x: 0, y: 86, width: 300, height: 70 }),\n      createMockNode(\"submit-btn\", \"Submit Button\", { x: 0, y: 172, width: 300, height: 44 }),\n    ];\n\n    const formNode = createMockNode(\n      \"login-form\",\n      \"Login Form\",\n      { x: 0, y: 0, width: 300, height: 216 },\n      formFields\n    );\n\n    const result = analyzeNodeLayout(formNode);\n\n    expect(result.layoutPattern).toBe(\"vertical-stack\");\n    expect(result.semanticRole).toBe(\"form\");\n  });\n\n  test(\"analyzes navigation bar with items\", () => {\n    const navItems: FigmaNode[] = [\n      createMockNode(\"nav-logo\", \"Logo\", { x: 0, y: 8, width: 32, height: 32 }),\n      createMockNode(\"nav-home\", \"Home\", { x: 56, y: 12, width: 50, height: 24 }),\n      createMockNode(\"nav-about\", \"About\", { x: 122, y: 12, width: 50, height: 24 }),\n      createMockNode(\"nav-contact\", \"Contact\", { x: 188, y: 12, width: 60, height: 24 }),\n    ];\n\n    const navNode = createMockNode(\n      \"nav-bar\",\n      \"Navigation\",\n      { x: 0, y: 0, width: 375, height: 48 },\n      navItems\n    );\n\n    const result = analyzeNodeLayout(navNode);\n\n    expect(result.semanticRole).toBe(\"navigation\");\n    expect(result.layoutPattern).toBe(\"horizontal-stack\");\n  });\n\n  test(\"analyzes hero section\", () => {\n    const heroContent: FigmaNode[] = [\n      createMockNode(\"hero-title\", \"Hero Title\", { x: 87, y: 60, width: 200, height: 40 }),\n      createMockNode(\"hero-subtitle\", \"Subtitle\", { x: 62, y: 116, width: 250, height: 24 }),\n      createMockNode(\"hero-cta\", \"CTA Button\", { x: 112, y: 172, width: 150, height: 48 }),\n    ];\n\n    const parentBounds: BoundingBox = { x: 0, y: 0, width: 375, height: 812 };\n\n    const heroNode = createMockNode(\n      \"hero-section\",\n      \"Hero Banner\",\n      { x: 0, y: 0, width: 375, height: 280 },\n      heroContent\n    );\n\n    const result = quickAnalyze(heroNode, parentBounds);\n\n    expect(result.role).toBe(\"hero\");\n  });\n});\n"
}
Now let's run the Playwright tests to verify everything works:

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/layout-analyzer.spec.ts --reporter=list 2>&1",
  "description": "Run Playwright tests for layout analyzer",
  "timeout": 120000
}
Good progress! 32 of 35 tests pass. Let me fix the 3 failing tests by improving the heuristics in the layout analyzer:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "offset": 1,
  "limit": 100
}
Let me look at the key detection logic that needs fixes:

🔧 Tool: Grep
Input: {
  "pattern": "ROLE_KEYWORDS",
  "path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "output_mode": "content",
  "-A": 30
}
I see the issues. The problems are:
1. "Items List" contains "item" which matches `card` role before `list` (order matters in the keyword matching)
2. Grid detection is too aggressive - detecting horizontal stack as grid when items are on the same row
3. Parent naming vs children layout - need to boost grid role when pattern is detected

Let me fix these issues:

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "old_string": "const ROLE_KEYWORDS: Record<SemanticRole, string[]> = {\n  header: [\"header\", \"navbar\", \"topbar\", \"top-bar\", \"app-bar\", \"appbar\"],\n  footer: [\"footer\", \"bottom-bar\", \"bottombar\", \"bottom-nav\"],\n  sidebar: [\"sidebar\", \"side-bar\", \"sidenav\", \"side-nav\", \"drawer\", \"menu-panel\"],\n  navigation: [\"nav\", \"navigation\", \"menu\", \"links\", \"breadcrumb\"],\n  \"main-content\": [\"main\", \"content\", \"body\", \"container\", \"wrapper\"],\n  card: [\"card\", \"tile\", \"panel\", \"box\", \"item\"],\n  \"card-grid\": [\"cards\", \"grid\", \"tiles\", \"gallery\", \"collection\"],\n  list: [\"list\", \"items\", \"rows\", \"entries\"],\n  \"list-item\": [\"list-item\", \"row\", \"entry\", \"item\"],\n  hero: [\"hero\", \"banner\", \"jumbotron\", \"splash\", \"cover\"],\n  form: [\"form\", \"input\", \"field\", \"login\", \"signup\", \"register\"],\n  modal: [\"modal\", \"dialog\", \"popup\", \"overlay\", \"sheet\"],\n  toolbar: [\"toolbar\", \"tool-bar\", \"action-bar\", \"actions\"],\n  \"tab-bar\": [\"tabs\", \"tab-bar\", \"tabbar\", \"segments\"],\n  breadcrumb: [\"breadcrumb\", \"crumbs\", \"path\"],\n  search: [\"search\", \"searchbar\", \"search-box\", \"filter\"],\n  avatar: [\"avatar\", \"profile-pic\", \"user-image\", \"photo\"],\n  \"button-group\": [\"button-group\", \"btn-group\", \"actions\", \"buttons\"],\n  \"content-section\": [\"section\", \"block\", \"area\", \"region\"],\n  unknown: [],\n};",
  "new_string": "/** Keywords for semantic role detection - ORDER MATTERS (more specific first) */\nconst ROLE_KEYWORDS: Record<SemanticRole, string[]> = {\n  header: [\"header\", \"navbar\", \"topbar\", \"top-bar\", \"app-bar\", \"appbar\"],\n  footer: [\"footer\", \"bottom-bar\", \"bottombar\", \"bottom-nav\"],\n  sidebar: [\"sidebar\", \"side-bar\", \"sidenav\", \"side-nav\", \"drawer\", \"menu-panel\"],\n  navigation: [\"nav\", \"navigation\", \"menu\", \"links\"],\n  \"main-content\": [\"main\", \"content\", \"body\", \"container\", \"wrapper\"],\n  \"card-grid\": [\"cards\", \"card-grid\", \"tiles\", \"gallery\", \"collection\", \"products grid\"],\n  list: [\"list\", \"items\", \"rows\", \"entries\"],  // \"list\" checked before \"card\" (item)\n  \"list-item\": [\"list-item\", \"row\", \"entry\"],\n  card: [\"card\", \"tile\", \"panel\", \"box\"],  // \"item\" removed - too generic\n  hero: [\"hero\", \"banner\", \"jumbotron\", \"splash\", \"cover\"],\n  form: [\"form\", \"input\", \"field\", \"login\", \"signup\", \"register\"],\n  modal: [\"modal\", \"dialog\", \"popup\", \"overlay\", \"sheet\"],\n  toolbar: [\"toolbar\", \"tool-bar\", \"action-bar\", \"actions\"],\n  \"tab-bar\": [\"tabs\", \"tab-bar\", \"tabbar\", \"segments\"],\n  breadcrumb: [\"breadcrumb\", \"crumbs\", \"path\"],\n  search: [\"search\", \"searchbar\", \"search-box\", \"filter\"],\n  avatar: [\"avatar\", \"profile-pic\", \"user-image\", \"photo\"],\n  \"button-group\": [\"button-group\", \"btn-group\", \"buttons\"],\n  \"content-section\": [\"section\", \"block\", \"area\", \"region\"],\n  unknown: [],\n};"
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "old_string": "/** Keywords for semantic role detection from node names */\n/** Keywords for semantic role detection - ORDER MATTERS (more specific first) */",
  "new_string": "/** Keywords for semantic role detection - ORDER MATTERS (more specific first) */"
}
Now let me fix the grid vs horizontal-stack detection issue. The problem is that navigation bar items are being detected as grid because they have items on the same row. Let me look at that function:

🔧 Tool: Grep
Input: {
  "pattern": "detectGridArrangement",
  "path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "output_mode": "content",
  "-A": 25
}
I see the issue. The grid detection happens BEFORE checking horizontal/vertical stack. The problem is that navigation bar with 4 items has 4 unique X positions (which >= 2 columns) but should only be detected as a grid if there are actually multiple rows. Let me fix the detection order and logic:

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "old_string": "/**\n * Detect if children are arranged in a grid pattern\n */\nfunction detectGridArrangement(children: NodeLayoutAnalysis[]): boolean {\n  if (children.length < THRESHOLDS.GRID_MIN_CHILDREN) return false;\n\n  // Get unique X positions (column starts)\n  const xPositions = [...new Set(children.map((c) => Math.round(c.bounds.x)))];\n  // Get unique Y positions (row starts)\n  const yPositions = [...new Set(children.map((c) => Math.round(c.bounds.y)))];\n\n  // A grid has multiple columns AND multiple rows\n  const hasMultipleColumns = xPositions.length >= 2;\n  const hasMultipleRows = yPositions.length >= 2;\n\n  if (!hasMultipleColumns || !hasMultipleRows) return false;\n\n  // Check if items fill the grid somewhat evenly\n  const expectedItems = xPositions.length * yPositions.length;\n  const actualItems = children.length;\n\n  // Allow for incomplete rows (at least 50% of expected)\n  return actualItems >= expectedItems * 0.5;\n}",
  "new_string": "/**\n * Detect if children are arranged in a grid pattern (not just horizontal or vertical)\n */\nfunction detectGridArrangement(children: NodeLayoutAnalysis[]): boolean {\n  if (children.length < THRESHOLDS.GRID_MIN_CHILDREN) return false;\n\n  // Use a tolerance for Y position grouping (items within 10px are on same row)\n  const yTolerance = 10;\n\n  // Group children by Y position (rows)\n  const rows: NodeLayoutAnalysis[][] = [];\n  const sortedByY = [...children].sort((a, b) => a.bounds.y - b.bounds.y);\n\n  let currentRow: NodeLayoutAnalysis[] = [sortedByY[0]];\n  let currentRowY = sortedByY[0].bounds.y;\n\n  for (let i = 1; i < sortedByY.length; i++) {\n    const child = sortedByY[i];\n    if (Math.abs(child.bounds.y - currentRowY) <= yTolerance) {\n      currentRow.push(child);\n    } else {\n      rows.push(currentRow);\n      currentRow = [child];\n      currentRowY = child.bounds.y;\n    }\n  }\n  rows.push(currentRow);\n\n  // A grid must have at least 2 actual rows\n  if (rows.length < 2) return false;\n\n  // A grid should have at least 2 items per row (on average)\n  const avgItemsPerRow = children.length / rows.length;\n  if (avgItemsPerRow < 2) return false;\n\n  // Check that rows have similar item counts (grid is roughly rectangular)\n  const itemCounts = rows.map(r => r.length);\n  const maxCount = Math.max(...itemCounts);\n  const minCount = Math.min(...itemCounts);\n\n  // Allow for incomplete last row but not wildly different counts\n  return minCount >= maxCount * 0.5;\n}"
}
Now let me also update the children scoring to better handle grid detection and also boost card-grid role when grid pattern is detected:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "offset": 565,
  "limit": 60
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "old_string": "  // Card grid detection\n  if (\n    children.length >= THRESHOLDS.GRID_MIN_CHILDREN &&\n    hasUniformChildren &&\n    (hasUniformHGaps || hasUniformVGaps)\n  ) {\n    scores.push({ role: \"card-grid\", score: 2 });\n  }",
  "new_string": "  // Card grid detection - must actually be a grid pattern (multiple rows)\n  if (\n    children.length >= THRESHOLDS.GRID_MIN_CHILDREN &&\n    hasUniformChildren &&\n    detectGridArrangement(children)\n  ) {\n    scores.push({ role: \"card-grid\", score: 2.5 });  // Higher score for actual grids\n  }"
}
Now let's run the tests again to see if the fixes work:

🔧 Tool: Bash
Input: {
  "command": "npx playwright test tests/layout-analyzer.spec.ts --reporter=list 2>&1",
  "description": "Run Playwright tests again",
  "timeout": 120000
}
All 35 tests pass now. Let me update the todo and clean up:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Design and implement layout-analyzer.ts utility module",
      "status": "completed",
      "activeForm": "Designing layout analyzer module"
    },
    {
      "content": "Implement spatial positioning analysis (alignment, gaps, clustering)",
      "status": "completed",
      "activeForm": "Implementing spatial analysis"
    },
    {
      "content": "Implement semantic pattern detection (header/footer/sidebar/navigation)",
      "status": "completed",
      "activeForm": "Implementing pattern detection"
    },
    {
      "content": "Implement card grid and list layout detection",
      "status": "completed",
      "activeForm": "Detecting grid and list layouts"
    },
    {
      "content": "Add layout intent inference with heuristics",
      "status": "completed",
      "activeForm": "Adding layout heuristics"
    },
    {
      "content": "Create integration with existing Figma utilities",
      "status": "completed",
      "activeForm": "Creating integration utilities"
    },
    {
      "content": "Write comprehensive tests with Playwright",
      "status": "completed",
      "activeForm": "Writing Playwright tests"
    },
    {
      "content": "Verify feature works correctly",
      "status": "completed",
      "activeForm": "Verifying feature"
    }
  ]
}
Now let me clean up the test files as required (delete the temporary test file):

🔧 Tool: Bash
Input: {
  "command": "rm /home/rainman/figma-to-code/figma-to-code/tests/layout-analyzer.spec.ts && rm /home/rainman/figma-to-code/figma-to-code/playwright.config.ts && rmdir /home/rainman/figma-to-code/figma-to-code/tests 2>/dev/null || true",
  "description": "Delete temporary Playwright test files"
}
Let me verify the build still works:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit --skipLibCheck 2>&1 | head -50",
  "description": "Check TypeScript compilation",
  "timeout": 60000
}
These errors are pre-existing in the codebase and not related to my changes. Let me verify my new files compile correctly:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit --skipLibCheck /home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts /home/rainman/figma-to-code/figma-to-code/src/utils/figma-layout-intent.ts 2>&1",
  "description": "Check new files compile",
  "timeout": 30000
}
The iteration issues are because we're running tsc outside the project config. Let me check the project's tsconfig:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tsconfig.json"
}
The tsconfig is configured properly (ES2022 target). Let me run the actual project build check:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit 2>&1 | grep -E \"(layout-analyzer|figma-layout-intent)\" | head -20",
  "description": "Check if new files have errors in project build",
  "timeout": 60000
}
No errors for my new files. Let me also create a simple index export to make the utilities easily accessible:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/layout-analyzer.ts",
  "offset": 1,
  "limit": 10
}
The implementation is complete. Let me provide the summary:

<summary>
## Summary: Analyze Visual Positioning to Infer Semantic Layout Intent

### Changes Implemented

1. **Created `layout-analyzer.ts`** - Core layout analysis utility module with:
   - Semantic role detection (header, footer, sidebar, navigation, card, card-grid, list, hero, form, modal, toolbar, tab-bar, breadcrumb, search, avatar, button-group, content-section)
   - Layout pattern detection (horizontal-stack, vertical-stack, grid, centered, split, wrap, absolute)
   - Spatial analysis functions (alignment detection, gap calculation, clustering)
   - Position-based heuristics for detecting UI patterns
   - Name-based keyword matching for semantic roles
   - Children-based pattern inference
   - CSS and Tailwind code generation for detected patterns

2. **Created `figma-layout-intent.ts`** - Integration layer providing:
   - High-level `analyzeFrameIntent()` function for complete frame analysis
   - `analyzePageFrames()` for batch analysis of page contents
   - `getLayoutSummary()` for human-readable analysis summaries
   - Semantic structure tree building for code generation
   - JSX, CSS, and Tailwind code suggestions
   - Filtering functions (`findFramesByPattern`, `findFramesByRole`)
   - Re-exports of core analysis types and functions

### Key Features

- **Header/Footer Detection**: Uses position heuristics (top/bottom, full-width)
- **Sidebar Detection**: Identifies side panels by position and aspect ratio
- **Navigation Detection**: Detects horizontal nav bars with uniform gaps
- **Card Grid Detection**: Identifies multi-row grids with uniform children
- **List Detection**: Detects vertical stacks with uniform items
- **Pattern-to-CSS Mapping**: Generates flex/grid CSS from detected patterns
- **Confidence Scoring**: Each detection includes a 0-1 confidence score
- **ML-Ready Architecture**: Scoring system designed for future ML enhancement

### Files Created
- `src/utils/layout-analyzer.ts` (1100+ lines)
- `src/utils/figma-layout-intent.ts` (500+ lines)

### Notes for Developer

- The analysis works with standard Figma node structures (FigmaNode type from figma-api.ts)
- Heuristics are tunable via the THRESHOLDS constant at the top of layout-analyzer.ts
- The system uses keyword matching for name-based detection - keywords can be extended
- Grid detection requires at least 4 items arranged in 2+ rows to differentiate from horizontal stacks
- Detection confidence scores are aggregated from multiple signals (name, position, children patterns)
- The `flattenAnalysis()` function is useful for getting a quick overview of all detected roles in a tree

### Verification Status
- Created and ran 35 Playwright tests covering all major detection scenarios
- All tests passed including: header/footer/sidebar detection, navigation detection, card grid vs horizontal stack differentiation, list detection, edge cases, and complex real-world scenarios
- Test file was deleted after successful verification as per requirements
</summary>