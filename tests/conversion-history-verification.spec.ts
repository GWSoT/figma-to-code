/**
 * Temporary Playwright test to verify Conversion History feature
 *
 * Tests:
 * - History navigation link in sidebar
 * - History page loads with main elements
 * - Statistics panel displays
 * - Search and filter controls work
 * - Breadcrumb navigation present
 */

import { test, expect } from '@playwright/test';

test.describe('Conversion History Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('History navigation link is visible in sidebar', async ({ page }) => {
    // Check that the History link exists in the sidebar
    const historyLink = page.locator('a[href="/dashboard/history"]');
    await expect(historyLink).toBeVisible({ timeout: 15000 });

    // Verify it has the History text
    await expect(historyLink).toContainText('History');
  });

  test('Can navigate to history page via sidebar', async ({ page }) => {
    // Click on the History link
    const historyLink = page.locator('a[href="/dashboard/history"]');
    await historyLink.click();

    // Wait for navigation
    await page.waitForURL('**/dashboard/history');

    // Verify we're on the history page
    await expect(page).toHaveURL(/\/dashboard\/history/);
  });

  test('History page displays main heading', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Check for the main page heading
    const heading = page.locator('h1:has-text("Conversion History")');
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('History page displays statistics panel', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Look for statistics section
    const statsPanel = page.locator('text=Statistics');
    await expect(statsPanel).toBeVisible({ timeout: 15000 });

    // Check for stat labels
    await expect(page.locator('text=Total Conversions')).toBeVisible();
    await expect(page.locator('text=This Week')).toBeVisible();
    await expect(page.locator('text=Favorites')).toBeVisible();
  });

  test('History page has search input', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // Verify it's interactive
    await searchInput.fill('test search');
    await expect(searchInput).toHaveValue('test search');
  });

  test('History page has filter dropdowns', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Find filter buttons - the Select components render as buttons with trigger role
    const typeFilterButton = page.locator('button').filter({ hasText: 'All Types' });
    const statusFilterButton = page.locator('button').filter({ hasText: 'All Status' });

    // At least one should be visible
    const typeVisible = await typeFilterButton.isVisible().catch(() => false);
    const statusVisible = await statusFilterButton.isVisible().catch(() => false);

    expect(typeVisible || statusVisible).toBe(true);
  });

  test('History page has favorites toggle button', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Find the favorites star button
    const favoritesButton = page.locator('button').filter({ has: page.locator('svg.lucide-star') });
    await expect(favoritesButton.first()).toBeVisible({ timeout: 15000 });
  });

  test('History page shows conversion list panel', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Check for the list panel with "Conversion History" title
    const historyPanel = page.locator('text=Conversion History').first();
    await expect(historyPanel).toBeVisible({ timeout: 15000 });
  });

  test('Breadcrumb navigation is present', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Check for Dashboard link in breadcrumb
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    await expect(dashboardLink).toBeVisible({ timeout: 10000 });

    // Check for History text in breadcrumb
    const historyBreadcrumb = page.locator('text=History');
    await expect(historyBreadcrumb.first()).toBeVisible();
  });

  test('Can navigate back to dashboard from breadcrumb', async ({ page }) => {
    await page.goto('/dashboard/history');
    await page.waitForLoadState('networkidle');

    // Click on Dashboard in breadcrumb
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    await dashboardLink.click();

    // Should navigate back to dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
