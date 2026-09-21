import { data } from '../data'
import type { ActivityState } from '../activity'
import { buildVoices, type VoiceSpec } from './score'

export type AudioState = { status: 'idle' | 'loading' | 'playing' | 'paused' | 'error'; error: string }
type Asset = 'metal' | 'light-metal' | 'marimba' | 'bell' | 'pluck'
type Voice = { spec: VoiceSpec; bus: GainNode; pan: StereoPannerNode; next: number; event: number; sources: Set<AudioScheduledSourceNode> }
const ASSETS: Asset[] = ['metal','light-metal','marimba','bell','pluck']
const FADE = .8
const MELODY = [60, 64, 67, 69, 67, 62, 64, 60]

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
      this.buffers.set(asset, normalized)
    })).then(() => undefined).finally(() => { clearTimeout(timeout); this.loadPromise = undefined })
    return this.loadPromise
  }

  async play() {
    if (this.disposed || this.state.status === 'playing' || this.state.status === 'loading') return
    const ticket = ++this.generation
    try {
      const context = this.init()
      // resume is called synchronously within the click, before fetching files.
      const resumed = context.resume()
      this.setState('loading')
      await Promise.all([resumed, this.load(context)])
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
        const swing = voice.spec.role === 'Soft Craft' ? [1,.8,1.15,.9][voice.event % 4] : 1
        voice.next += voice.spec.interval * swing
        voice.event++
      }
    }
  }

  private sample(voice: Voice, asset: Asset, at: number, rate = 1, limit = 8, level = 1) {
    const context = this.context!
    const buffer = this.buffers.get(asset)!
    const node = context.createBufferSource(); node.buffer = buffer; node.playbackRate.value = rate
    const offset = 0
    const duration = Math.max(.02, Math.min(limit, (buffer.duration - offset) / rate))
    const envelope = context.createGain()
    const attack = Math.min(duration / 4, .008)
    const release = Math.min(duration / 3, .12)
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(level, at + attack)
    envelope.gain.setValueAtTime(level, at + duration - release)
    envelope.gain.linearRampToValueAtTime(0, at + duration)
    node.connect(envelope); envelope.connect(voice.bus)
    voice.sources.add(node)
    node.onended = () => { voice.sources.delete(node); node.disconnect(); envelope.disconnect() }
    node.start(at, offset); node.stop(at + duration)
  }

  private drone(voice: Voice, at: number) {
    const context = this.context!
    const node = context.createOscillator(); node.type = 'sine'; node.frequency.value = 130.8128
    const envelope = context.createGain()
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(.15, at + .6)
    envelope.gain.linearRampToValueAtTime(0, at + 4)
    node.connect(envelope); envelope.connect(voice.bus)
    voice.sources.add(node)
    node.onended = () => { voice.sources.delete(node); node.disconnect(); envelope.disconnect() }
    node.start(at); node.stop(at + 4)
  }

  private texture(voice: Voice, at: number, note: number) {
    const context = this.context!
    const node = context.createOscillator(); node.type = 'triangle'; node.frequency.value = 440 * 2 ** ((note - 69) / 12)
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 720; filter.Q.value = 2
    const envelope = context.createGain()
    const duration = Math.max(2.4, Math.min(5, voice.spec.interval * 1.2))
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(.12, at + .45)
    envelope.gain.setValueAtTime(.12, at + Math.max(.5, duration - .7))
    envelope.gain.linearRampToValueAtTime(0, at + duration)
    node.connect(filter); filter.connect(envelope); envelope.connect(voice.bus)
    voice.sources.add(node)
    node.onended = () => { voice.sources.delete(node); node.disconnect(); filter.disconnect(); envelope.disconnect() }
    node.start(at); node.stop(at + duration)
  }

  private event(voice: Voice, at: number) {
    const note = MELODY[voice.event % MELODY.length]
    switch (voice.spec.role) {
      case 'Main Craft': this.sample(voice, 'metal', at, .9, .7); break
      case 'Soft Craft':
        this.sample(voice, 'light-metal', at, .95, .3, .6)
        this.sample(voice, 'marimba', at + .09, 2 ** ((note - 59) / 12), 2.2, .8)
        break
      case 'Market':
        this.texture(voice, at, note - 12)
        this.sample(voice, 'marimba', at + .14, 2 ** ((note - 59) / 12), 2, .45)
        this.sample(voice, 'light-metal', at + .42, .72, .3, .22)
        break
      case 'Respect': this.sample(voice, 'bell', at, .75, 5, .6); this.drone(voice, at); break
      case 'Culture': this.sample(voice, 'pluck', at, 2 ** ((note - 60) / 12), 2); break
    }
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
