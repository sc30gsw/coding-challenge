import { IconChevronDown } from "@tabler/icons-react"
import { clsx } from "clsx"
import { Controller, useFormContext } from "react-hook-form"
import Select, { type SingleValue } from "react-select"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import { ELECTRICITY_COMPANIES } from "~/features/simulation/constants"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"
import { createSelectStyles } from "~/features/simulation/utils/select-styles"

type PlanOption = {
  value: string
  label: string
}

type PlanSelectFieldProps = {
  error?: string
  disabled?: boolean
  company: SimulationFormData["company"]
  onChange?: (plan: SimulationFormData["plan"]) => void
}

export function PlanSelectField({
  error,
  disabled = false,
  company,
  onChange,
}: PlanSelectFieldProps) {
  const { control } = useFormContext<SimulationFormData>()

  const selectedCompany = ELECTRICITY_COMPANIES.find((c) => c.code === company)
  const availablePlans = selectedCompany?.supportedPlans || []

  const planOptions = availablePlans.map((plan) => ({
    value: plan.code,
    label: plan.name,
  })) satisfies readonly PlanOption[]

  const getSelectedPlanDescription = (planCode: SimulationFormData["plan"]) => {
    const plan = availablePlans.find((p) => p.code === planCode)

    if (!plan) {
      return null
    }

    switch (planCode) {
      case "juryoA":
        return "関西電力の従量電灯プランで、一般家庭向けの基本プランです。契約容量の設定はありません。"
      case "juryoB":
        return company === "tepco"
          ? "東京電力の従量電灯プランで、10A～60Aのアンペア単位で契約します。"
          : "関西電力の従量電灯プランで、6kVA～49kVAのkVA単位で契約します。"
      case "juryoC":
        return "東京電力の従量電灯プランで、6kVA～49kVAのkVA単位で契約します。大容量を使用する家庭や店舗向けです。"
      default:
        return null
    }
  }

  const hasDescription = (field: any) => field.value && getSelectedPlanDescription(field.value)

  return (
    <Controller
      name="plan"
      control={control}
      render={({ field }) => {
        const selectedOption = planOptions.find((option) => option.value === field.value) || null

        return (
          <FieldWrapper name="plan" error={error} disabled={disabled} hideLabel={true}>
            <div className="relative">
              <div className="-translate-y-1/2 pointer-events-none absolute top-5 left-2 z-10 transform sm:left-3">
                <IconChevronDown stroke={3} size={24} className="text-red-400" />
              </div>
              <Select<PlanOption, false>
                value={selectedOption}
                onChange={(newValue: SingleValue<PlanOption>) => {
                  const value = newValue?.value || ""
                  field.onChange(value)
                  onChange?.(value as SimulationFormData["plan"])
                }}
                options={planOptions}
                placeholder="プランを選択してください"
                isDisabled={disabled}
                styles={createSelectStyles<PlanOption>({
                  error,
                  disabled,
                  hasDescription: hasDescription(field),
                })}
                isSearchable={false}
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
              />
              {field.value && getSelectedPlanDescription(field.value) && (
                <div
                  className={clsx(
                    "rounded-b-md border border-t-0 bg-gray-100 p-2 text-gray-700 text-xs leading-relaxed sm:p-3 sm:text-sm",
                    error && "border-red-300",
                    disabled && !error && "border-gray-200",
                    !error && !disabled && "border-gray-300",
                  )}
                >
                  {getSelectedPlanDescription(field.value)}
                </div>
              )}
            </div>
          </FieldWrapper>
        )
      }}
    />
  )
}
