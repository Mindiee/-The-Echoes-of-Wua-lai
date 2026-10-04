import { expect, test, type Page } from '@playwright/test'

export async function setSlider(page: Page, label: string, value: number) {
  if (label === 'Day') { await page.getByRole('button', {name:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][value],exact:true}).click(); return }
  const slider = page.getByRole('slider', { name: label, exact: true })
  await slider.fill(String(value))
}

test('day/time state, duplicate markers, details and appearance controls', async ({ page }) => {
  await page.goto('/#experience')
  await setSlider(page,'Day',1)
  await setSlider(page,'Time',720)
  await expect(page.getByTestId('active-count')).toHaveText('27 ACTIVE ACTIVITIES')
  await setSlider(page, 'Day', 6) // Saturday in SUN-first UI
  await setSlider(page, 'Time', 1140)
  await expect(page.getByTestId('active-count')).toHaveText('9 ACTIVE ACTIVITIES')
  await expect(page.locator('#experience [data-place=P14]')).toHaveAttribute('data-active', 'true')
  await page.locator('#experience [data-place=P14]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#experience [data-place=P14]')).toHaveCSS('transform','none')
  await expect(page.getByRole('dialog')).toContainText('ถนนคนเดิน')
  await expect(page.getByRole('dialog')).toContainText('16:00–23:00')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await setSlider(page, 'Time', 1380)
  await expect(page.locator('#experience [data-place=P14]')).toHaveAttribute('data-active', 'false')
  await expect(page.getByTestId('active-count')).toHaveText('0 ACTIVE ACTIVITIES')
  await setSlider(page, 'Day', 1)
  await setSlider(page, 'Time', 720)
  await expect(page.locator('#experience [data-place=P20][data-active=true]')).toHaveCount(7)
  await expect(page.getByTestId('active-count')).toHaveText('27 ACTIVE ACTIVITIES')
  await page.getByRole('button', { name: 'Night mode' }).click()
  await expect(page.locator('main')).toHaveAttribute('data-theme', 'night')
  await expect(page.getByTestId('active-count')).toHaveText('27 ACTIVE ACTIVITIES')
  await page.getByRole('button', { name: 'Show roads' }).click()
  await expect(page.locator('#experience .base-roads')).toHaveCSS('opacity', '0')
  await expect(page.locator('#experience [data-place=P14]')).toBeVisible()
  await page.getByRole('button', { name: 'REAL TIME' }).click()
  await expect(page.getByRole('button', { name: 'REAL TIME' })).toHaveAttribute('aria-pressed', 'true')
  await setSlider(page, 'Time', 1440)
  await expect(page.getByRole('button', { name: 'REAL TIME' })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByTestId('active-count')).toHaveText('0 ACTIVE ACTIVITIES')
})

test('active markers pulse without glow and hover tooltip avoids its marker', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/#experience')
  await setSlider(page,'Day',1)
  await setSlider(page,'Time',720)
  const activeMarker = page.locator('#experience [data-place=P20]').first()
  await expect(activeMarker).toHaveAttribute('data-active', 'true')
  const visibleShape = activeMarker.locator('.marker-pulse')
  await expect(visibleShape).toHaveCSS('animation-name', 'activeMarkerPulse')
  await expect(activeMarker.locator('.marker-visible')).toHaveCSS('filter', 'none')
  const scales = await visibleShape.evaluate(element => {
    const animation = element.getAnimations()[0]
    animation.pause()
    const timing = animation.effect!.getTiming()
    return [0, .5, 1].map(progress => {
      animation.currentTime = Number(timing.delay) + Number(timing.duration) * progress
      return new DOMMatrix(getComputedStyle(element).transform).a
    })
  })
  expect(scales[0]).toBeCloseTo(1, 2)
  expect(scales[1]).toBeCloseTo(1.7, 2)
  expect(scales[2]).toBeCloseTo(1, 2)
  await expect(page.locator('#experience .marker-ripple')).toHaveCount(0)
  await expect(page.getByRole('button', {name:'Play soundscape',exact:true})).toBeVisible()
  await expect(visibleShape).toHaveCSS('animation-name', 'activeMarkerPulse')

  const edgeMarker = page.locator('#experience [data-marker=m123]')
  await edgeMarker.hover()
  const tooltip = page.getByRole('tooltip')
  await expect(tooltip).toBeVisible()
  await expect(tooltip).toContainText('Silver Shop')
  await expect(tooltip).toContainText(/Active|Inactive/)
  await expect(tooltip).toHaveAttribute('data-horizontal', 'left')
  await expect(tooltip).toHaveAttribute('data-vertical', 'below')
  const markerBox = await edgeMarker.boundingBox()
  const tooltipBox = await tooltip.boundingBox()
  const overlaps = markerBox!.x < tooltipBox!.x + tooltipBox!.width && markerBox!.x + markerBox!.width > tooltipBox!.x &&
    markerBox!.y < tooltipBox!.y + tooltipBox!.height && markerBox!.y + markerBox!.height > tooltipBox!.y
  expect(overlaps).toBe(false)

  await setSlider(page, 'Time', 1440)
  await expect(activeMarker).toHaveAttribute('data-active', 'false')
  await expect(visibleShape).toHaveCSS('animation-name', 'none')
})
