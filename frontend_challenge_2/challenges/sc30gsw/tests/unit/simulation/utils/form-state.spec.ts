import { describe, expect, it } from "vitest"
import { STEP_IDS } from "~/features/simulation/constants/field-definitions"
import type { PartialSimulationFormData } from "~/features/simulation/types/schema/simulation-schema"
import {
  analyzeFormState,
  canSubmitForm,
  getFieldsToReset,
  updateFormStepsWithErrors,
} from "~/features/simulation/utils/form-state"

describe("form-state", () => {
  describe("analyzeFormState", () => {
    it("初期状態では郵便番号のみ有効", () => {
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
      expect(result.currentStep).toBe("postal-code")
      expect(result.nextRequiredField).toBe("postalCode")
      expect(result.isFormComplete).toBe(false)
    })

    it("有効な郵便番号入力後は電力会社選択が有効", () => {
      const formData = {
        postalCode: "1234567",
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)

      expect(result.enabledFields.company).toBe(true)
      expect(result.currentStep).toBe("company")
      expect(result.completedSteps["postal-code"]).toBe(true)
    })

    it("対象外エリアの場合は郵便番号ステップで停止", () => {
      const formData = {
        postalCode: "2345678",
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)

      expect(result.enabledFields.company).toBe(false)
      expect(result.currentStep).toBe("postal-code")
      expect(result.completedSteps["postal-code"]).toBe(false)
      expect(result.nextRequiredField).toBe("postalCode")
    })

    it("電力会社で「その他」選択時は進行停止", () => {
      const formData = {
        postalCode: "1234567",
        company: "other",
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)

      expect(result.enabledFields.plan).toBe(false)
      expect(result.currentStep).toBe("company")
      expect(result.completedSteps.company).toBe(false)
      expect(result.nextRequiredField).toBe("company")
    })

    it("東京電力従量電灯Bの場合は契約容量選択が必要", () => {
      const formData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)

      expect(result.enabledFields.capacity).toBe(true)
      expect(result.currentStep).toBe("capacity")
      expect(result.completedSteps.plan).toBe(true)
    })

    it("関西電力従量電灯Aの場合は契約容量不要で電気代入力へ", () => {
      const formData = {
        postalCode: "5678901",
        company: "kepco",
        plan: "juryoA",
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)

      expect(result.enabledFields.capacity).toBe(false)
      expect(result.enabledFields.electricityBill).toBe(true)
      expect(result.currentStep).toBe("electricity-bill")
      expect(result.completedSteps.capacity).toBe(true)
    })

    it("全項目完了時はフォーム完了状態", () => {
      const formData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
        electricityBill: 5000,
        email: "test@example.com",
      } as const satisfies PartialSimulationFormData
      const result = analyzeFormState(formData)

      expect(result.isFormComplete).toBe(true)
      expect(result.currentStep).toBeNull()
      expect(result.nextRequiredField).toBeNull()
    })
  })

  describe("getFieldsToReset", () => {
    it("郵便番号変更でエリアが変わる場合、関連フィールドをリセット", () => {
      const previousData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
      } as const satisfies PartialSimulationFormData
      const newData = {
        postalCode: "5678901",
        company: "tepco",
        plan: "juryoB",
      } as const satisfies PartialSimulationFormData

      const fieldsToReset = getFieldsToReset(previousData, newData)

      expect(fieldsToReset).toContain("area")
      expect(fieldsToReset).toContain("company")
      expect(fieldsToReset).toContain("plan")
      expect(fieldsToReset).toContain("capacity")
    })

    it("郵便番号変更時は常に関連フィールドをリセット", () => {
      const previousData = {
        postalCode: "1234567",
        company: "tepco",
      } as const satisfies PartialSimulationFormData
      const newData = {
        postalCode: "1111111",
        company: "tepco",
      } as const satisfies PartialSimulationFormData

      const fieldsToReset = getFieldsToReset(previousData, newData)

      expect(fieldsToReset).toEqual(["area", "company", "plan", "capacity"])
    })

    it("電力会社変更時は関連フィールドをリセット", () => {
      const previousData = {
        company: "tepco",
        plan: "juryoB",
      } as const satisfies PartialSimulationFormData
      const newData = {
        company: "kepco",
        plan: "juryoB",
      } as const satisfies PartialSimulationFormData

      const fieldsToReset = getFieldsToReset(previousData, newData)

      expect(fieldsToReset).toContain("plan")
      expect(fieldsToReset).toContain("capacity")
    })

    it("プラン変更時は契約容量をリセット", () => {
      const previousData = {
        plan: "juryoB",
        capacity: 30,
      } as const satisfies PartialSimulationFormData
      const newData = {
        plan: "juryoA",
        capacity: 30,
      } as const satisfies PartialSimulationFormData

      const fieldsToReset = getFieldsToReset(previousData, newData)

      expect(fieldsToReset).toEqual(["capacity"])
    })
  })

  describe("updateFormStepsWithErrors", () => {
    it("エラーがある場合、該当ステップにエラーフラグを設定", () => {
      const formData = {
        postalCode: "1234567",
      } as const satisfies PartialSimulationFormData
      const errors = {
        company: "電力会社を選択してください。",
      }

      const steps = updateFormStepsWithErrors(formData, errors)
      const companyStep = steps.find((step) => step.id === "company")

      expect(companyStep?.hasError).toBe(true)
    })

    it("エラーがない場合、エラーフラグは設定されない", () => {
      const formData = {
        postalCode: "1234567",
      } as const satisfies PartialSimulationFormData
      const errors = {}

      const steps = updateFormStepsWithErrors(formData, errors)

      expect(steps.every((step) => !step.hasError)).toBe(true)
    })
  })

  describe("canSubmitForm", () => {
    it("フォーム完了かつエラーなしの場合true", () => {
      const formData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
        electricityBill: 5000,
        email: "test@example.com",
      } as const satisfies PartialSimulationFormData
      const errors = {}

      const result = canSubmitForm(formData, errors)

      expect(result).toBe(true)
    })

    it("フォーム未完了の場合false", () => {
      const formData = {
        postalCode: "1234567",
      } as const satisfies PartialSimulationFormData
      const errors = {}

      const result = canSubmitForm(formData, errors)

      expect(result).toBe(false)
    })

    it("エラーがある場合false", () => {
      const formData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
        electricityBill: 5000,
        email: "test@example.com",
      } as const satisfies PartialSimulationFormData

      const errors = {
        email: "有効なメールアドレスを入力してください",
      }

      const result = canSubmitForm(formData, errors)

      expect(result).toBe(false)
    })
  })

  describe("updateFormStepsWithErrors", () => {
    it("契約容量不要プランの場合、容量ステップが非表示になる", () => {
      const formData = {
        postalCode: "5234567",
        company: "kepco",
        plan: "juryoA",
      } as const satisfies PartialSimulationFormData
      const errors = {}

      const result = updateFormStepsWithErrors(formData, errors)

      const capacityStep = result.find((step) => step.id === "capacity")
      expect(capacityStep).toBeUndefined()

      expect(result.find((step) => step.id === "postal-code")).toBeDefined()
      expect(result.find((step) => step.id === "company")).toBeDefined()
      expect(result.find((step) => step.id === "plan")).toBeDefined()
      expect(result.find((step) => step.id === "electricity-bill")).toBeDefined()
      expect(result.find((step) => step.id === "email")).toBeDefined()
    })

    it("契約容量必要プランの場合、容量ステップが表示される", () => {
      const formData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
      } as const satisfies PartialSimulationFormData
      const errors = {}

      const result = updateFormStepsWithErrors(formData, errors)

      const capacityStep = result.find((step) => step.id === "capacity")
      expect(capacityStep).toBeDefined()
    })

    it("会社やプランが未選択の場合、容量ステップが表示される", () => {
      const formData = {
        postalCode: "1234567",
      } as const satisfies PartialSimulationFormData
      const errors = {}

      const result = updateFormStepsWithErrors(formData, errors)

      const capacityStep = result.find((step) => step.id === "capacity")
      expect(capacityStep).toBeDefined()
    })
  })

  describe("ステップ依存関係のテスト", () => {
    it("電力会社を「その他」に変更した場合、電気代とメールのステップが未完了になる", () => {
      const completeFormData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
        electricityBill: 5000,
        email: "test@example.com",
      } as const satisfies PartialSimulationFormData

      const completeResult = analyzeFormState(completeFormData)
      expect(completeResult.isFormComplete).toBe(true)
      expect(completeResult.completedSteps[STEP_IDS.ELECTRICITY_BILL]).toBe(true)
      expect(completeResult.completedSteps.email).toBe(true)

      const changedFormData = {
        ...completeFormData,
        company: "other",
      } as const satisfies PartialSimulationFormData

      const changedResult = analyzeFormState(changedFormData)

      // 電力会社ステップが未完了になることで、依存する後続ステップも未完了になる
      expect(changedResult.completedSteps.company).toBe(false)
      expect(changedResult.completedSteps[STEP_IDS.ELECTRICITY_BILL]).toBe(false)
      expect(changedResult.completedSteps.email).toBe(false)
      expect(changedResult.isFormComplete).toBe(false)
    })

    it("郵便番号を対象外エリアに変更した場合、全ての後続ステップが未完了になる", () => {
      const completeFormData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
        electricityBill: 5000,
        email: "test@example.com",
      } as const satisfies PartialSimulationFormData

      const completeResult = analyzeFormState(completeFormData)
      expect(completeResult.isFormComplete).toBe(true)

      const changedFormData = {
        ...completeFormData,
        postalCode: "2000000",
      } as const satisfies PartialSimulationFormData

      const changedResult = analyzeFormState(changedFormData)

      // 郵便番号ステップが未完了になることで、依存する全ての後続ステップも未完了になる
      expect(changedResult.completedSteps["postal-code"]).toBe(false)
      expect(changedResult.completedSteps.company).toBe(false)
      expect(changedResult.completedSteps.plan).toBe(false)
      expect(changedResult.completedSteps.capacity).toBe(false)
      expect(changedResult.completedSteps[STEP_IDS.ELECTRICITY_BILL]).toBe(false)
      expect(changedResult.completedSteps.email).toBe(false)
      expect(changedResult.isFormComplete).toBe(false)
    })

    it("プランを変更した場合、容量・電気代・メールのステップが適切に更新される", () => {
      // 容量が必要なプランで全項目完了状態を作る
      const completeFormData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
        electricityBill: 5000,
        email: "test@example.com",
      } as const satisfies PartialSimulationFormData

      const completeResult = analyzeFormState(completeFormData)
      expect(completeResult.isFormComplete).toBe(true)

      // 容量不要なプランに変更
      const changedFormData = {
        ...completeFormData,
        company: "kepco",
        plan: "juryoA",
      } as const satisfies PartialSimulationFormData

      const changedResult = analyzeFormState(changedFormData)

      // プラン変更により容量は自動完了、電気代・メールは継続
      expect(changedResult.completedSteps["postal-code"]).toBe(true)
      expect(changedResult.completedSteps.company).toBe(true)
      expect(changedResult.completedSteps.plan).toBe(true)
      expect(changedResult.completedSteps.capacity).toBe(true) // 容量不要のため自動完了
      expect(changedResult.completedSteps[STEP_IDS.ELECTRICITY_BILL]).toBe(true)
      expect(changedResult.completedSteps.email).toBe(true)
      expect(changedResult.isFormComplete).toBe(true)
    })
  })

  describe("純粋関数構造のテスト（副作用なし）", () => {
    it("各ステップ関数は元のstateを変更しない", () => {
      const originalState = {
        enabledFields: {
          postalCode: true,
          area: false,
          company: false,
          plan: false,
          capacity: false,
          electricityBill: false,
          email: false,
        },
        completedSteps: {},
        currentStep: "postal-code" as const,
        nextRequiredField: null,
      }

      const formData = { postalCode: "1234567" } as const satisfies PartialSimulationFormData

      const beforeState = JSON.parse(JSON.stringify(originalState))

      analyzeFormState(formData)

      expect(originalState).toEqual(beforeState)
    })

    it("同じ入力データに対して常に同じ結果を返す（純粋関数性）", () => {
      const formData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
      } as const satisfies PartialSimulationFormData

      const result1 = analyzeFormState(formData)
      const result2 = analyzeFormState(formData)

      expect(result1).toEqual(result2)
    })

    it("ステップの依存関係が明示的に表現される", () => {
      const formData = {
        postalCode: "1234567",
        company: "tepco",
        plan: "juryoB",
        capacity: 30,
        electricityBill: 5000,
      } as const satisfies PartialSimulationFormData

      const result = analyzeFormState(formData)

      expect(result.completedSteps["postal-code"]).toBe(true)
      expect(result.completedSteps.company).toBe(true)
      expect(result.completedSteps.plan).toBe(true)
      expect(result.completedSteps.capacity).toBe(true)
      expect(result.enabledFields.email).toBe(true)
      expect(result.currentStep).toBe("email")
    })
  })
})
