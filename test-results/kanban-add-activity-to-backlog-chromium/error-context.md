# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kanban.spec.ts >> add activity to backlog
- Location: tests\kanban.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Test Activity 1779367521539') to be visible

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - heading "Event Manager" [level=1] [ref=e3]
    - navigation [ref=e4]:
      - link "Dashboard" [ref=e5] [cursor=pointer]:
        - /url: /
      - link "Admin" [ref=e6] [cursor=pointer]:
        - /url: /admin
  - main [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - heading "Event Board" [level=1] [ref=e10]
        - textbox "New activity title" [ref=e11]
        - button "Add Activity" [active] [ref=e12]
      - generic [ref=e13]:
        - heading "backlog" [level=2] [ref=e15]
        - heading "plan in-progress" [level=2] [ref=e17]
        - heading "execution in-progress" [level=2] [ref=e19]
        - heading "done" [level=2] [ref=e21]
      - status [ref=e22]
  - alert [ref=e23]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('add activity to backlog', async ({ page, request }) => {
  4  |   // 1. Create Event first and get the ID
  5  |   const response = await request.post('/api/events', {
  6  |     data: { title: 'Test Event', start_date: '2026-06-01', end_date: '2026-06-03' }
  7  |   });
  8  |   const event = await response.json();
  9  |   const eventId = event.id;
  10 | 
  11 |   await page.goto(`/events/${eventId}`);
  12 |   // Log the page content to see what's rendered
  13 |   console.log(await page.content());
  14 |   
  15 |   // 2. Add new activity
  16 |   const title = 'Test Activity ' + Date.now();
  17 |   await page.fill('input[placeholder="New activity title"]', title);
  18 |   await page.click('button:has-text("Add Activity")');
  19 |   
  20 |   // 3. Verify it appears in the backlog column
> 21 |   await page.waitForSelector(`text=${title}`);
     |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  22 |   const activityCard = page.locator(`text=${title}`);
  23 |   await expect(activityCard).toBeVisible();
  24 | });
  25 | 
```