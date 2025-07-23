import { IconChevronDown } from "@tabler/icons-react"
import { clsx } from "clsx"
import { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import { ELECTRICITY_COMPANIES } from "~/features/simulation/constants"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

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

  return (
    <Controller
      name="plan"
      control={control}
      render={({ field }) => (
        <FieldWrapper name="plan" error={error} disabled={disabled} hideLabel={true}>
          <div className="relative">
            <label
            htmlFor="plan-select"
              className="-translate-y-1/2 absolute top-5 left-2 sm:left-3 z-10 transform cursor-pointer"
            >
              <IconChevronDown stroke={3} size={24} className="text-red-400" />
            </label>
            <select
              {...field}
              id="plan-select"
              
              disabled={disabled}
              className={clsx(
                "w-full appearance-none border bg-white py-2 sm:py-3 pr-2 sm:pr-3 pl-10 sm:pl-12 text-base sm:text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2",
                (field.value && getSelectedPlanDescription(field.value)) ? "rounded-t-md border-b-0" : "rounded-md",
                error && "border-red-300 bg-red-50 focus:border-red-500",
                disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                !error && !disabled && "border-gray-300 hover:border-gray-400 focus:border-red-400",
              )}
              onChange={(e) => {
                field.onChange(e.target.value)
                onChange?.(e.target.value as SimulationFormData["plan"])
              }}
            >
              <option value="">プランを選択してください</option>
              {availablePlans.map((plan) => (
                <option key={plan.code} value={plan.code}>
                  {plan.name}
                </option>
              ))}
            </select>
            {field.value && getSelectedPlanDescription(field.value) && (
              <div
                className={clsx(
                  "border-t-0 rounded-b-md border bg-gray-100 p-2 sm:p-3 text-gray-700 text-xs sm:text-sm leading-relaxed",
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
      )}
    />
  )
}
