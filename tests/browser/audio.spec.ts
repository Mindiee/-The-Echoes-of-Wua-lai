import { expect, test, type Page } from '@playwright/test'

async function requireWebAudio(page: Page) {
  test.skip(!await page.evaluate(() => typeof AudioContext !== 'undefined'), 'This browser build does not expose Web Audio')
}

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

test('hero gesture starts musical samples, selection persists with crossfade, pauses and stays unique', async ({ page }) => {
  await instrumentAudio(page)
  const requestedAudio: string[] = []
  page.on('request', request => { if (request.url().includes('/audio/')) requestedAudio.push(request.url()) })
  await page.goto('/')
  await requireWebAudio(page)
  expect(await page.evaluate(() => (window as unknown as {audioProbe:{contexts:AudioContext[]}}).audioProbe.contexts.length)).toBe(0)
  await page.getByRole('button', {name:'Enter the active map'}).click()
  await expect(page.getByRole('button', { name: 'Pause soundscape', exact: true })).toBeVisible()
  // The live Hero can be entered during Wua-lai's closed overnight hours.
  // Pin this sound assertion to the Monday noon reference state.
  await page.getByRole('slider', {name:'Day',exact:true}).fill('1')
  await page.getByRole('slider', {name:'Time',exact:true}).fill('720')
  await expect.poll(() => energy(page), {timeout:10000}).toBeGreaterThan(0.0001)
  expect(requestedAudio.some(url => url.endsWith('/crowd.mp3'))).toBe(false)
  const selected = page.locator('#experience [data-place=P20]').first()
  await selected.hover()
  await expect(page.locator('#experience .map-marker[data-dimmed=true]').first()).toBeVisible()
  await expect.poll(() => energy(page), {timeout:10000}).toBeGreaterThan(0.0001)
  await selected.click()
  await page.locator('.controls').hover()
  await expect(selected).toHaveAttribute('data-selected', 'true')
  await expect(page.locator('#experience .map-marker[data-dimmed=true]').first()).toBeVisible()
  await page.locator('#experience [data-place=P01]').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#experience [data-place=P01]').first()).toHaveAttribute('data-selected', 'true')
  expect(await page.evaluate(() => (window as unknown as {audioProbe:{fadeDurations:number[]}}).audioProbe.fadeDurations.some(t=>t>.75&&t<.85))).toBe(true)
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
  await requireWebAudio(page)
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
  await requireWebAudio(page)
  await page.getByRole('button', {name:'Play soundscape',exact:true}).click()
  await page.getByRole('button', {name:'Cancel loading soundscape',exact:true}).click()
  release()
  await expect(page.getByRole('button', {name:'Play soundscape',exact:true})).toBeVisible()
  await page.getByRole('button', {name:'Play soundscape',exact:true}).click()
  await expect(page.getByRole('button', {name:'Pause soundscape',exact:true})).toBeVisible()
})
