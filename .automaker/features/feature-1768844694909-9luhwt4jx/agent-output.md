I'll implement this feature for displaying a Figma layer hierarchy in a navigable tree view. Let me start by exploring the codebase to understand the existing structure.

🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming",
  "args": "Display Figma layer hierarchy in navigable tree view with icons, expand/collapse, search, filtering, and code highlighting on selection"
}
I'll help you implement this Figma layer hierarchy feature. Let me first understand the current project context.

🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "Explore this codebase to understand:\n1. The overall project structure \n2. How the dashboard and preview routes work\n3. Any existing Figma-related code or components\n4. UI patterns used for tree views or hierarchical data\n5. How code preview/highlighting is currently implemented\n\nFocus on src/routes/dashboard/, src/components/, and any Figma-related files. Return a summary of findings relevant to implementing a Figma layer hierarchy tree view.",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -type f -name \"*.ts\" -o -name \"*.tsx\" | head -20",
  "description": "Get overview of TypeScript files in project"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/routes/**/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/**/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Grep
Input: {
  "pattern": "figma|layer|tree|hierarchy",
  "type": "tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code",
  "output_mode": "files_with_matches"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/preview.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/figma.tsx"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f \\( -name \"*figma*\" -o -name \"*tree*\" -o -name \"*layer*\" \\) | grep -v node_modules",
  "description": "Find Figma, tree, and layer related files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FigmaTeamsProjects.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/FrameExplorer.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/ui/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/design-preview.tsx",
  "limit": 100
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/code-preview/**/*.tsx",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/utils/code-generation-agent/**",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/code-generation-agent/types.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/SplitView.tsx",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -name \"*CodePreview*\" -o -name \"*code-preview*\" | head -20",
  "description": "Find CodePreview related files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/CodePreview.tsx",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/code-preview/types.ts"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/components/ | grep -i tree",
  "description": "Check for tree-related components"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/figma-api.ts",
  "limit": 150
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -name \"*.ts\" -type f | xargs grep -l \"interface FigmaNode\\|type FigmaNode\" | head -5",
  "description": "Find FigmaNode type definition"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/ | head -20",
  "description": "Check src directory structure"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/hooks/ | head -20",
  "description": "List hooks directory"
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"children\\|parent\\|hierarchy\\|tree\" /home/rainman/figma-to-code/figma-to-code/src/components --include=\"*.tsx\" | head -20",
  "description": "Search for hierarchy/tree patterns in components"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/db/",
  "description": "Check database directory"
}

🔧 Tool: Bash
Input: {
  "command": "grep -r \"FigmaFrameRecord\\|FigmaFileFrames\" /home/rainman/figma-to-code/figma-to-code/src --include=\"*.ts\" | head -10",
  "description": "Find Figma frame data structures"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "limit": 200
}

🔧 Tool: Bash
Input: {
  "command": "grep -A 30 \"export const figmaFrame\" /home/rainman/figma-to-code/figma-to-code/src/db/schema.ts | head -40",
  "description": "Get figmaFrame table schema"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/figma-files.ts",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "head -100 /home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/frames.tsx",
  "description": "Check frames route to see how data is displayed"
}
Excellent! I now have a comprehensive understanding of the codebase. Based on the feature description and the exploration, I have a clear picture of what needs to be built. Let me ask a key clarifying question:

**Where should the layer hierarchy tree be placed in the UI?**

A. **Replace the FrameExplorer** - The new tree view would become the main way to browse Figma content in `/dashboard/frames`
B. **Side panel in design-preview** - Add it as a left sidebar in the `/dashboard/design-preview` route alongside the existing split view (recommended)
C. **Standalone route** - Create a new `/dashboard/layers` route dedicated to the hierarchy view
D. **Floating/docked panel** - A toggleable panel that can be opened from any dashboard view

I recommend **Option B** because:
- The feature description mentions "highlight corresponding code on selection" - this integration makes most sense when viewing the design-preview
- The existing SplitView already has highlight state infrastructure we can leverage
- It keeps related functionality together (design preview + layer navigation)