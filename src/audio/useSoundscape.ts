import { useEffect, useRef, useState } from 'react'
import type { ActivityState } from '../activity'
import { SoundscapeEngine, type AudioState } from './engine'

export function useSoundscape(activity: ActivityState, muted: boolean) {
  const engine = useRef<SoundscapeEngine | null>(null)
  const [state, setState] = useState<AudioState>({status:'idle',error:''})
  useEffect(() => {
    const current = new SoundscapeEngine(setState)
    engine.current = current
    return () => { current.dispose(); engine.current = null }
  }, [])
  useEffect(() => { engine.current?.update(activity) }, [activity])
  useEffect(() => { engine.current?.setMuted(muted) }, [muted])
  const start = () => { void engine.current?.play() }
  const solo = (placeId?: string, fade?: number) => { engine.current?.setSolo(placeId, fade) }
  const toggle = () => {
    const current = engine.current
    if (!current) return
    if (current.state.status === 'playing' || current.state.status === 'loading') current.pause()
    else void current.play()
  }
  return { playing: state.status === 'playing', loading: state.status === 'loading', error: state.error, toggle, start, solo }
}
