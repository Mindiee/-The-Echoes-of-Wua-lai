import type { CSSProperties } from 'react'
import { formatTime } from '../activity'
import { colors, fullDays, placeById } from '../data'
import type { Marker } from '../data/types'

export function MarkerTooltip({ marker, day, active }: { marker: Marker; day: number; active: boolean }) {
  const place = placeById.get(marker.placeId)!
  const hours = place.hours[day]
  const horizontal = marker.x > 650 ? 'left' : 'right'
  const vertical = marker.y < 300 ? 'below' : 'above'
  const style = { left: `${marker.x / 1100 * 100}%`, top: `${marker.y / 1024 * 100}%` } as CSSProperties

  return <aside className="marker-tooltip" role="tooltip" data-horizontal={horizontal} data-vertical={vertical} style={style}>
    <strong lang={/[ก-๙]/.test(place.name) ? 'th' : undefined}>{place.name}</strong>
    <span>{place.category}</span>
    <span>{fullDays[day]} · {hours ? `${formatTime(hours[0])}–${formatTime(hours[1])}` : 'Closed'}</span>
    <span className="tooltip-state"><i style={{ background: active ? colors[place.category] : 'var(--muted)' }} />{active ? 'Active' : 'Inactive'}</span>
  </aside>
}
