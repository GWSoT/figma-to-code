/**
 * Verification test for IntegratedCodeEditor feature
 * Tests: syntax highlighting, find/replace, code folding, autocomplete, error highlighting
 */

import { test, expect } from "@playwright/test";

test.describe("IntegratedCodeEditor Feature Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the preview page
    await page.goto("/dashboard/preview");
    // Wait for the Monaco editor to load
    await page.waitForSelector(".monaco-editor", { timeout: 30000 });
  });

  test("should render Monaco editor with syntax highlighting", async ({ page }) => {
    // Check that Monaco editor is rendered
    const editor = page.locator(".monaco-editor");
    await expect(editor).toBeVisible();

    // Check that the editor has line numbers
    const lineNumbers = page.locator(".monaco-editor .line-numbers");
    await expect(lineNumbers.first()).toBeVisible();

    // Check that syntax highlighting is applied (look for token spans)
    const syntaxTokens = page.locator(".monaco-editor .mtk1, .monaco-editor .mtk3, .monaco-editor .mtk4, .monaco-editor .mtk5, .monaco-editor .mtk6, .monaco-editor .mtk8");
    const tokenCount = await syntaxTokens.count();
    expect(tokenCount).toBeGreaterThan(0);
  });

  test("should display file tabs with file type indicators", async ({ page }) => {
    // Check for Card.tsx file tab
    const cardTab = page.locator('button:has-text("Card.tsx")');
    await expect(cardTab).toBeVisible();

    // Check for CSS file tab
    const cssTab = page.locator('button:has-text("Card.module.css")');
    await expect(cssTab).toBeVisible();
  });

  test("should switch between files when clicking tabs", async ({ page }) => {
    // Click on CSS file tab
    const cssTab = page.locator('button:has-text("Card.module.css")');
    await cssTab.click();

    // Wait for content change
    await page.waitForTimeout(500);

    // Editor should now show CSS content
    const editorContent = page.locator(".monaco-editor .view-lines");
    await expect(editorContent).toContainText("font-family");
  });

  test("should show find/replace panel when clicking search button", async ({ page }) => {
    // Click the search button
    const searchButton = page.locator('button[title*="Find"]');
    await searchButton.click();

    // Find panel should appear with input
    const findInput = page.locator('input[placeholder="Find"]');
    await expect(findInput).toBeVisible();

    // Type a search term
    await findInput.fill("Card");
    await page.waitForTimeout(300);

    // Should show match count
    const matchCount = page.locator('text=/\\d+ match/');
    await expect(matchCount).toBeVisible();
  });

  test("should show replace functionality in find panel", async ({ page }) => {
    // Click the search button
    const searchButton = page.locator('button[title*="Find"]');
    await searchButton.click();

    // Expand replace section
    const expandButton = page.locator('.border-b.bg-muted\\/30 button:first-child');
    await expandButton.click();

    // Replace input should be visible
    const replaceInput = page.locator('input[placeholder="Replace"]');
    await expect(replaceInput).toBeVisible();

    // Replace buttons should be visible
    const replaceButton = page.locator('button:has-text("Replace")');
    await expect(replaceButton.first()).toBeVisible();

    const replaceAllButton = page.locator('button:has-text("Replace All")');
    await expect(replaceAllButton).toBeVisible();
  });

  test("should have code folding controls", async ({ page }) => {
    // Fold all button should exist
    const foldAllButton = page.locator('button[title="Fold All"]');
    await expect(foldAllButton).toBeVisible();

    // Unfold all button should exist
    const unfoldAllButton = page.locator('button[title="Unfold All"]');
    await expect(unfoldAllButton).toBeVisible();

    // Click fold all
    await foldAllButton.click();
    await page.waitForTimeout(300);

    // Click unfold all
    await unfoldAllButton.click();
    await page.waitForTimeout(300);
  });

  test("should display language badge for selected file", async ({ page }) => {
    // Should show typescript badge for .tsx file
    const languageBadge = page.locator('text="typescript"');
    await expect(languageBadge).toBeVisible();

    // Switch to CSS file
    const cssTab = page.locator('button:has-text("Card.module.css")');
    await cssTab.click();
    await page.waitForTimeout(500);

    // Should show css badge
    const cssBadge = page.locator('text="css"');
    await expect(cssBadge).toBeVisible();
  });

  test("should have copy button functionality", async ({ page }) => {
    // Copy button should exist
    const copyButton = page.locator('button:has-text("Copy")');
    await expect(copyButton).toBeVisible();

    // Click copy button
    await copyButton.click();

    // Should show "Copied!" text
    const copiedText = page.locator('button:has-text("Copied!")');
    await expect(copiedText).toBeVisible();
  });

  test("should have minimap visible", async ({ page }) => {
    // Minimap should be visible in the editor
    const minimap = page.locator(".monaco-editor .minimap");
    await expect(minimap).toBeVisible();
  });

  test("should support editing code", async ({ page }) => {
    // Focus the editor
    const editor = page.locator(".monaco-editor");
    await editor.click();

    // Type some text
    await page.keyboard.type("// Test comment");
    await page.waitForTimeout(300);

    // The typed text should appear in the editor
    const editorContent = page.locator(".monaco-editor .view-lines");
    await expect(editorContent).toContainText("// Test comment");
  });

  test("should show regex option in find panel", async ({ page }) => {
    // Click the search button
    const searchButton = page.locator('button[title*="Find"]');
    await searchButton.click();

    // Regex button should exist
    const regexButton = page.locator('button[title="Use Regular Expression"]');
    await expect(regexButton).toBeVisible();

    // Case sensitive button should exist
    const caseButton = page.locator('button[title="Match Case"]');
    await expect(caseButton).toBeVisible();

    // Whole word button should exist
    const wordButton = page.locator('button[title="Match Whole Word"]');
    await expect(wordButton).toBeVisible();
  });

  test("editor should be in the preview page Code tab", async ({ page }) => {
    // The Code tab should be selected by default
    const codeTab = page.locator('[data-state="active"]:has-text("Code")');
    await expect(codeTab).toBeVisible();

    // The Monaco editor should be in the tab content
    const editor = page.locator(".monaco-editor");
    await expect(editor).toBeVisible();
  });
});
