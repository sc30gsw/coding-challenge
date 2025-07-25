import { KVA_RANGE_LENGTH, KVA_START_VALUE } from "~/features/simulation/constants/validation"
import type { CapacityOption } from "~/features/simulation/types/simulation"

/**
 * 容量オプションを動的に生成するユーティリティ関数
 * @param values 容量値の配列
 * @param unit 単位 ("A" または "kVA")
 * @returns 容量オプション配列
 */
export function createCapacityOptions(
  values: readonly CapacityOption["value"][],
  unit: CapacityOption["unit"],
) {
  return values.map((value) => ({
    value: value,
    label: `${value}${unit}`,
    unit,
  }))
}

/**
 * kVA範囲の容量オプションを生成する
 * @param startValue 開始値 (デフォルト: 6)
 * @param length 生成する数 (デフォルト: 44)
 * @param unit 単位 (デフォルト: "kVA")
 * @returns kVA容量オプション配列
 */
export function createKVACapacityOptions(
  startValue: CapacityOption["value"] = KVA_START_VALUE,
  length: CapacityOption["value"] = KVA_RANGE_LENGTH,
  unit: CapacityOption["unit"] = "kVA",
): CapacityOption[] {
  return Array.from({ length }, (_, i) => ({
    value: i + startValue,
    label: `${i + startValue}${unit}`,
    unit,
  }))
}
