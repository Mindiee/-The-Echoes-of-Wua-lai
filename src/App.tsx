import { useEffect, useMemo, useState } from 'react'
import { Map } from './components/Map'
import { Controls } from './components/Controls'
import { PlaceDetail } from './components/PlaceDetail'
import { bangkokTime, calculateActivity } from './activity'
import type { Marker } from './data/types'
import { data } from './data'
import { useSoundscape } from './audio/useSoundscape'

export default function App() {
  const [day, setDay] = useState(0)
  const [minute, setMinute] = useState(720)
  const [realtime, setRealtime] = useState(false)
  const [muted, setMuted] = useState(false)
  const [dark, setDark] = useState(false)
  const [roads, setRoads] = useState(true)
  const [selected, setSelected] = useState<Marker>()
  const activity = useMemo(() => calculateActivity(data, day, minute), [day, minute])
  const audio = useSoundscape(activity, muted)
  useEffect(() => {
    if (!realtime) return
    const update = () => { const t = bangkokTime(); setDay(t.day); setMinute(t.minute) }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [realtime])
  const closeDetail = () => {
    const marker = selected
    setSelected(undefined)
    if (marker) document.querySelector<SVGGElement>(`[data-marker="${marker.id}"]`)?.focus({ preventScroll: true })
  }
  return <main data-theme={dark ? 'night' : 'day'}>
    <a className="skip-link" href="#experience">Explore the soundscape</a>
    <section className="hero reference-section" aria-label="The Echoes of Wua-lai introduction">
      <a href="#experience" className="hero-link" aria-label="Explore the interactive Wua-lai map">
        <img className={`reference-image ${dark ? 'dark-reference' : ''}`} src={`${import.meta.env.BASE_URL}references/Hero Shot.svg`} alt="The Echoes of Wua-lai. An interactive experience transforming Wua-lai's silver craft activity data into music, revealing the neighborhood's rhythm through sound." />
      </a>
    </section>
    <section id="experience" className="experience" aria-label="Interactive soundscape">
      <div className="experience-layout">
        <div className="map-region">
          <Map activeIds={activity.activeIds} showRoads={roads} selectedId={selected?.placeId} onSelect={setSelected} />
          {selected && <PlaceDetail marker={selected} day={day} active={activity.activeIds.includes(selected.placeId)} onClose={closeDetail} />}
        </div>
        <Controls day={day} minute={minute} count={activity.density} realtime={realtime} muted={muted} dark={dark} roads={roads}
          playing={audio.playing} loading={audio.loading} error={audio.error} onDay={d => { setRealtime(false); setDay(d) }}
          onMinute={m => { setRealtime(false); setMinute(m) }} onRealtime={() => setRealtime(r => !r)}
          onMute={() => setMuted(m => !m)} onTheme={() => setDark(d => !d)} onRoads={() => setRoads(r => !r)} onPlay={audio.toggle} />
      </div>
    </section>
    <section className="method reference-section" aria-label="How it works">
      <img className={`reference-image ${dark ? 'dark-reference' : ''}`} src={`${import.meta.env.BASE_URL}references/Method.svg`} alt="Activity Data to Sound: Day and Time, Active Activities, Activity Density, Category Weight, Sound Intensity, Generative Sound." />
    </section>
  </main>
}
