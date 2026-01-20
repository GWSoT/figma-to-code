I'll start by using the brainstorming skill since this is a creative feature implementation task that requires understanding user intent and design before implementation.

🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming",
  "args": "Allow users to annotate generated code with custom directives. Support preserve blocks that survive regeneration. Enable component-level customization hints. Parse annotations during merge."
}
I'll help you design this code annotation feature. Let me first understand the current project context.

🔧 Tool: Task
Input: {
  "prompt": "Explore the codebase to understand:\n1. How code generation currently works (look for any code generation, templates, or Figma-to-code conversion logic)\n2. How the IntegratedCodeEditor component works\n3. Any existing merge or regeneration logic\n4. The overall structure of the code export/generation pipeline\n\nFocus on files in src/components/, src/utils/, and any code generation related files. Return a summary of the key files and patterns found.",
  "description": "Explore code generation patterns",
  "subagent_type": "Explore"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/**/*.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/utils/**/*.ts"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -E \"(codegen|export|generate|template|merge)\" | head -20",
  "description": "Search for code generation and export related files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/IntegratedCodeEditor.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/code-export.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/figma/export-dialog.tsx"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/code-preview/**/*.tsx"
}
