import { describe, expect, it } from 'vitest'
import type { PartialSimulationFormData } from '~/features/simulation/types/schema/simulation-schema'
import {
  analyzeFormState,
  canSubmitForm,
  getFieldsToReset,
  updateFormStepsWithErrors,
} from '~/features/simulation/utils/form-state'

describe('form-state', () => {
  describe('analyzeFormState', () => {
    it('初期状態では郵便番号のみ有効', () => {
      const formData: PartialSimulationFormData = {}
      const result = analyzeFormState(formData)
      
      expect(result.enabledFields).toEqual({
        postalCode: true,
        area: false,
        company: false,
        plan: false,
        capacity: false,
        electricityBill: false,
        email: false,
      })
      expect(result.currentStep).toBe('postal-code')
      expect(result.nextRequiredField).toBe('postalCode')
      expect(result.isFormComplete).toBe(false)
    })

    it('有効な郵便番号入力後は電力会社選択が有効', () => {
      const formData = {
        postalCode: '1234567',
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)
      
      expect(result.enabledFields.company).toBe(true)
      expect(result.currentStep).toBe('company')
      expect(result.completedSteps['postal-code']).toBe(true)
    })

    it('対象外エリアの場合は郵便番号ステップで停止', () => {
      const formData = {
        postalCode: '2345678',
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)
      
      expect(result.enabledFields.company).toBe(false)
      expect(result.currentStep).toBe('postal-code')
      expect(result.completedSteps['postal-code']).toBe(false)
      expect(result.nextRequiredField).toBe('postalCode')
    })

    it('電力会社で「その他」選択時は進行停止', () => {
      const formData = {
        postalCode: '1234567',
        company: 'other',
      } as const satisfies PartialSimulationFormData  
      const result = analyzeFormState(formData)
      
      expect(result.enabledFields.plan).toBe(false)
      expect(result.currentStep).toBe('company')
      expect(result.completedSteps.company).toBe(false)
      expect(result.nextRequiredField).toBe('company')
    })

    it('東京電力従量電灯Bの場合は契約容量選択が必要', () => {
      const formData = {
        postalCode: '1234567',
        company: 'tepco',
        plan: 'juryoB',
      } as const satisfies PartialSimulationFormData  
      const result = analyzeFormState(formData)
      
      expect(result.enabledFields.capacity).toBe(true)
      expect(result.currentStep).toBe('capacity')
      expect(result.completedSteps.plan).toBe(true)
    })

    it('関西電力従量電灯Aの場合は契約容量不要で電気代入力へ', () => {
      const formData = {
        postalCode: '5678901',
        company: 'kepco',
        plan: 'juryoA',
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)
      
      expect(result.enabledFields.capacity).toBe(false)
      expect(result.enabledFields.electricityBill).toBe(true)
      expect(result.currentStep).toBe('electricity-bill')
      expect(result.completedSteps.capacity).toBe(true)
    })

    it('全項目完了時はフォーム完了状態', () => {
      const formData = {
        postalCode: '1234567',
        company: 'tepco',
        plan: 'juryoB',
        capacity: 30,
        electricityBill: 5000,
        email: 'test@example.com',
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)
      
      expect(result.isFormComplete).toBe(true)
      expect(result.currentStep).toBeNull()
      expect(result.nextRequiredField).toBeNull()
    })
  })

  describe('getFieldsToReset', () => {
    it('郵便番号変更でエリアが変わる場合、関連フィールドをリセット', () => {
      const previousData = {
        postalCode: '1234567',
        company: 'tepco',
        plan: 'juryoB',
      } as const satisfies PartialSimulationFormData
      const newData = {
        postalCode: '5678901',
        company: 'tepco',
        plan: 'juryoB',
      } as const satisfies PartialSimulationFormData
      
      const fieldsToReset = getFieldsToReset(previousData, newData)
      
      expect(fieldsToReset).toContain('area')
      expect(fieldsToReset).toContain('company')
      expect(fieldsToReset).toContain('plan')
      expect(fieldsToReset).toContain('capacity')
    })

    it('郵便番号変更時は常に関連フィールドをリセット', () => {
      const previousData = {
        postalCode: '1234567',
        company: 'tepco',
      } as const satisfies PartialSimulationFormData
      const newData = {
        postalCode: '1111111',
        company: 'tepco',
      } as const satisfies PartialSimulationFormData

      const fieldsToReset = getFieldsToReset(previousData, newData)
      
      expect(fieldsToReset).toEqual(['area', 'company', 'plan', 'capacity'])
    })

    it('電力会社変更時は関連フィールドをリセット', () => {
      const previousData = {
        company: 'tepco',
        plan: 'juryoB',
      } as  const satisfies PartialSimulationFormData
      const newData = {
        company: 'kepco',
        plan: 'juryoB',
      } as const satisfies PartialSimulationFormData

      const fieldsToReset = getFieldsToReset(previousData, newData)
      
      expect(fieldsToReset).toContain('plan')
      expect(fieldsToReset).toContain('capacity')
    })

    it('プラン変更時は契約容量をリセット', () => {
      const previousData = {
        plan: 'juryoB',
        capacity: 30,
      } as const satisfies PartialSimulationFormData
      const newData = {
        plan: 'juryoA',
        capacity: 30,
      } as const satisfies PartialSimulationFormData

      const fieldsToReset = getFieldsToReset(previousData, newData)
      
      expect(fieldsToReset).toEqual(['capacity'])
    })
  })

  describe('updateFormStepsWithErrors', () => {
    it('エラーがある場合、該当ステップにエラーフラグを設定', () => {
      const formData = {
        postalCode: '1234567',
      } as const satisfies PartialSimulationFormData
      const errors = {
        company: '電力会社を選択してください。',
      }
      
      const steps = updateFormStepsWithErrors(formData, errors)
      const companyStep = steps.find(step => step.id === 'company')
      
      expect(companyStep?.hasError).toBe(true)
    })

    it('エラーがない場合、エラーフラグは設定されない', () => {
      const formData = {
        postalCode: '1234567',
      } as const satisfies PartialSimulationFormData
      const errors = {}
      
      const steps = updateFormStepsWithErrors(formData, errors)
      
      expect(steps.every(step => !step.hasError)).toBe(true)
    })
  })

  describe('canSubmitForm', () => {
    it('フォーム完了かつエラーなしの場合true', () => {
      const formData = {
        postalCode: '1234567',
        company: 'tepco',
        plan: 'juryoB',
        capacity: 30,
        electricityBill: 5000,
        email: 'test@example.com',
      } as const satisfies PartialSimulationFormData
      const errors = {}
      
      const result = canSubmitForm(formData, errors)
      
      expect(result).toBe(true)
    })

    it('フォーム未完了の場合false', () => {
      const formData = {
        postalCode: '1234567',
      } as const satisfies PartialSimulationFormData
      const errors = {}
      
      const result = canSubmitForm(formData, errors)
      
      expect(result).toBe(false)
    })

    it('エラーがある場合false', () => {
      const formData = {
        postalCode: '1234567',
        company: 'tepco',
        plan: 'juryoB',
        capacity: 30,
        electricityBill: 5000,
        email: 'test@example.com',
      } as const satisfies PartialSimulationFormData
      
      const errors = {
        email: '有効なメールアドレスを入力してください',
      }
      
      const result = canSubmitForm(formData, errors)
      
      expect(result).toBe(false)
    })
  })
})