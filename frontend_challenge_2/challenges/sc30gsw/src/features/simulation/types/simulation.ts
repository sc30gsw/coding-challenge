export type ElectricityArea = {
  code: "tokyo" | "kansai" | "unsupported"
  name: string
  postalCodePattern: RegExp
}

export type ElectricityCompany = {
  code: string
  name: string
  area: ElectricityArea["code"]
  supportedPlans: ElectricityPlan[]
}

export type ElectricityPlan = {
  code: string
  name: string
  company: string
  capacityOptions: CapacityOption[]
  requiresCapacity: boolean
}

export type CapacityOption = {
  value: string | number
  label: string
  unit: "A" | "kVA"
}

export type FormStep = {
  id: string
  name: string
  completed: boolean
  enabled: boolean
  hasError: boolean
}
