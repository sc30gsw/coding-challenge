import type {
  CapacityOption,
  ElectricityArea,
  ElectricityCompany,
  ElectricityPlan,
  FormStep,
} from "~/features/simulation/types/simulation"

export const ELECTRICITY_AREAS = {
  tokyo: {
    code: "tokyo",
    name: "東京電力エリア",
    postalCodePattern: /^1/,
  },
  kansai: {
    code: "kansai",
    name: "関西電力エリア",
    postalCodePattern: /^5/,
  },
  unsupported: {
    code: "unsupported",
    name: "サービスエリア対象外",
    postalCodePattern: /^[^15]/,
  },
} as const satisfies Record<ElectricityArea["code"], ElectricityArea>

export const CAPACITY_OPTIONS = {
  tepcoJuryoB: [
    { value: "10A", label: "10A", unit: "A" },
    { value: "15A", label: "15A", unit: "A" },
    { value: "20A", label: "20A", unit: "A" },
    { value: "30A", label: "30A", unit: "A" },
    { value: "40A", label: "40A", unit: "A" },
    { value: "50A", label: "50A", unit: "A" },
    { value: "60A", label: "60A", unit: "A" },
  ],
  tepcoJuryoC: Array.from({ length: 44 }, (_, i) => ({
    value: i + 6,
    label: `${i + 6}kVA`,
    unit: "kVA",
  })),
  kepcoJuryoA: [], // 契約容量不要
  kepcoJuryoB: Array.from({ length: 44 }, (_, i) => ({
    value: i + 6,
    label: `${i + 6}kVA`,
    unit: "kVA",
  })),
} as const satisfies Record<string, CapacityOption[]>

export const ELECTRICITY_PLANS = [
  {
    code: "juryoB",
    name: "従量電灯B",
    company: "tepco",
    capacityOptions: CAPACITY_OPTIONS.tepcoJuryoB,
    requiresCapacity: true,
  },
  {
    code: "juryoC",
    name: "従量電灯C",
    company: "tepco",
    capacityOptions: CAPACITY_OPTIONS.tepcoJuryoC,
    requiresCapacity: true,
  },
  {
    code: "juryoA",
    name: "従量電灯A",
    company: "kepco",
    capacityOptions: CAPACITY_OPTIONS.kepcoJuryoA,
    requiresCapacity: false,
  },
  {
    code: "juryoB",
    name: "従量電灯B",
    company: "kepco",
    capacityOptions: CAPACITY_OPTIONS.kepcoJuryoB,
    requiresCapacity: true,
  },
] as const satisfies ElectricityPlan[]

export const ELECTRICITY_COMPANIES = [
  {
    code: "tepco",
    name: "東京電力",
    area: "tokyo",
    supportedPlans: ELECTRICITY_PLANS.filter((plan) => plan.company === "tepco"),
  },
  {
    code: "kepco",
    name: "関西電力",
    area: "kansai",
    supportedPlans: ELECTRICITY_PLANS.filter((plan) => plan.company === "kepco"),
  },
  {
    code: "other",
    name: "その他",
    area: "tokyo",
    supportedPlans: [],
  },
] as const satisfies ElectricityCompany[]

export const FORM_STEPS = [
  {
    id: "postal-code",
    name: "郵便番号",
    completed: false,
    enabled: true,
    hasError: false,
  },
  {
    id: "company",
    name: "電力会社",
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: "plan",
    name: "プラン",
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: "capacity",
    name: "契約容量",
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: "electricity-bill",
    name: "電気代",
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: "email",
    name: "メールアドレス",
    completed: false,
    enabled: false,
    hasError: false,
  },
] as const satisfies FormStep[]
