
🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming"
}
I'll start by exploring the codebase to understand the existing structure, particularly around design tokens and how components are organized.

🔧 Tool: Task
Input: {
  "prompt": "Explore the codebase to understand:\n1. The current project structure, especially src/components and src/routes\n2. Any existing design token or theming system\n3. How the dashboard/preview page works (src/routes/dashboard/preview.tsx was modified)\n4. Any existing token-related components or utilities\n5. The UI component patterns being used (Radix UI, Tailwind, etc.)\n\nBe thorough - look for any existing token extraction, Figma integration, or design system tooling.",
  "description": "Explore codebase structure",
  "subagent_type": "Explore"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/**/*.{tsx,ts,jsx,js}"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"package.json\" | head -5",
  "description": "Find package.json files to understand dependencies"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/preview.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/ | head -30",
  "description": "List components directory"
}

🔧 Tool: Grep
Input: {
  "pattern": "token|theme|design.?system|color|css.?variable",
  "glob": "src/**/*.{ts,tsx,css}",
  "output_mode": "files_with_matches"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f -name \"*theme*\" -o -name \"*token*\" -o -name \"*color*\"",
  "description": "Find theme/token/color files"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -name \"tailwind.config.*\" -o -name \"postcss.config.*\"",
  "description": "Find tailwind and postcss config"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-token.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/theme-provider.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/hooks/useTheme.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/postcss.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/tailwind-generator.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/typography-extractor.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/css-modules-examples/theme.values.css"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/routes -type f -name \"*.tsx\" | head -20",
  "description": "List routes to understand structure"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/utils -type f -name \"*.ts\" | grep -E \"(figma|code-gen)\" | head -20",
  "description": "Find Figma/code generation utilities"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/utils -type f -name \"*.ts\" | xargs grep -l \"code.*generation\\|design.*token\\|figma.*api\" 2>/dev/null | head -10",
  "description": "Find code generation and design token utilities"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/figma.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/utils -type d | head -10",
  "description": "List utility directories"
}

🔧 Tool: Bash
Input: {
  "command": "ls /home/rainman/figma-to-code/figma-to-code/src/utils/ | grep -E \"agent|generation|code\" ",
  "description": "Find agent and generation utilities"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/utils/code-generation-agent/",
  "description": "List code generation agent files"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/utils/design-intent-agent/",
  "description": "List design intent agent files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/CodePreview.tsx",
  "limit": 200
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/code-generation-agent/types.ts",
  "limit": 150
}

🔧 Tool: Bash
Input: {
  "command": "head -50 /home/rainman/figma-to-code/figma-to-code/src/components/IntegratedCodeEditor.tsx",
  "description": "Preview IntegratedCodeEditor component"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/button.tsx",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "head -100 /home/rainman/figma-to-code/figma-to-code/src/styles/app.css",
  "description": "Check main app styles"
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"design.*token\\|token.*extract\\|design.*system\" /home/rainman/figma-to-code/figma-to-code/src --include=\"*.ts\" --include=\"*.tsx\" 2>/dev/null | head -20",
  "description": "Search for token/design system references"
}

🔧 Tool: Bash
Input: {
  "command": "wc -l /home/rainman/figma-to-code/figma-to-code/src/utils/code-generation-agent/*.ts /home/rainman/figma-to-code/figma-to-code/src/utils/design-intent-agent/*.ts 2>/dev/null",
  "description": "Check file sizes of agent files"
}
Now I understand the codebase well. Let me check the current state of the preview page and any related token components:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/preview.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/tailwind-figma-integration.ts"
}
Now let me look at the tailwind-generator to understand the DesignToken type and available utilities:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/tailwind-generator.ts",
  "limit": 200
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/**/*Token*.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/**/*token*.tsx"
}
Let me also check the existing UI components to understand the patterns:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/tabs.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/card.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ui/input.tsx"
}
I have a good understanding of the codebase. The feature requires building a design token display panel with:
1. Visual previews for tokens (colors, typography, spacing, etc.)
2. Token editing and renaming
3. Token usage tracking across components
4. Token grouping and categorization

Let me create a todo list and start implementing:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create DesignTokenPanel component with visual previews",
      "status": "in_progress",
      "activeForm": "Creating DesignTokenPanel component"
    },
    {
      "content": "Build TokenEditor component for editing/renaming tokens",
      "status": "pending",
      "activeForm": "Building TokenEditor component"
    },
    {
      "content": "Create TokenUsageTracker to show usage across components",
      "status": "pending",
      "activeForm": "Creating TokenUsageTracker"
    },
    {
      "content": "Add token grouping and categorization support",
      "status": "pending",
      "activeForm": "Adding token grouping support"
    },
    {
      "content": "Integrate DesignTokenPanel into the preview page",
      "status": "pending",
      "activeForm": "Integrating into preview page"
    },
    {
      "content": "Verify with Playwright test",
      "status": "pending",
      "activeForm": "Verifying with Playwright test"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/DesignTokenPanel.tsx",
  "content": "/**\n * Design Token Panel Component\n *\n * Displays extracted design tokens with visual previews.\n * Features:\n * - Visual previews for colors, typography, spacing, etc.\n * - Token editing and renaming\n * - Token usage tracking across components\n * - Token grouping and categorization\n */\n\nimport * as React from \"react\";\nimport { useState, useMemo, useCallback } from \"react\";\nimport { cn } from \"~/lib/utils\";\nimport { Input } from \"~/components/ui/input\";\nimport { Button } from \"~/components/ui/button\";\nimport { Badge } from \"~/components/ui/badge\";\nimport {\n  Card,\n  CardContent,\n  CardDescription,\n  CardHeader,\n  CardTitle,\n} from \"~/components/ui/card\";\nimport {\n  Tabs,\n  TabsContent,\n  TabsList,\n  TabsTrigger,\n} from \"~/components/ui/tabs\";\nimport {\n  Tooltip,\n  TooltipContent,\n  TooltipProvider,\n  TooltipTrigger,\n} from \"~/components/ui/tooltip\";\nimport {\n  DropdownMenu,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuTrigger,\n} from \"~/components/ui/dropdown-menu\";\nimport {\n  Palette,\n  Type,\n  Ruler,\n  Square,\n  Layers,\n  Search,\n  Edit2,\n  Check,\n  X,\n  Copy,\n  MoreVertical,\n  ChevronDown,\n  ChevronRight,\n  Eye,\n} from \"lucide-react\";\nimport type { DesignToken, DesignTokenType } from \"~/utils/tailwind-generator\";\n\n// ============================================================================\n// Types\n// ============================================================================\n\nexport interface TokenUsage {\n  componentName: string;\n  propertyName: string;\n  lineNumber?: number;\n}\n\nexport interface DesignTokenWithUsage extends DesignToken {\n  usages?: TokenUsage[];\n}\n\nexport interface TokenGroup {\n  name: string;\n  tokens: DesignTokenWithUsage[];\n  collapsed?: boolean;\n}\n\nexport interface DesignTokenPanelProps {\n  /** Design tokens to display */\n  tokens: DesignTokenWithUsage[];\n  /** Callback when a token is edited */\n  onTokenEdit?: (token: DesignTokenWithUsage, newValue: string) => void;\n  /** Callback when a token is renamed */\n  onTokenRename?: (token: DesignTokenWithUsage, newName: string) => void;\n  /** Callback when a token is deleted */\n  onTokenDelete?: (token: DesignTokenWithUsage) => void;\n  /** Callback when a token's usage is clicked */\n  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;\n  /** Whether tokens are editable */\n  editable?: boolean;\n  /** Custom grouping function */\n  groupBy?: \"type\" | \"category\" | \"none\";\n  /** Default expanded groups */\n  defaultExpandedGroups?: string[];\n  /** Class name for additional styling */\n  className?: string;\n}\n\n// ============================================================================\n// Constants\n// ============================================================================\n\nconst TOKEN_TYPE_CONFIG: Record<\n  DesignTokenType,\n  { icon: React.ReactNode; label: string; category: string }\n> = {\n  color: { icon: <Palette className=\"h-4 w-4\" />, label: \"Colors\", category: \"Colors\" },\n  spacing: { icon: <Ruler className=\"h-4 w-4\" />, label: \"Spacing\", category: \"Layout\" },\n  fontSize: { icon: <Type className=\"h-4 w-4\" />, label: \"Font Sizes\", category: \"Typography\" },\n  fontFamily: { icon: <Type className=\"h-4 w-4\" />, label: \"Font Families\", category: \"Typography\" },\n  fontWeight: { icon: <Type className=\"h-4 w-4\" />, label: \"Font Weights\", category: \"Typography\" },\n  lineHeight: { icon: <Type className=\"h-4 w-4\" />, label: \"Line Heights\", category: \"Typography\" },\n  letterSpacing: { icon: <Type className=\"h-4 w-4\" />, label: \"Letter Spacing\", category: \"Typography\" },\n  borderRadius: { icon: <Square className=\"h-4 w-4\" />, label: \"Border Radius\", category: \"Borders\" },\n  borderWidth: { icon: <Square className=\"h-4 w-4\" />, label: \"Border Width\", category: \"Borders\" },\n  boxShadow: { icon: <Layers className=\"h-4 w-4\" />, label: \"Shadows\", category: \"Effects\" },\n  opacity: { icon: <Eye className=\"h-4 w-4\" />, label: \"Opacity\", category: \"Effects\" },\n  zIndex: { icon: <Layers className=\"h-4 w-4\" />, label: \"Z-Index\", category: \"Layout\" },\n};\n\n// ============================================================================\n// Helper Functions\n// ============================================================================\n\nfunction groupTokensByType(tokens: DesignTokenWithUsage[]): TokenGroup[] {\n  const groups = new Map<DesignTokenType, DesignTokenWithUsage[]>();\n\n  for (const token of tokens) {\n    const existing = groups.get(token.type) || [];\n    groups.set(token.type, [...existing, token]);\n  }\n\n  return Array.from(groups.entries()).map(([type, groupTokens]) => ({\n    name: TOKEN_TYPE_CONFIG[type]?.label || type,\n    tokens: groupTokens,\n  }));\n}\n\nfunction groupTokensByCategory(tokens: DesignTokenWithUsage[]): TokenGroup[] {\n  const groups = new Map<string, DesignTokenWithUsage[]>();\n\n  for (const token of tokens) {\n    const category = TOKEN_TYPE_CONFIG[token.type]?.category || \"Other\";\n    const existing = groups.get(category) || [];\n    groups.set(category, [...existing, token]);\n  }\n\n  return Array.from(groups.entries()).map(([category, groupTokens]) => ({\n    name: category,\n    tokens: groupTokens,\n  }));\n}\n\nfunction copyToClipboard(text: string): void {\n  navigator.clipboard.writeText(text);\n}\n\n// ============================================================================\n// Sub-Components\n// ============================================================================\n\n/** Color preview swatch */\nfunction ColorPreview({ value, size = \"md\" }: { value: string; size?: \"sm\" | \"md\" | \"lg\" }) {\n  const sizeClasses = {\n    sm: \"h-6 w-6\",\n    md: \"h-8 w-8\",\n    lg: \"h-12 w-12\",\n  };\n\n  return (\n    <div\n      className={cn(\n        \"rounded-md border shadow-sm\",\n        sizeClasses[size]\n      )}\n      style={{ backgroundColor: value }}\n      aria-label={`Color: ${value}`}\n    />\n  );\n}\n\n/** Typography preview */\nfunction TypographyPreview({\n  token,\n}: {\n  token: DesignTokenWithUsage;\n}) {\n  const style: React.CSSProperties = {};\n\n  switch (token.type) {\n    case \"fontSize\":\n      style.fontSize = token.value;\n      break;\n    case \"fontFamily\":\n      style.fontFamily = token.value;\n      break;\n    case \"fontWeight\":\n      style.fontWeight = token.value;\n      break;\n    case \"lineHeight\":\n      style.lineHeight = token.value;\n      break;\n    case \"letterSpacing\":\n      style.letterSpacing = token.value;\n      break;\n  }\n\n  return (\n    <div className=\"flex items-center gap-2\">\n      <span style={style} className=\"text-foreground truncate max-w-[120px]\">\n        Aa\n      </span>\n      <span className=\"text-xs text-muted-foreground\">{token.value}</span>\n    </div>\n  );\n}\n\n/** Spacing preview */\nfunction SpacingPreview({ value }: { value: string }) {\n  // Parse the value to get a numeric representation\n  const numericValue = parseFloat(value);\n  const displayWidth = Math.min(Math.max(numericValue * 2, 8), 80);\n\n  return (\n    <div className=\"flex items-center gap-2\">\n      <div\n        className=\"h-4 bg-primary/20 border border-primary/40 rounded\"\n        style={{ width: `${displayWidth}px` }}\n      />\n      <span className=\"text-xs text-muted-foreground\">{value}</span>\n    </div>\n  );\n}\n\n/** Border radius preview */\nfunction BorderRadiusPreview({ value }: { value: string }) {\n  return (\n    <div className=\"flex items-center gap-2\">\n      <div\n        className=\"h-8 w-8 bg-muted border-2 border-primary/40\"\n        style={{ borderRadius: value }}\n      />\n      <span className=\"text-xs text-muted-foreground\">{value}</span>\n    </div>\n  );\n}\n\n/** Shadow preview */\nfunction ShadowPreview({ value }: { value: string }) {\n  return (\n    <div className=\"flex items-center gap-2\">\n      <div\n        className=\"h-8 w-8 bg-background rounded\"\n        style={{ boxShadow: value }}\n      />\n      <span className=\"text-xs text-muted-foreground truncate max-w-[100px]\">{value}</span>\n    </div>\n  );\n}\n\n/** Generic value preview */\nfunction GenericPreview({ value }: { value: string }) {\n  return (\n    <span className=\"text-sm font-mono text-muted-foreground\">{value}</span>\n  );\n}\n\n/** Token preview based on type */\nfunction TokenPreview({ token }: { token: DesignTokenWithUsage }) {\n  switch (token.type) {\n    case \"color\":\n      return <ColorPreview value={token.value} />;\n    case \"fontSize\":\n    case \"fontFamily\":\n    case \"fontWeight\":\n    case \"lineHeight\":\n    case \"letterSpacing\":\n      return <TypographyPreview token={token} />;\n    case \"spacing\":\n      return <SpacingPreview value={token.value} />;\n    case \"borderRadius\":\n      return <BorderRadiusPreview value={token.value} />;\n    case \"boxShadow\":\n      return <ShadowPreview value={token.value} />;\n    default:\n      return <GenericPreview value={token.value} />;\n  }\n}\n\n/** Editable token name input */\nfunction EditableTokenName({\n  token,\n  onRename,\n  editable,\n}: {\n  token: DesignTokenWithUsage;\n  onRename?: (token: DesignTokenWithUsage, newName: string) => void;\n  editable?: boolean;\n}) {\n  const [isEditing, setIsEditing] = useState(false);\n  const [editValue, setEditValue] = useState(token.name);\n\n  const handleSave = useCallback(() => {\n    if (editValue.trim() && editValue !== token.name) {\n      onRename?.(token, editValue.trim());\n    }\n    setIsEditing(false);\n  }, [editValue, token, onRename]);\n\n  const handleCancel = useCallback(() => {\n    setEditValue(token.name);\n    setIsEditing(false);\n  }, [token.name]);\n\n  const handleKeyDown = useCallback(\n    (e: React.KeyboardEvent) => {\n      if (e.key === \"Enter\") {\n        handleSave();\n      } else if (e.key === \"Escape\") {\n        handleCancel();\n      }\n    },\n    [handleSave, handleCancel]\n  );\n\n  if (!editable) {\n    return <span className=\"font-medium text-sm\">{token.name}</span>;\n  }\n\n  if (isEditing) {\n    return (\n      <div className=\"flex items-center gap-1\">\n        <Input\n          value={editValue}\n          onChange={(e) => setEditValue(e.target.value)}\n          onKeyDown={handleKeyDown}\n          className=\"h-6 text-xs w-32\"\n          autoFocus\n          data-testid=\"token-name-input\"\n        />\n        <Button\n          size=\"sm\"\n          variant=\"ghost\"\n          className=\"h-6 w-6 p-0\"\n          onClick={handleSave}\n          data-testid=\"save-token-name\"\n        >\n          <Check className=\"h-3 w-3\" />\n        </Button>\n        <Button\n          size=\"sm\"\n          variant=\"ghost\"\n          className=\"h-6 w-6 p-0\"\n          onClick={handleCancel}\n        >\n          <X className=\"h-3 w-3\" />\n        </Button>\n      </div>\n    );\n  }\n\n  return (\n    <button\n      className=\"font-medium text-sm hover:text-primary transition-colors flex items-center gap-1 text-left\"\n      onClick={() => setIsEditing(true)}\n      data-testid=\"edit-token-name\"\n    >\n      {token.name}\n      <Edit2 className=\"h-3 w-3 opacity-0 group-hover:opacity-50\" />\n    </button>\n  );\n}\n\n/** Editable token value */\nfunction EditableTokenValue({\n  token,\n  onEdit,\n  editable,\n}: {\n  token: DesignTokenWithUsage;\n  onEdit?: (token: DesignTokenWithUsage, newValue: string) => void;\n  editable?: boolean;\n}) {\n  const [isEditing, setIsEditing] = useState(false);\n  const [editValue, setEditValue] = useState(token.value);\n\n  const handleSave = useCallback(() => {\n    if (editValue.trim() && editValue !== token.value) {\n      onEdit?.(token, editValue.trim());\n    }\n    setIsEditing(false);\n  }, [editValue, token, onEdit]);\n\n  const handleCancel = useCallback(() => {\n    setEditValue(token.value);\n    setIsEditing(false);\n  }, [token.value]);\n\n  if (!editable || token.type === \"color\") {\n    // For colors, we show a different editor\n    return null;\n  }\n\n  if (isEditing) {\n    return (\n      <div className=\"flex items-center gap-1 mt-1\">\n        <Input\n          value={editValue}\n          onChange={(e) => setEditValue(e.target.value)}\n          onKeyDown={(e) => {\n            if (e.key === \"Enter\") handleSave();\n            if (e.key === \"Escape\") handleCancel();\n          }}\n          className=\"h-6 text-xs w-24 font-mono\"\n          autoFocus\n          data-testid=\"token-value-input\"\n        />\n        <Button\n          size=\"sm\"\n          variant=\"ghost\"\n          className=\"h-6 w-6 p-0\"\n          onClick={handleSave}\n          data-testid=\"save-token-value\"\n        >\n          <Check className=\"h-3 w-3\" />\n        </Button>\n        <Button\n          size=\"sm\"\n          variant=\"ghost\"\n          className=\"h-6 w-6 p-0\"\n          onClick={handleCancel}\n        >\n          <X className=\"h-3 w-3\" />\n        </Button>\n      </div>\n    );\n  }\n\n  return (\n    <button\n      className=\"text-xs text-muted-foreground hover:text-foreground transition-colors mt-1\"\n      onClick={() => setIsEditing(true)}\n      data-testid=\"edit-token-value\"\n    >\n      Edit value\n    </button>\n  );\n}\n\n/** Color picker for color tokens */\nfunction ColorTokenEditor({\n  token,\n  onEdit,\n  editable,\n}: {\n  token: DesignTokenWithUsage;\n  onEdit?: (token: DesignTokenWithUsage, newValue: string) => void;\n  editable?: boolean;\n}) {\n  const [localColor, setLocalColor] = useState(token.value);\n\n  const handleChange = useCallback(\n    (e: React.ChangeEvent<HTMLInputElement>) => {\n      const newValue = e.target.value;\n      setLocalColor(newValue);\n    },\n    []\n  );\n\n  const handleBlur = useCallback(() => {\n    if (localColor !== token.value) {\n      onEdit?.(token, localColor);\n    }\n  }, [localColor, token, onEdit]);\n\n  if (!editable || token.type !== \"color\") {\n    return null;\n  }\n\n  return (\n    <div className=\"flex items-center gap-2 mt-2\">\n      <input\n        type=\"color\"\n        value={localColor.startsWith(\"#\") ? localColor : \"#000000\"}\n        onChange={handleChange}\n        onBlur={handleBlur}\n        className=\"h-6 w-6 rounded cursor-pointer border-0\"\n        data-testid=\"color-picker\"\n      />\n      <Input\n        value={localColor}\n        onChange={(e) => setLocalColor(e.target.value)}\n        onBlur={handleBlur}\n        className=\"h-6 text-xs w-24 font-mono\"\n        data-testid=\"color-input\"\n      />\n    </div>\n  );\n}\n\n/** Token usage list */\nfunction TokenUsageList({\n  token,\n  onUsageClick,\n}: {\n  token: DesignTokenWithUsage;\n  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;\n}) {\n  if (!token.usages || token.usages.length === 0) {\n    return (\n      <span className=\"text-xs text-muted-foreground italic\">No usages found</span>\n    );\n  }\n\n  return (\n    <div className=\"space-y-1\">\n      {token.usages.map((usage, index) => (\n        <button\n          key={`${usage.componentName}-${usage.propertyName}-${index}`}\n          className=\"flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left\"\n          onClick={() => onUsageClick?.(token, usage)}\n          data-testid={`token-usage-${index}`}\n        >\n          <Badge variant=\"outline\" className=\"text-[10px] px-1 py-0\">\n            {usage.componentName}\n          </Badge>\n          <span className=\"font-mono\">{usage.propertyName}</span>\n          {usage.lineNumber && (\n            <span className=\"text-muted-foreground/60\">:L{usage.lineNumber}</span>\n          )}\n        </button>\n      ))}\n    </div>\n  );\n}\n\n/** Single token row/card */\nfunction TokenItem({\n  token,\n  onTokenEdit,\n  onTokenRename,\n  onTokenDelete,\n  onUsageClick,\n  editable,\n  showUsage,\n}: {\n  token: DesignTokenWithUsage;\n  onTokenEdit?: (token: DesignTokenWithUsage, newValue: string) => void;\n  onTokenRename?: (token: DesignTokenWithUsage, newName: string) => void;\n  onTokenDelete?: (token: DesignTokenWithUsage) => void;\n  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;\n  editable?: boolean;\n  showUsage?: boolean;\n}) {\n  const config = TOKEN_TYPE_CONFIG[token.type];\n\n  return (\n    <div\n      className=\"group flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors\"\n      data-testid={`token-item-${token.name}`}\n    >\n      {/* Preview */}\n      <div className=\"flex-shrink-0\">\n        <TokenPreview token={token} />\n      </div>\n\n      {/* Token info */}\n      <div className=\"flex-1 min-w-0\">\n        <div className=\"flex items-center gap-2\">\n          <EditableTokenName\n            token={token}\n            onRename={onTokenRename}\n            editable={editable}\n          />\n          <TooltipProvider>\n            <Tooltip>\n              <TooltipTrigger asChild>\n                <Badge variant=\"secondary\" className=\"text-[10px]\">\n                  {config?.icon}\n                </Badge>\n              </TooltipTrigger>\n              <TooltipContent>\n                <p>{config?.label || token.type}</p>\n              </TooltipContent>\n            </Tooltip>\n          </TooltipProvider>\n        </div>\n\n        {token.description && (\n          <p className=\"text-xs text-muted-foreground mt-1\">{token.description}</p>\n        )}\n\n        {token.figmaStyleName && token.figmaStyleName !== token.name && (\n          <p className=\"text-xs text-muted-foreground/60 mt-1\">\n            Figma: {token.figmaStyleName}\n          </p>\n        )}\n\n        {/* Editable value */}\n        <EditableTokenValue token={token} onEdit={onTokenEdit} editable={editable} />\n        <ColorTokenEditor token={token} onEdit={onTokenEdit} editable={editable} />\n\n        {/* Usage */}\n        {showUsage && (\n          <div className=\"mt-2 pt-2 border-t\">\n            <p className=\"text-xs font-medium mb-1\">\n              Usage ({token.usages?.length || 0})\n            </p>\n            <TokenUsageList token={token} onUsageClick={onUsageClick} />\n          </div>\n        )}\n      </div>\n\n      {/* Actions */}\n      <div className=\"flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity\">\n        <DropdownMenu>\n          <DropdownMenuTrigger asChild>\n            <Button variant=\"ghost\" size=\"sm\" className=\"h-6 w-6 p-0\">\n              <MoreVertical className=\"h-4 w-4\" />\n            </Button>\n          </DropdownMenuTrigger>\n          <DropdownMenuContent align=\"end\">\n            <DropdownMenuItem onClick={() => copyToClipboard(token.value)}>\n              <Copy className=\"h-4 w-4 mr-2\" />\n              Copy value\n            </DropdownMenuItem>\n            <DropdownMenuItem onClick={() => copyToClipboard(token.name)}>\n              <Copy className=\"h-4 w-4 mr-2\" />\n              Copy name\n            </DropdownMenuItem>\n            <DropdownMenuItem\n              onClick={() => copyToClipboard(`var(--${token.name})`)}\n            >\n              <Copy className=\"h-4 w-4 mr-2\" />\n              Copy as CSS var\n            </DropdownMenuItem>\n            {editable && onTokenDelete && (\n              <DropdownMenuItem\n                className=\"text-destructive\"\n                onClick={() => onTokenDelete(token)}\n              >\n                <X className=\"h-4 w-4 mr-2\" />\n                Delete\n              </DropdownMenuItem>\n            )}\n          </DropdownMenuContent>\n        </DropdownMenu>\n      </div>\n    </div>\n  );\n}\n\n/** Collapsible token group */\nfunction TokenGroupSection({\n  group,\n  onTokenEdit,\n  onTokenRename,\n  onTokenDelete,\n  onUsageClick,\n  editable,\n  showUsage,\n  defaultExpanded,\n}: {\n  group: TokenGroup;\n  onTokenEdit?: (token: DesignTokenWithUsage, newValue: string) => void;\n  onTokenRename?: (token: DesignTokenWithUsage, newName: string) => void;\n  onTokenDelete?: (token: DesignTokenWithUsage) => void;\n  onUsageClick?: (token: DesignTokenWithUsage, usage: TokenUsage) => void;\n  editable?: boolean;\n  showUsage?: boolean;\n  defaultExpanded?: boolean;\n}) {\n  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? true);\n\n  return (\n    <div className=\"border rounded-lg overflow-hidden\" data-testid={`token-group-${group.name}`}>\n      <button\n        className=\"flex items-center justify-between w-full p-3 bg-muted/50 hover:bg-muted transition-colors text-left\"\n        onClick={() => setIsExpanded(!isExpanded)}\n      >\n        <div className=\"flex items-center gap-2\">\n          {isExpanded ? (\n            <ChevronDown className=\"h-4 w-4\" />\n          ) : (\n            <ChevronRight className=\"h-4 w-4\" />\n          )}\n          <span className=\"font-medium\">{group.name}</span>\n          <Badge variant=\"secondary\" className=\"text-xs\">\n            {group.tokens.length}\n          </Badge>\n        </div>\n      </button>\n\n      {isExpanded && (\n        <div className=\"p-2 space-y-2\">\n          {group.tokens.map((token) => (\n            <TokenItem\n              key={`${token.type}-${token.name}`}\n              token={token}\n              onTokenEdit={onTokenEdit}\n              onTokenRename={onTokenRename}\n              onTokenDelete={onTokenDelete}\n              onUsageClick={onUsageClick}\n              editable={editable}\n              showUsage={showUsage}\n            />\n          ))}\n        </div>\n      )}\n    </div>\n  );\n}\n\n// ============================================================================\n// Main Component\n// ============================================================================\n\nexport function DesignTokenPanel({\n  tokens,\n  onTokenEdit,\n  onTokenRename,\n  onTokenDelete,\n  onUsageClick,\n  editable = false,\n  groupBy = \"type\",\n  defaultExpandedGroups,\n  className,\n}: DesignTokenPanelProps) {\n  const [searchQuery, setSearchQuery] = useState(\"\");\n  const [activeView, setActiveView] = useState<\"grid\" | \"list\">(\"list\");\n  const [showUsage, setShowUsage] = useState(false);\n\n  // Filter tokens by search query\n  const filteredTokens = useMemo(() => {\n    if (!searchQuery.trim()) return tokens;\n\n    const query = searchQuery.toLowerCase();\n    return tokens.filter(\n      (token) =>\n        token.name.toLowerCase().includes(query) ||\n        token.value.toLowerCase().includes(query) ||\n        token.type.toLowerCase().includes(query) ||\n        token.figmaStyleName?.toLowerCase().includes(query)\n    );\n  }, [tokens, searchQuery]);\n\n  // Group tokens\n  const groups = useMemo(() => {\n    if (groupBy === \"none\") {\n      return [{ name: \"All Tokens\", tokens: filteredTokens }];\n    }\n    if (groupBy === \"category\") {\n      return groupTokensByCategory(filteredTokens);\n    }\n    return groupTokensByType(filteredTokens);\n  }, [filteredTokens, groupBy]);\n\n  // Token type counts for tabs\n  const typeCounts = useMemo(() => {\n    const counts: Record<string, number> = { all: tokens.length };\n    for (const token of tokens) {\n      const category = TOKEN_TYPE_CONFIG[token.type]?.category || \"Other\";\n      counts[category] = (counts[category] || 0) + 1;\n    }\n    return counts;\n  }, [tokens]);\n\n  const [activeCategory, setActiveCategory] = useState(\"all\");\n\n  // Filter by category tab\n  const categoryFilteredGroups = useMemo(() => {\n    if (activeCategory === \"all\") return groups;\n\n    return groups.filter((group) => {\n      // Check if any token in the group matches the category\n      return group.tokens.some(\n        (token) => TOKEN_TYPE_CONFIG[token.type]?.category === activeCategory\n      );\n    });\n  }, [groups, activeCategory]);\n\n  return (\n    <div className={cn(\"flex flex-col h-full\", className)} data-testid=\"design-token-panel\">\n      {/* Header */}\n      <div className=\"p-4 border-b space-y-4\">\n        <div className=\"flex items-center justify-between\">\n          <div>\n            <h2 className=\"text-lg font-semibold\">Design Tokens</h2>\n            <p className=\"text-sm text-muted-foreground\">\n              {tokens.length} tokens extracted\n            </p>\n          </div>\n          <div className=\"flex items-center gap-2\">\n            <Button\n              variant={showUsage ? \"secondary\" : \"ghost\"}\n              size=\"sm\"\n              onClick={() => setShowUsage(!showUsage)}\n              data-testid=\"toggle-usage\"\n            >\n              <Eye className=\"h-4 w-4 mr-1\" />\n              Usage\n            </Button>\n          </div>\n        </div>\n\n        {/* Search */}\n        <div className=\"relative\">\n          <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground\" />\n          <Input\n            placeholder=\"Search tokens...\"\n            value={searchQuery}\n            onChange={(e) => setSearchQuery(e.target.value)}\n            className=\"pl-9\"\n            data-testid=\"token-search\"\n          />\n        </div>\n      </div>\n\n      {/* Category Tabs */}\n      <Tabs value={activeCategory} onValueChange={setActiveCategory} className=\"flex-1 flex flex-col overflow-hidden\">\n        <div className=\"border-b px-4\">\n          <TabsList className=\"h-9\">\n            <TabsTrigger value=\"all\" className=\"text-xs\">\n              All ({typeCounts.all})\n            </TabsTrigger>\n            {[\"Colors\", \"Typography\", \"Layout\", \"Borders\", \"Effects\"].map(\n              (category) =>\n                typeCounts[category] ? (\n                  <TabsTrigger key={category} value={category} className=\"text-xs\">\n                    {category} ({typeCounts[category]})\n                  </TabsTrigger>\n                ) : null\n            )}\n          </TabsList>\n        </div>\n\n        {/* Token List */}\n        <div className=\"flex-1 overflow-auto p-4 space-y-4\">\n          {categoryFilteredGroups.length === 0 ? (\n            <div className=\"text-center py-8 text-muted-foreground\">\n              <p>No tokens found</p>\n              {searchQuery && (\n                <Button\n                  variant=\"link\"\n                  size=\"sm\"\n                  onClick={() => setSearchQuery(\"\")}\n                >\n                  Clear search\n                </Button>\n              )}\n            </div>\n          ) : (\n            categoryFilteredGroups.map((group) => (\n              <TokenGroupSection\n                key={group.name}\n                group={group}\n                onTokenEdit={onTokenEdit}\n                onTokenRename={onTokenRename}\n                onTokenDelete={onTokenDelete}\n                onUsageClick={onUsageClick}\n                editable={editable}\n                showUsage={showUsage}\n                defaultExpanded={\n                  defaultExpandedGroups?.includes(group.name) ?? true\n                }\n              />\n            ))\n          )}\n        </div>\n      </Tabs>\n    </div>\n  );\n}\n\nexport default DesignTokenPanel;\n"
}
