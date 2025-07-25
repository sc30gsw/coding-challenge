import { describe, expect, it } from 'vitest'
import {
  generateCapacityOptions,
  isCapacityRequired,
} from '~/features/simulation/utils/capacity-options'

describe('capacity-options', () => {
  describe('generateCapacityOptions', () => {
    it('東京電力従量電灯Bの場合、Aアンペア単位のオプションを返す', () => {
      const result = generateCapacityOptions('tepco', 'juryoB')
      
      expect(result).toEqual({
        options: expect.any(Array),
        isRequired: true,
        unit: 'A',
        helpText: '一般的なご家庭では30Aが目安です',
      })
      expect(result.options.length).toBeGreaterThan(0)
    })

    it('東京電力従量電灯Cの場合、kVA単位のオプションを返す', () => {
      const result = generateCapacityOptions('tepco', 'juryoC')
      
      expect(result).toEqual({
        options: expect.any(Array),
        isRequired: true,
        unit: 'kVA',
        helpText: '大容量を使用される場合に適用されます',
      })
      expect(result.options.length).toBeGreaterThan(0)
    })

    it('関西電力従量電灯Aの場合、契約容量は不要', () => {
      const result = generateCapacityOptions('kepco', 'juryoA')
      
      expect(result).toEqual({
        options: expect.any(Array),
        isRequired: false,
        unit: null,
        helpText: '従量電灯Aでは契約容量の設定は不要です',
      })
    })

    it('関西電力従量電灯Bの場合、kVA単位のオプションを返す', () => {
      const result = generateCapacityOptions('kepco', 'juryoB')
      
      expect(result).toEqual({
        options: expect.any(Array),
        isRequired: true,
        unit: 'kVA',
        helpText: '大容量を使用される場合に適用されます',
      })
      expect(result.options.length).toBeGreaterThan(0)
    })

    it('未知の電力会社・プランの場合、デフォルト値を返す', () => {
      const result = generateCapacityOptions('unknown', 'unknown')
      
      expect(result).toEqual({
        options: [],
        isRequired: false,
        unit: null,
        helpText: '選択されたプランでは契約容量は設定できません',
      })
    })
  })

  describe('isCapacityRequired', () => {
    it('東京電力従量電灯Bは契約容量が必要', () => {
      expect(isCapacityRequired('tepco', 'juryoB')).toBe(true)
    })

    it('東京電力従量電灯Cは契約容量が必要', () => {
      expect(isCapacityRequired('tepco', 'juryoC')).toBe(true)
    })

    it('関西電力従量電灯Aは契約容量が不要', () => {
      expect(isCapacityRequired('kepco', 'juryoA')).toBe(false)
    })

    it('関西電力従量電灯Bは契約容量が必要', () => {
      expect(isCapacityRequired('kepco', 'juryoB')).toBe(true)
    })

    it('未知のプランは契約容量が不要', () => {
      expect(isCapacityRequired('unknown', 'unknown')).toBe(false)
    })
  })
})