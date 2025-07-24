import { IconChevronDown } from "@tabler/icons-react"
import clsx from "clsx"
import { useMemo } from "react"
import { Controller, useFormContext } from "react-hook-form"
import Select, { type SingleValue } from "react-select"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import type { CapacityOption } from "~/features/simulation/types"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"
import { generateCapacityOptions } from "~/features/simulation/utils/capacity-options"
import { createSelectStyles } from "~/features/simulation/utils/select-styles"

type SelectCapacityOption = {
  value: string | number
  label: string
}

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

  const capacityResult = useMemo(
    () =>
      company && plan ? generateCapacityOptions(company, plan) : { options: [], isRequired: false },
    [company, plan],
  )

  const capacityOptions = capacityResult.options

  const selectOptions = capacityOptions.map((option: CapacityOption) => ({
    value: option.value,
    label: option.label,
  })) satisfies SelectCapacityOption[]

  const customStyles = createSelectStyles<SelectCapacityOption>({ error, disabled })

  return (
    <Controller
      name="capacity"
      control={control}
      render={({ field }) => {
        const selectedOption =
          selectOptions.find((option) => String(option.value) === String(field.value ?? "")) || null

        return (
          <FieldWrapper name="capacity" error={error} disabled={disabled} hideLabel={true}>
            <div className="relative">
              <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 z-10 transform sm:left-3">
                <IconChevronDown stroke={3} size={24} className="text-red-400" />
              </div>
              <div className={clsx(disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                <Select<SelectCapacityOption, false>
                  value={selectedOption}
                  onChange={(newValue: SingleValue<SelectCapacityOption>) => {
                    const value = newValue?.value
                    const capacityValue =
                      value === undefined || value === ""
                        ? null
                        : ((Number.isNaN(Number(value))
                            ? value
                            : Number(value)) as SimulationFormData["capacity"])
                    field.onChange(capacityValue)
                    onChange?.(capacityValue)
                  }}
                  options={selectOptions}
                  placeholder="契約容量を選択してください"
                  isDisabled={disabled}
                  styles={customStyles}
                  isSearchable={false}
                  aria-label="契約容量"
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                />
              </div>
            </div>
          </FieldWrapper>
        )
      }}
    />
  )
}
