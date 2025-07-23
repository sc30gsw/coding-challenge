import { describe, expect, it } from 'vitest'
import {
  detectAreaFromPostalCode,
  getAreaInfo,
  getAvailableCompaniesForPostalCode,
  getPostalCodeInputFeedback,
  isSupportedArea,
  validatePostalCodeChange,
} from '~/features/simulation/utils/area-detection'

describe('area-detection', () => {
  describe('detectAreaFromPostalCode', () => {
    it('東京電力エリア（1で始まる郵便番号）を正しく判定する', () => {
      const result = detectAreaFromPostalCode('1234567')
      
      expect(result).toEqual({
        area: 'tokyo',
        areaName: '東京電力エリア',
        isSupported: true,
      })
    })

    it('関西電力エリア（5で始まる郵便番号）を正しく判定する', () => {
      const result = detectAreaFromPostalCode('5678901')
      
      expect(result).toEqual({
        area: 'kansai',
        areaName: '関西電力エリア',
        isSupported: true,
      })
    })

    it('対象外エリアを正しく判定する', () => {
      const result = detectAreaFromPostalCode('2345678')
      
      expect(result).toEqual({
        area: 'unsupported',
        areaName: 'サービスエリア対象外',
        isSupported: false,
        errorMessage: 'サービスエリア対象外です。',
      })
    })

    it('7桁でない郵便番号の場合エラーを返す', () => {
      const result = detectAreaFromPostalCode('123456')
      
      expect(result).toEqual({
        area: 'unsupported',
        areaName: 'サービスエリア対象外',
        isSupported: false,
        errorMessage: '郵便番号は7桁で入力してください',
      })
    })

    it('数字以外が含まれる郵便番号の場合エラーを返す', () => {
      const result = detectAreaFromPostalCode('123456a')
      
      expect(result).toEqual({
        area: 'unsupported',
        areaName: 'サービスエリア対象外',
        isSupported: false,
        errorMessage: '郵便番号は数字のみで入力してください',
      })
    })

    it('空文字列の場合エラーを返す', () => {
      const result = detectAreaFromPostalCode('')
      
      expect(result).toEqual({
        area: 'unsupported',
        areaName: 'サービスエリア対象外',
        isSupported: false,
        errorMessage: '郵便番号は7桁で入力してください',
      })
    })
  })

  describe('isSupportedArea', () => {
    it('東京電力エリアはサポート対象', () => {
      expect(isSupportedArea('tokyo')).toBe(true)
    })

    it('関西電力エリアはサポート対象', () => {
      expect(isSupportedArea('kansai')).toBe(true)
    })

    it('対象外エリアはサポート対象外', () => {
      expect(isSupportedArea('unsupported')).toBe(false)
    })
  })

  describe('getAvailableCompaniesForPostalCode', () => {
    it('東京電力エリアの場合、東京電力とその他を返す', () => {
      const companies = getAvailableCompaniesForPostalCode('1234567')
      
      expect(companies).toEqual(['tepco', 'other'])
    })

    it('関西電力エリアの場合、関西電力とその他を返す', () => {
      const companies = getAvailableCompaniesForPostalCode('5678901')
      
      expect(companies).toEqual(['kepco', 'other'])
    })

    it('対象外エリアの場合、空配列を返す', () => {
      const companies = getAvailableCompaniesForPostalCode('2345678')
      
      expect(companies).toEqual([])
    })

    it('無効な郵便番号の場合、空配列を返す', () => {
      const companies = getAvailableCompaniesForPostalCode('invalid')
      
      expect(companies).toEqual([])
    })
  })

  describe('validatePostalCodeChange', () => {
    it('有効な郵便番号で初回入力の場合', () => {
      const result = validatePostalCodeChange('1234567')
      
      expect(result).toEqual({
        isValid: true,
        newArea: 'tokyo',
        shouldResetForm: false,
        errorMessage: undefined,
      })
    })

    it('エリアが変更された場合フォームリセットが必要', () => {
      const result = validatePostalCodeChange('5678901', 'tokyo')
      
      expect(result).toEqual({
        isValid: true,
        newArea: 'kansai',
        shouldResetForm: true,
        errorMessage: undefined,
      })
    })

    it('同じエリア内で変更された場合フォームリセット不要', () => {
      const result = validatePostalCodeChange('1111111', 'tokyo')
      
      expect(result).toEqual({
        isValid: true,
        newArea: 'tokyo',
        shouldResetForm: false,
        errorMessage: undefined,
      })
    })

    it('無効な郵便番号の場合', () => {
      const result = validatePostalCodeChange('123456')
      
      expect(result).toEqual({
        isValid: false,
        newArea: 'unsupported',
        shouldResetForm: false,
        errorMessage: '郵便番号は7桁で入力してください',
      })
    })
  })

  describe('getPostalCodeInputFeedback', () => {
    it('空文字列の場合', () => {
      const result = getPostalCodeInputFeedback('')
      
      expect(result).toEqual({
        canPredict: false,
        feedback: '郵便番号を入力してください',
      })
    })

    it('1で始まる部分入力の場合', () => {
      const result = getPostalCodeInputFeedback('1')
      
      expect(result).toEqual({
        canPredict: true,
        predictedArea: 'tokyo',
        feedback: '東京電力エリアです',
      })
    })

    it('5で始まる部分入力の場合', () => {
      const result = getPostalCodeInputFeedback('5')
      
      expect(result).toEqual({
        canPredict: true,
        predictedArea: 'kansai',
        feedback: '関西電力エリアです',
      })
    })

    it('対象外エリアの部分入力の場合', () => {
      const result = getPostalCodeInputFeedback('2')
      
      expect(result).toEqual({
        canPredict: true,
        predictedArea: 'unsupported',
        feedback: 'サービスエリア対象外の可能性があります',
      })
    })

    it('複数桁入力の場合も正しく判定する', () => {
      const result = getPostalCodeInputFeedback('123')
      
      expect(result).toEqual({
        canPredict: true,
        predictedArea: 'tokyo',
        feedback: '東京電力エリアです',
      })
    })
  })

  describe('getAreaInfo', () => {
    it('東京電力エリアの情報を取得できる', () => {
      const areaInfo = getAreaInfo('tokyo')
      
      expect(areaInfo).toBeDefined()
      expect(areaInfo.code).toBe('tokyo')
    })

    it('関西電力エリアの情報を取得できる', () => {
      const areaInfo = getAreaInfo('kansai')
      
      expect(areaInfo).toBeDefined()
      expect(areaInfo.code).toBe('kansai')
    })

    it('対象外エリアの情報を取得できる', () => {
      const areaInfo = getAreaInfo('unsupported')
      
      expect(areaInfo).toBeDefined()
      expect(areaInfo.code).toBe('unsupported')
    })
  })
})