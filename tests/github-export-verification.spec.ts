/**
 * GitHub Export Feature Verification Test
 *
 * Temporary verification test for the GitHub export feature.
 * This test verifies the feature is properly integrated without errors.
 */

import { test, expect } from "@playwright/test";

test.describe("GitHub Export Feature Verification", () => {
  test("should load dashboard without GitHub-related import errors", async ({
    page,
  }) => {
    // Track any JavaScript errors
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    // Navigate to the dashboard
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    // Wait for the page to settle
    await page.waitForTimeout(2000);

    // Verify no GitHub-related JS errors occurred
    const githubErrors = errors.filter(
      (e) =>
        e.toLowerCase().includes("github") ||
        e.includes("useGitHub") ||
        e.includes("GitHubExportDialog")
    );
    expect(githubErrors).toHaveLength(0);
  });

  test("GitHub OAuth callback route should exist (not 404)", async ({
    page,
  }) => {
    // The callback route should redirect or return error, not 404
    const response = await page.goto("/api/github/callback", {
      waitUntil: "commit",
    });

    // Should not be 404 (route exists)
    const status = response?.status() || 0;
    expect(status).not.toBe(404);
    // Should be a redirect (302) or error (400/401) but not 404
    expect([302, 400, 401, 500]).toContain(status);
  });

  test("should load app homepage without import errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    // Check for module import errors
    const importErrors = errors.filter(
      (e) =>
        e.includes("Cannot find module") ||
        e.includes("is not defined") ||
        e.includes("Failed to fetch dynamically imported module")
    );
    expect(importErrors).toHaveLength(0);
  });
});
