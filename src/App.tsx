import { useEffect, useMemo, useRef, useState } from 'react'
import { Map } from './components/Map'
import { Controls } from './components/Controls'
import { PlaceDetail } from './components/PlaceDetail'
import { bangkokTime, calculateActivity } from './activity'
import type { Marker } from './data/types'
import { data } from './data'
import { useSoundscape } from './audio/useSoundscape'
import { buildVoices } from './audio/score'
import { Hero } from './components/Hero'
import { MarkerTooltip } from './components/MarkerTooltip'

export default function App() {
  const [day, setDay] = useState(0)
  const [minute, setMinute] = useState(720)
  const [realtime, setRealtime] = useState(false)
  const muted = false
  const [dark, setDark] = useState(false)
  const [roads, setRoads] = useState(true)
  const [selected, setSelected] = useState<Marker>()
  const [hovered, setHovered] = useState<Marker>()
  const [heroClock, setHeroClock] = useState(() => bangkokTime())
  const [methodRevealed, setMethodRevealed] = useState(false)
  const methodRef = useRef<HTMLElement>(null)
  const activity = useMemo(() => calculateActivity(data, day, minute), [day, minute])
  const heroActivity = useMemo(() => calculateActivity(data, heroClock.day, heroClock.minute), [heroClock])
  const rhythms = useMemo(() => Object.fromEntries(buildVoices(data, activity).map(voice => [voice.placeId, voice.interval])), [activity])
  const audio = useSoundscape(activity, muted)
  useEffect(() => {
    const update = () => setHeroClock(bangkokTime())
    const timer = window.setInterval(update, 30000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!realtime) return
    const update = () => { const t = bangkokTime(); setDay(t.day); setMinute(t.minute) }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [realtime])
  useEffect(() => {
    const node = methodRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setMethodRevealed(true) }, {threshold:.22})
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const hoverActivity = (marker?: Marker) => {
    setHovered(marker)
    audio.solo(marker?.placeId ?? selected?.placeId, .4)
  }
  const selectActivity = (marker: Marker) => {
    setSelected(marker)
    setHovered(undefined)
    audio.solo(marker.placeId, .8)
    audio.start()
  }
  const enterExperience = () => {
    setDay(heroClock.day); setMinute(heroClock.minute); setRealtime(true)
    document.querySelector('#experience')?.scrollIntoView({behavior:'smooth'})
    audio.start()
  }
  const showMethod = () => {
    setMethodRevealed(true)
    methodRef.current?.scrollIntoView({behavior:'smooth'})
  }
  const closeDetail = () => {
    const marker = selected
    setSelected(undefined)
    audio.solo(hovered?.placeId, .8)
    if (marker) document.querySelector<SVGGElement>(`[data-marker="${marker.id}"]`)?.focus({ preventScroll: true })
  }
  return <main data-theme={dark ? 'night' : 'day'}>
    <a className="skip-link" href="#experience">Explore the soundscape</a>
    <Hero activity={heroActivity} day={heroClock.day} minute={heroClock.minute} dark={dark} onEnter={enterExperience} />
    <section id="experience" className="experience" aria-label="Interactive soundscape">
      <div className="experience-layout">
        <div className="map-region">
          <Map activeIds={activity.activeIds} showRoads={roads} selectedId={selected?.placeId} onSelect={selectActivity}
            hoveredId={hovered?.placeId} onHover={hoverActivity} rhythms={rhythms} />
          {hovered && <MarkerTooltip marker={hovered} day={day} active={activity.activeIds.includes(hovered.placeId)} />}
          {selected && <PlaceDetail marker={selected} day={day} active={activity.activeIds.includes(selected.placeId)} onClose={closeDetail} />}
        </div>
        <Controls day={day} minute={minute} count={activity.density} realtime={realtime} muted={muted} dark={dark} roads={roads}
          playing={audio.playing} loading={audio.loading} error={audio.error} onDay={d => { setRealtime(false); setDay(d) }}
          onMinute={m => { setRealtime(false); setMinute(m) }} onRealtime={() => setRealtime(r => !r)}
          onMethod={showMethod} onTheme={() => setDark(d => !d)} onRoads={() => setRoads(r => !r)} onPlay={audio.toggle} />
      </div>
    </section>
    <section ref={methodRef} className="method reference-section" aria-label="How it works" data-revealed={methodRevealed}>
      <img className={`reference-image ${dark ? 'dark-reference' : ''}`} src={`${import.meta.env.BASE_URL}references/Method.svg`} alt="How Wua-lai activity data becomes sound and how to explore the interactive experience." />
    </section>
  </main>
}
