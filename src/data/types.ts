export type Category = 'Silver Shop' | 'Crafthouse' | 'Workshop' | 'Temple' | 'Market Night' | 'Museum'
export type SoundType = 'Main Craft' | 'Soft Craft' | 'Market' | 'Respect' | 'Culture'
export type Hours = [number, number] | null
export type Place = {
  id: string; name: string; category: Category; hours: Hours[]
  rawHours: string[]; soundTypes: SoundType[]; sourceRow: number
}
export type Marker = {
  id: string; placeId: string; x: number; y: number
  shape: 'path' | 'circle' | 'route'
  geometry: { d?: string; cx?: string; cy?: string; r?: string }
  sourceElement: number; frame: boolean
}
export type SourceData = {
  places: Place[]; weights: Record<Category, number>
  sounds: Record<SoundType, { base: string; role: string; character: string; sourceRow: number }>
  roads: { d: string; stroke: string; 'stroke-width': string }[]; markers: Marker[]
}
