import {
  AMPERE_VALUES,
  AREA_CODES,
  CAPACITY_UNITS,
  COMPANY_CODES,
  PLAN_CODES,
} from "~/features/simulation/constants/company-codes"
import { FIELD_LABELS, STEP_IDS } from "~/features/simulation/constants/field-definitions"
import type {
  ElectricityArea,
  ElectricityCompany,
  ElectricityPlan,
  FormStep,
} from "~/features/simulation/types/simulation"
import {
  createCapacityOptions,
  createKVACapacityOptions,
} from "~/features/simulation/utils/capacity-generator"

export const ELECTRICITY_AREAS = {
  [AREA_CODES.TOKYO]: {
    code: AREA_CODES.TOKYO,
    name: "東京電力エリア",
    postalCodePattern: /^1/,
  },
  [AREA_CODES.KANSAI]: {
    code: AREA_CODES.KANSAI,
    name: "関西電力エリア",
    postalCodePattern: /^5/,
  },
  [AREA_CODES.UNSUPPORTED]: {
    code: AREA_CODES.UNSUPPORTED,
    name: "サービスエリア対象外",
    postalCodePattern: /^[^15]/,
  },
} as const satisfies Record<ElectricityArea["code"], ElectricityArea>

export const ELECTRICITY_PLANS = [
  {
    code: PLAN_CODES.JURYO_B,
    name: "従量電灯B",
    company: COMPANY_CODES.TEPCO,
    capacityOptions: createCapacityOptions(AMPERE_VALUES, CAPACITY_UNITS.AMPERE),
    requiresCapacity: true,
  },
  {
    code: PLAN_CODES.JURYO_C,
    name: "従量電灯C",
    company: COMPANY_CODES.TEPCO,
    capacityOptions: createKVACapacityOptions(),
    requiresCapacity: true,
  },
  {
    code: PLAN_CODES.JURYO_A,
    name: "従量電灯A",
    company: COMPANY_CODES.KEPCO,
    capacityOptions: [],
    requiresCapacity: false,
  },
  {
    code: PLAN_CODES.JURYO_B,
    name: "従量電灯B",
    company: COMPANY_CODES.KEPCO,
    capacityOptions: createKVACapacityOptions(),
    requiresCapacity: true,
  },
] as const satisfies ElectricityPlan[]

export const ELECTRICITY_COMPANIES = [
  {
    code: COMPANY_CODES.TEPCO,
    name: "東京電力",
    area: AREA_CODES.TOKYO,
    supportedPlans: ELECTRICITY_PLANS.filter((plan) => plan.company === COMPANY_CODES.TEPCO),
  },
  {
    code: COMPANY_CODES.KEPCO,
    name: "関西電力",
    area: AREA_CODES.KANSAI,
    supportedPlans: ELECTRICITY_PLANS.filter((plan) => plan.company === COMPANY_CODES.KEPCO),
  },
  {
    code: COMPANY_CODES.OTHER,
    name: "その他",
    area: AREA_CODES.TOKYO,
    supportedPlans: [],
  },
] as const satisfies ElectricityCompany[]

export const FORM_STEPS = [
  {
    id: STEP_IDS.POSTAL_CODE,
    name: FIELD_LABELS.POSTAL_CODE,
    completed: false,
    enabled: true,
    hasError: false,
  },
  {
    id: STEP_IDS.COMPANY,
    name: FIELD_LABELS.COMPANY,
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: STEP_IDS.PLAN,
    name: FIELD_LABELS.PLAN,
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: STEP_IDS.CAPACITY,
    name: FIELD_LABELS.CAPACITY,
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: STEP_IDS.ELECTRICITY_BILL,
    name: FIELD_LABELS.ELECTRICITY_BILL,
    completed: false,
    enabled: false,
    hasError: false,
  },
  {
    id: STEP_IDS.EMAIL,
    name: FIELD_LABELS.EMAIL,
    completed: false,
    enabled: false,
    hasError: false,
  },
] as const satisfies FormStep[]
