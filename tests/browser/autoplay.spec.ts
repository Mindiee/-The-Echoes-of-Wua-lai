import { expect, test } from '@playwright/test'

for (const allowed of [true, false]) {
  test(`entry audio ${allowed ? 'plays when autoplay is allowed' : 'offers Play when autoplay is blocked'}`, async ({ playwright, browserName, baseURL }) => {
    test.skip(browserName !== 'chromium', 'Explicit Chromium autoplay policies')
    const browser = await playwright.chromium.launch({ args: [`--autoplay-policy=${allowed ? 'no-user-gesture-required' : 'document-user-activation-required'}`] })
    try {
      const page = await browser.newPage()
      await page.clock.setFixedTime(new Date('2026-09-28T05:00:00Z'))
      await page.addInitScript(() => {
        const probe = { analyser: undefined as AnalyserNode | undefined }
        Object.assign(window, { autoplayProbe: probe })
        const connect = AudioNode.prototype.connect
        AudioNode.prototype.connect = function(this: AudioNode, destination: AudioNode | AudioParam, ...args: number[]) {
          if (destination === this.context.destination) {
            probe.analyser = this.context.createAnalyser()
            Reflect.apply(connect, this, [probe.analyser])
          }
          return Reflect.apply(connect, this, [destination, ...args])
        } as typeof connect
      })
      await page.goto(baseURL!)
      if (!allowed) {
        await expect(page.getByText('Tap Play to start sound.')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Play soundscape', exact: true })).toBeVisible()
        await page.getByRole('button', { name: 'Play soundscape', exact: true }).click()
      }
      await expect(page.getByRole('button', { name: 'Pause soundscape', exact: true })).toBeVisible()
      await expect.poll(() => page.evaluate(() => {
        const analyser = (window as unknown as { autoplayProbe: { analyser?: AnalyserNode } }).autoplayProbe.analyser
        if (!analyser) return 0
        const values = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(values)
        return Math.max(...values.map(Math.abs))
      }), { timeout: 10000 }).toBeGreaterThan(.0001)
      await page.getByRole('button', { name: 'Pause soundscape', exact: true }).click()
      await page.getByRole('link', { name: 'About Wua-lai', exact: true }).click()
      await page.getByRole('link', { name: 'Soundscape', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Play soundscape', exact: true })).toBeVisible()
    } finally { await browser.close() }
  })
}
