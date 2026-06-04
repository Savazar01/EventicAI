import { test, expect } from '@playwright/test';

test('add activity to backlog', async ({ page }) => {
  // 1. Log in via UI
  await page.goto('/login');
  await page.fill('input[placeholder="Enter your username"]', 'savadmin');
  await page.fill('input[placeholder="Enter your password"]', '$Jun2020');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 2. Create Event first using page.request (so it shares the login cookies)
  const response = await page.request.post('/api/events', {
    data: { title: 'Test Event', start_date: '2026-06-01', end_date: '2026-06-03' }
  });
  const event = await response.json();
  const eventId = event.id;

  // Create columns: 'backlog', 'in-progress', 'done'
  await page.request.post('/api/columns', {
    data: { event_id: eventId, status_id: 'backlog', label: 'Backlog', color: '#6771ab' }
  });
  await page.request.post('/api/columns', {
    data: { event_id: eventId, status_id: 'in-progress', label: 'In-Progress', color: '#c484b0' }
  });
  await page.request.post('/api/columns', {
    data: { event_id: eventId, status_id: 'done', label: 'Done', color: '#22c55e' }
  });

  await page.goto(`/events/${eventId}`);
  
  // 3. Open activity creation drawer
  await page.click('button:has-text("Add Activity")');
  
  // 4. Fill and submit new activity
  const title = 'Test Activity ' + Date.now();
  await page.fill('input[placeholder="Activity title"]', title);
  await page.click('button:has-text("Create Activity")');
  
  // 5. Verify it appears on the board
  await page.waitForSelector(`text=${title}`);
  const activityCard = page.locator(`text=${title}`);
  await expect(activityCard).toBeVisible();
});

test('auto-prompt columns setup on empty event board', async ({ page }) => {
  // 1. Log in via UI
  await page.goto('/login');
  await page.fill('input[placeholder="Enter your username"]', 'savadmin');
  await page.fill('input[placeholder="Enter your password"]', '$Jun2020');
  await page.click('button:has-text("Sign In"), button[type="submit"]');
  await page.waitForURL('**/dashboard');

  // 2. Create Event first using page.request with no columns seeded
  const response = await page.request.post('/api/events', {
    data: { title: 'Test Event No Columns', start_date: '2026-06-01', end_date: '2026-06-03' }
  });
  const event = await response.json();
  const eventId = event.id;

  // 3. Go to the event board
  await page.goto(`/events/${eventId}`);

  // 4. Verify "Manage Columns" modal is automatically opened
  await page.waitForSelector('text=Manage Columns');
  const modalTitle = page.locator('text=Manage Columns');
  await expect(modalTitle).toBeVisible();

  // 5. Verify the placeholder text is visible
  const noColsPlaceholder = page.locator('text=No columns configured.');
  await expect(noColsPlaceholder).toBeVisible();
});
