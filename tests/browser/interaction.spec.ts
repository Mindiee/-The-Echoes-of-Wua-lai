import { expect, test, type Page } from '@playwright/test'

export async function setSlider(page: Page, label: string, value: number) {
  const slider = page.getByRole('slider', { name: label, exact: true })
  await slider.fill(String(value))
}

test('day/time state, duplicate markers, details and appearance controls', async ({ page }) => {
  await page.goto('/#experience')
  await expect(page.getByTestId('active-count')).toHaveText('27 ACTIVE ACTIVITIES')
  await setSlider(page, 'Day', 6) // Saturday in SUN-first UI
  await setSlider(page, 'Time', 1140)
  await expect(page.getByTestId('active-count')).toHaveText('9 ACTIVE ACTIVITIES')
  await expect(page.locator('[data-place=P14]')).toHaveAttribute('data-active', 'true')
  await page.locator('[data-place=P14]').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toContainText('ถนนคนเดิน')
  await expect(page.getByRole('dialog')).toContainText('16:00–23:00')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await setSlider(page, 'Time', 1380)
  await expect(page.locator('[data-place=P14]')).toHaveAttribute('data-active', 'false')
  await expect(page.getByTestId('active-count')).toHaveText('0 ACTIVE ACTIVITIES')
  await setSlider(page, 'Day', 1)
  await setSlider(page, 'Time', 720)
  await expect(page.locator('[data-place=P20][data-active=true]')).toHaveCount(7)
  await expect(page.getByTestId('active-count')).toHaveText('27 ACTIVE ACTIVITIES')
  await page.getByRole('button', { name: 'Night mode' }).click()
  await expect(page.locator('main')).toHaveAttribute('data-theme', 'night')
  await expect(page.getByTestId('active-count')).toHaveText('27 ACTIVE ACTIVITIES')
  await page.getByRole('button', { name: 'Show roads' }).click()
  await expect(page.locator('.base-roads')).toHaveCSS('opacity', '0')
  await expect(page.locator('[data-place=P14]')).toBeVisible()
  await page.getByRole('button', { name: 'REAL TIME' }).click()
  await expect(page.getByRole('button', { name: 'REAL TIME' })).toHaveAttribute('aria-pressed', 'true')
  await setSlider(page, 'Time', 1440)
  await expect(page.getByRole('button', { name: 'REAL TIME' })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByTestId('active-count')).toHaveText('0 ACTIVE ACTIVITIES')
})
