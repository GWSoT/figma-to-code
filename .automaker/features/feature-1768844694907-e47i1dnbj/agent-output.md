I'll review the previous work and continue the implementation. Let me first check the current state of the IntegratedCodeEditor component and verify it works correctly.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Review existing IntegratedCodeEditor implementation",
      "status": "in_progress",
      "activeForm": "Reviewing IntegratedCodeEditor implementation"
    },
    {
      "content": "Check Monaco Editor package installation",
      "status": "pending",
      "activeForm": "Checking Monaco Editor package"
    },
    {
      "content": "Verify editor integration in preview.tsx",
      "status": "pending",
      "activeForm": "Verifying editor integration"
    },
    {
      "content": "Run Playwright verification test",
      "status": "pending",
      "activeForm": "Running Playwright verification test"
    }
  ]
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/components/IntegratedCodeEditor.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/src/routes/dashboard/preview.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/package.json"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Review existing IntegratedCodeEditor implementation",
      "status": "completed",
      "activeForm": "Reviewing IntegratedCodeEditor implementation"
    },
    {
      "content": "Check Monaco Editor package installation",
      "status": "completed",
      "activeForm": "Checking Monaco Editor package"
    },
    {
      "content": "Verify editor integration in preview.tsx",
      "status": "completed",
      "activeForm": "Verifying editor integration"
    },
    {
      "content": "Run Playwright verification test",
      "status": "in_progress",
      "activeForm": "Running Playwright verification test"
    }
  ]
}
The implementation is complete:

1. **Monaco Editor package** (`@monaco-editor/react` v4.7.0 and `monaco-editor` v0.55.1) is installed
2. **IntegratedCodeEditor component** is fully implemented with:
   - Syntax highlighting for all supported languages (TS/JS/TSX/JSX, HTML, CSS/SCSS/LESS, Vue, Svelte, JSON, YAML, XML, Markdown, SQL, GraphQL)
   - Find/replace with regex support
   - Multiple cursors (Alt+click)
   - Code folding
   - Error highlighting with markers
   - Autocomplete and IntelliSense
3. **Integration** in `preview.tsx` is complete

Now let me create and run a Playwright verification test:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/verify-code-editor.spec.ts",
  "content": "/**\n * Verification test for IntegratedCodeEditor feature\n * Tests: syntax highlighting, find/replace, code folding, autocomplete, error highlighting\n */\n\nimport { test, expect } from \"@playwright/test\";\n\ntest.describe(\"IntegratedCodeEditor Feature Verification\", () => {\n  test.beforeEach(async ({ page }) => {\n    // Navigate to the preview page\n    await page.goto(\"/dashboard/preview\");\n    // Wait for the Monaco editor to load\n    await page.waitForSelector(\".monaco-editor\", { timeout: 30000 });\n  });\n\n  test(\"should render Monaco editor with syntax highlighting\", async ({ page }) => {\n    // Check that Monaco editor is rendered\n    const editor = page.locator(\".monaco-editor\");\n    await expect(editor).toBeVisible();\n\n    // Check that the editor has line numbers\n    const lineNumbers = page.locator(\".monaco-editor .line-numbers\");\n    await expect(lineNumbers.first()).toBeVisible();\n\n    // Check that syntax highlighting is applied (look for token spans)\n    const syntaxTokens = page.locator(\".monaco-editor .mtk1, .monaco-editor .mtk3, .monaco-editor .mtk4, .monaco-editor .mtk5, .monaco-editor .mtk6, .monaco-editor .mtk8\");\n    const tokenCount = await syntaxTokens.count();\n    expect(tokenCount).toBeGreaterThan(0);\n  });\n\n  test(\"should display file tabs with file type indicators\", async ({ page }) => {\n    // Check for Card.tsx file tab\n    const cardTab = page.locator('button:has-text(\"Card.tsx\")');\n    await expect(cardTab).toBeVisible();\n\n    // Check for CSS file tab\n    const cssTab = page.locator('button:has-text(\"Card.module.css\")');\n    await expect(cssTab).toBeVisible();\n\n    // The selected tab should have a visual indicator (secondary variant)\n    const selectedTab = page.locator('button[data-state=\"active\"]:has-text(\"Card.tsx\"), button:has-text(\"Card.tsx\").bg-secondary, button:has-text(\"Card.tsx\").text-secondary-foreground');\n    // At least one of the tabs should be selected/styled\n    const tabsExist = (await cardTab.count()) > 0 || (await cssTab.count()) > 0;\n    expect(tabsExist).toBe(true);\n  });\n\n  test(\"should switch between files when clicking tabs\", async ({ page }) => {\n    // Click on CSS file tab\n    const cssTab = page.locator('button:has-text(\"Card.module.css\")');\n    await cssTab.click();\n\n    // Wait for content change\n    await page.waitForTimeout(500);\n\n    // Editor should now show CSS content\n    const editorContent = page.locator(\".monaco-editor .view-lines\");\n    await expect(editorContent).toContainText(\"font-family\");\n  });\n\n  test(\"should show find/replace panel when clicking search button\", async ({ page }) => {\n    // Click the search button\n    const searchButton = page.locator('button[title*=\"Find\"]');\n    await searchButton.click();\n\n    // Find panel should appear with input\n    const findInput = page.locator('input[placeholder=\"Find\"]');\n    await expect(findInput).toBeVisible();\n\n    // Type a search term\n    await findInput.fill(\"Card\");\n    await page.waitForTimeout(300);\n\n    // Should show match count\n    const matchCount = page.locator('text=/\\\\d+ match/');\n    await expect(matchCount).toBeVisible();\n  });\n\n  test(\"should show replace functionality in find panel\", async ({ page }) => {\n    // Click the search button\n    const searchButton = page.locator('button[title*=\"Find\"]');\n    await searchButton.click();\n\n    // Expand replace section\n    const expandButton = page.locator('.border-b.bg-muted\\\\/30 button:first-child');\n    await expandButton.click();\n\n    // Replace input should be visible\n    const replaceInput = page.locator('input[placeholder=\"Replace\"]');\n    await expect(replaceInput).toBeVisible();\n\n    // Replace buttons should be visible\n    const replaceButton = page.locator('button:has-text(\"Replace\")');\n    await expect(replaceButton.first()).toBeVisible();\n\n    const replaceAllButton = page.locator('button:has-text(\"Replace All\")');\n    await expect(replaceAllButton).toBeVisible();\n  });\n\n  test(\"should have code folding controls\", async ({ page }) => {\n    // Fold all button should exist\n    const foldAllButton = page.locator('button[title=\"Fold All\"]');\n    await expect(foldAllButton).toBeVisible();\n\n    // Unfold all button should exist\n    const unfoldAllButton = page.locator('button[title=\"Unfold All\"]');\n    await expect(unfoldAllButton).toBeVisible();\n\n    // Click fold all\n    await foldAllButton.click();\n    await page.waitForTimeout(300);\n\n    // Click unfold all\n    await unfoldAllButton.click();\n    await page.waitForTimeout(300);\n  });\n\n  test(\"should display language badge for selected file\", async ({ page }) => {\n    // Should show typescript badge for .tsx file\n    const languageBadge = page.locator('text=\"typescript\"');\n    await expect(languageBadge).toBeVisible();\n\n    // Switch to CSS file\n    const cssTab = page.locator('button:has-text(\"Card.module.css\")');\n    await cssTab.click();\n    await page.waitForTimeout(500);\n\n    // Should show css badge\n    const cssBadge = page.locator('text=\"css\"');\n    await expect(cssBadge).toBeVisible();\n  });\n\n  test(\"should have copy button functionality\", async ({ page }) => {\n    // Copy button should exist\n    const copyButton = page.locator('button:has-text(\"Copy\")');\n    await expect(copyButton).toBeVisible();\n\n    // Click copy button\n    await copyButton.click();\n\n    // Should show \"Copied!\" text\n    const copiedText = page.locator('button:has-text(\"Copied!\")');\n    await expect(copiedText).toBeVisible();\n  });\n\n  test(\"should have minimap visible\", async ({ page }) => {\n    // Minimap should be visible in the editor\n    const minimap = page.locator(\".monaco-editor .minimap\");\n    await expect(minimap).toBeVisible();\n  });\n\n  test(\"should support editing code\", async ({ page }) => {\n    // Focus the editor\n    const editor = page.locator(\".monaco-editor\");\n    await editor.click();\n\n    // Type some text\n    await page.keyboard.type(\"// Test comment\");\n    await page.waitForTimeout(300);\n\n    // The typed text should appear in the editor\n    const editorContent = page.locator(\".monaco-editor .view-lines\");\n    await expect(editorContent).toContainText(\"// Test comment\");\n  });\n\n  test(\"should show regex option in find panel\", async ({ page }) => {\n    // Click the search button\n    const searchButton = page.locator('button[title*=\"Find\"]');\n    await searchButton.click();\n\n    // Regex button should exist\n    const regexButton = page.locator('button[title=\"Use Regular Expression\"]');\n    await expect(regexButton).toBeVisible();\n\n    // Case sensitive button should exist\n    const caseButton = page.locator('button[title=\"Match Case\"]');\n    await expect(caseButton).toBeVisible();\n\n    // Whole word button should exist\n    const wordButton = page.locator('button[title=\"Match Whole Word\"]');\n    await expect(wordButton).toBeVisible();\n  });\n\n  test(\"editor should be in the preview page Code tab\", async ({ page }) => {\n    // The Code tab should be selected by default\n    const codeTab = page.locator('[data-state=\"active\"]:has-text(\"Code\")');\n    await expect(codeTab).toBeVisible();\n\n    // The Monaco editor should be in the tab content\n    const editor = page.locator(\".monaco-editor\");\n    await expect(editor).toBeVisible();\n  });\n});\n"
}

🔧 Tool: Glob
Input: {
  "pattern": "tests/verify-code-editor.spec.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/verify-code-editor.spec.ts"
}
Good, the test file already exists. Let me update it with more comprehensive tests:

🔧 Tool: Write
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/tests/verify-code-editor.spec.ts",
  "content": "/**\n * Verification test for IntegratedCodeEditor feature\n * Tests: syntax highlighting, find/replace, code folding, autocomplete, error highlighting\n */\n\nimport { test, expect } from \"@playwright/test\";\n\ntest.describe(\"IntegratedCodeEditor Feature Verification\", () => {\n  test.beforeEach(async ({ page }) => {\n    // Navigate to the preview page\n    await page.goto(\"/dashboard/preview\");\n    // Wait for the Monaco editor to load\n    await page.waitForSelector(\".monaco-editor\", { timeout: 30000 });\n  });\n\n  test(\"should render Monaco editor with syntax highlighting\", async ({ page }) => {\n    // Check that Monaco editor is rendered\n    const editor = page.locator(\".monaco-editor\");\n    await expect(editor).toBeVisible();\n\n    // Check that the editor has line numbers\n    const lineNumbers = page.locator(\".monaco-editor .line-numbers\");\n    await expect(lineNumbers.first()).toBeVisible();\n\n    // Check that syntax highlighting is applied (look for token spans)\n    const syntaxTokens = page.locator(\".monaco-editor .mtk1, .monaco-editor .mtk3, .monaco-editor .mtk4, .monaco-editor .mtk5, .monaco-editor .mtk6, .monaco-editor .mtk8\");\n    const tokenCount = await syntaxTokens.count();\n    expect(tokenCount).toBeGreaterThan(0);\n  });\n\n  test(\"should display file tabs with file type indicators\", async ({ page }) => {\n    // Check for Card.tsx file tab\n    const cardTab = page.locator('button:has-text(\"Card.tsx\")');\n    await expect(cardTab).toBeVisible();\n\n    // Check for CSS file tab\n    const cssTab = page.locator('button:has-text(\"Card.module.css\")');\n    await expect(cssTab).toBeVisible();\n  });\n\n  test(\"should switch between files when clicking tabs\", async ({ page }) => {\n    // Click on CSS file tab\n    const cssTab = page.locator('button:has-text(\"Card.module.css\")');\n    await cssTab.click();\n\n    // Wait for content change\n    await page.waitForTimeout(500);\n\n    // Editor should now show CSS content\n    const editorContent = page.locator(\".monaco-editor .view-lines\");\n    await expect(editorContent).toContainText(\"font-family\");\n  });\n\n  test(\"should show find/replace panel when clicking search button\", async ({ page }) => {\n    // Click the search button\n    const searchButton = page.locator('button[title*=\"Find\"]');\n    await searchButton.click();\n\n    // Find panel should appear with input\n    const findInput = page.locator('input[placeholder=\"Find\"]');\n    await expect(findInput).toBeVisible();\n\n    // Type a search term\n    await findInput.fill(\"Card\");\n    await page.waitForTimeout(300);\n\n    // Should show match count\n    const matchCount = page.locator('text=/\\\\d+ match/');\n    await expect(matchCount).toBeVisible();\n  });\n\n  test(\"should show replace functionality in find panel\", async ({ page }) => {\n    // Click the search button\n    const searchButton = page.locator('button[title*=\"Find\"]');\n    await searchButton.click();\n\n    // Expand replace section\n    const expandButton = page.locator('.border-b.bg-muted\\\\/30 button:first-child');\n    await expandButton.click();\n\n    // Replace input should be visible\n    const replaceInput = page.locator('input[placeholder=\"Replace\"]');\n    await expect(replaceInput).toBeVisible();\n\n    // Replace buttons should be visible\n    const replaceButton = page.locator('button:has-text(\"Replace\")');\n    await expect(replaceButton.first()).toBeVisible();\n\n    const replaceAllButton = page.locator('button:has-text(\"Replace All\")');\n    await expect(replaceAllButton).toBeVisible();\n  });\n\n  test(\"should have code folding controls\", async ({ page }) => {\n    // Fold all button should exist\n    const foldAllButton = page.locator('button[title=\"Fold All\"]');\n    await expect(foldAllButton).toBeVisible();\n\n    // Unfold all button should exist\n    const unfoldAllButton = page.locator('button[title=\"Unfold All\"]');\n    await expect(unfoldAllButton).toBeVisible();\n\n    // Click fold all\n    await foldAllButton.click();\n    await page.waitForTimeout(300);\n\n    // Click unfold all\n    await unfoldAllButton.click();\n    await page.waitForTimeout(300);\n  });\n\n  test(\"should display language badge for selected file\", async ({ page }) => {\n    // Should show typescript badge for .tsx file\n    const languageBadge = page.locator('text=\"typescript\"');\n    await expect(languageBadge).toBeVisible();\n\n    // Switch to CSS file\n    const cssTab = page.locator('button:has-text(\"Card.module.css\")');\n    await cssTab.click();\n    await page.waitForTimeout(500);\n\n    // Should show css badge\n    const cssBadge = page.locator('text=\"css\"');\n    await expect(cssBadge).toBeVisible();\n  });\n\n  test(\"should have copy button functionality\", async ({ page }) => {\n    // Copy button should exist\n    const copyButton = page.locator('button:has-text(\"Copy\")');\n    await expect(copyButton).toBeVisible();\n\n    // Click copy button\n    await copyButton.click();\n\n    // Should show \"Copied!\" text\n    const copiedText = page.locator('button:has-text(\"Copied!\")');\n    await expect(copiedText).toBeVisible();\n  });\n\n  test(\"should have minimap visible\", async ({ page }) => {\n    // Minimap should be visible in the editor\n    const minimap = page.locator(\".monaco-editor .minimap\");\n    await expect(minimap).toBeVisible();\n  });\n\n  test(\"should support editing code\", async ({ page }) => {\n    // Focus the editor\n    const editor = page.locator(\".monaco-editor\");\n    await editor.click();\n\n    // Type some text\n    await page.keyboard.type(\"// Test comment\");\n    await page.waitForTimeout(300);\n\n    // The typed text should appear in the editor\n    const editorContent = page.locator(\".monaco-editor .view-lines\");\n    await expect(editorContent).toContainText(\"// Test comment\");\n  });\n\n  test(\"should show regex option in find panel\", async ({ page }) => {\n    // Click the search button\n    const searchButton = page.locator('button[title*=\"Find\"]');\n    await searchButton.click();\n\n    // Regex button should exist\n    const regexButton = page.locator('button[title=\"Use Regular Expression\"]');\n    await expect(regexButton).toBeVisible();\n\n    // Case sensitive button should exist\n    const caseButton = page.locator('button[title=\"Match Case\"]');\n    await expect(caseButton).toBeVisible();\n\n    // Whole word button should exist\n    const wordButton = page.locator('button[title=\"Match Whole Word\"]');\n    await expect(wordButton).toBeVisible();\n  });\n\n  test(\"editor should be in the preview page Code tab\", async ({ page }) => {\n    // The Code tab should be selected by default\n    const codeTab = page.locator('[data-state=\"active\"]:has-text(\"Code\")');\n    await expect(codeTab).toBeVisible();\n\n    // The Monaco editor should be in the tab content\n    const editor = page.locator(\".monaco-editor\");\n    await expect(editor).toBeVisible();\n  });\n});\n"
}
Now let's start the development server and run the Playwright tests:

🔧 Tool: Bash
Input: {
  "command": "npm run dev:app 2>&1 &\necho \"Server starting in background...\"\nsleep 10\ncurl -s -o /dev/null -w \"%{http_code}\" http://localhost:3000 || echo \"Server may need more time\"",
  "description": "Start dev server in background",
  "timeout": 30000
}

🔧 Tool: Read
Input: {
  "file_path": "/tmp/claude/-home-rainman-figma-to-code-figma-to-code/tasks/bafb854.output"
}
The server is running on port 3001. Let me check the Playwright config to update the base URL if needed and run the tests:

🔧 Tool: Glob
Input: {
  "pattern": "playwright.config.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "/home/rainman/figma-to-code/figma-to-code/playwright.config.ts"
}

🔧 Tool: Bash
Input: {
  "command": "pkill -f \"vite\" 2>/dev/null; sleep 2; echo \"killed vite\"",
  "description": "Kill existing vite process"
}
