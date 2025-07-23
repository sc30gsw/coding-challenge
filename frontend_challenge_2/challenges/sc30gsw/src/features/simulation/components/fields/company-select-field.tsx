import { IconChevronDown } from "@tabler/icons-react"
import clsx from "clsx"
import { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import { ELECTRICITY_COMPANIES } from "~/features/simulation/constants"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

type CompanySelectFieldProps = {
  error?: string
  disabled?: boolean
  area: SimulationFormData["area"]
  onChange?: (company: SimulationFormData["company"]) => void
}

export function CompanySelectField({
  error,
  disabled = false,
  area,
  onChange,
}: CompanySelectFieldProps) {
  const { control } = useFormContext<SimulationFormData>()
  const selectRef = useRef<HTMLSelectElement>(null)

  // エリアに対応した電力会社をフィルタリング
  const availableCompanies = ELECTRICITY_COMPANIES.filter(
    (company) => company.area === area || company.code === "other",
  )

  return (
    <Controller
      name="company"
      control={control}
      render={({ field }) => (
        <FieldWrapper name="company" error={error} disabled={disabled} hideLabel={true}>
          <div className="relative">
            <button
              type="button"
              className="-translate-y-1/2 absolute top-1/2 left-2 sm:left-3 z-10 transform cursor-pointer"
              onClick={() => {
                if (!disabled) {
                  selectRef.current?.focus()
                  selectRef.current?.click()
                }
              }}
            >
              <IconChevronDown stroke={3} size={24} className="text-red-400" />
            </button>
            <select
              {...field}
              ref={selectRef}
              disabled={disabled}
              className={clsx(
                "w-full appearance-none rounded-md border bg-white py-2 sm:py-3 pr-2 sm:pr-3 pl-10 sm:pl-12 text-base sm:text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2",
                error && "border-red-300 bg-red-50 focus:border-red-500",
                disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                !error && !disabled && "border-gray-300 hover:border-gray-400 focus:border-red-400",
              )}
              onChange={(e) => {
                field.onChange(e.target.value)
                onChange?.(e.target.value as SimulationFormData["company"])
              }}
            >
              <option value="">電力会社を選択してください</option>
              {availableCompanies.map((company) => (
                <option key={company.code} value={company.code}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </FieldWrapper>
      )}
    />
  )
}
