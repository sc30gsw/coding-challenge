import { describe, expect, it } from 'vitest'
import {
  areaSchema,
  capacitySchema,
  companySchema,
  customValidations,
  electricityBillSchema,
  emailSchema,
  planSchema,
  postalCodeSchema,
  simulationSchema,
  stepSchemas,
  validateSimulationForm,
  type PartialSimulationFormData,
} from '~/features/simulation/types/schema/simulation-schema'

describe('simulation-schema', () => {
  describe('postalCodeSchema', () => {
    it('有効な7桁数字を受け入れる', () => {
      const result = postalCodeSchema.safeParse('1234567')
      expect(result.success).toBe(true)
    })

    it('6桁以下は無効', () => {
      const result = postalCodeSchema.safeParse('123456')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('郵便番号は7桁で入力してください。')
    })

    it('8桁以上は無効', () => {
      const result = postalCodeSchema.safeParse('12345678')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('郵便番号は7桁で入力してください。')
    })

    it('数字以外の文字は無効', () => {
      const result = postalCodeSchema.safeParse('123456a')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('郵便番号は数字のみで入力してください。')
    })
  })

  describe('areaSchema', () => {
    it('tokyo, kansai, unsupportedを受け入れる', () => {
      expect(areaSchema.safeParse('tokyo').success).toBe(true)
      expect(areaSchema.safeParse('kansai').success).toBe(true)
      expect(areaSchema.safeParse('unsupported').success).toBe(true)
    })

    it('無効な値は拒否する', () => {
      const result = areaSchema.safeParse('invalid')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('サービスエリアを選択してください。')
    })
  })

  describe('companySchema', () => {
    it('tepco, kepco, otherを受け入れる', () => {
      expect(companySchema.safeParse('tepco').success).toBe(true)
      expect(companySchema.safeParse('kepco').success).toBe(true)
      expect(companySchema.safeParse('other').success).toBe(true)
    })

    it('無効な値は拒否する', () => {
      const result = companySchema.safeParse('invalid')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('電力会社を選択してください。')
    })
  })

  describe('planSchema', () => {
    it('juryoA, juryoB, juryCを受け入れる', () => {
      expect(planSchema.safeParse('juryoA').success).toBe(true)
      expect(planSchema.safeParse('juryoB').success).toBe(true)
      expect(planSchema.safeParse('juryoC').success).toBe(true)
    })

    it('無効な値は拒否する', () => {
      const result = planSchema.safeParse('invalid')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('プランを選択してください。')
    })
  })

  describe('capacitySchema', () => {
    it('従量電灯B用の文字列値を受け入れる', () => {
      expect(capacitySchema.safeParse(30).success).toBe(true)
      expect(capacitySchema.safeParse(50).success).toBe(true)
    })

    it('kVA用の数値を受け入れる', () => {
      expect(capacitySchema.safeParse(6).success).toBe(true)
      expect(capacitySchema.safeParse(20).success).toBe(true)
    })

    it('nullを受け入れる（従量電灯A用）', () => {
      expect(capacitySchema.safeParse(null).success).toBe(true)
    })

    it('undefinedを受け入れる（オプション）', () => {
      expect(capacitySchema.safeParse(undefined).success).toBe(true)
    })

    it('6未満の数値は無効', () => {
      const result = capacitySchema.safeParse(5)
      expect(result.success).toBe(false)
    })

    it('49を超える数値は無効（AMPERE_VALUES外の場合）', () => {
      const result = capacitySchema.safeParse(55) // 55はAMPERE_VALUESに含まれていない
      expect(result.success).toBe(false)
    })

    it('無効な文字列は拒否', () => {
      const result = capacitySchema.safeParse('invalid')
      expect(result.success).toBe(false)
    })
  })

  describe('electricityBillSchema', () => {
    it('1000円以上の値を受け入れる', () => {
      expect(electricityBillSchema.safeParse(1000).success).toBe(true)
      expect(electricityBillSchema.safeParse(5000).success).toBe(true)
    })

    it('1000円未満は無効', () => {
      const result = electricityBillSchema.safeParse(999)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('電気代を正しく入力してください。')
    })

    it('999999円を超える値は無効', () => {
      const result = electricityBillSchema.safeParse(1000000)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('電気代が大きすぎます。')
    })

    it('文字列は無効', () => {
      const result = electricityBillSchema.safeParse('5000')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('電気代は数値で入力してください。')
    })
  })

  describe('emailSchema', () => {
    it('有効なメールアドレスを受け入れる', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name+tag@domain.co.jp').success).toBe(true)
    })

    it('無効なメールアドレスは拒否', () => {
      const result = emailSchema.safeParse('invalid-email')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('メールアドレスを正しく入力してください。')
    })

    it('空文字列は無効', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('メールアドレスを正しく入力してください。')
    })
  })

  describe('simulationSchema', () => {
    it('完全な有効データを受け入れる', () => {
      const validData = {
        postalCode: '1234567',
        area: 'tokyo',
        company: 'tepco',
        plan: 'juryoB',
        capacity: 30,
        electricityBill: 5000,
        email: 'test@example.com',
      } as const satisfies PartialSimulationFormData
      
      const result = simulationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('一部無効なデータは拒否', () => {
      const invalidData = {
        postalCode: 'invalid',
        area: 'tokyo',
        company: 'tepco',
        plan: 'juryoB',
        capacity: 30,
        electricityBill: 5000,
        email: 'test@example.com',
      } as const satisfies PartialSimulationFormData
      
      const result = simulationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('stepSchemas', () => {
    it('postalCodeステップのスキーマが定義されている', () => {
      const data = { postalCode: '1234567' }
      const result = stepSchemas.postalCode.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('areaステップのスキーマが定義されている', () => {
      const data = { 
        postalCode: '1234567',
        area: 'tokyo',
      } as const satisfies PartialSimulationFormData
      const result = stepSchemas.area.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('companyステップのスキーマが定義されている', () => {
      const data = { 
        postalCode: '1234567',
        area: 'tokyo',
        company: 'tepco',
      } as const satisfies PartialSimulationFormData
      const result = stepSchemas.company.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('各ステップで必須フィールドが不足していると無効', () => {
      const data = { postalCode: '1234567' }
      const result = stepSchemas.company.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('customValidations', () => {
    describe('validatePostalCodeArea', () => {
      it('1で始まる郵便番号はtokyoエリア', () => {
        const result = customValidations.validatePostalCodeArea('1234567')
        expect(result).toBe('tokyo')
      })

      it('5で始まる郵便番号はkansaiエリア', () => {
        const result = customValidations.validatePostalCodeArea('5678901')
        expect(result).toBe('kansai')
      })

      it('その他の郵便番号はunsupportedエリア', () => {
        const result = customValidations.validatePostalCodeArea('2345678')
        expect(result).toBe('unsupported')
      })

      it('無効な郵便番号はunsupportedエリア', () => {
        const result = customValidations.validatePostalCodeArea('invalid')
        expect(result).toBe('unsupported')
      })

      it('空文字列はunsupportedエリア', () => {
        const result = customValidations.validatePostalCodeArea('')
        expect(result).toBe('unsupported')
      })
    })

    describe('validateCompanyPlanCombination', () => {
      it('東京電力では従量電灯B/Cが有効', () => {
        expect(customValidations.validateCompanyPlanCombination('tepco', 'juryoB')).toBe(true)
        expect(customValidations.validateCompanyPlanCombination('tepco', 'juryoC')).toBe(true)
      })

      it('東京電力では従量電灯Aは無効', () => {
        expect(customValidations.validateCompanyPlanCombination('tepco', 'juryoA')).toBe(false)
      })

      it('関西電力では従量電灯A/Bが有効', () => {
        expect(customValidations.validateCompanyPlanCombination('kepco', 'juryoA')).toBe(true)
        expect(customValidations.validateCompanyPlanCombination('kepco', 'juryoB')).toBe(true)
      })

      it('関西電力では従量電灯Cは無効', () => {
        expect(customValidations.validateCompanyPlanCombination('kepco', 'juryoC')).toBe(false)
      })

      it('その他の電力会社では全プラン無効', () => {
        expect(customValidations.validateCompanyPlanCombination('other', 'juryoA')).toBe(false)
        expect(customValidations.validateCompanyPlanCombination('other', 'juryoB')).toBe(false)
        expect(customValidations.validateCompanyPlanCombination('other', 'juryoC')).toBe(false)
      })
    })

    describe('validatePlanCapacityCombination', () => {
      it('関西電力従量電灯Aでは契約容量nullが有効', () => {
        expect(customValidations.validatePlanCapacityCombination('kepco', 'juryoA', null)).toBe(true)
        expect(customValidations.validatePlanCapacityCombination('kepco', 'juryoA', undefined)).toBe(true)
      })

      it('関西電力従量電灯Aでは契約容量指定は無効', () => {
        expect(customValidations.validatePlanCapacityCombination('kepco', 'juryoA', 30)).toBe(false)
        expect(customValidations.validatePlanCapacityCombination('kepco', 'juryoA', 10)).toBe(false)
      })

      it('東京電力従量電灯Bでは指定のアンペア数が有効', () => {
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoB', 30)).toBe(true)
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoB', 50)).toBe(true)
      })

      it('東京電力従量電灯Bでは無効なアンペア数は無効', () => {
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoB', 70)).toBe(false)
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoB', 25)).toBe(false) // 25はAMPERE_VALUESに含まれていない
      })

      it('東京電力従量電灯CではkVA数値が有効', () => {
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoC', 10)).toBe(true)
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoC', 20)).toBe(true)
      })

      it('関西電力従量電灯BではkVA数値が有効', () => {
        expect(customValidations.validatePlanCapacityCombination('kepco', 'juryoB', 10)).toBe(true)
        expect(customValidations.validatePlanCapacityCombination('kepco', 'juryoB', 20)).toBe(true)
      })

      it('kVA範囲外の数値は無効', () => {
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoC', 5)).toBe(false)
        expect(customValidations.validatePlanCapacityCombination('tepco', 'juryoC', 50)).toBe(false)
      })
    })
  })

  describe('validateSimulationForm', () => {
    it('エラーなしの場合空オブジェクトを返す', () => {
      const data = {
        postalCode: '1234567',
        area: 'tokyo',
        company: 'tepco',
        plan: 'juryoB',
        capacity: 30,
      } as const satisfies PartialSimulationFormData
      
      const errors = validateSimulationForm(data)
      expect(errors).toEqual({})
    })

    it('郵便番号とエリアの不整合でエラー', () => {
      const data = {
        postalCode: '1234567',
        area: 'kansai',
      } as const satisfies PartialSimulationFormData
      
      const errors = validateSimulationForm(data)
      expect(errors.area).toBe('エリア判定に整合性がありません。')
    })

    it('電力会社とプランの不正な組み合わせでエラー', () => {
      // ? 東京電力では従量電灯Aは無効
      const data = {
        company: 'tepco',
        plan: 'juryoA',
      } as const satisfies PartialSimulationFormData
      
      const errors = validateSimulationForm(data)
      expect(errors.plan).toBe('選択した電力会社では利用できないプランです。')
    })

    it('プランと契約容量の不正な組み合わせでエラー', () => {
      // ? 関西電力従量電灯Aでは契約容量不要
      const data = {
        capacity: 30,
        company: 'kepco',
        plan: 'juryoA',
      } as const satisfies PartialSimulationFormData
      
      const errors = validateSimulationForm(data)
      expect(errors.capacity).toBe('選択したプランでは利用できない契約容量です。')
    })

    it('複数のエラーがある場合すべて返す', () => {
      // ? 郵便番号とエリアの不整合、電力会社とプランの不正な組み合わせ
      const data = {
        postalCode: '1234567',
        area: 'kansai',
        company: 'tepco',
        plan: 'juryoA',
        capacity: null,
      } as const satisfies PartialSimulationFormData
      
      const errors = validateSimulationForm(data)
      expect(errors.area).toBeDefined()
      expect(errors.plan).toBeDefined()
    })

    it('フィールドが不足している場合はチェックをスキップ', () => {
      // ? planが不足
      const data = {
        company: 'tepco',
      } as const satisfies PartialSimulationFormData
      
      const errors = validateSimulationForm(data)
      expect(Object.keys(errors)).toHaveLength(0)
    })
  })
})