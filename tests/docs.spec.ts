import { test, expect } from '@playwright/test';

test('documentation page loads with TOC and custom styles', async ({ page }) => {
  // 1. Log in via UI
  await page.goto('/login');
  await page.fill('input[placeholder="Enter your username"]', 'savadmin');
  await page.fill('input[placeholder="Enter your password"]', '$Jun2020');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 2. Go to /docs
  await page.goto('/docs');

  // 3. Verify page elements are present
  // Wait for Table of Contents header
  await page.waitForSelector('text=Table of Contents');
  const tocHeader = page.locator('text=Table of Contents');
  await expect(tocHeader).toBeVisible();

  // Verify that major sections are parsed correctly as headers and TOC links
  const overviewLink = page.locator('aside nav a[href="#1-platform-overview"]');
  await expect(overviewLink).toBeVisible();
  await expect(overviewLink).toHaveText('1. Platform Overview');

  const adminLink = page.locator('aside nav a[href="#2-user-team-management-admin-functionality"]');
  await expect(adminLink).toBeVisible();

  // Verify headers render inside main article content with their slugs
  const mainHeader = page.locator('main h2[id="2-user-team-management-admin-functionality"]');
  await expect(mainHeader).toBeVisible();

  // 4. Verify no raw markdown formatting like ** is shown inside paragraphs
  const paragraph = page.locator('main p').first();
  const textContent = await paragraph.textContent();
  expect(textContent).not.toContain('**');
  expect(textContent).not.toContain('`');
});
