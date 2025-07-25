import { z } from "zod"
import {
  AMPERE_VALUES,
  AREA_CODES,
  AREAS,
  COMPANIES,
  COMPANY_CODES,
  PLAN_CODES,
  PLANS,
} from "~/features/simulation/constants/company-codes"
import { VALIDATION_TEXTS } from "~/features/simulation/constants/field-definitions"
import {
  KANSAI_AREA_FIRST_DIGIT,
  MAX_CAPACITY,
  MAX_ELECTRICITY_BILL,
  MIN_CAPACITY,
  MIN_ELECTRICITY_BILL,
  MIN_EMAIL_LENGTH,
  POSTAL_CODE_LENGTH,
  POSTAL_CODE_REGEX,
  TOKYO_AREA_FIRST_DIGIT,
} from "~/features/simulation/constants/validation"

export const postalCodeSchema = z
  .string()
  .min(POSTAL_CODE_LENGTH, VALIDATION_TEXTS.POSTAL_CODE_7_DIGITS_ERROR)
  .max(POSTAL_CODE_LENGTH, VALIDATION_TEXTS.POSTAL_CODE_7_DIGITS_ERROR)
  .regex(POSTAL_CODE_REGEX, VALIDATION_TEXTS.POSTAL_CODE_DIGITS_ONLY_ERROR)

export const areaSchema = z.enum(AREAS, {
  message: "サービスエリアを選択してください。",
})

export const companySchema = z.enum(COMPANIES, {
  message: "電力会社を選択してください。",
})

export const planSchema = z
  .enum(PLANS, {
    message: "プランを選択してください。",
  })
  .optional()

export const capacitySchema = z
  .union([
    z
      .number()
      .refine(
        (val): val is (typeof AMPERE_VALUES)[number] =>
          AMPERE_VALUES.includes(val as (typeof AMPERE_VALUES)[number]),
        {
          message: "有効なアンペア値を選択してください。",
        },
      ), // 従量電灯B(東京) - AMPERE_VALUESの数値のみ
    z
      .number()
      .min(MIN_CAPACITY, "契約容量は6kVA以上で選択してください。")
      .max(MAX_CAPACITY, "契約容量は49kVA以下で選択してください。"), // 従量電灯C(東京), 従量電灯B(関西)
    z.null(), // 従量電灯A(関西) - 不要
  ])
  .optional()

export const electricityBillSchema = z
  .number({
    message: "電気代は数値で入力してください。",
  })
  .min(MIN_ELECTRICITY_BILL, VALIDATION_TEXTS.ELECTRICITY_BILL_ERROR)
  .max(MAX_ELECTRICITY_BILL, "電気代が大きすぎます。")

export const emailSchema = z
  .email("メールアドレスを正しく入力してください。")
  .min(MIN_EMAIL_LENGTH, "メールアドレスは必須です。")

export const simulationSchema = z.object({
  postalCode: postalCodeSchema,
  area: areaSchema,
  company: companySchema,
  plan: planSchema,
  capacity: capacitySchema,
  electricityBill: electricityBillSchema,
  email: emailSchema,
})

export const stepSchemas = {
  postalCode: z.object({
    postalCode: postalCodeSchema,
  }),
  area: z.object({
    postalCode: postalCodeSchema,
    area: areaSchema,
  }),
  company: z.object({
    postalCode: postalCodeSchema,
    area: areaSchema,
    company: companySchema,
  }),
  plan: z.object({
    postalCode: postalCodeSchema,
    area: areaSchema,
    company: companySchema,
    plan: planSchema,
  }),
  capacity: z.object({
    postalCode: postalCodeSchema,
    area: areaSchema,
    company: companySchema,
    plan: planSchema,
    capacity: capacitySchema,
  }),
  electricityBill: z.object({
    postalCode: postalCodeSchema,
    area: areaSchema,
    company: companySchema,
    plan: planSchema,
    capacity: capacitySchema,
    electricityBill: electricityBillSchema,
  }),
  email: simulationSchema,
} as const satisfies Record<string, z.ZodObject<any>>

export type SimulationFormData = z.infer<typeof simulationSchema>
export type PartialSimulationFormData = Partial<SimulationFormData>

export const customValidations = {
  // 郵便番号に基づくエリア判定
  validatePostalCodeArea: (postalCode: string) => {
    if (!postalCode || postalCode.length !== POSTAL_CODE_LENGTH) {
      return AREA_CODES.UNSUPPORTED
    }

    const firstDigit = postalCode.charAt(0)
    if (firstDigit === TOKYO_AREA_FIRST_DIGIT) {
      return AREA_CODES.TOKYO
    }

    if (firstDigit === KANSAI_AREA_FIRST_DIGIT) {
      return AREA_CODES.KANSAI
    }

    return AREA_CODES.UNSUPPORTED
  },

  // 電力会社とプランの組み合わせチェック
  validateCompanyPlanCombination: (
    company: (typeof COMPANIES)[number],
    plan?: (typeof PLANS)[number],
  ) => {
    if (!plan) {
      return true
    }

    const validCombinations: Record<string, readonly string[]> = {
      [COMPANY_CODES.TEPCO]: [PLAN_CODES.JURYO_B, PLAN_CODES.JURYO_C],
      [COMPANY_CODES.KEPCO]: [PLAN_CODES.JURYO_A, PLAN_CODES.JURYO_B],
      [COMPANY_CODES.OTHER]: [],
    }

    return validCombinations[company]?.includes(plan) ?? false
  },

  // プランと契約容量の組み合わせチェック
  validatePlanCapacityCombination: (company: string, plan: string, capacity?: number | null) => {
    // 関西電力の従量電灯Aは契約容量不要
    if (company === COMPANY_CODES.KEPCO && plan === PLAN_CODES.JURYO_A) {
      return capacity === null || capacity === undefined
    }

    // その他のプランは契約容量必須
    if (company === COMPANY_CODES.TEPCO && plan === PLAN_CODES.JURYO_B) {
      return (
        typeof capacity === "number" &&
        AMPERE_VALUES.includes(capacity as (typeof AMPERE_VALUES)[number])
      )
    }

    if (
      (company === COMPANY_CODES.TEPCO && plan === PLAN_CODES.JURYO_C) ||
      (company === COMPANY_CODES.KEPCO && plan === PLAN_CODES.JURYO_B)
    ) {
      return typeof capacity === "number" && capacity >= MIN_CAPACITY && capacity <= MAX_CAPACITY
    }

    return false
  },
} as const satisfies Record<string, (...args: any[]) => boolean | string>

export function validateSimulationForm(data: PartialSimulationFormData) {
  const errors: Record<string, string> = {}

  // 郵便番号とエリアの整合性チェック
  if (data.postalCode && data.area) {
    const expectedArea = customValidations.validatePostalCodeArea(data.postalCode)
    if (expectedArea !== data.area) {
      errors.area = "エリア判定に整合性がありません。"
    }
  }

  // 電力会社とプランの組み合わせチェック
  if (data.company && data.plan) {
    if (!customValidations.validateCompanyPlanCombination(data.company, data.plan)) {
      errors.plan = "選択した電力会社では利用できないプランです。"
    }
  }

  // プランと契約容量の組み合わせチェック
  if (data.company && data.plan && data.capacity !== undefined) {
    if (
      !customValidations.validatePlanCapacityCombination(data.company, data.plan, data.capacity)
    ) {
      errors.capacity = "選択したプランでは利用できない契約容量です。"
    }
  }

  return errors
}
