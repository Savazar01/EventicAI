import { test, expect } from '@playwright/test';

test('add activity to backlog', async ({ page, request }) => {
  // 1. Create Event first and get the ID
  const response = await request.post('/api/events', {
    data: { title: 'Test Event', start_date: '2026-06-01', end_date: '2026-06-03' }
  });
  const event = await response.json();
  const eventId = event.id;

  await page.goto(`/events/${eventId}`);
  // Log the page content to see what's rendered
  console.log(await page.content());
  
  // 2. Add new activity
  const title = 'Test Activity ' + Date.now();
  await page.fill('input[placeholder="New activity title"]', title);
  await page.click('button:has-text("Add Activity")');
  
  // 3. Verify it appears in the backlog column
  await page.waitForSelector(`text=${title}`);
  const activityCard = page.locator(`text=${title}`);
  await expect(activityCard).toBeVisible();
});
