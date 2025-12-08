import { test } from "./helpers/test_helper";

test("edit message - should work", async ({ po, page }) => {
  await po.setUp();
  await po.sendPrompt("Original message");
  await po.snapshotMessages();

  // Hover over the user message to show the edit button
  // The user message is the second one (index 1) because the first one is the assistant greeting (or empty)
  // Actually, let's find the user message.
  const userMessage = page
    .locator(".group")
    .filter({ hasText: "Original message" });
  await userMessage.hover();

  // Click the edit button (Pencil icon)
  await userMessage.getByRole("button").first().click();

  // Edit the message
  const textarea = page.locator("textarea");
  await textarea.fill("Edited message");

  // Click Save
  await page.getByRole("button", { name: "Save" }).click();

  // Wait for completion
  await po.waitForChatCompletion();

  // Verify the message is updated
  await po.snapshotMessages();
});
