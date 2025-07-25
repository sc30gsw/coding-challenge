export const COMPANY_CODES = {
  TEPCO: "tepco",
  KEPCO: "kepco",
  OTHER: "other",
} as const satisfies Record<string, string>

export const AREA_CODES = {
  TOKYO: "tokyo",
  KANSAI: "kansai",
  UNSUPPORTED: "unsupported",
} as const satisfies Record<string, string>

export const PLAN_CODES = {
  JURYO_A: "juryoA",
  JURYO_B: "juryoB",
  JURYO_C: "juryoC",
} as const satisfies Record<string, string>

export const CAPACITY_UNITS = {
  AMPERE: "A",
  KVA: "kVA",
} as const satisfies Record<string, string>

export const AREAS = [
  AREA_CODES.TOKYO,
  AREA_CODES.KANSAI,
  AREA_CODES.UNSUPPORTED,
] as const satisfies readonly string[]

export const COMPANIES = [
  COMPANY_CODES.TEPCO,
  COMPANY_CODES.KEPCO,
  COMPANY_CODES.OTHER,
  "",
] as const satisfies readonly string[]

export const PLANS = [
  PLAN_CODES.JURYO_A,
  PLAN_CODES.JURYO_B,
  PLAN_CODES.JURYO_C,
] as const satisfies readonly string[]

export const AMPERE_VALUES = [10, 15, 20, 30, 40, 50, 60] as const satisfies readonly number[]
