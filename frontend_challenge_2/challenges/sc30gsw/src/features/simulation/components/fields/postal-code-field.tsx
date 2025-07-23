import { clsx } from "clsx"
import { Controller, useFormContext } from "react-hook-form"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

type PostalCodeFieldProps = {
  error?: string
  disabled?: boolean
  onChange?: (postalCode: string) => void
}

export function PostalCodeField({ error, disabled = false, onChange }: PostalCodeFieldProps) {
  const { control } = useFormContext<SimulationFormData>()

  return (
    <Controller
      name="postalCode"
      control={control}
      render={({ field }) => {
        // field.valueから直接分割値を計算
        const currentValue = field.value || ""
        const firstPart = currentValue.length >= 3 ? currentValue.slice(0, 3) : currentValue
        const secondPart = currentValue.length > 3 ? currentValue.slice(3, 7) : ""

        const updateFullValue = (first: string, second: string) => {
          const fullValue = first + second
          field.onChange(fullValue)
          onChange?.(fullValue)
        }

        return (
          <FieldWrapper name="postalCode" error={error} disabled={disabled} hideLabel={true}>
            <div className="rounded-md bg-gray-100 p-2 sm:p-3">
              <div className="mx-auto flex max-w-sm items-center justify-center">
                <input
                  type="text"
                  placeholder="130"
                  maxLength={3}
                  value={firstPart}
                  disabled={disabled}
                  className={clsx(
                    "min-w-0 flex-[45] rounded-md border bg-white px-1 py-2 text-center font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:px-2 sm:py-3 sm:text-base",
                    error && "border-red-300 bg-red-50 focus:border-red-500",
                    disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                    !error &&
                      !disabled &&
                      "border-gray-300 hover:border-gray-400 focus:border-red-400",
                  )}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 3) {
                      updateFullValue(value, secondPart)
                    }
                  }}
                />
                <div className="flex flex-[10] justify-center">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">-</span>
                </div>
                <input
                  type="text"
                  placeholder="0012"
                  maxLength={4}
                  value={secondPart}
                  disabled={disabled}
                  className={clsx(
                    "min-w-0 flex-[45] rounded-md border bg-white px-1 py-2 text-center font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:px-2 sm:py-3 sm:text-base",
                    error && "border-red-300 bg-red-50 focus:border-red-500",
                    disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                    !error &&
                      !disabled &&
                      "border-gray-300 hover:border-gray-400 focus:border-red-400",
                  )}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")

                    if (value.length <= 4) {
                      updateFullValue(firstPart, value)
                    }
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
