import {test, expect} from '@playwright/test';
import {randomUUID} from "node:crypto";

test('アプリのタイトルが見える。', async ({page}) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TODO/);
});

test('項目を追加・削除できる。', async ({page}) => {
  const text = `todo${randomUUID()}`;

  await page.goto('/');

  await test.step('項目を追加する。', async () => {
    await page.getByRole('textbox').fill(text);
    await page.getByRole('button', {name: 'Add'}).click();
    await expect(page.getByRole('listitem').getByText(text)).toBeVisible()
  })

  await test.step('追加した項目を削除する。', async () => {
    const item = page.getByRole('listitem').getByText(text)
    await item.getByRole('button', {name: 'Delete'}).click();
    await expect(page.getByRole('listitem').getByText(text)).not.toBeVisible()
  })
});
