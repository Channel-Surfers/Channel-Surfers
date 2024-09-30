import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState();
    expect(page).toHaveTitle('Channel Surfers');
});
