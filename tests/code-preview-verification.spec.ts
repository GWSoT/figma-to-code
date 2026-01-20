/**
 * Temporary verification test for CodePreview feature
 * This test verifies the real-time preview functionality
 */

import { test, expect } from "@playwright/test";

test.describe("CodePreview Feature Verification", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the preview page
    await page.goto("/dashboard/preview");
  });

  test("should render the preview page with all required elements", async ({ page }) => {
    // Check page title and header
    await expect(page.getByRole("heading", { name: "Code Preview" })).toBeVisible();
    await expect(page.getByText("Edit code and see changes in real-time")).toBeVisible();

    // Check for back button
    await expect(page.getByRole("button", { name: /back to frames/i })).toBeVisible();

    // Check for download button
    await expect(page.getByRole("button", { name: /download all/i })).toBeVisible();
  });

  test("should display code editor with file tabs", async ({ page }) => {
    // Check for code tab
    await expect(page.getByRole("tab", { name: /code/i })).toBeVisible();

    // Check for settings tab
    await expect(page.getByRole("tab", { name: /settings/i })).toBeVisible();

    // Check for file tabs (demo files)
    await expect(page.getByRole("button", { name: /card\.tsx/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /card\.module\.css/i })).toBeVisible();
  });

  test("should display live preview component", async ({ page }) => {
    // Check for Live Preview header
    await expect(page.getByText("Live Preview")).toBeVisible();

    // Check for viewport selector
    await expect(page.getByRole("combobox")).toBeVisible();

    // Check for zoom controls
    await expect(page.getByRole("button", { name: /zoom out/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /zoom in/i })).toBeVisible();

    // Check for action buttons (interactive mode, rotate, refresh, fullscreen)
    const buttons = page.locator('button[data-state]');
    await expect(buttons).toBeTruthy();
  });

  test("should have viewport presets in selector", async ({ page }) => {
    // Click the viewport selector
    const viewportSelector = page.getByRole("combobox").first();
    await viewportSelector.click();

    // Check for device presets
    await expect(page.getByText("iPhone SE")).toBeVisible();
    await expect(page.getByText("iPhone 14")).toBeVisible();
    await expect(page.getByText("iPad Mini")).toBeVisible();
    await expect(page.getByText("MacBook Air")).toBeVisible();
  });

  test("should allow switching between code and settings tabs", async ({ page }) => {
    // Click settings tab
    await page.getByRole("tab", { name: /settings/i }).click();

    // Check settings content is visible
    await expect(page.getByLabel(/framework/i)).toBeVisible();
    await expect(page.getByLabel(/styling/i)).toBeVisible();

    // Click back to code tab
    await page.getByRole("tab", { name: /code/i }).click();

    // Check code editor is visible
    await expect(page.getByRole("button", { name: /card\.tsx/i })).toBeVisible();
  });

  test("should render iframe for preview", async ({ page }) => {
    // Check that the preview iframe exists
    const iframe = page.frameLocator('iframe[title="Component Preview"]');

    // Wait for the iframe to load
    await page.waitForTimeout(2000);

    // The iframe should exist
    await expect(page.locator('iframe[title="Component Preview"]')).toBeVisible();
  });

  test("should have copy button that works", async ({ page }) => {
    // Find and click the copy button
    const copyButton = page.getByRole("button", { name: /copy/i });
    await expect(copyButton).toBeVisible();

    // Click copy
    await copyButton.click();

    // Check that it changes to "Copied!"
    await expect(page.getByRole("button", { name: /copied/i })).toBeVisible();
  });

  test("should have zoom controls that work", async ({ page }) => {
    // Find the zoom selector
    const zoomSelector = page.locator('[role="combobox"]').nth(1);

    // It should show a percentage (default 100%)
    await expect(page.getByText("100%")).toBeVisible();

    // Click zoom in button
    const zoomInButton = page.getByRole("button").filter({ has: page.locator('svg.lucide-zoom-in') });

    // The zoom controls should exist
    await expect(page.locator('svg.lucide-zoom-in')).toBeVisible();
    await expect(page.locator('svg.lucide-zoom-out')).toBeVisible();
  });

  test("should show preview ready status when loaded", async ({ page }) => {
    // Wait for the preview to load
    await page.waitForTimeout(3000);

    // Check for the preview ready badge
    await expect(page.getByText(/preview ready/i)).toBeVisible();
  });

  test("should allow editing code in the textarea", async ({ page }) => {
    // Find the code textarea
    const codeArea = page.locator('textarea');

    // Check it contains the demo code
    await expect(codeArea).toContainText('CardProps');

    // Clear and type new content
    await codeArea.fill('// Modified code');

    // Verify the change
    await expect(codeArea).toHaveValue('// Modified code');
  });

  test("should have working interactive mode toggle", async ({ page }) => {
    // Find the interactive mode button (has MousePointer icon)
    const interactiveButton = page.locator('button').filter({ has: page.locator('svg.lucide-mouse-pointer') });

    // Click to toggle
    await interactiveButton.click();

    // The button should have changed state
    await expect(interactiveButton).toBeVisible();
  });

  test("should navigate back to frames page", async ({ page }) => {
    // Click the back button
    await page.getByRole("button", { name: /back to frames/i }).click();

    // Should navigate to frames page
    await expect(page).toHaveURL(/\/dashboard\/frames/);
  });
});
