import { expect, test } from '@playwright/test'

test('uses the live hero and supplied method and keeps map geometry proportional', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('The Echoes of Wua-lai')
  await expect(page.locator('.hero .activity-map')).toBeVisible()
  await expect(page.locator('.method img')).toHaveAttribute('src', /Method.svg$/)
  await expect(page.locator('.hero [data-marker]')).toHaveCount(60)
  await expect(page.locator('#experience [data-marker]')).toHaveCount(60)
  for (const [width,height] of [[1024,768],[1280,720],[1366,768],[1440,900],[1440,1024],[1920,1080],[2560,1440]]) {
    await page.setViewportSize({ width, height })
    const map = await page.locator('#experience .activity-map').boundingBox()
    const controls = await page.locator('.controls').boundingBox()
    expect(map!.width / map!.height).toBeCloseTo(1100 / 1024, 2)
    expect(map!.x + map!.width).toBeLessThan(controls!.x)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  for (let width = 1024; width <= 1920; width += 32) {
    await page.setViewportSize({width, height: 800})
    const map = await page.locator('#experience .activity-map').boundingBox()
    expect(map!.width / map!.height).toBeCloseTo(1100 / 1024, 2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
})
