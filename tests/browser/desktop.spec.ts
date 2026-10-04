import { expect, test } from '@playwright/test'

test('fluid desktop pages keep map geometry, text and controls inside the viewport', async ({page}) => {
  test.setTimeout(90000)
  await page.goto('/')
  for(const [width,height] of [[1280,720],[1280,800],[1280,1024],[1440,900],[1600,900],[1920,1080]]) {
    await page.setViewportSize({width,height})
    await page.getByRole('link',{name:'Soundscape',exact:true}).click()
    await expect(page.getByRole('link',{name:'Soundscape',exact:true})).toHaveAttribute('aria-current','page')
    await expect(page.locator('.activity-map')).toBeVisible()
    const map=await page.locator('.activity-map').boundingBox()
    const controls=await page.locator('.controls').boundingBox()
    const panel=await page.locator('.control-panel').boundingBox()
    expect(map!.width/map!.height).toBeCloseTo(1100/1024,2)
    expect(map!.x+map!.width).toBeLessThan(controls!.x)
    expect(controls!.x+controls!.width).toBeLessThanOrEqual(width)
    if(width===1280&&height===1024){
      expect(panel!.width).toBeGreaterThanOrEqual(315)
      expect(Number.parseFloat(await page.locator('.control-panel').evaluate(element=>getComputedStyle(element).borderTopLeftRadius))).toBeGreaterThanOrEqual(16)
    }
    await expect(page.locator('[data-marker]')).toHaveCount(60)
    for(const name of ['Soundscape','About Wua-lai','Method']) {
      await page.getByRole('link',{name,exact:true}).click()
      await expect(page.getByRole('link',{name,exact:true})).toHaveAttribute('aria-current','page')
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
      const nav=await page.getByRole('navigation').boundingBox()
      expect(nav!.x+nav!.width).toBeLessThan(width)
    }
    await page.getByRole('button',{name:'CATEGORY WEIGHT',exact:true}).click()
    await page.getByRole('button',{name:'SOUND INTENSITY',exact:true}).click()
    await expect(page.getByRole('table',{name:'Category weights'})).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await page.getByRole('button',{name:'CATEGORY WEIGHT',exact:true}).click()
    await page.getByRole('button',{name:'SOUND INTENSITY',exact:true}).click()
  }
  await page.getByRole('link',{name:'Soundscape',exact:true}).click()
  for(let width=1280;width<=1920;width+=32) {
    await page.setViewportSize({width,height:900})
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  }
})
