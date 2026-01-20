I'll implement an AI agent that reviews generated code for quality. Let me start by exploring the codebase to understand the existing structure, particularly around code generation utilities.

🔧 Tool: Skill
Input: {
  "skill": "superpowers:brainstorming",
  "args": "AI agent that reviews generated code for quality - checking best practices, accessibility, performance, security, suggesting improvements, catching common mistakes, and supporting custom review rules"
}
I'll help design an AI code review agent. Let me first understand the current project context.

🔧 Tool: Task
Input: {
  "description": "Explore codebase structure",
  "prompt": "Explore this codebase to understand:\n1. The existing code generation utilities in src/utils/ - especially any LLM or orchestrator related code\n2. How code generators work (look for generator patterns)\n3. Any existing review or validation patterns\n4. The overall project structure for utility functions\n\nFocus on understanding the patterns used so we can design a code review agent that fits. Return a summary of what you find.",
  "subagent_type": "Explore"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/utils -type f -name \"*.ts\" -o -name \"*.tsx\" | head -20",
  "description": "Find TypeScript files in utils directory"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/utils/**/*.ts",
  "path": "/home/rainman/figma-to-code/figma-to-code"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/llm/index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/llm/client.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/llm/base-provider.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/orchestrator/index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/orchestrator/types.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/orchestrator/workflow-executor.ts",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/prop-interface-generator.ts",
  "limit": 80
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/tailwind-generator.ts",
  "limit": 80
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/styled-components-generator.ts",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -type f -name \"*review*\" -o -name \"*validation*\" -o -name \"*validate*\" 2>/dev/null",
  "description": "Find review and validation related files"
}

🔧 Tool: Grep
Input: {
  "pattern": "export\\s+(function|class|const|interface|type).*[Rr]eview",
  "type": "ts",
  "path": "/home/rainman/figma-to-code/figma-to-code/src/utils"
}

🔧 Tool: Grep
Input: {
  "pattern": "export\\s+(function|class|const|interface|type).*[Vv]alidat",
  "type": "ts",
  "path": "/home/rainman/figma-to-code/figma-to-code/src/utils"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/error.ts"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/utils/*generator*.ts",
  "description": "List all generator files"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/llm/retry.ts",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src/types -name \"*llm*\" 2>/dev/null",
  "description": "Find LLM type definitions"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/orchestrator/workflow-builder.ts",
  "limit": 80
}

🔧 Tool: Bash
Input: {
  "command": "head -200 /home/rainman/figma-to-code/figma-to-code/src/utils/llm/providers/anthropic.ts",
  "description": "Preview Anthropic provider implementation"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la /home/rainman/figma-to-code/figma-to-code/src/ | head -30",
  "description": "List main src directories"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code/src -maxdepth 1 -type d | sort",
  "description": "Find all top-level directories in src"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/types/llm.ts",
  "limit": 120
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/orchestrator/task-graph.ts",
  "limit": 100
}

🔧 Tool: Bash
Input: {
  "command": "wc -l /home/rainman/figma-to-code/figma-to-code/src/utils/orchestrator/*.ts",
  "description": "Get line counts for orchestrator files"
}

🔧 Tool: Bash
Input: {
  "command": "grep -l \"class\\|interface\\|export\" /home/rainman/figma-to-code/figma-to-code/src/utils/llm/providers/*.ts",
  "description": "List provider files"
}

🔧 Tool: Bash
Input: {
  "command": "grep -h \"^export\" /home/rainman/figma-to-code/figma-to-code/src/utils/*generator*.ts | head -30",
  "description": "Get export signatures from generators"
}

🔧 Tool: Bash
Input: {
  "command": "head -50 /home/rainman/figma-to-code/figma-to-code/src/utils/semantic-list-generator.ts",
  "description": "Preview semantic list generator"
}

🔧 Tool: Bash
Input: {
  "command": "ls -lh /home/rainman/figma-to-code/figma-to-code/src/utils/llm/",
  "description": "List LLM utilities"
}

🔧 Tool: Bash
Input: {
  "command": "find /home/rainman/figma-to-code/figma-to-code -name \"*.spec.ts\" -o -name \"*.test.ts\" 2>/dev/null | head -20",
  "description": "Find test files"
}

🔧 Tool: Bash
Input: {
  "command": "head -100 /home/rainman/figma-to-code/figma-to-code/tests/slot-pattern-detector.spec.ts 2>/dev/null || echo \"File doesn't exist yet\"",
  "description": "Check if test file exists"
}

🔧 Tool: Bash
Input: {
  "command": "cat /home/rainman/figma-to-code/figma-to-code/package.json | grep -A 20 '\"scripts\"' | head -25",
  "description": "Check npm scripts"
}
This is very helpful. Now I understand the existing architecture. Let me ask you a few questions to refine the design.

**First question:** Who will be the primary user of this code review agent?

1. **Developers using the Figma-to-Code tool** - Review the generated React/Svelte/Vue components before integration
2. **CI/CD pipelines** - Automated quality gates for generated code
3. **Both** - Interactive review for developers + automated checks in pipelines
4. **Other** - Please describe