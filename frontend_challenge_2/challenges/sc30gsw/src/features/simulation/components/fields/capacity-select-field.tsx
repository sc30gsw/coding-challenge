import { IconChevronDown } from "@tabler/icons-react"
import { clsx } from "clsx"
import { useRef } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import type { CapacityOption } from "~/features/simulation/types"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"
import { generateCapacityOptions } from "~/features/simulation/utils/capacity-options"

type CapacitySelectFieldProps = {
  error?: string
  disabled?: boolean
  company: SimulationFormData["company"]
  plan: SimulationFormData["plan"]
  onChange?: (capacity: SimulationFormData["capacity"]) => void
}

export function CapacitySelectField({
  error,
  disabled = false,
  company,
  plan,
  onChange,
}: CapacitySelectFieldProps) {
  const { control } = useFormContext<SimulationFormData>()
  const selectRef = useRef<HTMLSelectElement>(null)

  const capacityResult =
    company && plan ? generateCapacityOptions(company, plan) : { options: [], isRequired: false }
  const capacityOptions = capacityResult.options

  return (
    <Controller
      name="capacity"
      control={control}
      render={({ field }) => (
        <FieldWrapper name="capacity" error={error} disabled={disabled} hideLabel={true}>
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
              value={field.value ?? ""}
              id="capacity"
              disabled={disabled}
              className={clsx(
                "w-full appearance-none rounded-md border bg-white py-2 sm:py-3 pr-2 sm:pr-3 pl-10 sm:pl-12 text-base sm:text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2",
                error && "border-red-300 bg-red-50 focus:border-red-500",
                disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                !error && !disabled && "border-gray-300 hover:border-gray-400 focus:border-red-400",
              )}
              onChange={(e) => {
                const value = e.target.value
                const capacityValue =
                  value === ""
                    ? null
                    : ((Number.isNaN(Number(value))
                        ? value
                        : Number(value)) as SimulationFormData["capacity"])
                field.onChange(capacityValue)
                onChange?.(capacityValue)
              }}
            >
              <option value="">契約容量を選択してください</option>
              {capacityOptions.map((option: CapacityOption) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </FieldWrapper>
      )}
    />
  )
}
