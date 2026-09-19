import { colors, data, placeById } from '../data'
import type { Marker } from '../data/types'

type Props = { activeIds: string[]; showRoads: boolean; selectedId?: string; onSelect: (marker: Marker) => void }

export function Map({ activeIds, showRoads, selectedId, onSelect }: Props) {
  const active = new Set(activeIds)
  return <svg className="activity-map" viewBox="0 0 1100 1024" aria-label="Interactive map of Wua-lai" role="group">
    <g className="base-roads" style={{ opacity: showRoads ? 1 : 0 }} aria-hidden="true">
      {data.roads.slice(0, 7).map((road, i) => <path key={i} d={road.d} fill="none" stroke="var(--road)" strokeWidth="2" />)}
    </g>
    {[...data.markers].sort((a,b) => Number(b.shape === 'route') - Number(a.shape === 'route')).map(marker => {
      const place = placeById.get(marker.placeId)!
      const isActive = active.has(place.id)
      const isRoute = marker.shape === 'route'
      const color = isActive ? colors[place.category] : 'var(--ink)'
      const label = `${place.name}, ${place.category}, ${isActive ? 'Active' : 'Inactive'}`
      return <g key={marker.id} data-marker={marker.id} data-place={place.id} data-active={isActive}
        className={`map-marker ${isRoute ? 'route-marker' : ''}`} role="button" tabIndex={0}
        aria-label={label} aria-pressed={selectedId === place.id}
        onClick={() => onSelect(marker)} onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(marker) }
        }}>
        <title>{label}</title>
        {isRoute ? <>
          <path className="marker-visible" d={marker.geometry.d} fill="none" stroke={isActive ? color : 'var(--road)'} strokeWidth="2" strokeLinecap="round" />
          <path d={marker.geometry.d} fill="none" stroke="transparent" strokeWidth="16" className="hit-target" />
        </> : <>
          {marker.frame && <rect x={marker.x - 4} y={marker.y - 4} width="8" height="8" fill="none" stroke="var(--ink)" strokeWidth=".7" />}
          {marker.shape === 'path'
            ? <path className="marker-visible" d={marker.geometry.d} fill={isActive || marker.frame ? color : 'var(--paper)'} stroke={color} strokeWidth={marker.frame ? 1 : 1.4} />
            : <circle className="marker-visible" cx={marker.x} cy={marker.y} r={marker.geometry.r} fill={isActive ? color : 'var(--paper)'} stroke={color} strokeWidth="1" />}
          <circle className="focus-ring" cx={marker.x} cy={marker.y} r="10" />
          <circle className="hit-target" cx={marker.x} cy={marker.y} r="9" fill="transparent" />
        </>}
      </g>
    })}
  </svg>
}
