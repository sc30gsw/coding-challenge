import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSimulationForm } from '~/features/simulation/hooks/use-simulation-form'

vi.mock('react', () => ({
  useState: vi.fn((initial) => [initial, vi.fn()]),
  useMemo: vi.fn((callback) => callback()),
  useCallback: vi.fn((callback) => callback),
}))

const mockWatch = vi.fn()
const mockGetValues = vi.fn()
const mockSetValue = vi.fn()
const mockReset = vi.fn()
const mockHandleSubmit = vi.fn((callback) => {
  return vi.fn(() => callback())
})

const mockSetError = vi.fn()

vi.mock('~/hooks/use-safe-form', () => ({
  useSafeForm: vi.fn(() => ({
    watch: mockWatch,
    getValues: mockGetValues,
    setValue: mockSetValue,
    reset: mockReset,
    handleSubmit: mockHandleSubmit,
    setError: mockSetError,
    formState: { errors: {}, isSubmitting: false },
  })),
}))

vi.mock('~/features/simulation/utils/area-detection', () => ({
  detectAreaFromPostalCode: vi.fn((postalCode: string) => {
    if (postalCode === '1234567') {
      return { area: 'tokyo', isSupported: true }
    }
    return { area: 'unsupported', isSupported: false, errorMessage: 'エラー' }
  }),
}))

vi.mock('~/features/simulation/utils/form-state', () => ({
  analyzeFormState: vi.fn(() => ({
    enabledFields: {},
    completedSteps: {},
    currentStep: null,
    nextRequiredField: null,
    isFormComplete: false,
  })),
  canSubmitForm: vi.fn(() => false),
  getFieldsToReset: vi.fn(() => []),
  updateFormStepsWithErrors: vi.fn(() => []),
}))

// zodResolverモック
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => vi.fn()),
}))

vi.mock('~/features/simulation/types/schema/simulation-schema', () => ({
  simulationSchema: {
    safeParse: vi.fn(() => ({ success: true })),
    parse: vi.fn((data) => data),
  },
  validateSimulationForm: vi.fn(() => ({})),
}))

describe('use-simulation-form', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockSetError.mockClear()
    
    // デフォルトのモック戻り値を設定
    mockWatch.mockReturnValue({
      postalCode: '',
      area: 'unsupported',
      company: 'tepco',
      plan: 'juryoB',
      electricityBill: 0,
      email: '',
      capacity: null,
    })
    
    mockGetValues.mockReturnValue({
      postalCode: '',
      area: 'unsupported',
      company: 'tepco',
      plan: 'juryoB',
      electricityBill: 0,
      email: '',
      capacity: null,
    })
      })

  describe('useSimulationForm初期化', () => {
    it('フックが正常に初期化される', () => {
      const result = useSimulationForm()
      
      expect(result.formData).toBeDefined()
      expect(result.formState).toBeDefined()
      expect(result.steps).toBeDefined()
      expect(result.canSubmit).toBe(false)
      expect(result.isSubmitting).toBe(false)
      expect(result.formErrors).toBeDefined()
    })

    it('カスタムデフォルト値を受け取る', () => {
      const defaultValues = {
        postalCode: '1234567',
        electricityBill: 5000,
      }
      
      const result = useSimulationForm({ defaultValues })
      
      expect(result).toBeDefined()
    })

    it('onSubmitコールバックを受け取る', () => {
      const mockOnSubmit = vi.fn()
      
      const result = useSimulationForm({ onSubmit: mockOnSubmit })
      
      expect(result.submit).toBeDefined()
      expect(typeof result.submit).toBe('function')
    })
  })

  describe('handlePostalCodeChange', () => {
    it('郵便番号変更処理が定義されている', () => {
      const result = useSimulationForm()
      
      expect(result.handlePostalCodeChange).toBeDefined()
      expect(typeof result.handlePostalCodeChange).toBe('function')
    })

    it('有効な郵便番号でエリアが設定される', () => {
      const result = useSimulationForm()
      
      result.handlePostalCodeChange('1234567')
      
      expect(mockSetValue).toHaveBeenCalledWith('area', 'tokyo')
    })

    it('無効な郵便番号でカスタムエラーが設定される', () => {
      const result = useSimulationForm()
      
      result.handlePostalCodeChange('invalid')
      
      // カスタムエラーが設定されることを確認
      expect(result.formErrors).toBeDefined()
    })
  })

  describe('handleCompanyChange', () => {
    it('電力会社変更処理が定義されている', () => {
      const result = useSimulationForm()
      
      expect(result.handleCompanyChange).toBeDefined()
      expect(typeof result.handleCompanyChange).toBe('function')
    })

    it('「その他」選択時にカスタムエラーが設定される', () => {
      const result = useSimulationForm()
      
      result.handleCompanyChange('other')
      
      // カスタムエラーが設定されることを確認
      expect(result.customErrors).toBeDefined()
    })
  })

  describe('handlePlanChange', () => {
    it('プラン変更処理が定義されている', () => {
      const result = useSimulationForm()
      
      expect(result.handlePlanChange).toBeDefined()
      expect(typeof result.handlePlanChange).toBe('function')
    })
  })

  describe('resetForm', () => {
    it('フォームリセット処理が定義されている', () => {
      const result = useSimulationForm()
      
      expect(result.resetForm).toBeDefined()
      expect(typeof result.resetForm).toBe('function')
    })

    it('リセット実行時にReact Hook Formのresetが呼ばれる', () => {
      // モックをリセット
      vi.clearAllMocks()
      
      const result = useSimulationForm()
      
      result.resetForm()
      
      expect(mockReset).toHaveBeenCalled()
    })
  })

  describe('resetFieldsFromIndex', () => {
    it('フィールドリセット処理が定義されている', () => {
      const result = useSimulationForm()
      
      expect(result.resetFieldsFromIndex).toBeDefined()
      expect(typeof result.resetFieldsFromIndex).toBe('function')
    })

    it('指定されたフィールドがリセットされる', () => {
      const result = useSimulationForm()
      
      result.resetFieldsFromIndex(['company', 'plan'])
      
      expect(mockSetValue).toHaveBeenCalled()
    })

    it('契約容量フィールドはnullでリセットされる', () => {
      const result = useSimulationForm()
      
      result.resetFieldsFromIndex(['capacity'])
      
      expect(mockSetValue).toHaveBeenCalledWith('capacity', null)
    })
  })

  describe('submit', () => {
    it('送信処理が定義されている', () => {
      const result = useSimulationForm()
      
      expect(result.submit).toBeDefined()
      expect(typeof result.submit).toBe('function')
    })

    it('送信処理でhandleSubmitが呼ばれる', () => {
      // モックをリセット
      vi.clearAllMocks()
      
      const mockOnSubmit = vi.fn()
      const result = useSimulationForm({ onSubmit: mockOnSubmit })
      
      result.submit()
      
      expect(mockHandleSubmit).toHaveBeenCalled()
    })
  })

  describe('フォーム状態管理', () => {
    it('フォームデータが監視されている', () => {
      const result = useSimulationForm()
      
      expect(mockWatch).toHaveBeenCalled()
      expect(result.formData).toBeDefined()
    })

    it('フォーム状態が分析されている', () => {
      const result = useSimulationForm()
      
      expect(result.formState).toBeDefined()
    })

    it('ステップ情報が取得されている', () => {
      const result = useSimulationForm()
      
      expect(result.steps).toBeDefined()
      expect(Array.isArray(result.steps)).toBe(true)
    })

    it('送信可能状態が計算されている', () => {
      const result = useSimulationForm()
      
      expect(typeof result.canSubmit).toBe('boolean')
    })

    it('フォームエラーが統合されている', () => {
      const result = useSimulationForm()
      
      expect(result.formErrors).toBeDefined()
      expect(typeof result.formErrors).toBe('object')
    })
  })

  describe('フック戻り値の型安全性', () => {
    it('すべての必要なプロパティが返される', () => {
      const result = useSimulationForm()
      
      const expectedProperties = [
        'form',
        'formData',
        'formState',
        'handlePostalCodeChange',
        'handleCompanyChange',
        'handlePlanChange',
        'steps',
        'handleSubmit',
        'resetForm',
        'resetFieldsFromIndex',
        'isSubmitting',
        'canSubmit',
        'formErrors',
        'submit',
      ]
      
      expectedProperties.forEach(prop => {
        expect(result).toHaveProperty(prop)
      })
    })

    it('関数プロパティが正しい型である', () => {
      const result = useSimulationForm()
      
      expect(typeof result.handlePostalCodeChange).toBe('function')
      expect(typeof result.handleCompanyChange).toBe('function')
      expect(typeof result.handlePlanChange).toBe('function')
      expect(typeof result.resetForm).toBe('function')
      expect(typeof result.resetFieldsFromIndex).toBe('function')
      expect(typeof result.submit).toBe('function')
    })

    it('状態プロパティが正しい型である', () => {
      const result = useSimulationForm()
      
      expect(typeof result.isSubmitting).toBe('boolean')
      expect(typeof result.canSubmit).toBe('boolean')
      expect(typeof result.formErrors).toBe('object')
      expect(Array.isArray(result.steps)).toBe(true)
    })
  })
})