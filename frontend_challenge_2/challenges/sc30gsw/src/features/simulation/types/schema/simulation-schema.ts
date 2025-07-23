import { z } from "zod"

// 郵便番号バリデーション
export const postalCodeSchema = z
  .string()
  .min(7, "郵便番号は7桁で入力してください")
  .max(7, "郵便番号は7桁で入力してください")
  .regex(/^\d{7}$/, "郵便番号は数字のみで入力してください")

// エリアバリデーション
export const areaSchema = z.enum(["tokyo", "kansai", "unsupported"], {
  message: "サービスエリアを選択してください",
})

// 電力会社バリデーション
export const companySchema = z.enum(["tepco", "kepco", "other"], {
  message: "電力会社を選択してください",
})

// プランバリデーション
export const planSchema = z.enum(["juryoA", "juryoB", "juryoC"], {
  message: "プランを選択してください",
})

// 契約容量バリデーション（条件付き）
export const capacitySchema = z
  .union([
    z.enum(["10A", "15A", "20A", "30A", "40A", "50A", "60A"]), // 従量電灯B(東京)
    z
      .number()
      .min(6, "契約容量は6kVA以上で選択してください")
      .max(49, "契約容量は49kVA以下で選択してください"), // 従量電灯C(東京), 従量電灯B(関西)
    z.null(), // 従量電灯A(関西) - 不要
  ])
  .optional()

// 電気代バリデーション
export const electricityBillSchema = z
  .number({
    message: "電気代は数値で入力してください",
  })
  .min(1000, "電気代は1000円以上で入力してください")
  .max(999999, "電気代が大きすぎます")

// メールアドレスバリデーション
export const emailSchema = z
  .email("メールアドレスを正しく入力してください")
  .min(1, "メールアドレスは必須です")

// メインの統合フォームスキーマ
export const simulationSchema = z.object({
  postalCode: postalCodeSchema,
  area: areaSchema,
  company: companySchema,
  plan: planSchema,
  capacity: capacitySchema,
  electricityBill: electricityBillSchema,
  email: emailSchema,
})

// 段階的バリデーション用のスキーマ
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

// カスタムバリデーション関数
export const customValidations = {
  // 郵便番号に基づくエリア判定
  validatePostalCodeArea: (postalCode: string) => {
    if (!postalCode || postalCode.length !== 7) {
      return "unsupported"
    }

    const firstDigit = postalCode.charAt(0)
    if (firstDigit === "1") {
      return "tokyo"
    }

    if (firstDigit === "5") {
      return "kansai"
    }

    return "unsupported"
  },

  // 電力会社とプランの組み合わせチェック
  validateCompanyPlanCombination: (
    company: "tepco" | "kepco" | "other",
    plan: "juryoA" | "juryoB" | "juryoC",
  ) => {
    const validCombinations: Record<typeof company, Array<typeof plan>> = {
      tepco: ["juryoB", "juryoC"],
      kepco: ["juryoA", "juryoB"],
      other: [],
    }

    return validCombinations[company]?.includes(plan) ?? false
  },

  // プランと契約容量の組み合わせチェック
  validatePlanCapacityCombination: (
    company: string,
    plan: string,
    capacity?: string | number | null,
  ) => {
    // 関西電力の従量電灯Aは契約容量不要
    if (company === "kepco" && plan === "juryoA") {
      return capacity === null || capacity === undefined
    }

    // その他のプランは契約容量必須
    if (company === "tepco" && plan === "juryoB") {
      return (
        typeof capacity === "string" &&
        ["10A", "15A", "20A", "30A", "40A", "50A", "60A"].includes(capacity)
      )
    }

    if ((company === "tepco" && plan === "juryoC") || (company === "kepco" && plan === "juryoB")) {
      return typeof capacity === "number" && capacity >= 6 && capacity <= 49
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
      errors.area = "エリア判定に整合性がありません"
    }
  }

  // 電力会社とプランの組み合わせチェック
  if (data.company && data.plan) {
    if (!customValidations.validateCompanyPlanCombination(data.company, data.plan)) {
      errors.plan = "選択した電力会社では利用できないプランです"
    }
  }

  // プランと契約容量の組み合わせチェック
  if (data.company && data.plan && data.capacity !== undefined) {
    if (
      !customValidations.validatePlanCapacityCombination(data.company, data.plan, data.capacity)
    ) {
      errors.capacity = "選択したプランでは利用できない契約容量です"
    }
  }

  return errors
}
