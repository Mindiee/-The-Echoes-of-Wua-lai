import type { ActivityState } from '../activity'
import type { SoundType, SourceData } from '../data/types'

export type VoiceSpec = { key: string; placeId: string; role: SoundType; weight: number; gain: number; interval: number; pan: number }
const gains: Record<SoundType, number> = { 'Main Craft': .075, 'Soft Craft': .065, Market: .05, Respect: .055, Culture: .07 }
const baseIntervals: Record<SoundType, number> = { 'Main Craft': 2.4, 'Soft Craft': 4.2, Market: 9, Respect: 14, Culture: 5.5 }

export function eventInterval(role: SoundType, roleIntensity: number): number {
  return baseIntervals[role] / (1 + Math.min(roleIntensity, 20) / 10)
}

export function buildVoices(source: SourceData, state: ActivityState): VoiceSpec[] {
  const active = new Set(state.activeIds)
  const places = source.places.filter(p => active.has(p.id))
  const roleIntensity = new Map<SoundType, number>()
  for (const place of places) for (const role of place.soundTypes) {
    roleIntensity.set(role, (roleIntensity.get(role) ?? 0) + source.weights[place.category] / place.soundTypes.length)
  }
  return places.flatMap(place => place.soundTypes.map(role => {
    const point = source.markers.find(m => m.placeId === place.id)
    return { key: `${place.id}:${role}`, placeId: place.id, role,
      weight: source.weights[place.category] / place.soundTypes.length,
      gain: gains[role], interval: eventInterval(role, roleIntensity.get(role)!),
      pan: point ? Math.max(-.65, Math.min(.65, (point.x - 600) / 650)) : 0,
    }
  }))
}
