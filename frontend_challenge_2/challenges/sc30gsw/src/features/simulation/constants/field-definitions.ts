export const FIELD_NAMES = {
  POSTAL_CODE: "postalCode",
  AREA: "area",
  COMPANY: "company",
  PLAN: "plan",
  CAPACITY: "capacity",
  ELECTRICITY_BILL: "electricityBill",
  EMAIL: "email",
} as const satisfies Record<string, string>

export const STEP_IDS = {
  POSTAL_CODE: "postal-code",
  AREA: "area",
  COMPANY: "company",
  PLAN: "plan",
  CAPACITY: "capacity",
  ELECTRICITY_BILL: "electricity-bill",
  EMAIL: "email",
} as const satisfies Record<string, string>

export const FIELD_LABELS = {
  POSTAL_CODE: "郵便番号",
  AREA: "エリア",
  COMPANY: "電力会社",
  PLAN: "プラン",
  CAPACITY: "契約容量",
  ELECTRICITY_BILL: "電気代",
  EMAIL: "メールアドレス",
} as const satisfies Record<string, string>

export const VALIDATION_TEXTS = {
  UNSUPPORTED_AREA: "サービスエリア対象外",
  POSTAL_CODE_7_DIGITS_ERROR: "郵便番号は7桁で入力してください。",
  POSTAL_CODE_DIGITS_ONLY_ERROR: "郵便番号は数字のみで入力してください。",
  ELECTRICITY_BILL_ERROR: "電気代を正しく入力してください。",
  UNSUPPORTED_AREA_ERROR: "サービスエリア対象外です。",
} as const satisfies Record<string, string>

export const FIELD_RESET_DEPENDENCIES = {
  [FIELD_NAMES.POSTAL_CODE]: [
    FIELD_NAMES.AREA,
    FIELD_NAMES.COMPANY,
    FIELD_NAMES.PLAN,
    FIELD_NAMES.CAPACITY,
  ],
  [FIELD_NAMES.COMPANY]: [FIELD_NAMES.PLAN, FIELD_NAMES.CAPACITY],
  [FIELD_NAMES.PLAN]: [FIELD_NAMES.CAPACITY],
} as const satisfies Record<string, readonly string[]>

export const FIELD_TO_STEP_MAP = {
  [FIELD_NAMES.POSTAL_CODE]: STEP_IDS.POSTAL_CODE,
  [FIELD_NAMES.AREA]: STEP_IDS.POSTAL_CODE,
  [FIELD_NAMES.COMPANY]: STEP_IDS.COMPANY,
  [FIELD_NAMES.PLAN]: STEP_IDS.PLAN,
  [FIELD_NAMES.CAPACITY]: STEP_IDS.CAPACITY,
  [FIELD_NAMES.ELECTRICITY_BILL]: STEP_IDS.ELECTRICITY_BILL,
  [FIELD_NAMES.EMAIL]: STEP_IDS.EMAIL,
} as const satisfies Record<string, string>
