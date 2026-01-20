
🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming"
}
I'll help implement the side-by-side view feature. Let me start by exploring the codebase to understand the existing structure and patterns.

🔧 Tool: Task
Input: {
  "prompt": "Explore the codebase to understand:\n1. The existing route structure and how pages are organized in src/routes/\n2. Any existing components related to Figma, code generation, or preview functionality\n3. The UI component patterns used (especially layout components, panels, split views)\n4. Any existing utilities for code generation or Figma integration\n\nFocus on finding:\n- How routes are structured\n- Existing panel/layout components\n- Any Figma-related code\n- Code generation utilities\n- Existing scrolling/synchronization utilities\n\nBe thorough - this is for implementing a side-by-side view with synchronized scrolling.",
  "description": "Explore codebase structure",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.ts\" -o -name \"*.tsx\" | head -20",
  "description": "List TypeScript files in codebase"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/routes/**/*.{ts,tsx}",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/**/*.{ts,tsx}",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/utils/**/*.{ts,tsx}",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Grep
Input: {
  "pattern": "figma|code.*generation|preview|split|panel|sync",
  "type": "tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code/src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/__root.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/figma.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/frames.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FrameExplorer.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FigmaTeamsProjects.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/panel.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/code-generation-agent/agent.ts",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/tailwind-generator.ts",
  "limit": 100
}

🔧 Tool: Grep
Input: {
  "pattern": "split|panel|sync|scroll|resizable",
  "type": "tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code/src/components",
  "output_mode": "files_with_matches"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/**/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/components -name \"*split*\" -o -name \"*panel*\" -o -name \"*preview*\" -o -name \"*view*\" 2>/dev/null",
  "description": "Find layout/split-view related components"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/index.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/CodeGenerationSettings.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/routes/ | head -20",
  "description": "List files in routes directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/hooks/ | grep -i figma",
  "description": "List Figma-related hooks"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/hooks/**/*.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FrameExplorer.tsx",
  "offset": 1,
  "limit": 50
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/css-modules-demo.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/figma/CSSFrameworkSelector.tsx",
  "limit": 150
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type d | head -30",
  "description": "List main source directories"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/figma/export-dialog.tsx"
}

🔧 Tool: Grep
Input: {
  "pattern": "resizable|draggable|resize|drag",
  "type": "json",
  "path": "/home/rainman/figma-to-code/figma-to-code",
  "output_mode": "files_with_matches"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/lib/",
  "description": "List files in lib directory"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/figma/",
  "description": "List files in figma components directory"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f -name \"*.css\" -o -name \"*.module.css\" | head -20",
  "description": "Find CSS and CSS module files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/styles/app.css"
}

🔧 Tool: Bash
Input: {
  "command": "head -100 /home/rainman/figma-to-code/figma-to-code/tsconfig.json",
  "description": "Show TypeScript configuration"
}

🔧 Tool: Bash
Input: {
  "command": "head -50 /home/rainman/figma-to-code/figma-to-code/vite.config.ts",
  "description": "Show Vite configuration"
}
Now let me look at the specific existing components and patterns to understand how to implement this feature properly.

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/panel.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FrameExplorer.tsx"
}
Let me also look at the code generation utilities and any existing styling patterns to understand how generated code is displayed.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create SplitView component with resizable panels",
      "status": "in_progress",
      "activeForm": "Creating SplitView component with resizable panels"
    },
    {
      "content": "Build FigmaDesignPanel for displaying Figma designs",
      "status": "pending",
      "activeForm": "Building FigmaDesignPanel for displaying Figma designs"
    },
    {
      "content": "Build CodePreviewPanel with syntax highlighting",
      "status": "pending",
      "activeForm": "Building CodePreviewPanel with syntax highlighting"
    },
    {
      "content": "Implement synchronized scrolling between panels",
      "status": "pending",
      "activeForm": "Implementing synchronized scrolling between panels"
    },
    {
      "content": "Add element highlighting and click-to-navigate",
      "status": "pending",
      "activeForm": "Adding element highlighting and click-to-navigate"
    },
    {
      "content": "Support multiple panel arrangements (side-by-side, top-bottom, etc.)",
      "status": "pending",
      "activeForm": "Supporting multiple panel arrangements"
    },
    {
      "content": "Create dashboard route for code preview",
      "status": "pending",
      "activeForm": "Creating dashboard route for code preview"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}

🔧 Tool: Glob
Input: {
  "pattern": "src/utils/code-generation-agent/**/*.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/app.css"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.css"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/code-generation-agent/types.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/styles/app.css"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/ui/*.tsx"
}
Now I have a good understanding of the codebase. Let me start implementing the feature. I'll create the components needed for the side-by-side view.

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/types.ts",
  "content": "/**\n * Types for the Side-by-Side Code Preview Feature\n */\n\nimport type { GeneratedFile } from \"~/utils/code-generation-agent/types\";\n\n/**\n * Panel arrangement options\n */\nexport type PanelArrangement = \"side-by-side\" | \"top-bottom\" | \"design-only\" | \"code-only\";\n\n/**\n * Element mapping between design and code\n */\nexport interface ElementMapping {\n  /** Unique ID for the element */\n  id: string;\n  /** Element name from Figma */\n  name: string;\n  /** Figma node ID */\n  figmaNodeId: string;\n  /** Bounding box in the design panel (relative coordinates 0-1) */\n  designBounds: {\n    x: number;\n    y: number;\n    width: number;\n    height: number;\n  };\n  /** Code location */\n  codeLocation: {\n    file: string;\n    startLine: number;\n    endLine: number;\n  };\n  /** Child element IDs */\n  children: string[];\n  /** Parent element ID */\n  parentId?: string;\n}\n\n/**\n * Highlighted element state\n */\nexport interface HighlightState {\n  /** Currently hovered element ID */\n  hoveredElementId: string | null;\n  /** Currently selected element ID */\n  selectedElementId: string | null;\n  /** Source of the highlight (design panel or code panel) */\n  source: \"design\" | \"code\" | null;\n}\n\n/**\n * Scroll synchronization state\n */\nexport interface ScrollSyncState {\n  /** Whether sync is enabled */\n  enabled: boolean;\n  /** Currently syncing (to prevent loops) */\n  isSyncing: boolean;\n  /** Last scroll source */\n  lastScrollSource: \"design\" | \"code\" | null;\n}\n\n/**\n * Design panel props\n */\nexport interface DesignPanelProps {\n  /** Figma file key */\n  fileKey: string;\n  /** Figma node ID to display */\n  nodeId: string;\n  /** Account ID for Figma API */\n  accountId?: string;\n  /** Element mappings for highlighting */\n  elementMappings: ElementMapping[];\n  /** Current highlight state */\n  highlightState: HighlightState;\n  /** Callback when element is hovered */\n  onElementHover: (elementId: string | null) => void;\n  /** Callback when element is clicked */\n  onElementClick: (elementId: string | null) => void;\n  /** Callback when panel scrolls */\n  onScroll: (scrollTop: number, scrollHeight: number) => void;\n  /** External scroll position to sync to */\n  syncScrollPosition?: number;\n}\n\n/**\n * Code panel props\n */\nexport interface CodePanelProps {\n  /** Generated files to display */\n  files: GeneratedFile[];\n  /** Currently selected file index */\n  selectedFileIndex: number;\n  /** Callback when file tab is clicked */\n  onFileSelect: (index: number) => void;\n  /** Element mappings for highlighting */\n  elementMappings: ElementMapping[];\n  /** Current highlight state */\n  highlightState: HighlightState;\n  /** Callback when element is hovered (by line) */\n  onElementHover: (elementId: string | null) => void;\n  /** Callback when element is clicked (by line) */\n  onElementClick: (elementId: string | null) => void;\n  /** Callback when panel scrolls */\n  onScroll: (scrollTop: number, scrollHeight: number) => void;\n  /** External scroll position to sync to */\n  syncScrollPosition?: number;\n  /** Line to scroll to for navigation */\n  scrollToLine?: number;\n}\n\n/**\n * Split view props\n */\nexport interface SplitViewProps {\n  /** Figma file key */\n  fileKey: string;\n  /** Figma node ID */\n  nodeId: string;\n  /** Account ID for Figma API */\n  accountId?: string;\n  /** Generated code files */\n  generatedFiles: GeneratedFile[];\n  /** Element mappings between design and code */\n  elementMappings: ElementMapping[];\n  /** Initial panel arrangement */\n  initialArrangement?: PanelArrangement;\n  /** Initial split ratio (0-1, represents left/top panel size) */\n  initialSplitRatio?: number;\n  /** Minimum panel size in pixels */\n  minPanelSize?: number;\n  /** Whether to enable synchronized scrolling by default */\n  enableScrollSync?: boolean;\n  /** Callback when arrangement changes */\n  onArrangementChange?: (arrangement: PanelArrangement) => void;\n}\n\n/**\n * Resize handle props\n */\nexport interface ResizeHandleProps {\n  /** Orientation of the handle */\n  orientation: \"horizontal\" | \"vertical\";\n  /** Callback when resize starts */\n  onResizeStart: () => void;\n  /** Callback during resize with delta */\n  onResize: (delta: number) => void;\n  /** Callback when resize ends */\n  onResizeEnd: () => void;\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/ResizeHandle.tsx",
  "content": "import { useCallback, useEffect, useRef, useState } from \"react\";\nimport { cn } from \"~/lib/utils\";\nimport type { ResizeHandleProps } from \"./types\";\n\n/**\n * Draggable resize handle for split panels\n */\nexport function ResizeHandle({\n  orientation,\n  onResizeStart,\n  onResize,\n  onResizeEnd,\n}: ResizeHandleProps) {\n  const [isDragging, setIsDragging] = useState(false);\n  const startPosRef = useRef(0);\n\n  const handleMouseDown = useCallback(\n    (e: React.MouseEvent) => {\n      e.preventDefault();\n      setIsDragging(true);\n      startPosRef.current = orientation === \"vertical\" ? e.clientX : e.clientY;\n      onResizeStart();\n    },\n    [orientation, onResizeStart]\n  );\n\n  useEffect(() => {\n    if (!isDragging) return;\n\n    const handleMouseMove = (e: MouseEvent) => {\n      const currentPos = orientation === \"vertical\" ? e.clientX : e.clientY;\n      const delta = currentPos - startPosRef.current;\n      startPosRef.current = currentPos;\n      onResize(delta);\n    };\n\n    const handleMouseUp = () => {\n      setIsDragging(false);\n      onResizeEnd();\n    };\n\n    document.addEventListener(\"mousemove\", handleMouseMove);\n    document.addEventListener(\"mouseup\", handleMouseUp);\n\n    return () => {\n      document.removeEventListener(\"mousemove\", handleMouseMove);\n      document.removeEventListener(\"mouseup\", handleMouseUp);\n    };\n  }, [isDragging, orientation, onResize, onResizeEnd]);\n\n  return (\n    <div\n      className={cn(\n        \"group relative flex items-center justify-center transition-colors\",\n        orientation === \"vertical\"\n          ? \"w-2 cursor-col-resize hover:bg-primary/20\"\n          : \"h-2 cursor-row-resize hover:bg-primary/20\",\n        isDragging && \"bg-primary/30\"\n      )}\n      onMouseDown={handleMouseDown}\n    >\n      {/* Visual indicator */}\n      <div\n        className={cn(\n          \"rounded-full bg-muted-foreground/30 transition-all group-hover:bg-primary/50\",\n          orientation === \"vertical\" ? \"h-8 w-1\" : \"w-8 h-1\",\n          isDragging && \"bg-primary\"\n        )}\n      />\n      {/* Invisible larger hit area */}\n      <div\n        className={cn(\n          \"absolute\",\n          orientation === \"vertical\"\n            ? \"inset-y-0 -left-1 -right-1\"\n            : \"inset-x-0 -top-1 -bottom-1\"\n        )}\n      />\n    </div>\n  );\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/DesignPanel.tsx",
  "content": "import { useCallback, useEffect, useRef, useState } from \"react\";\nimport { cn } from \"~/lib/utils\";\nimport { Loader2, ZoomIn, ZoomOut, RotateCcw, Move } from \"lucide-react\";\nimport { Button } from \"~/components/ui/button\";\nimport type { DesignPanelProps, ElementMapping } from \"./types\";\n\n/**\n * Panel for displaying Figma design with element highlighting\n */\nexport function DesignPanel({\n  fileKey,\n  nodeId,\n  accountId,\n  elementMappings,\n  highlightState,\n  onElementHover,\n  onElementClick,\n  onScroll,\n  syncScrollPosition,\n}: DesignPanelProps) {\n  const containerRef = useRef<HTMLDivElement>(null);\n  const [imageUrl, setImageUrl] = useState<string | null>(null);\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState<string | null>(null);\n  const [zoom, setZoom] = useState(1);\n  const [pan, setPan] = useState({ x: 0, y: 0 });\n  const [isPanning, setIsPanning] = useState(false);\n  const lastPanPos = useRef({ x: 0, y: 0 });\n  const isSyncingRef = useRef(false);\n\n  // Fetch Figma node image\n  useEffect(() => {\n    async function fetchImage() {\n      setIsLoading(true);\n      setError(null);\n      try {\n        // Construct the Figma API URL for node image\n        const response = await fetch(\n          `/api/figma/image?fileKey=${fileKey}&nodeId=${nodeId}${accountId ? `&accountId=${accountId}` : \"\"}`\n        );\n        if (!response.ok) {\n          throw new Error(\"Failed to fetch design image\");\n        }\n        const data = await response.json();\n        setImageUrl(data.imageUrl);\n      } catch (err) {\n        setError(err instanceof Error ? err.message : \"Failed to load design\");\n        // Use placeholder for demo\n        setImageUrl(null);\n      } finally {\n        setIsLoading(false);\n      }\n    }\n\n    if (fileKey && nodeId) {\n      fetchImage();\n    }\n  }, [fileKey, nodeId, accountId]);\n\n  // Handle scroll sync from code panel\n  useEffect(() => {\n    if (syncScrollPosition !== undefined && containerRef.current && !isSyncingRef.current) {\n      isSyncingRef.current = true;\n      const container = containerRef.current;\n      const maxScroll = container.scrollHeight - container.clientHeight;\n      container.scrollTop = syncScrollPosition * maxScroll;\n      requestAnimationFrame(() => {\n        isSyncingRef.current = false;\n      });\n    }\n  }, [syncScrollPosition]);\n\n  // Handle local scroll\n  const handleScroll = useCallback(() => {\n    if (containerRef.current && !isSyncingRef.current) {\n      const container = containerRef.current;\n      const scrollRatio = container.scrollTop / (container.scrollHeight - container.clientHeight);\n      onScroll(container.scrollTop, container.scrollHeight);\n    }\n  }, [onScroll]);\n\n  // Zoom controls\n  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.25, 4));\n  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.25));\n  const handleResetView = () => {\n    setZoom(1);\n    setPan({ x: 0, y: 0 });\n  };\n\n  // Pan handling\n  const handleMouseDown = (e: React.MouseEvent) => {\n    if (e.button === 1 || (e.button === 0 && e.altKey)) {\n      setIsPanning(true);\n      lastPanPos.current = { x: e.clientX, y: e.clientY };\n    }\n  };\n\n  const handleMouseMove = (e: React.MouseEvent) => {\n    if (isPanning) {\n      const dx = e.clientX - lastPanPos.current.x;\n      const dy = e.clientY - lastPanPos.current.y;\n      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));\n      lastPanPos.current = { x: e.clientX, y: e.clientY };\n    }\n  };\n\n  const handleMouseUp = () => {\n    setIsPanning(false);\n  };\n\n  // Find element at position\n  const findElementAtPosition = (\n    clientX: number,\n    clientY: number\n  ): ElementMapping | null => {\n    if (!containerRef.current) return null;\n    const rect = containerRef.current.getBoundingClientRect();\n    const x = (clientX - rect.left - pan.x) / (rect.width * zoom);\n    const y = (clientY - rect.top - pan.y) / (rect.height * zoom);\n\n    // Find deepest matching element\n    let match: ElementMapping | null = null;\n    for (const mapping of elementMappings) {\n      const { designBounds } = mapping;\n      if (\n        x >= designBounds.x &&\n        x <= designBounds.x + designBounds.width &&\n        y >= designBounds.y &&\n        y <= designBounds.y + designBounds.height\n      ) {\n        // Prefer smaller (more specific) elements\n        if (!match || designBounds.width * designBounds.height <\n            match.designBounds.width * match.designBounds.height) {\n          match = mapping;\n        }\n      }\n    }\n    return match;\n  };\n\n  const handleElementHover = (e: React.MouseEvent) => {\n    if (isPanning) return;\n    const element = findElementAtPosition(e.clientX, e.clientY);\n    onElementHover(element?.id ?? null);\n  };\n\n  const handleElementClick = (e: React.MouseEvent) => {\n    if (isPanning) return;\n    const element = findElementAtPosition(e.clientX, e.clientY);\n    onElementClick(element?.id ?? null);\n  };\n\n  // Render element overlay boxes\n  const renderElementOverlays = () => {\n    return elementMappings.map((mapping) => {\n      const isHovered = highlightState.hoveredElementId === mapping.id;\n      const isSelected = highlightState.selectedElementId === mapping.id;\n      const isHighlighted = isHovered || isSelected;\n\n      if (!isHighlighted) return null;\n\n      const { designBounds } = mapping;\n      return (\n        <div\n          key={mapping.id}\n          className={cn(\n            \"absolute border-2 pointer-events-none transition-all duration-150\",\n            isSelected\n              ? \"border-primary bg-primary/10\"\n              : \"border-primary/60 bg-primary/5\"\n          )}\n          style={{\n            left: `${designBounds.x * 100}%`,\n            top: `${designBounds.y * 100}%`,\n            width: `${designBounds.width * 100}%`,\n            height: `${designBounds.height * 100}%`,\n          }}\n        >\n          {/* Element name tooltip */}\n          <div\n            className={cn(\n              \"absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium rounded whitespace-nowrap\",\n              isSelected ? \"bg-primary text-primary-foreground\" : \"bg-primary/80 text-primary-foreground\"\n            )}\n          >\n            {mapping.name}\n          </div>\n        </div>\n      );\n    });\n  };\n\n  return (\n    <div className=\"flex flex-col h-full bg-muted/30\">\n      {/* Toolbar */}\n      <div className=\"flex items-center justify-between px-3 py-2 border-b border-border bg-background/50 backdrop-blur-sm\">\n        <div className=\"flex items-center gap-1\">\n          <span className=\"text-sm font-medium text-muted-foreground\">Design</span>\n        </div>\n        <div className=\"flex items-center gap-1\">\n          <Button\n            variant=\"ghost\"\n            size=\"icon\"\n            className=\"h-7 w-7\"\n            onClick={handleZoomOut}\n            title=\"Zoom out\"\n          >\n            <ZoomOut className=\"h-4 w-4\" />\n          </Button>\n          <span className=\"text-xs text-muted-foreground w-12 text-center\">\n            {Math.round(zoom * 100)}%\n          </span>\n          <Button\n            variant=\"ghost\"\n            size=\"icon\"\n            className=\"h-7 w-7\"\n            onClick={handleZoomIn}\n            title=\"Zoom in\"\n          >\n            <ZoomIn className=\"h-4 w-4\" />\n          </Button>\n          <Button\n            variant=\"ghost\"\n            size=\"icon\"\n            className=\"h-7 w-7\"\n            onClick={handleResetView}\n            title=\"Reset view\"\n          >\n            <RotateCcw className=\"h-4 w-4\" />\n          </Button>\n        </div>\n      </div>\n\n      {/* Design canvas */}\n      <div\n        ref={containerRef}\n        className={cn(\n          \"flex-1 overflow-auto relative\",\n          isPanning ? \"cursor-grabbing\" : \"cursor-crosshair\"\n        )}\n        onScroll={handleScroll}\n        onMouseDown={handleMouseDown}\n        onMouseMove={handleMouseMove}\n        onMouseUp={handleMouseUp}\n        onMouseLeave={handleMouseUp}\n      >\n        {isLoading ? (\n          <div className=\"absolute inset-0 flex items-center justify-center\">\n            <Loader2 className=\"h-8 w-8 animate-spin text-muted-foreground\" />\n          </div>\n        ) : error || !imageUrl ? (\n          <div className=\"absolute inset-0 flex flex-col items-center justify-center p-8\">\n            {/* Placeholder design preview */}\n            <div\n              className=\"relative w-full max-w-md aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-border overflow-hidden\"\n              style={{\n                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,\n              }}\n              onMouseMove={handleElementHover}\n              onClick={handleElementClick}\n            >\n              {/* Mock design elements */}\n              <div className=\"absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center\">\n                <div className=\"text-center\">\n                  <Move className=\"h-8 w-8 mx-auto mb-2 text-muted-foreground/50\" />\n                  <p className=\"text-sm text-muted-foreground\">\n                    Design preview\n                  </p>\n                  <p className=\"text-xs text-muted-foreground/70 mt-1\">\n                    Alt+drag to pan, scroll to zoom\n                  </p>\n                </div>\n              </div>\n              {renderElementOverlays()}\n            </div>\n          </div>\n        ) : (\n          <div\n            className=\"relative min-h-full\"\n            style={{\n              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,\n              transformOrigin: \"0 0\",\n            }}\n            onMouseMove={handleElementHover}\n            onClick={handleElementClick}\n          >\n            <img\n              src={imageUrl}\n              alt=\"Figma design\"\n              className=\"max-w-none\"\n              draggable={false}\n            />\n            {renderElementOverlays()}\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create SplitView component with resizable panels",
      "status": "completed",
      "activeForm": "Creating SplitView component with resizable panels"
    },
    {
      "content": "Build FigmaDesignPanel for displaying Figma designs",
      "status": "completed",
      "activeForm": "Building FigmaDesignPanel for displaying Figma designs"
    },
    {
      "content": "Build CodePreviewPanel with syntax highlighting",
      "status": "in_progress",
      "activeForm": "Building CodePreviewPanel with syntax highlighting"
    },
    {
      "content": "Implement synchronized scrolling between panels",
      "status": "pending",
      "activeForm": "Implementing synchronized scrolling between panels"
    },
    {
      "content": "Add element highlighting and click-to-navigate",
      "status": "pending",
      "activeForm": "Adding element highlighting and click-to-navigate"
    },
    {
      "content": "Support multiple panel arrangements (side-by-side, top-bottom, etc.)",
      "status": "pending",
      "activeForm": "Supporting multiple panel arrangements"
    },
    {
      "content": "Create dashboard route for code preview",
      "status": "pending",
      "activeForm": "Creating dashboard route for code preview"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/CodePanel.tsx",
  "content": "import { useCallback, useEffect, useMemo, useRef, useState } from \"react\";\nimport { cn } from \"~/lib/utils\";\nimport { Copy, Check, FileCode, FileText, FileType } from \"lucide-react\";\nimport { Button } from \"~/components/ui/button\";\nimport type { CodePanelProps, ElementMapping } from \"./types\";\nimport type { GeneratedFile } from \"~/utils/code-generation-agent/types\";\n\n/**\n * Get file icon based on language\n */\nfunction getFileIcon(language: string) {\n  switch (language) {\n    case \"typescript\":\n    case \"javascript\":\n      return <FileCode className=\"h-4 w-4\" />;\n    case \"css\":\n    case \"scss\":\n      return <FileType className=\"h-4 w-4\" />;\n    default:\n      return <FileText className=\"h-4 w-4\" />;\n  }\n}\n\n/**\n * Simple syntax highlighting for common languages\n */\nfunction highlightCode(code: string, language: string): string {\n  // Keywords for different languages\n  const keywords: Record<string, string[]> = {\n    typescript: [\n      \"import\", \"export\", \"from\", \"const\", \"let\", \"var\", \"function\", \"return\",\n      \"if\", \"else\", \"for\", \"while\", \"class\", \"interface\", \"type\", \"extends\",\n      \"implements\", \"new\", \"this\", \"async\", \"await\", \"try\", \"catch\", \"throw\",\n      \"default\", \"as\", \"typeof\", \"instanceof\", \"in\", \"of\", \"true\", \"false\", \"null\", \"undefined\"\n    ],\n    javascript: [\n      \"import\", \"export\", \"from\", \"const\", \"let\", \"var\", \"function\", \"return\",\n      \"if\", \"else\", \"for\", \"while\", \"class\", \"extends\", \"new\", \"this\", \"async\",\n      \"await\", \"try\", \"catch\", \"throw\", \"default\", \"typeof\", \"instanceof\", \"in\", \"of\",\n      \"true\", \"false\", \"null\", \"undefined\"\n    ],\n    css: [\n      \"display\", \"flex\", \"grid\", \"position\", \"width\", \"height\", \"margin\", \"padding\",\n      \"border\", \"background\", \"color\", \"font\", \"text\", \"align\", \"justify\", \"items\",\n      \"content\", \"gap\", \"overflow\", \"z-index\", \"opacity\", \"transform\", \"transition\"\n    ],\n    html: [\"div\", \"span\", \"p\", \"h1\", \"h2\", \"h3\", \"h4\", \"h5\", \"h6\", \"a\", \"img\", \"button\", \"input\", \"form\", \"label\", \"ul\", \"li\", \"nav\", \"header\", \"footer\", \"main\", \"section\", \"article\"]\n  };\n\n  const langKeywords = keywords[language] || keywords.javascript;\n\n  // Escape HTML\n  let result = code\n    .replace(/&/g, \"&amp;\")\n    .replace(/</g, \"&lt;\")\n    .replace(/>/g, \"&gt;\");\n\n  // Highlight strings\n  result = result.replace(\n    /([\"'`])(?:(?!\\1)[^\\\\]|\\\\.)*\\1/g,\n    '<span class=\"text-green-400\">$&</span>'\n  );\n\n  // Highlight comments\n  result = result.replace(\n    /(\\/\\/.*$|\\/\\*[\\s\\S]*?\\*\\/)/gm,\n    '<span class=\"text-muted-foreground italic\">$&</span>'\n  );\n\n  // Highlight keywords\n  const keywordPattern = new RegExp(`\\\\b(${langKeywords.join(\"|\")})\\\\b`, \"g\");\n  result = result.replace(\n    keywordPattern,\n    '<span class=\"text-purple-400 font-medium\">$&</span>'\n  );\n\n  // Highlight numbers\n  result = result.replace(\n    /\\b(\\d+\\.?\\d*)\\b/g,\n    '<span class=\"text-orange-400\">$&</span>'\n  );\n\n  // Highlight JSX tags\n  if (language === \"typescript\" || language === \"javascript\") {\n    result = result.replace(\n      /(&lt;\\/?)([A-Z][a-zA-Z0-9]*)/g,\n      '$1<span class=\"text-cyan-400\">$2</span>'\n    );\n  }\n\n  return result;\n}\n\n/**\n * Find element mapping for a given line number\n */\nfunction findElementForLine(\n  line: number,\n  file: string,\n  mappings: ElementMapping[]\n): ElementMapping | null {\n  for (const mapping of mappings) {\n    if (\n      mapping.codeLocation.file === file &&\n      line >= mapping.codeLocation.startLine &&\n      line <= mapping.codeLocation.endLine\n    ) {\n      return mapping;\n    }\n  }\n  return null;\n}\n\n/**\n * Panel for displaying generated code with syntax highlighting\n */\nexport function CodePanel({\n  files,\n  selectedFileIndex,\n  onFileSelect,\n  elementMappings,\n  highlightState,\n  onElementHover,\n  onElementClick,\n  onScroll,\n  syncScrollPosition,\n  scrollToLine,\n}: CodePanelProps) {\n  const codeContainerRef = useRef<HTMLDivElement>(null);\n  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);\n  const isSyncingRef = useRef(false);\n\n  const selectedFile = files[selectedFileIndex];\n\n  // Split code into lines with highlighting info\n  const codeLines = useMemo(() => {\n    if (!selectedFile) return [];\n    const lines = selectedFile.content.split(\"\\n\");\n    return lines.map((line, index) => {\n      const lineNumber = index + 1;\n      const element = findElementForLine(\n        lineNumber,\n        selectedFile.path,\n        elementMappings\n      );\n      return {\n        number: lineNumber,\n        content: line,\n        highlighted: highlightCode(line, selectedFile.language),\n        elementId: element?.id ?? null,\n      };\n    });\n  }, [selectedFile, elementMappings]);\n\n  // Handle scroll sync from design panel\n  useEffect(() => {\n    if (syncScrollPosition !== undefined && codeContainerRef.current && !isSyncingRef.current) {\n      isSyncingRef.current = true;\n      const container = codeContainerRef.current;\n      const maxScroll = container.scrollHeight - container.clientHeight;\n      container.scrollTop = syncScrollPosition * maxScroll;\n      requestAnimationFrame(() => {\n        isSyncingRef.current = false;\n      });\n    }\n  }, [syncScrollPosition]);\n\n  // Scroll to specific line when requested\n  useEffect(() => {\n    if (scrollToLine !== undefined && codeContainerRef.current) {\n      const lineHeight = 24; // Approximate line height\n      codeContainerRef.current.scrollTop = (scrollToLine - 5) * lineHeight;\n    }\n  }, [scrollToLine]);\n\n  // Handle local scroll\n  const handleScroll = useCallback(() => {\n    if (codeContainerRef.current && !isSyncingRef.current) {\n      const container = codeContainerRef.current;\n      onScroll(container.scrollTop, container.scrollHeight);\n    }\n  }, [onScroll]);\n\n  // Copy code to clipboard\n  const handleCopy = async () => {\n    if (!selectedFile) return;\n    await navigator.clipboard.writeText(selectedFile.content);\n    setCopiedIndex(selectedFileIndex);\n    setTimeout(() => setCopiedIndex(null), 2000);\n  };\n\n  // Handle line hover\n  const handleLineHover = (lineNumber: number) => {\n    const element = findElementForLine(\n      lineNumber,\n      selectedFile?.path ?? \"\",\n      elementMappings\n    );\n    onElementHover(element?.id ?? null);\n  };\n\n  // Handle line click\n  const handleLineClick = (lineNumber: number) => {\n    const element = findElementForLine(\n      lineNumber,\n      selectedFile?.path ?? \"\",\n      elementMappings\n    );\n    onElementClick(element?.id ?? null);\n  };\n\n  // Check if a line is in a highlighted element's range\n  const isLineHighlighted = (lineNumber: number): boolean => {\n    const highlightedId = highlightState.hoveredElementId ?? highlightState.selectedElementId;\n    if (!highlightedId || !selectedFile) return false;\n\n    const mapping = elementMappings.find((m) => m.id === highlightedId);\n    if (!mapping || mapping.codeLocation.file !== selectedFile.path) return false;\n\n    return (\n      lineNumber >= mapping.codeLocation.startLine &&\n      lineNumber <= mapping.codeLocation.endLine\n    );\n  };\n\n  const isLineSelected = (lineNumber: number): boolean => {\n    if (!highlightState.selectedElementId || !selectedFile) return false;\n\n    const mapping = elementMappings.find(\n      (m) => m.id === highlightState.selectedElementId\n    );\n    if (!mapping || mapping.codeLocation.file !== selectedFile.path) return false;\n\n    return (\n      lineNumber >= mapping.codeLocation.startLine &&\n      lineNumber <= mapping.codeLocation.endLine\n    );\n  };\n\n  if (files.length === 0) {\n    return (\n      <div className=\"flex flex-col h-full bg-muted/30 items-center justify-center\">\n        <FileCode className=\"h-12 w-12 text-muted-foreground/50 mb-4\" />\n        <p className=\"text-muted-foreground\">No generated code</p>\n        <p className=\"text-sm text-muted-foreground/70 mt-1\">\n          Generate code from a design to see it here\n        </p>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"flex flex-col h-full bg-[#1e1e1e]\">\n      {/* File tabs */}\n      <div className=\"flex items-center justify-between border-b border-border/50 bg-[#252526]\">\n        <div className=\"flex overflow-x-auto\">\n          {files.map((file, index) => (\n            <button\n              key={file.path}\n              className={cn(\n                \"flex items-center gap-2 px-4 py-2 text-sm border-r border-border/30 transition-colors whitespace-nowrap\",\n                index === selectedFileIndex\n                  ? \"bg-[#1e1e1e] text-foreground\"\n                  : \"text-muted-foreground hover:text-foreground hover:bg-[#2d2d2d]\"\n              )}\n              onClick={() => onFileSelect(index)}\n            >\n              {getFileIcon(file.language)}\n              <span>{file.path.split(\"/\").pop()}</span>\n            </button>\n          ))}\n        </div>\n        <Button\n          variant=\"ghost\"\n          size=\"sm\"\n          className=\"mr-2 h-7 text-muted-foreground hover:text-foreground\"\n          onClick={handleCopy}\n        >\n          {copiedIndex === selectedFileIndex ? (\n            <>\n              <Check className=\"h-3.5 w-3.5 mr-1\" />\n              Copied\n            </>\n          ) : (\n            <>\n              <Copy className=\"h-3.5 w-3.5 mr-1\" />\n              Copy\n            </>\n          )}\n        </Button>\n      </div>\n\n      {/* Code content */}\n      <div\n        ref={codeContainerRef}\n        className=\"flex-1 overflow-auto font-mono text-sm\"\n        onScroll={handleScroll}\n      >\n        <div className=\"min-w-max\">\n          {codeLines.map((line) => (\n            <div\n              key={line.number}\n              className={cn(\n                \"flex hover:bg-white/5 transition-colors\",\n                isLineHighlighted(line.number) && \"bg-primary/10\",\n                isLineSelected(line.number) && \"bg-primary/20\"\n              )}\n              onMouseEnter={() => handleLineHover(line.number)}\n              onMouseLeave={() => onElementHover(null)}\n              onClick={() => handleLineClick(line.number)}\n            >\n              {/* Line number */}\n              <span className=\"w-12 px-3 py-0.5 text-right text-muted-foreground/50 select-none border-r border-border/30\">\n                {line.number}\n              </span>\n              {/* Code content */}\n              <pre className=\"flex-1 px-4 py-0.5\">\n                <code\n                  dangerouslySetInnerHTML={{ __html: line.highlighted || \"&nbsp;\" }}\n                />\n              </pre>\n            </div>\n          ))}\n        </div>\n      </div>\n\n      {/* Status bar */}\n      <div className=\"flex items-center justify-between px-3 py-1 text-xs text-muted-foreground border-t border-border/50 bg-[#252526]\">\n        <span>{selectedFile?.language ?? \"Unknown\"}</span>\n        <span>{codeLines.length} lines</span>\n      </div>\n    </div>\n  );\n}\n"
}
Now let me create the main SplitView component that brings everything together:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/SplitView.tsx",
  "content": "import { useCallback, useEffect, useRef, useState } from \"react\";\nimport { cn } from \"~/lib/utils\";\nimport {\n  Columns,\n  Rows,\n  Maximize2,\n  Code2,\n  Image,\n  Link2,\n  Link2Off,\n  Settings2,\n} from \"lucide-react\";\nimport { Button } from \"~/components/ui/button\";\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuSeparator,\n  DropdownMenuTrigger,\n} from \"~/components/ui/dropdown-menu\";\nimport { DesignPanel } from \"./DesignPanel\";\nimport { CodePanel } from \"./CodePanel\";\nimport { ResizeHandle } from \"./ResizeHandle\";\nimport type {\n  SplitViewProps,\n  PanelArrangement,\n  HighlightState,\n  ElementMapping,\n} from \"./types\";\n\nconst MIN_PANEL_SIZE = 200;\n\n/**\n * Side-by-side view showing Figma design and generated code\n * with synchronized scrolling and element highlighting\n */\nexport function SplitView({\n  fileKey,\n  nodeId,\n  accountId,\n  generatedFiles,\n  elementMappings,\n  initialArrangement = \"side-by-side\",\n  initialSplitRatio = 0.5,\n  minPanelSize = MIN_PANEL_SIZE,\n  enableScrollSync = true,\n  onArrangementChange,\n}: SplitViewProps) {\n  const containerRef = useRef<HTMLDivElement>(null);\n  const [arrangement, setArrangement] = useState<PanelArrangement>(initialArrangement);\n  const [splitRatio, setSplitRatio] = useState(initialSplitRatio);\n  const [isResizing, setIsResizing] = useState(false);\n  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(enableScrollSync);\n  const [selectedFileIndex, setSelectedFileIndex] = useState(0);\n\n  // Highlight state shared between panels\n  const [highlightState, setHighlightState] = useState<HighlightState>({\n    hoveredElementId: null,\n    selectedElementId: null,\n    source: null,\n  });\n\n  // Scroll synchronization state\n  const [designScrollRatio, setDesignScrollRatio] = useState(0);\n  const [codeScrollRatio, setCodeScrollRatio] = useState(0);\n  const lastScrollSource = useRef<\"design\" | \"code\" | null>(null);\n\n  // Line to scroll to in code panel when navigating from design\n  const [scrollToLine, setScrollToLine] = useState<number | undefined>();\n\n  // Handle arrangement change\n  const handleArrangementChange = (newArrangement: PanelArrangement) => {\n    setArrangement(newArrangement);\n    onArrangementChange?.(newArrangement);\n  };\n\n  // Handle resize\n  const handleResizeStart = () => {\n    setIsResizing(true);\n  };\n\n  const handleResize = useCallback(\n    (delta: number) => {\n      if (!containerRef.current) return;\n      const containerSize =\n        arrangement === \"side-by-side\" || arrangement === \"design-only\" || arrangement === \"code-only\"\n          ? containerRef.current.clientWidth\n          : containerRef.current.clientHeight;\n\n      setSplitRatio((prev) => {\n        const newRatio = prev + delta / containerSize;\n        const minRatio = minPanelSize / containerSize;\n        const maxRatio = 1 - minRatio;\n        return Math.max(minRatio, Math.min(maxRatio, newRatio));\n      });\n    },\n    [arrangement, minPanelSize]\n  );\n\n  const handleResizeEnd = () => {\n    setIsResizing(false);\n  };\n\n  // Handle element hover from design panel\n  const handleDesignElementHover = (elementId: string | null) => {\n    setHighlightState((prev) => ({\n      ...prev,\n      hoveredElementId: elementId,\n      source: elementId ? \"design\" : prev.source,\n    }));\n  };\n\n  // Handle element hover from code panel\n  const handleCodeElementHover = (elementId: string | null) => {\n    setHighlightState((prev) => ({\n      ...prev,\n      hoveredElementId: elementId,\n      source: elementId ? \"code\" : prev.source,\n    }));\n  };\n\n  // Handle element click from design panel - navigate to code\n  const handleDesignElementClick = (elementId: string | null) => {\n    setHighlightState((prev) => ({\n      ...prev,\n      selectedElementId: elementId,\n      source: \"design\",\n    }));\n\n    // Find the element and scroll to its code location\n    if (elementId) {\n      const mapping = elementMappings.find((m) => m.id === elementId);\n      if (mapping) {\n        // Find and select the correct file\n        const fileIndex = generatedFiles.findIndex(\n          (f) => f.path === mapping.codeLocation.file\n        );\n        if (fileIndex !== -1) {\n          setSelectedFileIndex(fileIndex);\n        }\n        // Scroll to the line\n        setScrollToLine(mapping.codeLocation.startLine);\n      }\n    }\n  };\n\n  // Handle element click from code panel - highlight in design\n  const handleCodeElementClick = (elementId: string | null) => {\n    setHighlightState((prev) => ({\n      ...prev,\n      selectedElementId: elementId,\n      source: \"code\",\n    }));\n  };\n\n  // Handle scroll from design panel\n  const handleDesignScroll = (scrollTop: number, scrollHeight: number) => {\n    if (!scrollSyncEnabled) return;\n    lastScrollSource.current = \"design\";\n    const ratio = scrollTop / (scrollHeight - (containerRef.current?.clientHeight ?? 0));\n    setDesignScrollRatio(Math.max(0, Math.min(1, ratio)));\n  };\n\n  // Handle scroll from code panel\n  const handleCodeScroll = (scrollTop: number, scrollHeight: number) => {\n    if (!scrollSyncEnabled) return;\n    lastScrollSource.current = \"code\";\n    const ratio = scrollTop / (scrollHeight - (containerRef.current?.clientHeight ?? 0));\n    setCodeScrollRatio(Math.max(0, Math.min(1, ratio)));\n  };\n\n  // Get panel styles based on arrangement\n  const getPanelStyles = () => {\n    const isVertical = arrangement === \"side-by-side\";\n\n    if (arrangement === \"design-only\") {\n      return {\n        design: { flex: 1 },\n        code: { display: \"none\" },\n        showHandle: false,\n      };\n    }\n\n    if (arrangement === \"code-only\") {\n      return {\n        design: { display: \"none\" },\n        code: { flex: 1 },\n        showHandle: false,\n      };\n    }\n\n    if (isVertical) {\n      return {\n        design: { width: `${splitRatio * 100}%` },\n        code: { width: `${(1 - splitRatio) * 100}%` },\n        showHandle: true,\n      };\n    }\n\n    return {\n      design: { height: `${splitRatio * 100}%` },\n      code: { height: `${(1 - splitRatio) * 100}%` },\n      showHandle: true,\n    };\n  };\n\n  const styles = getPanelStyles();\n  const isVertical = arrangement === \"side-by-side\";\n\n  return (\n    <div className=\"flex flex-col h-full\">\n      {/* Toolbar */}\n      <div className=\"flex items-center justify-between px-4 py-2 border-b border-border bg-background/50 backdrop-blur-sm\">\n        <div className=\"flex items-center gap-2\">\n          <h3 className=\"text-sm font-medium\">Code Preview</h3>\n          {elementMappings.length > 0 && (\n            <span className=\"text-xs text-muted-foreground\">\n              {elementMappings.length} elements mapped\n            </span>\n          )}\n        </div>\n        <div className=\"flex items-center gap-1\">\n          {/* Scroll sync toggle */}\n          <Button\n            variant={scrollSyncEnabled ? \"secondary\" : \"ghost\"}\n            size=\"sm\"\n            className=\"h-7 gap-1.5\"\n            onClick={() => setScrollSyncEnabled(!scrollSyncEnabled)}\n            title={scrollSyncEnabled ? \"Disable scroll sync\" : \"Enable scroll sync\"}\n          >\n            {scrollSyncEnabled ? (\n              <Link2 className=\"h-3.5 w-3.5\" />\n            ) : (\n              <Link2Off className=\"h-3.5 w-3.5\" />\n            )}\n            <span className=\"text-xs\">Sync</span>\n          </Button>\n\n          {/* Arrangement dropdown */}\n          <DropdownMenu>\n            <DropdownMenuTrigger asChild>\n              <Button variant=\"ghost\" size=\"sm\" className=\"h-7 gap-1.5\">\n                <Settings2 className=\"h-3.5 w-3.5\" />\n                <span className=\"text-xs\">Layout</span>\n              </Button>\n            </DropdownMenuTrigger>\n            <DropdownMenuContent align=\"end\">\n              <DropdownMenuItem onClick={() => handleArrangementChange(\"side-by-side\")}>\n                <Columns className=\"h-4 w-4 mr-2\" />\n                Side by side\n                {arrangement === \"side-by-side\" && (\n                  <span className=\"ml-auto text-primary\">•</span>\n                )}\n              </DropdownMenuItem>\n              <DropdownMenuItem onClick={() => handleArrangementChange(\"top-bottom\")}>\n                <Rows className=\"h-4 w-4 mr-2\" />\n                Top / bottom\n                {arrangement === \"top-bottom\" && (\n                  <span className=\"ml-auto text-primary\">•</span>\n                )}\n              </DropdownMenuItem>\n              <DropdownMenuSeparator />\n              <DropdownMenuItem onClick={() => handleArrangementChange(\"design-only\")}>\n                <Image className=\"h-4 w-4 mr-2\" />\n                Design only\n                {arrangement === \"design-only\" && (\n                  <span className=\"ml-auto text-primary\">•</span>\n                )}\n              </DropdownMenuItem>\n              <DropdownMenuItem onClick={() => handleArrangementChange(\"code-only\")}>\n                <Code2 className=\"h-4 w-4 mr-2\" />\n                Code only\n                {arrangement === \"code-only\" && (\n                  <span className=\"ml-auto text-primary\">•</span>\n                )}\n              </DropdownMenuItem>\n              <DropdownMenuSeparator />\n              <DropdownMenuItem onClick={() => setSplitRatio(0.5)}>\n                <Maximize2 className=\"h-4 w-4 mr-2\" />\n                Reset split\n              </DropdownMenuItem>\n            </DropdownMenuContent>\n          </DropdownMenu>\n        </div>\n      </div>\n\n      {/* Split panels */}\n      <div\n        ref={containerRef}\n        className={cn(\n          \"flex-1 flex overflow-hidden\",\n          isVertical ? \"flex-row\" : \"flex-col\",\n          isResizing && \"select-none\"\n        )}\n      >\n        {/* Design panel */}\n        <div style={styles.design} className=\"overflow-hidden\">\n          <DesignPanel\n            fileKey={fileKey}\n            nodeId={nodeId}\n            accountId={accountId}\n            elementMappings={elementMappings}\n            highlightState={highlightState}\n            onElementHover={handleDesignElementHover}\n            onElementClick={handleDesignElementClick}\n            onScroll={handleDesignScroll}\n            syncScrollPosition={\n              scrollSyncEnabled && lastScrollSource.current === \"code\"\n                ? codeScrollRatio\n                : undefined\n            }\n          />\n        </div>\n\n        {/* Resize handle */}\n        {styles.showHandle && (\n          <ResizeHandle\n            orientation={isVertical ? \"vertical\" : \"horizontal\"}\n            onResizeStart={handleResizeStart}\n            onResize={handleResize}\n            onResizeEnd={handleResizeEnd}\n          />\n        )}\n\n        {/* Code panel */}\n        <div style={styles.code} className=\"overflow-hidden\">\n          <CodePanel\n            files={generatedFiles}\n            selectedFileIndex={selectedFileIndex}\n            onFileSelect={setSelectedFileIndex}\n            elementMappings={elementMappings}\n            highlightState={highlightState}\n            onElementHover={handleCodeElementHover}\n            onElementClick={handleCodeElementClick}\n            onScroll={handleCodeScroll}\n            syncScrollPosition={\n              scrollSyncEnabled && lastScrollSource.current === \"design\"\n                ? designScrollRatio\n                : undefined\n            }\n            scrollToLine={scrollToLine}\n          />\n        </div>\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/index.ts",
  "content": "export { SplitView } from \"./SplitView\";\nexport { DesignPanel } from \"./DesignPanel\";\nexport { CodePanel } from \"./CodePanel\";\nexport { ResizeHandle } from \"./ResizeHandle\";\nexport type {\n  PanelArrangement,\n  ElementMapping,\n  HighlightState,\n  ScrollSyncState,\n  DesignPanelProps,\n  CodePanelProps,\n  SplitViewProps,\n  ResizeHandleProps,\n} from \"./types\";\n"
}
Now let me create the dashboard route for the code preview:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create SplitView component with resizable panels",
      "status": "completed",
      "activeForm": "Creating SplitView component with resizable panels"
    },
    {
      "content": "Build FigmaDesignPanel for displaying Figma designs",
      "status": "completed",
      "activeForm": "Building FigmaDesignPanel for displaying Figma designs"
    },
    {
      "content": "Build CodePreviewPanel with syntax highlighting",
      "status": "completed",
      "activeForm": "Building CodePreviewPanel with syntax highlighting"
    },
    {
      "content": "Implement synchronized scrolling between panels",
      "status": "completed",
      "activeForm": "Implementing synchronized scrolling between panels"
    },
    {
      "content": "Add element highlighting and click-to-navigate",
      "status": "completed",
      "activeForm": "Adding element highlighting and click-to-navigate"
    },
    {
      "content": "Support multiple panel arrangements (side-by-side, top-bottom, etc.)",
      "status": "completed",
      "activeForm": "Supporting multiple panel arrangements"
    },
    {
      "content": "Create dashboard route for code preview",
      "status": "in_progress",
      "activeForm": "Creating dashboard route for code preview"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "pending",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.preview.tsx",
  "content": "import { createFileRoute } from \"@tanstack/react-router\";\nimport { useState, useMemo } from \"react\";\nimport { SplitView } from \"~/components/code-preview\";\nimport type { ElementMapping, PanelArrangement } from \"~/components/code-preview\";\nimport type { GeneratedFile } from \"~/utils/code-generation-agent/types\";\nimport { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from \"~/components/ui/panel\";\nimport { Input } from \"~/components/ui/input\";\nimport { Button } from \"~/components/ui/button\";\nimport { Label } from \"~/components/ui/label\";\nimport { Sparkles, Play, Code2 } from \"lucide-react\";\n\nexport const Route = createFileRoute(\"/dashboard/preview\")({\n  component: CodePreviewPage,\n});\n\n// Demo generated files for testing\nconst DEMO_FILES: GeneratedFile[] = [\n  {\n    path: \"components/Card.tsx\",\n    type: \"component\",\n    language: \"typescript\",\n    content: `import React from \"react\";\nimport { cn } from \"~/lib/utils\";\n\ninterface CardProps {\n  title: string;\n  description?: string;\n  image?: string;\n  className?: string;\n  onClick?: () => void;\n}\n\nexport function Card({\n  title,\n  description,\n  image,\n  className,\n  onClick,\n}: CardProps) {\n  return (\n    <div\n      className={cn(\n        \"rounded-xl border border-border bg-card p-6\",\n        \"hover:shadow-lg transition-all duration-300\",\n        \"cursor-pointer\",\n        className\n      )}\n      onClick={onClick}\n    >\n      {image && (\n        <div className=\"mb-4 overflow-hidden rounded-lg\">\n          <img\n            src={image}\n            alt={title}\n            className=\"w-full h-48 object-cover\"\n          />\n        </div>\n      )}\n      <h3 className=\"text-lg font-semibold text-foreground\">\n        {title}\n      </h3>\n      {description && (\n        <p className=\"mt-2 text-sm text-muted-foreground\">\n          {description}\n        </p>\n      )}\n    </div>\n  );\n}\n`,\n  },\n  {\n    path: \"components/Card.module.css\",\n    type: \"styles\",\n    language: \"css\",\n    content: `.card {\n  border-radius: 0.75rem;\n  border: 1px solid var(--border);\n  background-color: var(--card);\n  padding: 1.5rem;\n  transition: all 0.3s ease;\n  cursor: pointer;\n}\n\n.card:hover {\n  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);\n  transform: translateY(-2px);\n}\n\n.cardImage {\n  margin-bottom: 1rem;\n  overflow: hidden;\n  border-radius: 0.5rem;\n}\n\n.cardImage img {\n  width: 100%;\n  height: 12rem;\n  object-fit: cover;\n}\n\n.cardTitle {\n  font-size: 1.125rem;\n  font-weight: 600;\n  color: var(--foreground);\n}\n\n.cardDescription {\n  margin-top: 0.5rem;\n  font-size: 0.875rem;\n  color: var(--muted-foreground);\n}\n`,\n  },\n  {\n    path: \"components/Card.types.ts\",\n    type: \"types\",\n    language: \"typescript\",\n    content: `/**\n * Card component props interface\n */\nexport interface CardProps {\n  /** Card title - displayed as heading */\n  title: string;\n\n  /** Optional description text */\n  description?: string;\n\n  /** Optional image URL for card header */\n  image?: string;\n\n  /** Additional CSS classes */\n  className?: string;\n\n  /** Click handler */\n  onClick?: () => void;\n}\n\n/**\n * Card variant types\n */\nexport type CardVariant = \"default\" | \"outlined\" | \"elevated\";\n\n/**\n * Card size options\n */\nexport type CardSize = \"sm\" | \"md\" | \"lg\";\n`,\n  },\n];\n\n// Demo element mappings for testing click-to-navigate\nconst DEMO_MAPPINGS: ElementMapping[] = [\n  {\n    id: \"card-container\",\n    name: \"Card Container\",\n    figmaNodeId: \"1:1\",\n    designBounds: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },\n    codeLocation: { file: \"components/Card.tsx\", startLine: 17, endLine: 37 },\n    children: [\"card-image\", \"card-title\", \"card-description\"],\n  },\n  {\n    id: \"card-image\",\n    name: \"Card Image\",\n    figmaNodeId: \"1:2\",\n    designBounds: { x: 0.12, y: 0.12, width: 0.76, height: 0.35 },\n    codeLocation: { file: \"components/Card.tsx\", startLine: 25, endLine: 31 },\n    children: [],\n    parentId: \"card-container\",\n  },\n  {\n    id: \"card-title\",\n    name: \"Card Title\",\n    figmaNodeId: \"1:3\",\n    designBounds: { x: 0.12, y: 0.5, width: 0.76, height: 0.1 },\n    codeLocation: { file: \"components/Card.tsx\", startLine: 32, endLine: 34 },\n    children: [],\n    parentId: \"card-container\",\n  },\n  {\n    id: \"card-description\",\n    name: \"Card Description\",\n    figmaNodeId: \"1:4\",\n    designBounds: { x: 0.12, y: 0.62, width: 0.76, height: 0.15 },\n    codeLocation: { file: \"components/Card.tsx\", startLine: 35, endLine: 39 },\n    children: [],\n    parentId: \"card-container\",\n  },\n];\n\nfunction CodePreviewPage() {\n  const [fileKey, setFileKey] = useState(\"\");\n  const [nodeId, setNodeId] = useState(\"\");\n  const [isGenerating, setIsGenerating] = useState(false);\n  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>(DEMO_FILES);\n  const [elementMappings, setElementMappings] = useState<ElementMapping[]>(DEMO_MAPPINGS);\n  const [arrangement, setArrangement] = useState<PanelArrangement>(\"side-by-side\");\n\n  // Simulate code generation\n  const handleGenerate = async () => {\n    setIsGenerating(true);\n    // Simulate API call\n    await new Promise((resolve) => setTimeout(resolve, 1500));\n    setGeneratedFiles(DEMO_FILES);\n    setElementMappings(DEMO_MAPPINGS);\n    setIsGenerating(false);\n  };\n\n  return (\n    <div className=\"flex flex-col h-[calc(100vh-3.5rem)] p-6 gap-6\">\n      {/* Header section */}\n      <div className=\"flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between\">\n        <div>\n          <h1 className=\"text-3xl font-bold tracking-tight\">Code Preview</h1>\n          <p className=\"text-muted-foreground mt-1\">\n            View Figma designs side-by-side with generated code\n          </p>\n        </div>\n\n        {/* Quick input */}\n        <div className=\"flex items-end gap-3\">\n          <div className=\"space-y-1.5\">\n            <Label htmlFor=\"fileKey\" className=\"text-xs\">File Key</Label>\n            <Input\n              id=\"fileKey\"\n              placeholder=\"abc123xyz\"\n              value={fileKey}\n              onChange={(e) => setFileKey(e.target.value)}\n              className=\"w-40\"\n            />\n          </div>\n          <div className=\"space-y-1.5\">\n            <Label htmlFor=\"nodeId\" className=\"text-xs\">Node ID</Label>\n            <Input\n              id=\"nodeId\"\n              placeholder=\"1:234\"\n              value={nodeId}\n              onChange={(e) => setNodeId(e.target.value)}\n              className=\"w-32\"\n            />\n          </div>\n          <Button\n            onClick={handleGenerate}\n            disabled={isGenerating}\n            className=\"gap-2\"\n          >\n            {isGenerating ? (\n              <>\n                <Sparkles className=\"h-4 w-4 animate-spin\" />\n                Generating...\n              </>\n            ) : (\n              <>\n                <Play className=\"h-4 w-4\" />\n                Generate\n              </>\n            )}\n          </Button>\n        </div>\n      </div>\n\n      {/* Main split view */}\n      <Panel className=\"flex-1 overflow-hidden\">\n        <SplitView\n          fileKey={fileKey || \"demo-file\"}\n          nodeId={nodeId || \"1:0\"}\n          generatedFiles={generatedFiles}\n          elementMappings={elementMappings}\n          initialArrangement={arrangement}\n          onArrangementChange={setArrangement}\n          enableScrollSync={true}\n        />\n      </Panel>\n\n      {/* Help panel */}\n      <Panel>\n        <PanelHeader className=\"pb-3\">\n          <PanelTitle className=\"text-base flex items-center gap-2\">\n            <Code2 className=\"h-4 w-4\" />\n            How to use\n          </PanelTitle>\n        </PanelHeader>\n        <PanelContent className=\"pt-0\">\n          <div className=\"grid gap-4 sm:grid-cols-3 text-sm\">\n            <div>\n              <h4 className=\"font-medium mb-1\">Synchronized scrolling</h4>\n              <p className=\"text-muted-foreground text-xs\">\n                Scroll in either panel and the other follows. Toggle with the Sync button.\n              </p>\n            </div>\n            <div>\n              <h4 className=\"font-medium mb-1\">Element highlighting</h4>\n              <p className=\"text-muted-foreground text-xs\">\n                Hover over design elements to highlight the corresponding code. Click to select.\n              </p>\n            </div>\n            <div>\n              <h4 className=\"font-medium mb-1\">Panel layouts</h4>\n              <p className=\"text-muted-foreground text-xs\">\n                Use the Layout menu to switch between side-by-side, top/bottom, or single panel views.\n              </p>\n            </div>\n          </div>\n        </PanelContent>\n      </Panel>\n    </div>\n  );\n}\n"
}
Now let me update the dashboard navigation to include the new Code Preview route:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.tsx"
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.tsx",
  "old_string": "import { LayoutDashboard, ChevronLeft, ChevronRight, Figma, Layers } from \"lucide-react\";",
  "new_string": "import { LayoutDashboard, ChevronLeft, ChevronRight, Figma, Layers, SplitSquareHorizontal } from \"lucide-react\";"
}

🔧 Tool: Edit
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.tsx",
  "old_string": "const navItems: NavItem[] = [\n  {\n    title: \"Overview\",\n    href: \"/dashboard\",\n    icon: LayoutDashboard,\n  },\n  {\n    title: \"Figma\",\n    href: \"/dashboard/figma\",\n    icon: Figma,\n  },\n  {\n    title: \"Frames\",\n    href: \"/dashboard/frames\",\n    icon: Layers,\n  },\n];",
  "new_string": "const navItems: NavItem[] = [\n  {\n    title: \"Overview\",\n    href: \"/dashboard\",\n    icon: LayoutDashboard,\n  },\n  {\n    title: \"Figma\",\n    href: \"/dashboard/figma\",\n    icon: Figma,\n  },\n  {\n    title: \"Frames\",\n    href: \"/dashboard/frames\",\n    icon: Layers,\n  },\n  {\n    title: \"Code Preview\",\n    href: \"/dashboard/preview\",\n    icon: SplitSquareHorizontal,\n  },\n];"
}
Now let me update the todo and run the build to verify there are no TypeScript errors:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create SplitView component with resizable panels",
      "status": "completed",
      "activeForm": "Creating SplitView component with resizable panels"
    },
    {
      "content": "Build FigmaDesignPanel for displaying Figma designs",
      "status": "completed",
      "activeForm": "Building FigmaDesignPanel for displaying Figma designs"
    },
    {
      "content": "Build CodePreviewPanel with syntax highlighting",
      "status": "completed",
      "activeForm": "Building CodePreviewPanel with syntax highlighting"
    },
    {
      "content": "Implement synchronized scrolling between panels",
      "status": "completed",
      "activeForm": "Implementing synchronized scrolling between panels"
    },
    {
      "content": "Add element highlighting and click-to-navigate",
      "status": "completed",
      "activeForm": "Adding element highlighting and click-to-navigate"
    },
    {
      "content": "Support multiple panel arrangements (side-by-side, top-bottom, etc.)",
      "status": "completed",
      "activeForm": "Supporting multiple panel arrangements"
    },
    {
      "content": "Create dashboard route for code preview",
      "status": "completed",
      "activeForm": "Creating dashboard route for code preview"
    },
    {
      "content": "Verify implementation with Playwright test",
      "status": "in_progress",
      "activeForm": "Verifying implementation with Playwright test"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "npm run build 2>&1 | head -100",
  "description": "Build project to check for errors",
  "timeout": 120000
}
There's a conflict - there's already a `dashboard/preview.tsx` file. Let me check what exists:

🔧 Tool: Glob
Input: {
  "pattern": "src/routes/dashboard/**/*.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/preview.tsx"
}
There's already a preview route! Let me remove the conflicting file I created and instead enhance the existing preview route to add the Figma side-by-side view functionality. Let me also check what components are already available:

🔧 Tool: Bash
Input: {
  "command": "rm /home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.preview.tsx",
  "description": "Remove conflicting route file"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/CodePreview*"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/CodePreview.tsx"
}
The existing `CodePreview` component and `preview.tsx` route are focused on rendering the generated code, but they don't have the Figma design side-by-side view with synchronized scrolling and element highlighting. Let me update the existing preview route to incorporate the new SplitView functionality:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/preview.tsx"
}
Now I need to update the existing preview route to add a new tab that uses the SplitView component for the Figma design view. Let me update the route: