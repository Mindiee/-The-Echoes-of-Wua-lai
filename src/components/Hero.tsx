import { formatTime } from '../activity'
import { fullDays } from '../data'
import type { ActivityState } from '../activity'
import { Map } from './Map'

export function Hero({activity, day, minute, dark, onEnter}: {
  activity: ActivityState; day: number; minute: number; dark: boolean; onEnter: () => void
}) {
  return <section className="hero" aria-label="The Echoes of Wua-lai introduction">
    <button className="hero-enter" onClick={onEnter} aria-label="Enter the active map">
      <div className="hero-map" aria-hidden="true">
        <Map activeIds={activity.activeIds} showRoads interactive={false} />
      </div>
      <div className="hero-copy">
        <p className="hero-kicker">INTERACTIVE SOUND MAP · WUA-LAI</p>
        <h1>The Echoes of Wua-lai</h1>
        <p className="hero-description">An interactive experience transforming Wua-lai’s silver craft activity data into music, revealing the neighborhood’s rhythm through sound.</p>
        <p className="hero-live"><span /> LIVE · {fullDays[day].toUpperCase()} {formatTime(minute)} · {activity.density} ACTIVE</p>
        <span className="hero-cta">ENTER ACTIVE MAP <b aria-hidden="true">↓</b></span>
      </div>
    </button>
    <span className="sr-only">Theme: {dark ? 'night' : 'day'}</span>
  </section>
}
