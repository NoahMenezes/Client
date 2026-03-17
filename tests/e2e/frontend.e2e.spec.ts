import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, _testInfo) => {
    const _context = await browser.newContext()
    const _page = await _context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Payload Blank Template/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Welcome to your new project.')
  })
})
