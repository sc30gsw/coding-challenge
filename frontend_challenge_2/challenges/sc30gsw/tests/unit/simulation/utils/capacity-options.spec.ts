import { describe, expect, it } from 'vitest'
import {
  findCapacityOption,
  formatCapacityValue,
  generateCapacityOptions,
  getCapacityRange,
  getDefaultCapacity,
  getRecommendedCapacity,
  isCapacityRequired,
  validateCapacityValue,
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

  describe('formatCapacityValue', () => {
    it('nullの場合「未設定」を返す', () => {
      expect(formatCapacityValue(null, null)).toBe('未設定')
    })

    it('undefinedの場合「未設定」を返す', () => {
      expect(formatCapacityValue(undefined, null)).toBe('未設定')
    })

    it('文字列の場合そのまま返す', () => {
      expect(formatCapacityValue('30A', 'A')).toBe('30A')
    })

    it('数値でkVA単位の場合、kVAを付けて返す', () => {
      expect(formatCapacityValue(6, 'kVA')).toBe('6kVA')
    })

    it('数値でkVA以外の場合、文字列に変換して返す', () => {
      expect(formatCapacityValue(30, 'A')).toBe('30')
    })
  })

  describe('validateCapacityValue', () => {
    it('契約容量が不要なプランでnullの場合有効', () => {
      const result = validateCapacityValue(null, 'kepco', 'juryoA')
      
      expect(result).toEqual({
        isValid: true,
      })
    })

    it('契約容量が不要なプランで値が設定されている場合無効', () => {
      const result = validateCapacityValue('30A', 'kepco', 'juryoA')
      
      expect(result).toEqual({
        isValid: false,
      })
    })

    it('契約容量が必要なプランでnullの場合無効', () => {
      const result = validateCapacityValue(null, 'tepco', 'juryoB')
      
      expect(result).toEqual({
        isValid: false,
        errorMessage: '契約容量を選択してください',
      })
    })

    it('有効な文字列値の場合有効', () => {
      const result = validateCapacityValue('30A', 'tepco', 'juryoB')
      
      expect(result).toEqual({
        isValid: true,
      })
    })

    it('有効な数値の場合有効', () => {
      const result = validateCapacityValue(6, 'tepco', 'juryoC')
      
      expect(result).toEqual({
        isValid: true,
      })
    })

    it('無効な値の場合エラーメッセージ付きで無効', () => {
      const result = validateCapacityValue('999A', 'tepco', 'juryoB')
      
      expect(result).toEqual({
        isValid: false,
        errorMessage: expect.stringContaining('選択されたプランでは'),
      })
    })
  })

  describe('getDefaultCapacity', () => {
    it('東京電力従量電灯Bの場合30Aを返す', () => {
      const result = getDefaultCapacity('tepco', 'juryoB')
      
      expect(result).toBe('30A')
    })

    it('kVA単位の場合6を返す', () => {
      const result = getDefaultCapacity('tepco', 'juryoC')
      
      expect(result).toBe(6)
    })

    it('契約容量が不要な場合nullを返す', () => {
      const result = getDefaultCapacity('kepco', 'juryoA')
      
      expect(result).toBeNull()
    })

    it('未知のプランの場合nullを返す', () => {
      const result = getDefaultCapacity('unknown', 'unknown')
      
      expect(result).toBeNull()
    })
  })

  describe('findCapacityOption', () => {
    it('存在する文字列値で検索した場合オプションを返す', () => {
      const result = findCapacityOption('tepco', 'juryoB', '30A')
      
      expect(result).toBeTruthy()
      expect(result?.value).toBe('30A')
    })

    it('存在する数値で検索した場合オプションを返す', () => {
      const result = findCapacityOption('tepco', 'juryoC', 6)
      
      expect(result).toBeTruthy()
      expect(result?.value).toBe(6)
    })

    it('存在しない値で検索した場合nullを返す', () => {
      const result = findCapacityOption('tepco', 'juryoB', '999A')
      
      expect(result).toBeNull()
    })

    it('オプションが存在しないプランの場合nullを返す', () => {
      const result = findCapacityOption('unknown', 'unknown', '30A')
      
      expect(result).toBeNull()
    })
  })

  describe('getCapacityRange', () => {
    it('東京電力従量電灯Bの場合範囲情報を返す', () => {
      const result = getCapacityRange('tepco', 'juryoB')
      
      expect(result).toEqual({
        min: expect.any(String),
        max: expect.any(String),
        unit: 'A',
      })
    })

    it('東京電力従量電灯Cの場合範囲情報を返す', () => {
      const result = getCapacityRange('tepco', 'juryoC')
      
      expect(result).toEqual({
        min: expect.any(Number),
        max: expect.any(Number),
        unit: 'kVA',
      })
    })

    it('オプションが存在しない場合nullを返す', () => {
      const result = getCapacityRange('unknown', 'unknown')
      
      expect(result).toEqual({
        min: null,
        max: null,
        unit: null,
      })
    })
  })

  describe('getRecommendedCapacity', () => {
    it('東京電力従量電灯Bで低電気代（3000円未満）の場合20Aを推奨', () => {
      const result = getRecommendedCapacity(2500, 'tepco', 'juryoB')
      
      expect(result).toBe('20A')
    })

    it('東京電力従量電灯Bで中電気代（3000-5000円）の場合30Aを推奨', () => {
      const result = getRecommendedCapacity(4000, 'tepco', 'juryoB')
      
      expect(result).toBe('30A')
    })

    it('東京電力従量電灯Bで高電気代（5000-8000円）の場合40Aを推奨', () => {
      const result = getRecommendedCapacity(6000, 'tepco', 'juryoB')
      
      expect(result).toBe('40A')
    })

    it('東京電力従量電灯Bで超高電気代（8000円以上）の場合50Aを推奨', () => {
      const result = getRecommendedCapacity(10000, 'tepco', 'juryoB')
      
      expect(result).toBe('50A')
    })

    it('kVA単位で低電気代（8000円未満）の場合6kVAを推奨', () => {
      const result = getRecommendedCapacity(6000, 'tepco', 'juryoC')
      
      expect(result).toBe(6)
    })

    it('kVA単位で中電気代（8000-15000円）の場合10kVAを推奨', () => {
      const result = getRecommendedCapacity(12000, 'tepco', 'juryoC')
      
      expect(result).toBe(10)
    })

    it('kVA単位で高電気代（15000-25000円）の場合15kVAを推奨', () => {
      const result = getRecommendedCapacity(20000, 'tepco', 'juryoC')
      
      expect(result).toBe(15)
    })

    it('kVA単位で超高電気代（25000円以上）の場合20kVAを推奨', () => {
      const result = getRecommendedCapacity(30000, 'tepco', 'juryoC')
      
      expect(result).toBe(20)
    })

    it('契約容量が不要なプランの場合nullを返す', () => {
      const result = getRecommendedCapacity(5000, 'kepco', 'juryoA')
      
      expect(result).toBeNull()
    })

    it('未知のプランの場合nullを返す', () => {
      const result = getRecommendedCapacity(5000, 'unknown', 'unknown')
      
      expect(result).toBeNull()
    })
  })
})