import { test, expect } from '@playwright/test';
import { uniqueUser, signup, login, logout } from './helpers';

/*
 * Happy-Path E2E Suite
 *
 * Tests run sequentially. Each test gets a fresh browser context (no shared
 * cookies/localStorage), so after the initial signup tests we use login()
 * to authenticate in subsequent tests.
 *
 * Prerequisites:
 *   - Angular dev server on http://localhost:4200
 *   - Rails API on http://localhost:3000
 */

// Shared state across sequential tests
const userA = uniqueUser('alice');
const userB = uniqueUser('bob');
const meetupTitle = `Morning Run ${Date.now()}`;
const futureDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 16);
};

test.describe('Happy Path', () => {
  test.describe.configure({ mode: 'serial' });

  // ─── 1. Registration & Login ────────────────────────────────────────

  test('User A can register a new account', async ({ page }) => {
    await signup(page, userA);
    await expect(page.locator('.username')).toContainText(userA.username);
  });

  test('User A can log out and log back in', async ({ page }) => {
    await login(page, userA.username, userA.password);
    await logout(page);
    await login(page, userA.username, userA.password);
    await expect(page.locator('.username')).toContainText(userA.username);
  });

  test('User B can register a new account', async ({ page }) => {
    await signup(page, userB);
    await expect(page.locator('.username')).toContainText(userB.username);
  });

  // ─── 2. Creating a Meetup ───────────────────────────────────────────

  test('User A can create a new meetup', async ({ page }) => {
    await login(page, userA.username, userA.password);

    // Open the "Create New Meetup" modal
    await page.getByRole('button', { name: 'Create New Meetup' }).click();
    await expect(page.getByRole('heading', { name: 'Create New Meetup' })).toBeVisible();

    // Fill in the form
    await page.locator('#title').fill(meetupTitle);
    await page.getByLabel('Run').check();
    await page.locator('#start_date_time').fill(futureDate(7));
    await page.locator('#end_date_time').fill(futureDate(8));
    await page.locator('#guests').fill('10');
    await page.locator('#address').fill('123 Test Street');
    await page.locator('#zip_code').fill('90210');
    // Trigger blur on ZIP to fire the auto-lookup
    await page.locator('#zip_code').blur();
    // Wait for the zippopotam API to respond and populate city/state
    await page.waitForResponse((res) => res.url().includes('zippopotam'));
    await page.locator('#country').fill('USA');

    // Submit and wait for the API to respond
    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/meetups') && res.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Save Meetup' }).click();
    await responsePromise;

    // Close the modal (the form resets but the modal wrapper stays open)
    await page.locator('.modal .close-btn').click();

    // The new meetup card should appear on the dashboard
    await expect(page.getByText(meetupTitle)).toBeVisible({ timeout: 10000 });
  });

  // ─── 3. Joining & Leaving a Meetup ──────────────────────────────────

  test('User B can join a meetup', async ({ page }) => {
    await login(page, userB.username, userB.password);

    // Wait for meetup cards to load
    await expect(page.getByText(meetupTitle)).toBeVisible();

    // Find the card with our meetup and click Join
    const card = page.locator('app-meetup-card', { hasText: meetupTitle });
    await card.getByRole('button', { name: 'Join' }).click();

    // After joining, the button should change to "Leave"
    await expect(card.getByRole('button', { name: 'Leave' })).toBeVisible();
  });

  test('User B can leave a meetup', async ({ page }) => {
    await login(page, userB.username, userB.password);

    await expect(page.getByText(meetupTitle)).toBeVisible();

    const card = page.locator('app-meetup-card', { hasText: meetupTitle });

    // User B should still be joined from the previous test (server state persists)
    // But fresh browser context means we need to wait for the correct button
    const joinBtn = card.getByRole('button', { name: 'Join' });
    const leaveBtn = card.getByRole('button', { name: 'Leave' });

    // If somehow not joined (e.g. server state reset), join first
    if (await joinBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await joinBtn.click();
      await expect(leaveBtn).toBeVisible();
    }

    // Now leave
    await leaveBtn.click();
    await expect(card.getByRole('button', { name: 'Join' })).toBeVisible();
  });

  // ─── 4. Posting a Comment ───────────────────────────────────────────

  test('User B can post a comment on a meetup', async ({ page }) => {
    await login(page, userB.username, userB.password);

    await expect(page.getByText(meetupTitle)).toBeVisible();

    // Open the meetup detail modal
    const card = page.locator('app-meetup-card', { hasText: meetupTitle });
    await card.getByRole('button', { name: 'Details' }).click();

    // Wait for the detail modal to appear
    await expect(page.locator('.detail-modal')).toBeVisible();

    const commentText = `Great meetup! See you there. ${Date.now()}`;
    await page.locator('.detail-modal textarea').fill(commentText);
    await page.locator('.detail-modal').getByRole('button', { name: 'Post Comment' }).click();

    // The comment should appear in the list
    await expect(page.locator('.detail-modal').getByText(commentText)).toBeVisible();
  });
});
