I'll continue implementing the GitHub export feature. Let me first review what was explored and understand the current state of the codebase.

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/code-export.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/ExportCodeDialog.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts"
}
Now I have a good understanding of the codebase. I can see there's already:
1. A ZIP export system (`code-export.ts` and `ExportCodeDialog.tsx`)
2. OAuth for Figma accounts but no GitHub integration yet
3. The database schema with user and account tables

Let me create a todo list and implement the GitHub export feature:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Create GitHub account database schema",
      "status": "in_progress",
      "activeForm": "Creating GitHub account database schema"
    },
    {
      "content": "Implement GitHub OAuth and API utilities",
      "status": "pending",
      "activeForm": "Implementing GitHub OAuth and API utilities"
    },
    {
      "content": "Create GitHub export server functions",
      "status": "pending",
      "activeForm": "Creating GitHub export server functions"
    },
    {
      "content": "Build GitHub export dialog component",
      "status": "pending",
      "activeForm": "Building GitHub export dialog component"
    },
    {
      "content": "Add data access layer for GitHub accounts",
      "status": "pending",
      "activeForm": "Adding data access layer for GitHub accounts"
    },
    {
      "content": "Add hooks for GitHub integration",
      "status": "pending",
      "activeForm": "Adding hooks for GitHub integration"
    },
    {
      "content": "Verify with Playwright test",
      "status": "pending",
      "activeForm": "Verifying with Playwright test"
    }
  ]
}
Let me first check what authentication patterns exist and look at the existing docs:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/docs/authentication.md"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/docs/architecture.md"
}
Now let me look at the Figma account pattern to understand how OAuth integration for external services is handled:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/data-access/figma-accounts.ts"
}

🔧 Tool: Glob
Input: {
  "pattern": "src/routes/api/**/*.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/api/figma/callback.ts"
}
Now I have a clear understanding of how OAuth is handled. Let me also check the encryption utility and privateEnv:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/utils/encryption.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/config/privateEnv.ts"
}
Now I have a comprehensive understanding of the patterns. Let me start implementing the GitHub export feature. I'll begin with the database schema:

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/db/schema.ts",
  "offset": 840,
  "limit": 100
}
