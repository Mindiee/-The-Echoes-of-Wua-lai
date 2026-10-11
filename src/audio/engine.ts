import { data } from '../data'
import type { ActivityState } from '../activity'
import { buildVoices, type VoiceSpec } from './score'

export type AudioState = { status: 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error'; error: string }
type Asset = 'metal' | 'craft' | 'market' | 'temple' | 'culture'
type Voice = { spec: VoiceSpec; bus: GainNode; pan: StereoPannerNode; next: number; event: number; sources: Set<AudioScheduledSourceNode> }
const ASSETS: Asset[] = ['metal','craft','market','temple','culture']
const FADE = .8

export class SoundscapeEngine {
  state: AudioState = { status: 'idle', error: '' }
  private context?: AudioContext
  private master?: GainNode
  private buffers = new Map<Asset, AudioBuffer>()
  private voices = new Map<string, Voice>()
  private retired = new Set<Voice>()
  private timers = new Set<ReturnType<typeof setTimeout>>()
  private ticker?: ReturnType<typeof setInterval>
  private loadPromise?: Promise<void>
  private loadAbort?: AbortController
  private generation = 0
  private muted = false
  private soloPlaceId?: string
  private disposed = false
  private activity: ActivityState = { activeIds: [], byCategory: {} as ActivityState['byCategory'], density: 0, intensity: 0 }

  constructor(private onState: (state: AudioState) => void) {}

  private setState(status: AudioState['status'], error = '') {
    this.state = { status, error }
    this.onState(this.state)
  }

  private init() {
    if (this.context) return this.context
    if (typeof AudioContext === 'undefined') throw new Error('WEB_AUDIO_UNAVAILABLE')
    const context = new AudioContext()
    const master = context.createGain()
    master.gain.value = 0
    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -12
    compressor.knee.value = 12
    compressor.ratio.value = 4
    master.connect(compressor)
    compressor.connect(context.destination)
    context.addEventListener('statechange', () => {
      if (context.state !== 'running' && this.state.status === 'playing') this.pause()
    })
    this.context = context
    this.master = master
    return context
  }

  private ramp(param: AudioParam, value: number, duration: number) {
    const now = this.context!.currentTime
    if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(now)
    else { const current = param.value; param.cancelScheduledValues(now); param.setValueAtTime(current, now) }
    param.linearRampToValueAtTime(value, now + duration)
  }

  private async load(context: AudioContext) {
    if (this.buffers.size === ASSETS.length) return
    if (this.loadPromise) return this.loadPromise
    this.loadAbort = new AbortController()
    const abort = this.loadAbort
    const timeout = setTimeout(() => abort.abort(), 15000)
    this.loadPromise = Promise.all(ASSETS.map(async asset => {
      if (this.buffers.has(asset)) return
      const response = await fetch(`${import.meta.env.BASE_URL}audio/${asset}.mp3`, { signal: abort.signal })
      if (!response.ok) throw new Error(`Could not load ${asset}`)
      const decoded = await context.decodeAudioData(await response.arrayBuffer())
      // Remove leading silence, then normalize each sample once. This does not
      // depend on activity density or turn intensity into master volume.
      let first = decoded.length - 1, peak = 0
      for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
        const values = decoded.getChannelData(channel)
        for (let i = 0; i < values.length; i++) {
          const amplitude = Math.abs(values[i]); peak = Math.max(peak, amplitude)
          if (amplitude > .002 && i < first) first = i
        }
      }
      if (peak < .00001) throw new Error(`Silent sample: ${asset}`)
      const start = Math.max(0, first - Math.floor(decoded.sampleRate * .005))
      const normalized = context.createBuffer(decoded.numberOfChannels, decoded.length - start, decoded.sampleRate)
      for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
        const original = decoded.getChannelData(channel)
        const output = normalized.getChannelData(channel)
        for (let i = 0; i < output.length; i++) output[i] = original[start + i] * Math.min(10, .7 / peak)
      }
      if (asset === 'temple') this.buffers.set(asset, normalized)
      else {
        // Crossfade the recording's seam once, keeping its natural speed.
        const seam = Math.min(Math.floor(decoded.sampleRate * FADE), Math.floor(normalized.length / 4))
        const loop = context.createBuffer(normalized.numberOfChannels, normalized.length - seam, normalized.sampleRate)
        for (let channel = 0; channel < loop.numberOfChannels; channel++) {
          const input = normalized.getChannelData(channel)
          const output = loop.getChannelData(channel)
          output.set(input.subarray(0, loop.length))
          for (let i = 0; i < seam; i++) {
            const mix = i / seam
            output[i] = input[loop.length + i] * (1 - mix) + input[i] * mix
          }
        }
        this.buffers.set(asset, loop)
      }
    })).then(() => undefined).finally(() => { clearTimeout(timeout); this.loadPromise = undefined })
    return this.loadPromise
  }

  async play(autoplay = false) {
    if (this.disposed || this.state.status === 'playing' || this.state.status === 'loading') return
    const ticket = ++this.generation
    try {
      const context = this.init()
      // On explicit Play, resume stays inside the user gesture before fetching.
      const resumed = context.resume()
      this.setState('loading')
      if (autoplay) {
        // Blocked resume promises may remain pending until a user gesture.
        // Bound the entry attempt so Play remains available in that case.
        let timeout: ReturnType<typeof setTimeout> | undefined
        await Promise.race([resumed.catch(() => {}), new Promise<void>(resolve => {
          timeout = setTimeout(resolve, 600)
        })]).finally(() => clearTimeout(timeout))
        if (ticket !== this.generation || this.disposed) return
        if (context.state !== 'running') { this.setState('blocked'); return }
        await this.load(context)
      } else await Promise.all([resumed, this.load(context)])
      if (ticket !== this.generation || this.disposed) return
      if (context.state !== 'running') throw new Error('Audio context did not start')
      this.setState('playing')
      this.ramp(this.master!.gain, this.muted ? 0 : .7, .1)
      this.reconcile()
      this.tick()
      this.ticker = setInterval(() => this.tick(), 50)
    } catch (error) {
      if (ticket !== this.generation || this.disposed) return
      this.loadAbort?.abort()
      const message = error instanceof Error && error.message === 'WEB_AUDIO_UNAVAILABLE'
        ? 'Sound playback is unavailable in this browser.'
        : 'Could not load or start sound. Check the connection and try again.'
      this.setState('error', message)
      void this.context?.suspend().catch(() => {})
    }
  }

  update(activity: ActivityState) {
    this.activity = activity
    if (this.state.status === 'playing') this.reconcile()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.master && this.state.status === 'playing') this.ramp(this.master.gain, muted ? 0 : .7, .08)
  }

  setSolo(placeId?: string, fade = FADE) {
    if (this.soloPlaceId === placeId) return
    this.soloPlaceId = placeId
    if (this.state.status === 'playing') this.reconcile(fade)
  }

  pause() {
    if (this.disposed) return
    if (this.state.status === 'loading') this.loadAbort?.abort()
    const ticket = ++this.generation
    clearInterval(this.ticker)
    this.ticker = undefined
    if (this.master) this.ramp(this.master.gain, 0, .08)
    for (const voice of this.voices.values()) this.retire(voice, .09)
    this.voices.clear()
    this.setState('paused')
    this.later(() => {
      if (ticket === this.generation && !this.disposed) void this.context?.suspend().catch(() => {})
    }, 120)
  }

  private later(callback: () => void, ms: number) {
    const timer = setTimeout(() => { this.timers.delete(timer); callback() }, ms)
    this.timers.add(timer)
  }

  private retire(voice: Voice, seconds: number) {
    this.ramp(voice.bus.gain, 0, seconds)
    this.retired.add(voice)
    for (const source of voice.sources) { try { source.stop(this.context!.currentTime + seconds + .01) } catch { /* already ended */ } }
    this.later(() => { voice.bus.disconnect(); voice.pan.disconnect(); this.retired.delete(voice) }, (seconds + .08) * 1000)
  }

  private reconcile(fade = FADE) {
    const specs = buildVoices(data, this.activity, this.soloPlaceId)
    const wanted = new Set(specs.map(s => s.key))
    for (const [key, voice] of this.voices) if (!wanted.has(key)) {
      this.voices.delete(key); this.retire(voice, fade)
    }
    for (const spec of specs) {
      const existing = this.voices.get(spec.key)
      if (existing) { existing.spec = spec; continue }
      const context = this.context!
      const bus = context.createGain(); bus.gain.value = 0
      const pan = context.createStereoPanner(); pan.pan.value = spec.pan
      bus.connect(pan); pan.connect(this.master!)
      this.ramp(bus.gain, spec.gain, fade)
      const index = Number(spec.placeId.slice(1))
      this.voices.set(spec.key, { spec, bus, pan, next: context.currentTime + .05 + (index % 7) * .1, event: index, sources: new Set() })
    }
  }

  private tick() {
    if (this.state.status !== 'playing') return
    const now = this.context!.currentTime
    for (const voice of this.voices.values()) {
      // A backgrounded tab must not replay a backlog when timers resume.
      if (voice.next < now) voice.next = now + .02
      if (voice.next < now + .12) {
        this.event(voice, voice.next)
        voice.next += voice.spec.interval
        voice.event++
      }
    }
  }

  private event(voice: Voice, at: number) {
    const assets: Record<VoiceSpec['role'], Asset> = {
      'Main Craft': 'metal', 'Soft Craft': 'craft', Market: 'market', Respect: 'temple', Culture: 'culture',
    }
    const context = this.context!
    const buffer = this.buffers.get(assets[voice.spec.role])!
    const bell = voice.spec.role === 'Respect'
    const duration = bell ? buffer.duration : voice.spec.interval + FADE
    const edge = bell ? Math.min(.02, duration / 4) : Math.min(FADE, duration / 3)
    const node = context.createBufferSource()
    node.buffer = buffer
    node.loop = !bell
    // Follow the recording's original time/pitch. Overlapping windows read the
    // same passage, so scheduler updates never restart or regenerate a melody.
    const offset = bell ? 0 : (at + Number(voice.spec.placeId.slice(1)) * 1.37) % buffer.duration
    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(1, at + edge)
    envelope.gain.setValueAtTime(1, at + duration - edge)
    envelope.gain.linearRampToValueAtTime(0, at + duration)
    node.connect(envelope); envelope.connect(voice.bus)
    voice.sources.add(node)
    node.onended = () => { voice.sources.delete(node); node.disconnect(); envelope.disconnect() }
    node.start(at, offset); node.stop(at + duration)
  }

  dispose() {
    this.disposed = true
    this.generation++
    clearInterval(this.ticker)
    this.loadAbort?.abort()
    for (const timer of this.timers) clearTimeout(timer)
    for (const voice of [...this.voices.values(), ...this.retired]) {
      for (const source of voice.sources) { try { source.stop() } catch { /* already ended */ } }
      voice.bus.disconnect(); voice.pan.disconnect()
    }
    this.voices.clear(); this.retired.clear(); this.timers.clear()
    void this.context?.close().catch(() => {})
  }
}
