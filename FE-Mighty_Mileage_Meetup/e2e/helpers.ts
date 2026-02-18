import { Page, expect } from '@playwright/test';

/**
 * Generate a unique user for each test run to avoid collisions.
 */
export function uniqueUser(prefix = 'pw') {
  const ts = Date.now();
  return {
    firstName: `${prefix}First`,
    lastName: `${prefix}Last`,
    username: `${prefix}_user_${ts}`,
    email: `${prefix}_${ts}@test.com`,
    password: 'Password1!',
  };
}

/**
 * Register a new user via the signup page.
 * Ends on the dashboard (auto-login after signup).
 */
export async function signup(page: Page, user: ReturnType<typeof uniqueUser>) {
  await page.goto('/signup');
  await page.locator('#first_name').fill(user.firstName);
  await page.locator('#last_name').fill(user.lastName);
  await page.locator('#username').fill(user.username);
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.locator('#password_confirmation').fill(user.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  // Should land on dashboard after successful signup
  await expect(page.getByRole('heading', { name: 'Mighty Mileage Meetup List' })).toBeVisible();
}

/**
 * Log in an existing user via the login page.
 * Ends on the dashboard.
 */
export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.getByRole('heading', { name: 'Mighty Mileage Meetup List' })).toBeVisible();
}

/**
 * Log out via the navbar button.
 * Ends on the login page.
 */
export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
}
