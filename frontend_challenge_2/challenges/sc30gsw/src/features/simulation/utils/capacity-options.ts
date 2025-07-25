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