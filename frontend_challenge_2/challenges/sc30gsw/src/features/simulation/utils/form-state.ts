import { FORM_STEPS } from "~/features/simulation/constants"
import { COMPANY_CODES } from "~/features/simulation/constants/company-codes"
import {
  FIELD_NAMES,
  FIELD_RESET_DEPENDENCIES,
  FIELD_TO_STEP_MAP,
  STEP_DEPENDENCIES,
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
 * ステップの依存関係をチェックし、依存するステップが未完了の場合は無効にする
 * @param stepId チェック対象のステップID
 * @param completedSteps 完了ステップの状態
 * @returns 依存関係が満たされているかどうか
 */
function validateStepDependencies(
  stepId: (typeof STEP_IDS)[keyof typeof STEP_IDS],
  completedSteps: Record<string, boolean>,
): boolean {
  const dependencies = STEP_DEPENDENCIES[stepId as keyof typeof STEP_DEPENDENCIES]
  if (!dependencies) {
    return true
  }

  return dependencies.every((dependencyStep) => completedSteps[dependencyStep] === true)
}

/**
 * Step 1: 郵便番号とエリア判定処理
 */
function processPostalCodeStep(formData: PartialSimulationFormData, state: FormStateResult) {
  const postalCodeComplete = formData.postalCode && formData.postalCode.length === 7

  if (!postalCodeComplete || !formData.postalCode) {
    return {
      ...state,
      currentStep: STEP_IDS.POSTAL_CODE,
      nextRequiredField: FIELD_NAMES.POSTAL_CODE,
    }
  }

  const areaResult = detectAreaFromPostalCode(formData.postalCode)
  const updatedCompletedSteps = {
    ...state.completedSteps,
    [STEP_IDS.POSTAL_CODE]: areaResult.isSupported,
  }

  if (!areaResult.isSupported) {
    return {
      ...state,
      completedSteps: updatedCompletedSteps,
      currentStep: STEP_IDS.POSTAL_CODE,
      nextRequiredField: FIELD_NAMES.POSTAL_CODE,
    }
  }

  return {
    ...state,
    completedSteps: updatedCompletedSteps,
    enabledFields: {
      ...state.enabledFields,
      company: true,
    },
    currentStep:
      !state.currentStep || state.currentStep === STEP_IDS.POSTAL_CODE
        ? STEP_IDS.COMPANY
        : state.currentStep,
  }
}

/**
 * Step 2: 電力会社選択処理
 */
function processCompanyStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps[STEP_IDS.POSTAL_CODE]) {
    return state
  }

  if (!formData.company) {
    if (state.enabledFields.company && !state.nextRequiredField) {
      return {
        ...state,
        nextRequiredField: FIELD_NAMES.COMPANY,
      }
    }
    return state
  }

  if (formData.company === COMPANY_CODES.OTHER) {
    return {
      ...state,
      completedSteps: {
        ...state.completedSteps,
        company: false,
      },
      currentStep: STEP_IDS.COMPANY,
      nextRequiredField: FIELD_NAMES.COMPANY,
    }
  }

  return {
    ...state,
    completedSteps: {
      ...state.completedSteps,
      company: true,
    },
    enabledFields: {
      ...state.enabledFields,
      plan: true,
    },
    currentStep:
      !state.currentStep || state.currentStep === STEP_IDS.COMPANY
        ? STEP_IDS.PLAN
        : state.currentStep,
  }
}

/**
 * Step 3: プラン選択処理
 */
function processPlanStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.completedSteps.company || !formData.plan) {
    if (state.enabledFields.plan && !state.nextRequiredField) {
      return {
        ...state,
        nextRequiredField: FIELD_NAMES.PLAN,
      }
    }
    return state
  }

  const capacityRequired = formData.company
    ? isCapacityRequired(formData.company, formData.plan!)
    : false

  if (capacityRequired) {
    return {
      ...state,
      completedSteps: {
        ...state.completedSteps,
        plan: true,
      },
      enabledFields: {
        ...state.enabledFields,
        capacity: true,
      },
      currentStep:
        !state.currentStep || state.currentStep === STEP_IDS.PLAN
          ? STEP_IDS.CAPACITY
          : state.currentStep,
    }
  }

  return {
    ...state,
    completedSteps: {
      ...state.completedSteps,
      plan: true,
      capacity: true,
    },
    enabledFields: {
      ...state.enabledFields,
      electricityBill: true,
    },
    currentStep:
      !state.currentStep || state.currentStep === STEP_IDS.PLAN
        ? STEP_IDS.ELECTRICITY_BILL
        : state.currentStep,
  }
}

/**
 * Step 4: 契約容量選択処理
 */
function processCapacityStep(formData: PartialSimulationFormData, state: FormStateResult) {
  if (!state.enabledFields.capacity) {
    return state
  }

  const capacityComplete = formData.capacity !== null && formData.capacity !== undefined
  if (!capacityComplete) {
    if (!state.nextRequiredField) {
      return {
        ...state,
        nextRequiredField: FIELD_NAMES.CAPACITY,
      }
    }
    return state
  }

  return {
    ...state,
    completedSteps: {
      ...state.completedSteps,
      capacity: true,
    },
    enabledFields: {
      ...state.enabledFields,
      electricityBill: true,
    },
    currentStep:
      !state.currentStep || state.currentStep === STEP_IDS.CAPACITY
        ? STEP_IDS.ELECTRICITY_BILL
        : state.currentStep,
  }
}

/**
 * Step 5: 電気代入力処理
 */
function processElectricityBillStep(formData: PartialSimulationFormData, state: FormStateResult) {
  const capacityReady = state.completedSteps.capacity || !state.enabledFields.capacity
  const billComplete = formData.electricityBill && formData.electricityBill >= MIN_ELECTRICITY_BILL

  const dependenciesValid = validateStepDependencies(
    STEP_IDS.ELECTRICITY_BILL,
    state.completedSteps,
  )

  if (!capacityReady || !billComplete || !dependenciesValid) {
    if (state.enabledFields.electricityBill && !state.nextRequiredField) {
      return {
        ...state,
        nextRequiredField: FIELD_NAMES.ELECTRICITY_BILL,
      }
    }
    return state
  }

  return {
    ...state,
    completedSteps: {
      ...state.completedSteps,
      [STEP_IDS.ELECTRICITY_BILL]: true,
    },
    enabledFields: {
      ...state.enabledFields,
      email: true,
    },
    currentStep:
      !state.currentStep || state.currentStep === STEP_IDS.ELECTRICITY_BILL
        ? STEP_IDS.EMAIL
        : state.currentStep,
  }
}

/**
 * Step 6: メールアドレス入力処理
 */
function processEmailStep(formData: PartialSimulationFormData, state: FormStateResult) {
  const dependenciesValid = validateStepDependencies(STEP_IDS.EMAIL, state.completedSteps)

  if (!state.completedSteps[STEP_IDS.ELECTRICITY_BILL] || !dependenciesValid) {
    return state
  }

  const emailComplete = formData.email && EMAIL_REGEX.test(formData.email)
  if (!emailComplete) {
    if (state.enabledFields.email && !state.nextRequiredField) {
      return {
        ...state,
        nextRequiredField: FIELD_NAMES.EMAIL,
      }
    }
    return state
  }

  return {
    ...state,
    completedSteps: {
      ...state.completedSteps,
      email: true,
    },
    currentStep: null,
  }
}

/**
 * フォームの現在の状態を分析し、各フィールドの有効/無効状態を決定する
 * @param formData 現在のフォームデータ
 * @returns フォーム状態分析結果
 */
export function analyzeFormState(formData: PartialSimulationFormData) {
  const initialState: FormStateResult = {
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

  const postalCodeProcessed = processPostalCodeStep(formData, initialState)
  const companyProcessed = processCompanyStep(formData, postalCodeProcessed)
  const planProcessed = processPlanStep(formData, companyProcessed)
  const capacityProcessed = processCapacityStep(formData, planProcessed)
  const electricityBillProcessed = processElectricityBillStep(formData, capacityProcessed)
  const finalState = processEmailStep(formData, electricityBillProcessed)

  const validatedCompletedSteps = { ...finalState.completedSteps }

  Object.keys(STEP_DEPENDENCIES).forEach((stepId) => {
    const typedStepId = stepId as (typeof STEP_IDS)[keyof typeof STEP_IDS]
    if (validatedCompletedSteps[typedStepId] === undefined) {
      validatedCompletedSteps[typedStepId] = false
    }
  })

  // 各ステップの依存関係をチェックし、依存関係が満たされていない場合は未完了にする
  Object.keys(STEP_DEPENDENCIES).forEach((stepId) => {
    const typedStepId = stepId as (typeof STEP_IDS)[keyof typeof STEP_IDS]
    if (
      validatedCompletedSteps[typedStepId] &&
      !validateStepDependencies(typedStepId, finalState.completedSteps)
    ) {
      validatedCompletedSteps[typedStepId] = false
    }
  })

  // フォーム完了判定
  const isFormComplete = Boolean(
    validatedCompletedSteps[STEP_IDS.POSTAL_CODE] &&
      validatedCompletedSteps.company &&
      validatedCompletedSteps.plan &&
      validatedCompletedSteps.capacity &&
      validatedCompletedSteps[STEP_IDS.ELECTRICITY_BILL] &&
      validatedCompletedSteps.email,
  )

  return {
    ...finalState,
    completedSteps: validatedCompletedSteps,
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

  // 契約容量が不要な場合、容量ステップを非表示にする
  const shouldShowCapacityStep =
    formData.company && formData.plan ? isCapacityRequired(formData.company, formData.plan) : true

  const steps = FORM_STEPS.filter((step) => {
    // 契約容量ステップを条件に応じてフィルタリング
    if (step.id === STEP_IDS.CAPACITY && !shouldShowCapacityStep) {
      return false
    }
    return true
  }).map((step) => ({
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
