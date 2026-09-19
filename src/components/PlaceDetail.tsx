import { useEffect, useRef } from 'react'
import { colors, fullDays, placeById } from '../data'
import { formatTime } from '../activity'
import type { Marker } from '../data/types'

export function PlaceDetail({ marker, day, active, onClose }: { marker: Marker; day: number; active: boolean; onClose: () => void }) {
  const place = placeById.get(marker.placeId)!
  const close = useRef<HTMLButtonElement>(null)
  const hours = place.hours[day]
  useEffect(() => { close.current?.focus({ preventScroll: true }) }, [marker.id])
  return <section className="place-detail" role="dialog" aria-modal="false" aria-label={`Details: ${place.name}`}
    style={{ left: `${Math.min(marker.x / 1100 * 100 + 2, 63)}%`, top: `${Math.min(marker.y / 1024 * 100, 70)}%` }}
    onKeyDown={e => { if (e.key === 'Escape') onClose() }}>
    <button className="close-detail" ref={close} onClick={onClose} aria-label="Close place details">×</button>
    <h2 lang="th">{place.name}</h2>
    <p className="detail-category">{place.category}</p>
    <p>{fullDays[day]} · {hours ? `${formatTime(hours[0])}–${formatTime(hours[1])}` : 'Closed'}</p>
    <p>Activity · {place.category}</p>
    <p className="detail-state"><span className="detail-dot" style={{ background: active ? colors[place.category] : 'var(--muted)' }} />{active ? 'Active' : 'Inactive'}</p>
  </section>
}
