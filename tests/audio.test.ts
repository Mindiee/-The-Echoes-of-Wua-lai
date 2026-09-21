import { describe, expect, it } from 'vitest'
import { calculateActivity } from '../src/activity'
import { data } from '../src/data'
import { buildVoices, eventInterval } from '../src/audio/score'

describe('sound mapping and density', () => {
  it('has one voice per distinct active place/role, not per map point', () => {
    const state = calculateActivity(data, 0, 720)
    const voices = buildVoices(data, state)
    expect(voices).toHaveLength(27)
    expect(voices.filter(v => v.placeId === 'P20')).toHaveLength(1)
    expect(new Set(voices.map(v => v.key)).size).toBe(voices.length)
  })
  it('splits the market contribution between its two roles without double-counting', () => {
    const state = calculateActivity(data, 5, 1140)
    const voices = buildVoices(data, state)
    const market = voices.filter(v => v.placeId === 'P14')
    expect(market.map(v => v.role)).toEqual(['Market','Culture'])
    expect(market.reduce((s,v) => s + v.weight, 0)).toBe(1.2)
    expect(voices.reduce((s,v) => s + v.weight, 0)).toBeCloseTo(state.intensity)
  })
  it('increases rhythm/event density rather than gain, and has no voices at closing', () => {
    expect(eventInterval('Main Craft', 10)).toBeLessThan(eventInterval('Main Craft', 1))
    expect(buildVoices(data, calculateActivity(data, 0, 1440))).toEqual([])
    const noon = buildVoices(data, calculateActivity(data, 0, 720))
    const morning = buildVoices(data, calculateActivity(data, 0, 540))
    expect(noon.find(v => v.placeId === 'P01')!.gain).toBe(morning.find(v => v.placeId === 'P01')!.gain)
  })
  it('can isolate one activity without changing its sound mapping', () => {
    const state = calculateActivity(data, 0, 720)
    const all = buildVoices(data, state)
    const solo = buildVoices(data, state, 'P20')
    expect(solo).toHaveLength(1)
    expect(solo[0].placeId).toBe('P20')
    expect(solo[0].role).toBe(all.find(v => v.placeId === 'P20')!.role)
  })
})
