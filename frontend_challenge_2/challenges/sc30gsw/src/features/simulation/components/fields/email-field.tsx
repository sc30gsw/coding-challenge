import { clsx } from "clsx"
import { Controller, useFormContext } from "react-hook-form"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

type EmailFieldProps = {
  error?: string
  disabled?: boolean
  onChange?: (email: string) => void
}

export function EmailField({ error, disabled = false, onChange }: EmailFieldProps) {
  const { control } = useFormContext<SimulationFormData>()

  return (
    <Controller
      name="email"
      control={control}
      render={({ field }) => (
        <FieldWrapper name="email" error={error} disabled={disabled} hideLabel={true}>
          <input
            {...field}
            id="email"
            type="email"
            placeholder="example@email.com"
            disabled={disabled}
            className={clsx(
              "w-full rounded-md border bg-white px-2 py-2 font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:px-3 sm:py-3 sm:text-lg",
              error && "border-red-300 bg-red-50 focus:border-red-500",
              disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
              !error && !disabled && "border-gray-300 hover:border-gray-400 focus:border-red-400",
            )}
            onChange={(e) => {
              field.onChange(e.target.value)
              onChange?.(e.target.value)
            }}
          />
        </FieldWrapper>
      )}
    />
  )
}
