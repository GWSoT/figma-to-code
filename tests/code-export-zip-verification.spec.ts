import { test, expect } from "@playwright/test";

/**
 * Verification test for Code Export ZIP feature
 * Tests the export code dialog and ZIP generation functionality
 */
test.describe("Code Export ZIP Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the preview page
    await page.goto("/dashboard/preview");
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
  });

  test("should display Export ZIP button in header", async ({ page }) => {
    // Find the Export ZIP button
    const exportButton = page.getByTestId("export-zip-button");
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toContainText("Export ZIP");
  });

  test("should open export dialog when clicking Export ZIP button", async ({ page }) => {
    // Click the Export ZIP button
    const exportButton = page.getByTestId("export-zip-button");
    await exportButton.click();

    // Verify dialog opens
    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Verify dialog title
    await expect(dialog.getByText("Export Code")).toBeVisible();
  });

  test("should display correct framework and styling info in dialog", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Check framework info (default is React)
    await expect(dialog.getByText("React")).toBeVisible();

    // Check styling info (default is Tailwind CSS)
    await expect(dialog.getByText("Tailwind CSS")).toBeVisible();
  });

  test("should show files to be exported", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Check for files list
    await expect(dialog.getByText("Files to Export")).toBeVisible();

    // Verify at least one file is listed (Card.tsx from demo files)
    await expect(dialog.getByText("Card.tsx")).toBeVisible();
  });

  test("should have export options with checkboxes", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Check for export options
    await expect(dialog.getByText("Include in Export")).toBeVisible();

    // README option
    await expect(dialog.getByLabel(/README\.md/)).toBeVisible();

    // Configuration files option
    await expect(dialog.getByLabel(/Configuration Files/)).toBeVisible();
  });

  test("should show export preview with file count", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Check for export preview section
    await expect(dialog.getByText("Export Preview")).toBeVisible();

    // Verify file name shows in preview
    await expect(dialog.getByText("Card.zip")).toBeVisible();

    // Verify total files is shown
    await expect(dialog.getByText(/Total files/)).toBeVisible();
  });

  test("should be able to toggle export options", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Find and toggle the README checkbox
    const readmeCheckbox = dialog.getByLabel(/README\.md/);
    await expect(readmeCheckbox).toBeChecked();

    // Uncheck it
    await readmeCheckbox.click();
    await expect(readmeCheckbox).not.toBeChecked();

    // Check it again
    await readmeCheckbox.click();
    await expect(readmeCheckbox).toBeChecked();
  });

  test("should have Export ZIP and Cancel buttons", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Check for Export ZIP button
    const exportCodeButton = dialog.getByTestId("export-code-button");
    await expect(exportCodeButton).toBeVisible();
    await expect(exportCodeButton).toContainText("Export ZIP");

    // Check for Cancel button
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("should close dialog when Cancel is clicked", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Click Cancel
    await dialog.getByRole("button", { name: "Cancel" }).click();

    // Dialog should be closed
    await expect(dialog).not.toBeVisible();
  });

  test("should trigger download when Export ZIP is clicked", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click Export ZIP button
    const exportCodeButton = dialog.getByTestId("export-code-button");
    await exportCodeButton.click();

    // Wait for download
    const download = await downloadPromise;

    // Verify the download filename
    expect(download.suggestedFilename()).toBe("Card.zip");
  });

  test("should show success state after export", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Click Export ZIP button (handle download but don't wait for it)
    page.on("download", async (download) => {
      // Cancel the download to prevent file system operations
      await download.cancel();
    });

    const exportCodeButton = dialog.getByTestId("export-code-button");
    await exportCodeButton.click();

    // Wait for success state
    await expect(dialog.getByText("Export Complete")).toBeVisible({ timeout: 10000 });

    // Verify success info is displayed
    await expect(dialog.getByText(/Total size/)).toBeVisible();

    // Verify Done button appears
    await expect(dialog.getByRole("button", { name: "Done" })).toBeVisible();
  });

  test("should show Export Another button in success state", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Handle download
    page.on("download", async (download) => {
      await download.cancel();
    });

    // Export
    await dialog.getByTestId("export-code-button").click();

    // Wait for success
    await expect(dialog.getByText("Export Complete")).toBeVisible({ timeout: 10000 });

    // Verify Export Another button
    await expect(dialog.getByRole("button", { name: "Export Another" })).toBeVisible();
  });

  test("should reset to initial state when Export Another is clicked", async ({ page }) => {
    // Open the export dialog
    await page.getByTestId("export-zip-button").click();

    const dialog = page.getByTestId("export-code-dialog");
    await expect(dialog).toBeVisible();

    // Handle download
    page.on("download", async (download) => {
      await download.cancel();
    });

    // Export
    await dialog.getByTestId("export-code-button").click();

    // Wait for success
    await expect(dialog.getByText("Export Complete")).toBeVisible({ timeout: 10000 });

    // Click Export Another
    await dialog.getByRole("button", { name: "Export Another" }).click();

    // Should be back to initial state
    await expect(dialog.getByText("Files to Export")).toBeVisible();
    await expect(dialog.getByTestId("export-code-button")).toBeVisible();
  });
});
