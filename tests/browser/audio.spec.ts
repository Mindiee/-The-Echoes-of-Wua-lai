import { expect, test, type Page } from '@playwright/test'

test.skip(({browserName}) => browserName === 'webkit', 'Playwright WebKit on Windows does not expose Web Audio; UI coverage runs in desktop.spec.ts')

async function instrumentAudio(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { audioProbe: { contexts: AudioContext[]; analyser?: AnalyserNode; fadeDurations: number[] } }
    w.audioProbe = { contexts: [], fadeDurations: [] }
    const Original = window.AudioContext
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) { super(options); w.audioProbe.contexts.push(this) }
    }
    const originalConnect = AudioNode.prototype.connect
    AudioNode.prototype.connect = function(this: AudioNode, destination: AudioNode | AudioParam, ...rest: number[]) {
      if (destination === this.context.destination) {
        const analyser = this.context.createAnalyser()
        analyser.fftSize = 2048
        Reflect.apply(originalConnect, this, [analyser])
        w.audioProbe.analyser = analyser
      }
      return Reflect.apply(originalConnect, this, [destination, ...rest])
    } as typeof originalConnect
    const ramp = AudioParam.prototype.linearRampToValueAtTime
    AudioParam.prototype.linearRampToValueAtTime = function(value, end) {
      const ctx = w.audioProbe.contexts[0]
      if (ctx) w.audioProbe.fadeDurations.push(end - ctx.currentTime)
      return ramp.call(this, value, end)
    }
  })
}

async function energy(page: Page) {
  return page.evaluate(() => {
    const probe = (window as unknown as { audioProbe: { analyser?: AnalyserNode } }).audioProbe
    if (!probe.analyser) return 0
    const array = new Float32Array(probe.analyser.fftSize)
    probe.analyser.getFloatTimeDomainData(array)
    return Math.sqrt(array.reduce((sum,n) => sum + n*n, 0) / array.length)
  })
}

test('audio starts on gesture, produces actual samples, fades, mutes, pauses and stays unique', async ({ page }) => {
  await instrumentAudio(page)
  await page.goto('/#experience')
  expect(await page.evaluate(() => (window as unknown as {audioProbe:{contexts:AudioContext[]}}).audioProbe.contexts.length)).toBe(0)
  await page.getByRole('button', { name: 'Play soundscape', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Pause soundscape', exact: true })).toBeVisible()
  await expect.poll(() => energy(page), {timeout:10000}).toBeGreaterThan(0.0001)
  await page.getByRole('button', {name:'Mute sound',exact:true}).click()
  await expect.poll(() => energy(page)).toBeLessThan(0.00001)
  await page.getByRole('button', {name:'Unmute sound',exact:true}).click()
  await expect.poll(() => energy(page), {timeout:10000}).toBeGreaterThan(0.0001)
  await page.getByRole('slider', {name:'Time',exact:true}).fill('1440')
  await expect(page.locator('.playback-state')).toContainText('no active activities')
  await expect.poll(() => energy(page)).toBeLessThan(0.00001)
  expect(await page.evaluate(() => (window as unknown as {audioProbe:{fadeDurations:number[]}}).audioProbe.fadeDurations.some(t=>t>.75&&t<.85))).toBe(true)
  await page.getByRole('button', {name:'Pause soundscape',exact:true}).click()
  await expect(page.getByRole('button', {name:'Play soundscape',exact:true})).toBeVisible()
  await page.getByRole('slider', {name:'Time',exact:true}).fill('720')
  await page.getByRole('button', {name:'Play soundscape',exact:true}).click()
  await expect.poll(() => energy(page), {timeout:10000}).toBeGreaterThan(.0001)
  expect(await page.evaluate(() => (window as unknown as {audioProbe:{contexts:AudioContext[]}}).audioProbe.contexts.length)).toBe(1)
})

test('failed files report error and can be retried', async ({page}) => {
  await page.route('**/audio/metal.mp3', route => route.abort())
  await page.goto('/#experience')
  await page.getByRole('button', {name:'Play soundscape',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('load')
  await expect(page.getByRole('button', {name:'Play soundscape',exact:true})).toBeVisible()
  await page.unroute('**/audio/metal.mp3')
  await page.getByRole('button', {name:'Try again'}).click()
  await expect(page.getByRole('button', {name:'Pause soundscape',exact:true})).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('cancel during loading never starts playback later', async ({page}) => {
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  await page.route('**/audio/*.mp3', async route => { await gate; await route.continue() })
  await page.goto('/#experience')
  await page.getByRole('button', {name:'Play soundscape',exact:true}).click()
  await page.getByRole('button', {name:'Cancel loading soundscape',exact:true}).click()
  release()
  await expect(page.getByRole('button', {name:'Play soundscape',exact:true})).toBeVisible()
  await page.getByRole('button', {name:'Play soundscape',exact:true}).click()
  await expect(page.getByRole('button', {name:'Pause soundscape',exact:true})).toBeVisible()
})
