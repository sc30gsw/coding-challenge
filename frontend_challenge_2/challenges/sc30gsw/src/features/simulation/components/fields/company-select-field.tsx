import { IconChevronDown } from "@tabler/icons-react"
import clsx from "clsx"
import { Controller, useFormContext } from "react-hook-form"
import Select, { type SingleValue } from "react-select"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import { ELECTRICITY_COMPANIES } from "~/features/simulation/constants"
import { COMPANY_CODES } from "~/features/simulation/constants/company-codes"
import { FIELD_NAMES } from "~/features/simulation/constants/field-definitions"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"
import { createSelectStyles } from "~/features/simulation/utils/select-styles"

type CompanyOption = {
  value: string
  label: string
}

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

  const availableCompanies = ELECTRICITY_COMPANIES.filter(
    (company) => company.area === area || company.code === COMPANY_CODES.OTHER,
  )
  const companyOptions = availableCompanies.map((company) => ({
    value: company.code,
    label: company.name,
  })) satisfies CompanyOption[]
  const customStyles = createSelectStyles<CompanyOption>({ error, disabled })

  return (
    <Controller
      name={FIELD_NAMES.COMPANY}
      control={control}
      render={({ field }) => {
        const selectedOption = companyOptions.find((option) => option.value === field.value) || null

        return (
          <FieldWrapper
            name={FIELD_NAMES.COMPANY}
            error={error}
            disabled={disabled}
            hideLabel={true}
          >
            <div className="relative">
              <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 z-10 transform sm:left-3">
                <IconChevronDown stroke={3} size={24} className="text-red-400" />
              </div>
              <div className={clsx(disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                <Select<CompanyOption, false>
                  value={selectedOption}
                  onChange={(newValue: SingleValue<CompanyOption>) => {
                    const value = newValue?.value || ""
                    field.onChange(value)
                    onChange?.(value as SimulationFormData["company"])
                  }}
                  options={companyOptions}
                  placeholder="電力会社を選択してください"
                  isDisabled={disabled}
                  styles={customStyles}
                  isSearchable={false}
                  aria-label="電力会社"
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
