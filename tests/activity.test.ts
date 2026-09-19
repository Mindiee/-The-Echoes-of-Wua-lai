import { describe, expect, it } from 'vitest'
import { data } from '../src/data'
import { calculateActivity, bangkokTime, formatTime, isActive } from '../src/activity'

describe('weekly activity rules', () => {
  it.each([[0,720,27,20.4],[3,720,26,19.4],[5,720,25,18.4],[5,1140,9,6.8],[6,720,20,14.2]])(
    'day %i minute %i → %i activities / %f intensity', (day, minute, count, intensity) => {
      const state = calculateActivity(data, day, minute)
      expect(state.density).toBe(count)
      expect(state.intensity).toBe(intensity)
    })
  it('includes opening, excludes closing and never counts a market secondary role twice', () => {
    const market = data.places.find(p => p.id === 'P14')!
    expect(isActive(market, 5, 959)).toBe(false)
    expect(isActive(market, 5, 960)).toBe(true)
    expect(isActive(market, 5, 1379)).toBe(true)
    expect(isActive(market, 5, 1380)).toBe(false)
    expect(isActive(market, 0, 1000)).toBe(false)
    const state = calculateActivity(data, 5, 1320)
    expect(state.activeIds.filter(id => id === 'P14')).toHaveLength(1)
    expect(state.intensity).toBe(1.8) // market + two temples
  })
  it('checks every minute against an independent interval oracle', () => {
    for (let day = 0; day < 7; day++) for (let minute = 0; minute <= 1440; minute++) {
      const expected = data.places.filter(p => {
        const h = p.hours[day]
        return h !== null && minute >= h[0] && minute < h[1]
      })
      const actual = calculateActivity(data, day, minute)
      expect(actual.activeIds).toEqual(expected.map(p => p.id))
      expect(actual.intensity).toBeCloseTo(expected.reduce((sum,p) => sum + data.weights[p.category], 0), 8)
    }
  })
  it('keeps midnight/end of day silent, guards invalid controls and counts places rather than markers', () => {
    expect(calculateActivity(data, 0, 1440).density).toBe(0)
    expect(calculateActivity(data, 0, 0).density).toBe(0)
    expect(calculateActivity(data, 0, 720).density).toBeLessThan(data.markers.length)
    expect(() => calculateActivity(data, 7, 720)).toThrow()
    expect(() => calculateActivity(data, 0, NaN)).toThrow()
  })
  it('uses Bangkok local day/minute even across UTC Sunday/Monday', () => {
    expect(bangkokTime(new Date('2026-09-20T18:35:00Z'))).toEqual({ day: 0, minute: 95 })
    expect(formatTime(1440)).toBe('24:00')
    expect(formatTime(510)).toBe('08:30')
  })
})
