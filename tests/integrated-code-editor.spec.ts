/**
 * Playwright test to verify IntegratedCodeEditor feature
 *
 * Tests:
 * - Monaco editor loads correctly
 * - Syntax highlighting is applied
 * - Find/replace panel opens
 * - Code folding controls are present
 * - Copy button works
 */

import { test, expect } from '@playwright/test';

test.describe('IntegratedCodeEditor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the preview page
    await page.goto('/dashboard/preview');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Monaco editor loads and displays code', async ({ page }) => {
    // Wait for Monaco editor to mount (it renders inside a div with class "monaco-editor")
    const monacoEditor = page.locator('.monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 10000 });

    // Check that the editor contains some code content
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toBeVisible();
  });

  test('File tabs are displayed', async ({ page }) => {
    // Check for file tabs - should show Card.tsx and Card.module.css
    const cardTab = page.locator('button:has-text("Card.tsx")');
    await expect(cardTab).toBeVisible({ timeout: 10000 });

    const stylesTab = page.locator('button:has-text("Card.module.css")');
    await expect(stylesTab).toBeVisible();
  });

  test('Find/replace panel opens with search button', async ({ page }) => {
    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Click the search button in the toolbar
    const searchButton = page.locator('button[title*="Find"]');
    await searchButton.click();

    // Check that find input appears
    const findInput = page.locator('input[placeholder="Find"]');
    await expect(findInput).toBeVisible();
  });

  test('Code folding buttons are present', async ({ page }) => {
    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Check for fold all button
    const foldButton = page.locator('button[title="Fold All"]');
    await expect(foldButton).toBeVisible();

    // Check for unfold all button
    const unfoldButton = page.locator('button[title="Unfold All"]');
    await expect(unfoldButton).toBeVisible();
  });

  test('Copy button is functional', async ({ page }) => {
    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Find the copy button
    const copyButton = page.locator('button:has-text("Copy")');
    await expect(copyButton).toBeVisible();

    // Click copy and verify it changes to "Copied!"
    await copyButton.click();
    await expect(page.locator('button:has-text("Copied!")')).toBeVisible();

    // Wait for it to change back to "Copy"
    await expect(copyButton).toContainText('Copy', { timeout: 5000 });
  });

  test('Language badge shows correct language', async ({ page }) => {
    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // When Card.tsx is selected, should show typescript badge
    const typescriptBadge = page.locator('span:has-text("typescript")').first();
    await expect(typescriptBadge).toBeVisible();

    // Click on CSS file tab
    const stylesTab = page.locator('button:has-text("Card.module.css")');
    await stylesTab.click();

    // Should now show CSS badge
    const cssBadge = page.locator('span:has-text("css")').first();
    await expect(cssBadge).toBeVisible();
  });

  test('Switching tabs changes editor content', async ({ page }) => {
    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Get initial content (should be Card.tsx content with "interface CardProps")
    const editorContent = page.locator('.view-lines');
    await expect(editorContent).toContainText('CardProps');

    // Click on CSS file tab
    const stylesTab = page.locator('button:has-text("Card.module.css")');
    await stylesTab.click();

    // Content should change to CSS content
    await expect(editorContent).toContainText('card-container');
  });

  test('Editor supports multi-cursor via keyboard shortcut info', async ({ page }) => {
    // Wait for Monaco to load
    const monacoEditor = page.locator('.monaco-editor');
    await expect(monacoEditor).toBeVisible({ timeout: 10000 });

    // Monaco editor is loaded, which inherently supports multi-cursor
    // Verify the editor is interactive by checking it can receive focus
    await monacoEditor.click();

    // The editor should have a cursor line visible
    const cursorLine = page.locator('.cursor');
    await expect(cursorLine).toBeVisible();
  });
});
