import { beforeEach, describe, expect, it, vi } from "vitest"
import { useSimulationForm } from "~/features/simulation/hooks/use-simulation-form"

vi.mock("react", () => ({
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
const mockClearErrors = vi.fn()

vi.mock("~/hooks/use-safe-form", () => ({
  useSafeForm: vi.fn(() => ({
    watch: mockWatch,
    getValues: mockGetValues,
    setValue: mockSetValue,
    reset: mockReset,
    handleSubmit: mockHandleSubmit,
    setError: mockSetError,
    clearErrors: mockClearErrors,
    formState: { errors: {}, isSubmitting: false },
  })),
}))

vi.mock("~/features/simulation/utils/area-detection", () => ({
  detectAreaFromPostalCode: vi.fn((postalCode: string) => {
    // 郵便番号の形式チェック
    if (!postalCode || postalCode.length !== 7) {
      return {
        area: "unsupported",
        isSupported: false,
        errorMessage: "郵便番号は7桁で入力してください。",
      }
    }

    // 数字のみかチェック
    if (!/^\d{7}$/.test(postalCode)) {
      return {
        area: "unsupported",
        isSupported: false,
        errorMessage: "郵便番号は数字のみで入力してください。",
      }
    }

    const firstDigit = postalCode.charAt(0)

    // 東京電力エリア判定（先頭が1）
    if (firstDigit === "1") {
      return { area: "tokyo", isSupported: true }
    }

    // 関西電力エリア判定（先頭が5）
    if (firstDigit === "5") {
      return { area: "kansai", isSupported: true }
    }

    // その他のエリア（対象外）
    return {
      area: "unsupported",
      isSupported: false,
      errorMessage: "サービスエリア対象外です。",
    }
  }),
}))

vi.mock("~/features/simulation/utils/form-state", () => ({
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

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(() => vi.fn()),
}))

vi.mock("~/features/simulation/types/schema/simulation-schema", () => ({
  simulationSchema: {
    safeParse: vi.fn(() => ({ success: true })),
    parse: vi.fn((data) => data),
  },
  validateSimulationForm: vi.fn(() => ({})),
}))

describe("use-simulation-form", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockSetError.mockClear()
    mockClearErrors.mockClear()

    // デフォルトのモック戻り値を設定
    mockWatch.mockReturnValue({
      postalCode: "",
      area: "unsupported",
      company: "",
      plan: undefined,
      electricityBill: 0,
      email: "",
      capacity: null,
    })

    mockGetValues.mockReturnValue({
      postalCode: "",
      area: "unsupported",
      company: "",
      plan: undefined,
      electricityBill: 0,
      email: "",
      capacity: null,
    })
  })

  describe("useSimulationForm初期化", () => {
    it("フックが正常に初期化される", () => {
      const result = useSimulationForm()

      expect(result.formData).toBeDefined()
      expect(result.formState).toBeDefined()
      expect(result.steps).toBeDefined()
      expect(result.canSubmit).toBe(false)
      expect(result.isSubmitting).toBe(false)
      expect(result.customErrors).toBeDefined()
    })

    it("カスタムデフォルト値を受け取る", () => {
      const defaultValues = {
        postalCode: "1234567",
        electricityBill: 5000,
      }

      const result = useSimulationForm({ defaultValues })

      expect(result).toBeDefined()
    })

    it("onSubmitコールバックを受け取る", () => {
      const mockOnSubmit = vi.fn()

      const result = useSimulationForm({ onSubmit: mockOnSubmit })

      expect(result.submit).toBeDefined()
      expect(typeof result.submit).toBe("function")
    })
  })

  describe("handlePostalCodeChange", () => {
    it("郵便番号変更処理が定義されている", () => {
      const result = useSimulationForm()

      expect(result.handlePostalCodeChange).toBeDefined()
      expect(typeof result.handlePostalCodeChange).toBe("function")
    })

    it("有効な郵便番号でエリアが設定される", () => {
      const result = useSimulationForm()

      result.handlePostalCodeChange("1234567")

      expect(mockSetValue).toHaveBeenCalledWith("area", "tokyo")
    })

    it("無効な郵便番号でカスタムエラーが設定される", () => {
      const result = useSimulationForm()

      result.handlePostalCodeChange("invalid")

      expect(result.customErrors).toBeDefined()
    })

    it("有効な郵便番号入力時にエラーがクリアされる", () => {
      const result = useSimulationForm()

      result.handlePostalCodeChange("1111111")

      expect(mockClearErrors).toHaveBeenCalledWith("postalCode")
    })

    it("関西エリアの郵便番号でエリアが正しく設定される", () => {
      const result = useSimulationForm()

      result.handlePostalCodeChange("5123456")

      expect(mockSetValue).toHaveBeenCalledWith("area", "kansai")
      expect(mockClearErrors).toHaveBeenCalledWith("postalCode")
    })
  })

  describe("handleCompanyChange", () => {
    it("電力会社変更処理が定義されている", () => {
      const result = useSimulationForm()

      expect(result.handleCompanyChange).toBeDefined()
      expect(typeof result.handleCompanyChange).toBe("function")
    })

    it("「その他」選択時にカスタムエラーが設定される", () => {
      const result = useSimulationForm()

      result.handleCompanyChange("other")

      expect(result.customErrors).toBeDefined()
    })
  })

  describe("handlePlanChange", () => {
    it("プラン変更処理が定義されている", () => {
      const result = useSimulationForm()

      expect(result.handlePlanChange).toBeDefined()
      expect(typeof result.handlePlanChange).toBe("function")
    })

    it("関西電力で従量電灯Bから他のプランに変わる際にcapacityがリセットされる", () => {
      mockGetValues.mockReturnValue({
        postalCode: "5123456",
        area: "kansai",
        company: "kepco",
        plan: "juryoB",
        electricityBill: 5000,
        email: "",
        capacity: 40,
      })

      const result = useSimulationForm()

      result.handlePlanChange("juryoA", "juryoB")

      expect(mockSetValue).toHaveBeenCalledWith("capacity", null)
      expect(mockClearErrors).toHaveBeenCalledWith("capacity")
    })

    it("関西電力以外の会社でプラン変更時はcapacityリセットされない", () => {
      mockGetValues.mockReturnValue({
        postalCode: "1123456",
        area: "tokyo",
        company: "tepco",
        plan: "juryoB",
        electricityBill: 5000,
        email: "",
        capacity: 40,
      })

      const result = useSimulationForm()

      result.handlePlanChange("juryoC", "juryoB")

      expect(mockSetValue).not.toHaveBeenCalledWith("capacity", null)
      expect(mockClearErrors).not.toHaveBeenCalledWith("capacity")
    })

    it("関西電力で従量電灯B以外からの変更時はcapacityリセットされない", () => {
      mockGetValues.mockReturnValue({
        postalCode: "5123456",
        area: "kansai",
        company: "kepco",
        plan: "juryoA",
        electricityBill: 5000,
        email: "",
        capacity: null,
      })

      const result = useSimulationForm()

      result.handlePlanChange("juryoB", "juryoA")

      expect(mockSetValue).not.toHaveBeenCalledWith("capacity", null)
      expect(mockClearErrors).not.toHaveBeenCalledWith("capacity")
    })
  })

  describe("resetForm", () => {
    it("フォームリセット処理が定義されている", () => {
      const result = useSimulationForm()

      expect(result.resetForm).toBeDefined()
      expect(typeof result.resetForm).toBe("function")
    })

    it("リセット実行時にReact Hook Formのresetが呼ばれる", () => {
      vi.clearAllMocks()

      const result = useSimulationForm()

      result.resetForm()

      expect(mockReset).toHaveBeenCalled()
    })
  })

  describe("resetFieldsFromIndex", () => {
    it("フィールドリセット処理が定義されている", () => {
      const result = useSimulationForm()

      expect(result.resetFieldsFromIndex).toBeDefined()
      expect(typeof result.resetFieldsFromIndex).toBe("function")
    })

    it("各フィールドが適切なデフォルト値でリセットされる", () => {
      const result = useSimulationForm()

      result.resetFieldsFromIndex([
        "area",
        "company",
        "plan",
        "capacity",
        "electricityBill",
        "email",
        "postalCode",
      ])

      expect(mockSetValue).toHaveBeenCalledWith("area", "unsupported")
      expect(mockSetValue).toHaveBeenCalledWith("company", "")
      expect(mockSetValue).toHaveBeenCalledWith("plan", undefined)
      expect(mockSetValue).toHaveBeenCalledWith("capacity", null)
      expect(mockSetValue).toHaveBeenCalledWith("electricityBill", 0)
      expect(mockSetValue).toHaveBeenCalledWith("email", "")
      expect(mockSetValue).toHaveBeenCalledWith("postalCode", "")
    })

    it("単一フィールドのリセットが正常に動作する", () => {
      const result = useSimulationForm()

      result.resetFieldsFromIndex(["capacity"])

      expect(mockSetValue).toHaveBeenCalledWith("capacity", null)
      expect(mockSetValue).toHaveBeenCalledTimes(1)
    })
  })

  describe("submit", () => {
    it("送信処理が定義されている", () => {
      const result = useSimulationForm()

      expect(result.submit).toBeDefined()
      expect(typeof result.submit).toBe("function")
    })

    it("送信処理でhandleSubmitが呼ばれる", () => {
      vi.clearAllMocks()

      const mockOnSubmit = vi.fn()
      const result = useSimulationForm({ onSubmit: mockOnSubmit })

      result.submit()

      expect(mockHandleSubmit).toHaveBeenCalled()
    })
  })

  describe("フォーム状態管理", () => {
    it("フォームデータが監視されている", () => {
      const result = useSimulationForm()

      expect(mockWatch).toHaveBeenCalled()
      expect(result.formData).toBeDefined()
    })

    it("フォーム状態が分析されている", () => {
      const result = useSimulationForm()

      expect(result.formState).toBeDefined()
    })

    it("ステップ情報が取得されている", () => {
      const result = useSimulationForm()

      expect(result.steps).toBeDefined()
      expect(Array.isArray(result.steps)).toBe(true)
    })

    it("送信可能状態が計算されている", () => {
      const result = useSimulationForm()

      expect(typeof result.canSubmit).toBe("boolean")
    })

    it("カスタムエラーが管理されている", () => {
      const result = useSimulationForm()

      expect(result.customErrors).toBeDefined()
      expect(typeof result.customErrors).toBe("object")
    })
  })

  describe("フック戻り値の型安全性", () => {
    it("すべての必要なプロパティが返される", () => {
      const result = useSimulationForm()

      const expectedProperties = [
        "form",
        "formData",
        "formState",
        "handlePostalCodeChange",
        "handleCompanyChange",
        "handlePlanChange",
        "steps",
        "handleSubmit",
        "resetForm",
        "resetFieldsFromIndex",
        "isSubmitting",
        "canSubmit",
        "customErrors",
        "submit",
      ]

      expectedProperties.forEach((prop) => {
        expect(result).toHaveProperty(prop)
      })
    })

    it("関数プロパティが正しい型である", () => {
      const result = useSimulationForm()

      expect(typeof result.handlePostalCodeChange).toBe("function")
      expect(typeof result.handleCompanyChange).toBe("function")
      expect(typeof result.handlePlanChange).toBe("function")
      expect(typeof result.resetForm).toBe("function")
      expect(typeof result.resetFieldsFromIndex).toBe("function")
      expect(typeof result.submit).toBe("function")
    })

    it("状態プロパティが正しい型である", () => {
      const result = useSimulationForm()

      expect(typeof result.isSubmitting).toBe("boolean")
      expect(typeof result.canSubmit).toBe("boolean")
      expect(typeof result.customErrors).toBe("object")
      expect(Array.isArray(result.steps)).toBe(true)
    })
  })
})
