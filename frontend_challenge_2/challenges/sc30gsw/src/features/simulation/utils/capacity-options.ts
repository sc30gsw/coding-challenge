import { CAPACITY_OPTIONS } from "~/features/simulation/constants"

/**
 * プランに基づいて契約容量オプションを生成する
 * @param company 電力会社コード
 * @param plan プランコード
 * @returns 契約容量オプション生成結果
 */
export function generateCapacityOptions(company: string, plan: string) {
  // 東京電力の従量電灯B
  if (company === "tepco" && plan === "juryoB") {
    return {
      options: CAPACITY_OPTIONS.tepcoJuryoB,
      isRequired: true,
      unit: "A",
      helpText: "一般的なご家庭では30Aが目安です",
    }
  }

  // 東京電力の従量電灯C
  if (company === "tepco" && plan === "juryoC") {
    return {
      options: CAPACITY_OPTIONS.tepcoJuryoC,
      isRequired: true,
      unit: "kVA",
      helpText: "大容量を使用される場合に適用されます",
    }
  }

  // 関西電力の従量電灯A
  if (company === "kepco" && plan === "juryoA") {
    return {
      options: CAPACITY_OPTIONS.kepcoJuryoA,
      isRequired: false,
      unit: null,
      helpText: "従量電灯Aでは契約容量の設定は不要です",
    }
  }

  // 関西電力の従量電灯B
  if (company === "kepco" && plan === "juryoB") {
    return {
      options: CAPACITY_OPTIONS.kepcoJuryoB,
      isRequired: true,
      unit: "kVA",
      helpText: "大容量を使用される場合に適用されます",
    }
  }

  return {
    options: [],
    isRequired: false,
    unit: null,
    helpText: "選択されたプランでは契約容量は設定できません",
  }
}

/**
 * 契約容量が必要かどうかを判定する
 * @param company 電力会社コード
 * @param plan プランコード
 * @returns 契約容量が必要かのboolean
 */
export function isCapacityRequired(company: string, plan: string) {
  return generateCapacityOptions(company, plan).isRequired
}

/**
 * 契約容量の値を正規化する（表示用文字列に変換）
 * @param capacity 契約容量の値
 * @param unit 単位
 * @returns 表示用文字列
 */
export function formatCapacityValue(capacity?: string | number | null, unit?: "A" | "kVA" | null) {
  if (capacity === null || capacity === undefined) {
    return "未設定"
  }

  if (typeof capacity === "string") {
    return capacity // すでに "30A" のような形式
  }

  if (typeof capacity === "number" && unit === "kVA") {
    return `${capacity}kVA`
  }

  return String(capacity)
}

/**
 * 契約容量値の妥当性をチェックする
 * @param capacity 契約容量の値
 * @param company 電力会社コード
 * @param plan プランコード
 * @returns 妥当性チェック結果
 */
export function validateCapacityValue(
  capacity: string | number | null,
  company: string,
  plan: string,
) {
  const result = generateCapacityOptions(company, plan)

  // 契約容量が不要なプランの場合
  if (!result.isRequired) {
    return {
      isValid: capacity === null || capacity === undefined,
    }
  }

  // 契約容量が必要なプランで未設定の場合
  if (capacity === null || capacity === undefined) {
    return {
      isValid: false,
      errorMessage: "契約容量を選択してください",
    }
  }

  // 有効なオプションの中に含まれているかチェック
  const isValidOption = result.options.some((option) => {
    if (typeof capacity === "string") {
      return option.value === capacity
    }

    if (typeof capacity === "number") {
      return option.value === capacity
    }

    return false
  })

  if (!isValidOption) {
    return {
      isValid: false,
      errorMessage: `選択されたプランでは${formatCapacityValue(capacity, result.unit as "A" | "kVA" | null)}は選択できません`,
    }
  }

  return {
    isValid: true,
  }
}

/**
 * デフォルトの契約容量を取得する
 * @param company 電力会社コード
 * @param plan プランコード
 * @returns デフォルト契約容量
 */
export function getDefaultCapacity(company: string, plan: string) {
  const result = generateCapacityOptions(company, plan)

  if (!result.isRequired || result.options.length === 0) {
    return null
  }

  // 東京電力従量電灯Bの場合は30Aをデフォルトにする
  if (company === "tepco" && plan === "juryoB") {
    return "30A"
  }

  // kVAの場合は6kVAをデフォルトにする
  if (result.unit === "kVA") {
    return 6
  }

  // それ以外は最初のオプションをデフォルトにする
  return result.options[0]?.value ?? null
}

/**
 * 契約容量オプションを検索する
 * @param company 電力会社コード
 * @param plan プランコード
 * @param searchValue 検索値
 * @returns 該当するオプション
 */
export function findCapacityOption(company: string, plan: string, searchValue: string | number) {
  const result = generateCapacityOptions(company, plan)

  return result.options.find((option) => option.value === searchValue) ?? null
}

/**
 * 契約容量の範囲情報を取得する
 * @param company 電力会社コード
 * @param plan プランコード
 * @returns 範囲情報
 */
export function getCapacityRange(company: string, plan: string) {
  const result = generateCapacityOptions(company, plan)

  if (result.options.length === 0) {
    return {
      min: null,
      max: null,
      unit: null,
    }
  }

  const values = result.options.map((option) => option.value)

  return {
    min: values[0] ?? null,
    max: values[values.length - 1] ?? null,
    unit: result.unit,
  }
}

/**
 * 契約容量の推奨値を取得する
 * @param electricityBill 月額電気代
 * @param company 電力会社コード
 * @param plan プランコード
 * @returns 推奨契約容量
 */
export function getRecommendedCapacity(electricityBill: number, company: string, plan: string) {
  const result = generateCapacityOptions(company, plan)

  if (!result.isRequired || result.options.length === 0) {
    return null
  }

  // 東京電力従量電灯Bの場合の推奨ロジック
  if (company === "tepco" && plan === "juryoB") {
    if (electricityBill < 3000) return "20A"
    if (electricityBill < 5000) return "30A"
    if (electricityBill < 8000) return "40A"
    return "50A"
  }

  // kVAの場合の推奨ロジック
  if (result.unit === "kVA") {
    if (electricityBill < 8000) return 6
    if (electricityBill < 15000) return 10
    if (electricityBill < 25000) return 15
    return 20
  }

  return getDefaultCapacity(company, plan)
}
