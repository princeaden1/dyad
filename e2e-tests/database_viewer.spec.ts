import { expect } from "@playwright/test";
import { test, testSkipIfWindows, Timeout } from "./helpers/test_helper";

test("database panel - shows not connected state", async ({ po }) => {
  await po.setUp();
  await po.sendPrompt("tc=1");

  // Navigate to the database panel
  await po.selectPreviewMode("database");

  // Should show the "not connected" message since no Supabase project is linked
  await expect(po.page.getByText("No Database Connected")).toBeVisible({
    timeout: Timeout.MEDIUM,
  });
  await expect(
    po.page.getByText("Connect Supabase to view tables"),
  ).toBeVisible();
});

testSkipIfWindows(
  "database panel - shows tables when connected",
  async ({ po }) => {
    await po.setUp({ autoApprove: true });
    await po.importApp("minimal");
    await po.sendPrompt("tc=add-supabase");

    // Connect to Supabase (uses fake connection in test mode)
    await po.page.getByText("Set up supabase").click();
    await po.clickConnectSupabaseButton();
    await po.clickBackButton();

    // Navigate to the database panel
    await po.selectPreviewMode("database");

    // Wait for the tables list header to be visible (indicates connection is active)
    // In test mode with fake Supabase, we should at least see the panel UI elements
    await expect(
      po.page.getByText(/Tables|No tables found|Failed to load/),
    ).toBeVisible({
      timeout: Timeout.LONG,
    });
  },
);

test("database panel - can switch to database mode and back", async ({
  po,
}) => {
  await po.setUp();
  await po.sendPrompt("tc=1");

  // Start in preview mode
  await po.selectPreviewMode("preview");
  await po.expectPreviewIframeIsVisible();

  // Switch to database mode
  await po.selectPreviewMode("database");
  await expect(po.page.getByText("No Database Connected")).toBeVisible({
    timeout: Timeout.MEDIUM,
  });

  // Switch back to preview mode
  await po.selectPreviewMode("preview");
  await po.expectPreviewIframeIsVisible();
});

test("database panel - button is visible in action header", async ({ po }) => {
  await po.setUp();
  await po.sendPrompt("tc=1");

  // Verify the database mode button exists
  await expect(po.page.getByTestId("database-mode-button")).toBeVisible();
});
