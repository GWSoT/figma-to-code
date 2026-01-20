/**
 * Temporary Playwright test to verify DesignTokenPanel feature
 *
 * Core verification tests for:
 * - Token panel tab visibility
 * - Token display with previews
 * - Token editing capability
 */

import { test, expect } from '@playwright/test';

test.describe('DesignTokenPanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/preview');
    await page.waitForLoadState('networkidle');
  });

  test('Tokens tab is visible and clicking shows token panel', async ({ page }) => {
    // Check that the Tokens tab exists
    const tokensTab = page.locator('[data-testid="tokens-tab"]');
    await expect(tokensTab).toBeVisible({ timeout: 15000 });

    // Click the Tokens tab
    await tokensTab.click();

    // Token panel should be visible
    const tokenPanel = page.locator('[data-testid="design-token-panel"]');
    await expect(tokenPanel).toBeVisible({ timeout: 5000 });

    // Should show "Design Tokens" header
    await expect(tokenPanel).toContainText('Design Tokens');
    await expect(tokenPanel).toContainText('tokens extracted');
  });

  test('Token panel displays color tokens with visual previews', async ({ page }) => {
    await page.locator('[data-testid="tokens-tab"]').click();
    await page.waitForSelector('[data-testid="design-token-panel"]');

    // Color tokens should be visible
    const colorsGroup = page.locator('[data-testid="token-group-Colors"]');
    await expect(colorsGroup).toBeVisible();

    // Should display a color token with preview
    const primaryToken = page.locator('[data-testid="token-item-primary"]');
    await expect(primaryToken).toBeVisible();
  });

  test('Token search filters tokens', async ({ page }) => {
    await page.locator('[data-testid="tokens-tab"]').click();
    await page.waitForSelector('[data-testid="design-token-panel"]');

    const searchInput = page.locator('[data-testid="token-search"]');
    await searchInput.fill('shadow');

    // Shadow tokens should be visible after search
    await expect(page.locator('[data-testid="token-item-shadow-lg"]')).toBeVisible();
  });

  test('Color tokens have color picker for editing', async ({ page }) => {
    await page.locator('[data-testid="tokens-tab"]').click();
    await page.waitForSelector('[data-testid="design-token-panel"]');

    const primaryToken = page.locator('[data-testid="token-item-primary"]');

    // Color picker should be visible
    const colorPicker = primaryToken.locator('[data-testid="color-picker"]');
    await expect(colorPicker).toBeVisible();

    const colorInput = primaryToken.locator('[data-testid="color-input"]');
    await expect(colorInput).toBeVisible();
  });

  test('Usage toggle reveals token usages', async ({ page }) => {
    await page.locator('[data-testid="tokens-tab"]').click();
    await page.waitForSelector('[data-testid="design-token-panel"]');

    const usageToggle = page.locator('[data-testid="toggle-usage"]');
    await usageToggle.click();

    // Tokens with usages should now show usage info
    const primaryToken = page.locator('[data-testid="token-item-primary"]');
    await expect(primaryToken).toContainText('Usage');
  });
});
