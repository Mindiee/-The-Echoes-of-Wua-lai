import { expect, test } from '@playwright/test'

test('reports when the browser has no Web Audio implementation', async ({page}) => {
  await page.goto('/#experience')
  test.skip(await page.evaluate(() => typeof AudioContext !== 'undefined'), 'Browser provides Web Audio')
  await page.getByRole('button', {name:'Play soundscape', exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('unavailable in this browser')
})
