import { FORM_STEPS } from "~/features/simulation/constants"
import type { FormStep } from "~/features/simulation/types"
import type {
  PartialSimulationFormData,
  SimulationFormData,
} from "~/features/simulation/types/schema/simulation-schema"
import { detectAreaFromPostalCode } from "~/features/simulation/utils/area-detection"
import { isCapacityRequired } from "~/features/simulation/utils/capacity-options"

type FormStateResult = {
  enabledFields: Record<keyof SimulationFormData, boolean>
  completedSteps: Record<string, boolean>
  currentStep: string | null
  nextRequiredField: keyof SimulationFormData | null
}

/**
 * Step 1: 郵便番号とエリア判定処理
 */
function processPostalCodeStep(formData: PartialSimulationFormData, state: FormStateResult) {
  const postalCodeComplete = formData.postalCode && formData.postalCode.length === 7

  if (!postalCodeComplete || !formData.postalCode) {
    state.currentStep = "postal-code"
    state.nextRequiredField = "postalCode"
    return
  }

  const areaResult = detectAreaFromPostalCode(formData.postalCode)
  state.completedSteps["postal-code"] = areaResult.isSupported

  if (!areaResult.isSupported) {
    state.currentStep = "postal-code"
    state.nextRequiredField = "postalCode"
    return
  }

  state.enabledFields.company = true
  if (!state.currentStep) {
    state.currentStep = "company"
  }
}

/**
 * Step 2: 電力会社選択処理
 */
function processCompanyStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps["postal-code"]) {
    return
  }

  if (!formData.company) {
    if (state.enabledFields.company && !state.nextRequiredField) {
      state.nextRequiredField = "company"
    }
    return
  }

  if (formData.company === "other") {
    state.completedSteps.company = false
    state.currentStep = "company"
    state.nextRequiredField = "company"
    return
  }

  state.completedSteps.company = true
  state.enabledFields.plan = true
  if (!state.currentStep || state.currentStep === "company") {
    state.currentStep = "plan"
  }
}

/**
 * Step 3: プラン選択処理
 */
function processPlanStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps.company || !formData.plan) {
    if (state.enabledFields.plan && !state.nextRequiredField) {
      state.nextRequiredField = "plan"
    }
    return
  }

  state.completedSteps.plan = true
  const capacityRequired = isCapacityRequired(formData.company!, formData.plan!)

  if (capacityRequired) {
    state.enabledFields.capacity = true
    if (!state.currentStep || state.currentStep === "plan") {
      state.currentStep = "capacity"
    }
    return
  }

  state.completedSteps.capacity = true
  state.enabledFields.electricityBill = true
  if (!state.currentStep || state.currentStep === "plan") {
    state.currentStep = "electricity-bill"
  }
}

/**
 * Step 4: 契約容量選択処理
 */
function processCapacityStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.enabledFields.capacity) {
    return
  }

  const capacityComplete = formData.capacity !== null && formData.capacity !== undefined
  if (!capacityComplete) {
    if (!state.nextRequiredField) {
      state.nextRequiredField = "capacity"
    }
    return
  }

  state.completedSteps.capacity = true
  state.enabledFields.electricityBill = true
  if (!state.currentStep || state.currentStep === "capacity") {
    state.currentStep = "electricity-bill"
  }
}

/**
 * Step 5: 電気代入力処理
 */
function processElectricityBillStep(formData: PartialSimulationFormData, state: FormStateResult) {
  const capacityReady = state.completedSteps.capacity || !state.enabledFields.capacity
  const billComplete = formData.electricityBill && formData.electricityBill >= 1000

  if (!capacityReady || !billComplete) {
    if (state.enabledFields.electricityBill && !state.nextRequiredField) {
      state.nextRequiredField = "electricityBill"
    }
    return
  }

  state.completedSteps["electricity-bill"] = true
  state.enabledFields.email = true
  if (!state.currentStep || state.currentStep === "electricity-bill") {
    state.currentStep = "email"
  }
}

/**
 * Step 6: メールアドレス入力処理
 */
function processEmailStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps["electricity-bill"]) {
    return
  }

  const emailComplete = formData.email && /^[^@\s]+@[^@\s]+\.[^@\s.]+$/.test(formData.email)
  if (!emailComplete) {
    if (state.enabledFields.email && !state.nextRequiredField) {
      state.nextRequiredField = "email"
    }
    return
  }

  state.completedSteps.email = true
  state.currentStep = null
}

/**
 * フォームの現在の状態を分析し、各フィールドの有効/無効状態を決定する
 * @param formData 現在のフォームデータ
 * @returns フォーム状態分析結果
 */
export function analyzeFormState(formData: PartialSimulationFormData) {
  const state: FormStateResult = {
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
    currentStep: null,
    nextRequiredField: null,
  }

  // 各ステップを順番に処理
  processPostalCodeStep(formData, state)
  processCompanyStep(formData, state)
  processPlanStep(formData, state)
  processCapacityStep(formData, state)
  processElectricityBillStep(formData, state)
  processEmailStep(formData, state)

  // フォーム完了判定
  const isFormComplete = Boolean(
    state.completedSteps["postal-code"] &&
      state.completedSteps.company &&
      state.completedSteps.plan &&
      state.completedSteps.capacity &&
      state.completedSteps["electricity-bill"] &&
      state.completedSteps.email,
  )

  return {
    ...state,
    isFormComplete,
  }
}





const FIELD_RESET_MAP = {
  postalCode: ["area", "company", "plan", "capacity"],
  company: ["plan", "capacity"],
  plan: ["capacity"],
} as const satisfies Record<string, Array<keyof SimulationFormData>>

/**
 * フォームのリセットが必要かどうかを判定する
 * @param previousData 変更前のフォームデータ
 * @param newData 変更後のフォームデータ
 * @returns リセットが必要な場合のリセット対象フィールド配列
 */
export function getFieldsToReset(
  previousData: PartialSimulationFormData,
  newData: PartialSimulationFormData,
) {
  const fieldsToReset = new Set<keyof SimulationFormData>()

  // ? 郵便番号変更時、フォームをリセットする必要がある
  if (previousData.postalCode !== newData.postalCode) {
    FIELD_RESET_MAP.postalCode.forEach((field) => fieldsToReset.add(field))
  }

  // その他のフィールド変更処理
  const fieldsToCheck = ["company", "plan"] as const

  for (const field of fieldsToCheck) {
    if (previousData[field] !== newData[field]) {
      const resetFields = FIELD_RESET_MAP[field]
      resetFields.forEach((resetField) => fieldsToReset.add(resetField))
    }
  }

  return Array.from(fieldsToReset)
}

/**
 * フォームエラーの状態を管理する
 * @param formData 現在のフォームデータ
 * @param errors バリデーションエラー
 * @returns エラー付きのステップ情報
 */
export function updateFormStepsWithErrors(
  formData: PartialSimulationFormData,
  errors: Record<string, string>,
) {
  const state = analyzeFormState(formData)

  const steps = FORM_STEPS.map((step) => ({
    ...step,
    completed: state.completedSteps[step.id] || false,
    enabled:
      step.id === "postal-code" || state.completedSteps[step.id] || state.currentStep === step.id,
    hasError: false, // エラー状態は別途管理
  }))

  // エラーがあるフィールドに対応するステップにエラーフラグを設定
  const fieldToStepMap: Record<keyof SimulationFormData, string> = {
    postalCode: "postal-code",
    area: "postal-code",
    company: "company",
    plan: "plan",
    capacity: "capacity",
    electricityBill: "electricity-bill",
    email: "email",
  }

  return steps.map((step: FormStep) => ({
    ...step,
    hasError: Object.keys(errors).some(
      (field) => fieldToStepMap[field as keyof SimulationFormData] === step.id,
    ),
  }))
}

/**
 * フォーム送信可能かどうかを判定する
 * @param formData 現在のフォームデータ
 * @param errors バリデーションエラー
 * @returns 送信可能かのboolean
 */
export function canSubmitForm(formData: PartialSimulationFormData, errors: Record<string, string>) {
  const state = analyzeFormState(formData)
  const hasNoErrors = Object.keys(errors).length === 0

  return state.isFormComplete && hasNoErrors
}
