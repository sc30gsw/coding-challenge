import type {
  AREA_CODES,
  CAPACITY_UNITS,
  COMPANY_CODES,
  PLAN_CODES,
} from "~/features/simulation/constants/company-codes"
import type { STEP_IDS } from "~/features/simulation/constants/field-definitions"

export type ElectricityArea = {
  code: (typeof AREA_CODES)[keyof typeof AREA_CODES]
  name: string
  postalCodePattern: RegExp
}

export type ElectricityCompany = {
  code: (typeof COMPANY_CODES)[keyof typeof COMPANY_CODES]
  name: string
  area: ElectricityArea["code"]
  supportedPlans: ElectricityPlan[]
}

export type ElectricityPlan = {
  code: (typeof PLAN_CODES)[keyof typeof PLAN_CODES]
  name: string
  company: (typeof COMPANY_CODES)[keyof typeof COMPANY_CODES]
  capacityOptions: CapacityOption[] | readonly []
  requiresCapacity: boolean
}

export type CapacityOption = {
  value: number
  label: string
  unit: (typeof CAPACITY_UNITS)[keyof typeof CAPACITY_UNITS]
}

export type FormStep = {
  id: (typeof STEP_IDS)[keyof typeof STEP_IDS]
  name: string
  completed: boolean
  enabled: boolean
  hasError: boolean
}
