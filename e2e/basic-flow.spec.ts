import { test, expect } from '@playwright/test'

test('home page renders map shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByLabel('Bengaluru places map')).toBeVisible()
})
