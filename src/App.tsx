import { useEffect, useMemo, useState } from 'react'
import { Map } from './components/Map'
import { Controls } from './components/Controls'
import { PlaceDetail } from './components/PlaceDetail'
import { bangkokTime, calculateActivity } from './activity'
import type { Marker } from './data/types'
import { data } from './data'
import { useSoundscape } from './audio/useSoundscape'
import { buildVoices } from './audio/score'
import { About } from './components/About'
import { Method } from './components/Method'
import { MarkerTooltip } from './components/MarkerTooltip'

const currentPage = () => ['about','method'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'experience'

export default function App() {
  const [initialClock] = useState(() => bangkokTime())
  const [day, setDay] = useState(initialClock.day)
  const [minute, setMinute] = useState(initialClock.minute)
  const [realtime, setRealtime] = useState(true)
  const [page, setPage] = useState(currentPage)
  const muted = false
  const [dark, setDark] = useState(false)
  const [roads, setRoads] = useState(true)
  const [selected, setSelected] = useState<Marker>()
  const [hovered, setHovered] = useState<Marker>()
  const activity = useMemo(() => calculateActivity(data, day, minute), [day, minute])
  const rhythms = useMemo(() => Object.fromEntries(buildVoices(data, activity).map(voice => [voice.placeId, voice.interval])), [activity])
  const audio = useSoundscape(activity, muted)
  useEffect(() => {
    const update = () => { setPage(currentPage()); window.scrollTo(0,0) }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    if (!realtime) return
    const update = () => { const t = bangkokTime(); setDay(t.day); setMinute(t.minute) }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [realtime])
  useEffect(() => {
    setHovered(undefined)
    audio.solo(selected?.placeId, .4)
  // Clear transient hover when switching pages; preserve persistent selection.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])
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
  const showMethod = () => {
    location.hash = 'method'
  }
  const closeDetail = () => {
    const marker = selected
    setSelected(undefined)
    audio.solo(hovered?.placeId, .8)
    if (marker) document.querySelector<SVGGElement>(`[data-marker="${marker.id}"]`)?.focus({ preventScroll: true })
  }
  return <main data-theme={dark ? 'night' : 'day'}>
    <a className="skip-link" href="#experience">Explore the soundscape</a>
    <header className="site-header">
      <a className="wordmark" href="#experience"><span>CHIANG MAI · </span>THE ECHOES OF WUA-LAI</a>
      <nav aria-label="Main navigation">
        {(['experience','about','method'] as const).map((id,index) => <a key={id} href={`#${id}`} aria-current={page===id ? 'page' : undefined}>{['Soundscape','About Wua-lai','Method'][index]}</a>)}
      </nav>
      <span className="live-status" data-playing={audio.playing} aria-label={audio.playing ? 'Audio playing' : 'Audio paused'}><span aria-hidden="true">♫</span> {audio.playing ? 'LIVE' : 'PAUSED'}</span>
    </header>
    <section id="experience" className="experience" aria-label="Interactive soundscape" hidden={page!=='experience'}>
      <div className="experience-layout">
        <div className="map-region">
          <Map activeIds={activity.activeIds} showRoads={roads} selectedId={selected?.placeId} onSelect={selectActivity}
            hoveredId={hovered?.placeId} onHover={hoverActivity} rhythms={rhythms} />
          {hovered && <MarkerTooltip marker={hovered} day={day} active={activity.activeIds.includes(hovered.placeId)} />}
          {selected && <PlaceDetail marker={selected} day={day} active={activity.activeIds.includes(selected.placeId)} onClose={closeDetail} />}
        </div>
        <Controls day={day} minute={minute} count={activity.density} byCategory={activity.byCategory} realtime={realtime} muted={muted} dark={dark} roads={roads}
          playing={audio.playing} loading={audio.loading} blocked={audio.blocked} error={audio.error} onDay={d => { setRealtime(false); setDay(d) }}
          onMinute={m => { setRealtime(false); setMinute(m) }} onRealtime={() => setRealtime(r => !r)}
          onMethod={showMethod} onTheme={() => setDark(d => !d)} onRoads={() => setRoads(r => !r)} onPlay={audio.toggle} />
      </div>
    </section>
    <About visible={page==='about'} />
    <Method visible={page==='method'} />
  </main>
}
