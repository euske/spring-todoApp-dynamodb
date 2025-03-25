import { test, expect } from '@playwright/test';
import {randomUUID} from "node:crypto";

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TODO/);
});

test('can post an item', async ({ page }) => {
  const text = `todo${randomUUID()}`;
  
  await page.goto('/');

  await page.getByRole('textbox').fill(text);
  await page.getByRole('button', {name: 'Add'}).click();
  await expect(page.getByRole('listitem').getByText(text)).toBeVisible()
});
