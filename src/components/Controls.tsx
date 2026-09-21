import { days, fullDays } from '../data'
import { formatTime } from '../activity'

type Props = {
  day: number; minute: number; count: number; realtime: boolean
  muted: boolean; dark: boolean; roads: boolean; playing: boolean; loading: boolean; error: string
  onDay: (day: number) => void; onMinute: (minute: number) => void; onRealtime: () => void
  onMethod: () => void; onTheme: () => void; onRoads: () => void; onPlay: () => void
}

const legend = [['Temple','#EAAB1D'],['Workshop','#E94A35'],['Museum','#BC522A'],['Market','#007A9B'],['Crafthouse','#B8B19E']]

function Icon({name}: {name: 'method' | 'theme' | 'road' | 'play' | 'pause'}) {
  return <svg className="control-icon" viewBox="0 0 20 20" aria-hidden="true">
    {name === 'method' && <><path d="M4 5h8M4 10h12M4 15h8"/><path d="m12 13 3 2-3 2"/></>}
    {name === 'theme' && <path d="M14.5 13.8A6 6 0 0 1 6.2 5.5 6.2 6.2 0 1 0 14.5 13.8Z"/>}
    {name === 'road' && <><path d="M6.5 3 5 17M13.5 3 15 17"/><path d="M10 4v2m0 2v2m0 2v2m0 2v1"/></>}
    {name === 'play' && <path className="fill-icon" d="m7 5 8 5-8 5Z"/>}
    {name === 'pause' && <><path d="M7 5v10M13 5v10"/></>}
  </svg>
}

export function Controls(p: Props) {
  return <aside className="controls" aria-label="Soundscape controls">
    <h2>The Echoes of Wua-lai</h2>
    <p className="active-count" aria-live="polite"><span className={`status-dot ${p.playing && !p.muted ? 'playing' : ''}`} />
      <span data-testid="active-count">{p.count} ACTIVE ACTIVITIES</span></p>
    <ul className="legend" aria-label="Activity legend">
      {legend.map(([name,color]) => <li key={name}><span style={{ background: color }} className={`legend-dot ${name === 'Crafthouse' ? 'outlined' : ''}`} />{name}</li>)}
    </ul>
    <button className="realtime-button" aria-pressed={p.realtime} onClick={p.onRealtime}>REAL TIME</button>
    <div className="timeline">
      <label htmlFor="time">TIME <output htmlFor="time">{formatTime(p.minute)}</output></label>
      <input id="time" aria-label="Time" aria-valuetext={formatTime(p.minute)} type="range" min="0" max="1440" step="1" value={p.minute} onChange={e => p.onMinute(Number(e.target.value))} />
      <div className="ticks" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
      <label htmlFor="day">DAY</label>
      <input id="day" aria-label="Day" aria-valuetext={fullDays[p.day]} type="range" min="0" max="6" step="1" value={(p.day + 1) % 7} onChange={e => p.onDay((Number(e.target.value) + 6) % 7)} />
      <div className="ticks day-ticks" aria-hidden="true">{[6,0,1,2,3,4,5].map(d => <span key={d}>{days[d]}</span>)}</div>
    </div>
    <div className="actions">
      <button className="circle-control" aria-label="View how it works" aria-pressed="false" onClick={p.onMethod} title="How it works"><Icon name="method" /></button>
      <button className="circle-control" aria-label="Night mode" aria-pressed={p.dark} onClick={p.onTheme} title="Day / night mode"><Icon name="theme" /></button>
      <button className="circle-control" aria-label="Show roads" aria-pressed={p.roads} onClick={p.onRoads} title="Show / hide roads"><Icon name="road" /></button>
      <button className={`circle-control ${p.loading ? 'loading' : ''}`} aria-label={p.loading ? 'Cancel loading soundscape' : p.playing ? 'Pause soundscape' : 'Play soundscape'} aria-pressed={p.playing} onClick={p.onPlay} title={p.playing ? 'Pause' : 'Play'}><Icon name={p.playing ? 'pause' : 'play'} /></button>
    </div>
    <p className="playback-state" role="status">{p.loading ? 'Loading sound…' : p.playing ? p.muted ? 'Playing · muted' : p.count ? 'Soundscape playing' : 'Playing · no active activities' : ''}</p>
    {p.error && <p className="audio-error" role="alert">{p.error} <button onClick={p.onPlay}>Try again</button></p>}
  </aside>
}
