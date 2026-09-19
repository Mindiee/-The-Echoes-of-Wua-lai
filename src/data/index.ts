import source from './source-data.json'
import type { Category, SourceData } from './types'

export const data = source as SourceData
export const placeById = new Map(data.places.map(place => [place.id, place]))
export const colors: Record<Category, string> = {
  Temple: '#EAAB1D', Workshop: '#E94A35', Museum: '#BC522A',
  'Silver Shop': '#007A9B', 'Market Night': '#007A9B', Crafthouse: '#B8B19E',
}
export const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
export const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
