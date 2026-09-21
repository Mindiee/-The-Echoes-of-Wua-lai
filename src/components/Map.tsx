import { colors, data, placeById } from '../data'
import type { Marker } from '../data/types'
import type { CSSProperties } from 'react'

type Props = {
  activeIds: string[]; showRoads: boolean; selectedId?: string; onSelect?: (marker: Marker) => void
  interactive?: boolean; hoveredId?: string; onHover?: (marker?: Marker) => void
  rhythms?: Record<string, number>
}

export function Map({ activeIds, showRoads, selectedId, onSelect, interactive = true, hoveredId, onHover, rhythms = {} }: Props) {
  const active = new Set(activeIds)
  const highlightedId = hoveredId ?? selectedId
  return <svg className={`activity-map ${highlightedId ? 'has-focus' : ''}`} viewBox="0 0 1100 1024"
    aria-label={interactive ? 'Interactive map of Wua-lai' : undefined} aria-hidden={!interactive} role={interactive ? 'group' : undefined}>
    <g className="base-roads" style={{ opacity: showRoads ? 1 : 0 }} aria-hidden="true">
      {data.roads.slice(0, 7).map((road, i) => <path key={i} d={road.d} fill="none" stroke="var(--road)" strokeWidth="2" />)}
    </g>
    {[...data.markers].sort((a,b) => Number(b.shape === 'route') - Number(a.shape === 'route')).map(marker => {
      const place = placeById.get(marker.placeId)!
      const isActive = active.has(place.id)
      const isRoute = marker.shape === 'route'
      const isCrafthouse = place.category === 'Crafthouse'
      const color = isActive ? colors[place.category] : 'var(--ink)'
      const label = `${place.name}, ${place.category}, ${isActive ? 'Active' : 'Inactive'}`
      const isHovered = hoveredId === place.id
      const isSelected = selectedId === place.id
      const isHighlighted = highlightedId === place.id
      const style = {
        '--rhythm': `${rhythms[place.id] ?? 3.2}s`,
        '--phase': `${.05 + (Number(place.id.slice(1)) % 7) * .1}s`,
        '--activity-color': isActive ? colors[place.category] : 'transparent',
      } as CSSProperties
      return <g key={marker.id} data-marker={marker.id} data-place={place.id} data-active={isActive}
        data-category={place.category} data-hovered={isHovered} data-selected={isSelected}
        data-highlighted={isHighlighted} data-dimmed={Boolean(highlightedId && !isHighlighted)}
        className={`map-marker ${isRoute ? 'route-marker' : ''}`} role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}
        aria-label={label} aria-pressed={selectedId === place.id}
        style={style} onPointerEnter={interactive ? () => onHover?.(marker) : undefined} onPointerLeave={interactive ? () => onHover?.() : undefined}
        onFocus={interactive ? () => onHover?.(marker) : undefined} onBlur={interactive ? () => onHover?.() : undefined}
        onClick={interactive ? () => onSelect?.(marker) : undefined} onKeyDown={interactive ? event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.(marker) }
        } : undefined}>
        <title>{label}</title>
        {isRoute ? <>
          <path className="marker-visible" d={marker.geometry.d} fill="none" stroke={isActive ? color : 'var(--road)'} strokeWidth="2" strokeLinecap="round" />
          <path d={marker.geometry.d} fill="none" stroke="transparent" strokeWidth="16" className="hit-target" />
        </> : <>
          {marker.frame && !isCrafthouse && <rect x={marker.x - 4} y={marker.y - 4} width="8" height="8" fill="none" stroke="var(--ink)" strokeWidth=".7" />}
          {isCrafthouse
            ? <circle className="marker-visible" cx={marker.x} cy={marker.y} r="4" fill={isActive ? color : 'var(--paper)'} stroke={color} strokeWidth="1" />
            : marker.shape === 'path'
            ? <path className="marker-visible" d={marker.geometry.d} fill={isActive || marker.frame ? color : 'var(--paper)'} stroke={color} strokeWidth={marker.frame ? 1 : 1.4} />
            : <circle className="marker-visible" cx={marker.x} cy={marker.y} r={marker.geometry.r} fill={isActive ? color : 'var(--paper)'} stroke={color} strokeWidth="1" />}
          <circle className="focus-ring" cx={marker.x} cy={marker.y} r="10" />
          <circle className="hit-target" cx={marker.x} cy={marker.y} r="9" fill="transparent" />
        </>}
      </g>
    })}
  </svg>
}
