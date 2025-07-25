import {
  AMPERE_VALUES,
  CAPACITY_UNITS,
  COMPANY_CODES,
  PLAN_CODES,
} from "~/features/simulation/constants/company-codes"
import type { ElectricityCompany, ElectricityPlan } from "~/features/simulation/types/simulation"
import {
  createCapacityOptions,
  createKVACapacityOptions,
} from "~/features/simulation/utils/capacity-generator"

/**
 * プランに基づいて契約容量オプションを生成する
 * @param company 電力会社コード
 * @param plan プランコード
 * @returns 契約容量オプション生成結果
 */
export function generateCapacityOptions(
  company: ElectricityCompany["code"],
  plan: ElectricityPlan["code"],
) {
  // 東京電力の従量電灯B
  if (company === COMPANY_CODES.TEPCO && plan === PLAN_CODES.JURYO_B) {
    return {
      options: createCapacityOptions(AMPERE_VALUES, CAPACITY_UNITS.AMPERE),
      isRequired: true,
      unit: CAPACITY_UNITS.AMPERE,
      helpText: "一般的なご家庭では30Aが目安です",
    }
  }

  // 東京電力の従量電灯C
  if (company === COMPANY_CODES.TEPCO && plan === PLAN_CODES.JURYO_C) {
    return {
      options: createKVACapacityOptions(),
      isRequired: true,
      unit: CAPACITY_UNITS.KVA,
      helpText: "大容量を使用される場合に適用されます",
    }
  }

  // 関西電力の従量電灯A
  if (company === COMPANY_CODES.KEPCO && plan === PLAN_CODES.JURYO_A) {
    return {
      options: [],
      isRequired: false,
      unit: null,
      helpText: "従量電灯Aでは契約容量の設定は不要です",
    }
  }

  // 関西電力の従量電灯B
  if (company === COMPANY_CODES.KEPCO && plan === PLAN_CODES.JURYO_B) {
    return {
      options: createKVACapacityOptions(),
      isRequired: true,
      unit: CAPACITY_UNITS.KVA,
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
export function isCapacityRequired(
  company: ElectricityCompany["code"],
  plan: ElectricityPlan["code"],
) {
  return generateCapacityOptions(company, plan).isRequired
}
