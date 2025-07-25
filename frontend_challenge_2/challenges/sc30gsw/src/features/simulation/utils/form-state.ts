import { FORM_STEPS } from "~/features/simulation/constants"
import { COMPANY_CODES } from "~/features/simulation/constants/company-codes"
import {
  FIELD_NAMES,
  FIELD_RESET_DEPENDENCIES,
  FIELD_TO_STEP_MAP,
  STEP_IDS,
} from "~/features/simulation/constants/field-definitions"
import { EMAIL_REGEX, MIN_ELECTRICITY_BILL } from "~/features/simulation/constants/validation"
import type {
  PartialSimulationFormData,
  SimulationFormData,
} from "~/features/simulation/types/schema/simulation-schema"
import type { FormStep } from "~/features/simulation/types/simulation"
import { detectAreaFromPostalCode } from "~/features/simulation/utils/area-detection"
import { isCapacityRequired } from "~/features/simulation/utils/capacity-options"

type FormStateResult = {
  enabledFields: Record<keyof SimulationFormData, boolean>
  completedSteps: Record<string, boolean>
  currentStep: (typeof STEP_IDS)[keyof typeof STEP_IDS] | null
  nextRequiredField: keyof SimulationFormData | null
}

/**
 * Step 1: 郵便番号とエリア判定処理
 */
function processPostalCodeStep(formData: PartialSimulationFormData, state: FormStateResult) {
  const postalCodeComplete = formData.postalCode && formData.postalCode.length === 7

  if (!postalCodeComplete || !formData.postalCode) {
    state.currentStep = STEP_IDS.POSTAL_CODE
    state.nextRequiredField = FIELD_NAMES.POSTAL_CODE
    return
  }

  const areaResult = detectAreaFromPostalCode(formData.postalCode)
  state.completedSteps[STEP_IDS.POSTAL_CODE] = areaResult.isSupported

  if (!areaResult.isSupported) {
    state.currentStep = STEP_IDS.POSTAL_CODE
    state.nextRequiredField = FIELD_NAMES.POSTAL_CODE
    return
  }

  state.enabledFields.company = true
  if (!state.currentStep || state.currentStep === STEP_IDS.POSTAL_CODE) {
    state.currentStep = STEP_IDS.COMPANY
  }
}

/**
 * Step 2: 電力会社選択処理
 */
function processCompanyStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps[STEP_IDS.POSTAL_CODE]) {
    return
  }

  if (!formData.company) {
    if (state.enabledFields.company && !state.nextRequiredField) {
      state.nextRequiredField = FIELD_NAMES.COMPANY
    }
    return
  }

  if (formData.company === COMPANY_CODES.OTHER) {
    state.completedSteps.company = false
    state.currentStep = STEP_IDS.COMPANY
    state.nextRequiredField = FIELD_NAMES.COMPANY
    return
  }

  state.completedSteps.company = true
  state.enabledFields.plan = true
  if (!state.currentStep || state.currentStep === STEP_IDS.COMPANY) {
    state.currentStep = STEP_IDS.PLAN
  }
}

/**
 * Step 3: プラン選択処理
 */
function processPlanStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps.company || !formData.plan) {
    if (state.enabledFields.plan && !state.nextRequiredField) {
      state.nextRequiredField = FIELD_NAMES.PLAN
    }
    return
  }

  state.completedSteps.plan = true
  const capacityRequired = formData.company
    ? isCapacityRequired(formData.company, formData.plan!)
    : false

  if (capacityRequired) {
    state.enabledFields.capacity = true
    if (!state.currentStep || state.currentStep === STEP_IDS.PLAN) {
      state.currentStep = STEP_IDS.CAPACITY
    }
    return
  }

  state.completedSteps.capacity = true
  state.enabledFields.electricityBill = true
  if (!state.currentStep || state.currentStep === STEP_IDS.PLAN) {
    state.currentStep = STEP_IDS.ELECTRICITY_BILL
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
      state.nextRequiredField = FIELD_NAMES.CAPACITY
    }
    return
  }

  state.completedSteps.capacity = true
  state.enabledFields.electricityBill = true
  if (!state.currentStep || state.currentStep === STEP_IDS.CAPACITY) {
    state.currentStep = STEP_IDS.ELECTRICITY_BILL
  }
}

/**
 * Step 5: 電気代入力処理
 */
function processElectricityBillStep(formData: PartialSimulationFormData, state: FormStateResult) {
  const capacityReady = state.completedSteps.capacity || !state.enabledFields.capacity
  const billComplete = formData.electricityBill && formData.electricityBill >= MIN_ELECTRICITY_BILL

  if (!capacityReady || !billComplete) {
    if (state.enabledFields.electricityBill && !state.nextRequiredField) {
      state.nextRequiredField = FIELD_NAMES.ELECTRICITY_BILL
    }
    return
  }

  state.completedSteps[STEP_IDS.ELECTRICITY_BILL] = true
  state.enabledFields.email = true
  if (!state.currentStep || state.currentStep === STEP_IDS.ELECTRICITY_BILL) {
    state.currentStep = STEP_IDS.EMAIL
  }
}

/**
 * Step 6: メールアドレス入力処理
 */
function processEmailStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps[STEP_IDS.ELECTRICITY_BILL]) {
    return
  }

  const emailComplete = formData.email && EMAIL_REGEX.test(formData.email)
  if (!emailComplete) {
    if (state.enabledFields.email && !state.nextRequiredField) {
      state.nextRequiredField = FIELD_NAMES.EMAIL
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
    currentStep: STEP_IDS.POSTAL_CODE,
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
    state.completedSteps[STEP_IDS.POSTAL_CODE] &&
      state.completedSteps.company &&
      state.completedSteps.plan &&
      state.completedSteps.capacity &&
      state.completedSteps[STEP_IDS.ELECTRICITY_BILL] &&
      state.completedSteps.email,
  )

  return {
    ...state,
    isFormComplete,
  }
}

const FIELD_RESET_MAP = FIELD_RESET_DEPENDENCIES

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
    FIELD_RESET_MAP[FIELD_NAMES.POSTAL_CODE].forEach((field) => fieldsToReset.add(field))
  }

  // その他のフィールド変更処理
  const fieldsToCheck = [FIELD_NAMES.COMPANY, FIELD_NAMES.PLAN] as const

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
      step.id === STEP_IDS.POSTAL_CODE ||
      state.completedSteps[step.id] ||
      state.currentStep === step.id,
    hasError: false, // エラー状態は別途管理
  }))

  // エラーがあるフィールドに対応するステップにエラーフラグを設定
  const fieldToStepMap = FIELD_TO_STEP_MAP

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
