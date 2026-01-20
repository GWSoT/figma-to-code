/**
 * Temporary verification test for CodePreview feature
 * This test verifies the real-time preview functionality
 */

import { test, expect } from "@playwright/test";

test.describe("CodePreview Feature Verification", () => {
  test("should render the preview page with key elements", async ({ page }) => {
    // Navigate to the preview page
    await page.goto("/dashboard/preview");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check page title and header
    await expect(page.getByRole("heading", { name: "Code Preview" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Edit code and see changes in real-time")).toBeVisible();

    // Check for back button
    await expect(page.getByText(/back to frames/i)).toBeVisible();

    // Check for download button
    await expect(page.getByText(/download all/i)).toBeVisible();
  });

  test("should display tabs for code and settings", async ({ page }) => {
    await page.goto("/dashboard/preview");
    await page.waitForLoadState("networkidle");

    // Check for code tab
    await expect(page.getByRole("tab", { name: /code/i })).toBeVisible({ timeout: 10000 });

    // Check for settings tab
    await expect(page.getByRole("tab", { name: /settings/i })).toBeVisible();
  });

  test("should display live preview component", async ({ page }) => {
    await page.goto("/dashboard/preview");
    await page.waitForLoadState("networkidle");

    // Check for Live Preview header in the CodePreview component
    await expect(page.getByText("Live Preview")).toBeVisible({ timeout: 10000 });

    // The iframe should exist for preview
    await expect(page.locator('iframe[title="Component Preview"]')).toBeVisible({ timeout: 10000 });
  });

  test("should allow switching between code and settings tabs", async ({ page }) => {
    await page.goto("/dashboard/preview");
    await page.waitForLoadState("networkidle");

    // Click settings tab
    await page.getByRole("tab", { name: /settings/i }).click();

    // Check settings content is visible (framework dropdown)
    await expect(page.getByText(/framework/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/styling/i)).toBeVisible();

    // Click back to code tab
    await page.getByRole("tab", { name: /code/i }).click();
  });

  test("should show preview status badge", async ({ page }) => {
    await page.goto("/dashboard/preview");
    await page.waitForLoadState("networkidle");

    // Wait for preview to be ready
    await page.waitForTimeout(3000);

    // Check for status badge (either "Preview Ready" or "Loading...")
    const badge = page.locator('[class*="badge"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });
  });

  test("should have viewport presets in selector", async ({ page }) => {
    await page.goto("/dashboard/preview");
    await page.waitForLoadState("networkidle");

    // Click the viewport selector
    const viewportSelector = page.getByRole("combobox").first();
    await viewportSelector.click();

    // Check for device presets
    await expect(page.getByText("iPhone SE")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("iPad Mini")).toBeVisible();
  });
});
