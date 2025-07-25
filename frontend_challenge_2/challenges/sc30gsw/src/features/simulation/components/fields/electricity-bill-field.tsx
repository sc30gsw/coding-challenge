import { clsx } from "clsx"
import { Controller, useFormContext } from "react-hook-form"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import { FIELD_NAMES } from "~/features/simulation/constants/field-definitions"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

type ElectricityBillFieldProps = {
  error?: string
  disabled?: boolean
  onChange?: (electricityBill: number) => void
}

export function ElectricityBillField({
  error,
  disabled = false,
  onChange,
}: ElectricityBillFieldProps) {
  const { control } = useFormContext<SimulationFormData>()

  const formatNumber = (num: number) => {
    return num.toLocaleString("ja-JP")
  }

  const parseNumber = (str: string) => {
    const cleanStr = str.replace(/,/g, "")
    return cleanStr === "" ? 0 : Number(cleanStr)
  }

  return (
    <Controller
      name={FIELD_NAMES.ELECTRICITY_BILL}
      control={control}
      render={({ field }) => {
        const displayValue = field.value > 0 ? formatNumber(field.value) : ""

        return (
          <FieldWrapper
            name={FIELD_NAMES.ELECTRICITY_BILL}
            error={error}
            disabled={disabled}
            hideLabel={true}
          >
            <div className="flex items-center gap-2">
              <input
                id={FIELD_NAMES.ELECTRICITY_BILL}
                type="text"
                value={displayValue}
                placeholder="10,000"
                disabled={disabled}
                aria-label="先月の電気代は？"
                className={clsx(
                  "flex-1 rounded-md border bg-white px-2 py-2 font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:px-3 sm:py-3 sm:text-lg",
                  error && "border-red-300 bg-red-50 focus:border-red-500",
                  disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                  !error &&
                    !disabled &&
                    "border-gray-300 hover:border-gray-400 focus:border-red-400",
                )}
                onChange={(e) => {
                  const numericValue = parseNumber(e.target.value)
                  field.onChange(numericValue)
                  onChange?.(numericValue)
                }}
              />
              <span className="font-medium text-gray-900 text-sm sm:text-base">円</span>
            </div>
          </FieldWrapper>
        )
      }}
    />
  )
}
