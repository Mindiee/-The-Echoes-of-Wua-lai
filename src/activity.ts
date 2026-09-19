import type { Category, Place, SourceData } from './data/types'

export type ActivityState = { activeIds: string[]; density: number; intensity: number; byCategory: Record<Category, number> }

export function isActive(place: Place, day: number, minute: number): boolean {
  const hours = place.hours[day]
  return hours != null && minute >= hours[0] && minute < hours[1]
}

export function calculateActivity(source: SourceData, day: number, minute: number): ActivityState {
  if (!Number.isInteger(day) || day < 0 || day > 6 || !Number.isInteger(minute) || minute < 0 || minute > 1440) {
    throw new RangeError('Day must be 0–6 (Monday first); minute must be 0–1440')
  }
  const byCategory = Object.fromEntries(Object.keys(source.weights).map(c => [c, 0])) as Record<Category, number>
  const activeIds: string[] = []
  for (const place of source.places) {
    if (isActive(place, day, minute)) { activeIds.push(place.id); byCategory[place.category]++ }
  }
  const intensity = Math.round(Object.entries(byCategory).reduce((sum, [category,count]) => sum + count * source.weights[category as Category], 0) * 1000) / 1000
  return { activeIds, byCategory, density: activeIds.length, intensity }
}

export function formatTime(minute: number): string {
  return `${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`
}

const bangkokFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export function bangkokTime(now = new Date()): { day: number; minute: number } {
  const parts = Object.fromEntries(bangkokFormatter.formatToParts(now).map(p => [p.type, p.value]))
  return { day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(parts.weekday), minute: Number(parts.hour) * 60 + Number(parts.minute) }
}
