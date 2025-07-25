import { clsx } from "clsx"
import type { ComponentProps } from "react"
import { useRef, useState } from "react"
import { Controller, type ControllerRenderProps, useFormContext } from "react-hook-form"
import { FieldWrapper } from "~/features/simulation/components/fields/field-wrapper"
import { FIELD_NAMES } from "~/features/simulation/constants/field-definitions"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

type PostalCodeFieldProps = {
  error?: string
  disabled?: boolean
  onChange?: (postalCode: string) => void
}

export function PostalCodeField({ error, disabled = false, onChange }: PostalCodeFieldProps) {
  const { control } = useFormContext<SimulationFormData>()

  const [postalCodeValue, setPostalCodeValue] = useState({
    first: "",
    second: "",
  })

  const firstInputRef = useRef<HTMLInputElement>(null)
  const secondInputRef = useRef<HTMLInputElement>(null)

  const updateFullValue = (
    first: string,
    second: string,
    fieldOnChange: ControllerRenderProps<SimulationFormData>["onChange"],
  ) => {
    const fullValue = first + second
    fieldOnChange(fullValue)
    onChange?.(fullValue)
  }

  const createInputHandler = (
    fieldType: "first" | "second",
    maxLength: number,
    fieldOnChange: ControllerRenderProps<SimulationFormData>["onChange"],
  ): ComponentProps<"input">["onChange"] => {
    return (e) => {
      const value = e.target.value.replace(/\D/g, "")

      if (value.length <= maxLength) {
        const newParts = { ...postalCodeValue, [fieldType]: value }
        setPostalCodeValue(newParts)
        updateFullValue(newParts.first, newParts.second, fieldOnChange)

        if (fieldType === "first" && value.length === 3) {
          secondInputRef.current?.focus()
        }
      }
    }
  }

  return (
    <Controller
      name={FIELD_NAMES.POSTAL_CODE}
      control={control}
      render={({ field }) => {
        const currentFullValue = postalCodeValue.first + postalCodeValue.second

        if (field.value !== currentFullValue) {
          if (field.value) {
            const newFirst = field.value.slice(0, 3)
            const newSecond = field.value.slice(3, 7)
            setPostalCodeValue({ first: newFirst, second: newSecond })
          } else {
            // フィールドが空の場合（リセット時など）はローカル状態もクリア
            setPostalCodeValue({ first: "", second: "" })
          }
        }

        const handleFirstInputChange = createInputHandler("first", 3, field.onChange)
        const handleSecondInputChange = createInputHandler("second", 4, field.onChange)

        return (
          <FieldWrapper
            name={FIELD_NAMES.POSTAL_CODE}
            error={error}
            disabled={disabled}
            hideLabel={true}
          >
            <div
              className="rounded-md bg-gray-100 p-2 sm:p-3"
              role="group"
              aria-labelledby="postal-code-label"
            >
              <div className="mx-auto flex max-w-sm items-center justify-center">
                <input
                  ref={firstInputRef}
                  type="text"
                  placeholder="130"
                  maxLength={3}
                  value={postalCodeValue.first}
                  disabled={disabled}
                  aria-label="電気を使用する場所の郵便番号"
                  className={clsx(
                    "min-w-0 flex-[45] rounded-md border bg-white px-1 py-2 text-center font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:px-2 sm:py-3 sm:text-base",
                    error && "border-red-300 bg-red-50 focus:border-red-500",
                    disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                    !error &&
                      !disabled &&
                      "border-gray-300 hover:border-gray-400 focus:border-red-400",
                  )}
                  onChange={handleFirstInputChange}
                />
                <div className="flex flex-[10] justify-center">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">-</span>
                </div>
                <input
                  ref={secondInputRef}
                  type="text"
                  placeholder="0012"
                  maxLength={4}
                  value={postalCodeValue.second}
                  disabled={disabled}
                  aria-label="電気を使用する場所の郵便番号（後半）"
                  className={clsx(
                    "min-w-0 flex-[45] rounded-md border bg-white px-1 py-2 text-center font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 sm:px-2 sm:py-3 sm:text-base",
                    error && "border-red-300 bg-red-50 focus:border-red-500",
                    disabled && !error && "border-gray-200 bg-gray-50 text-gray-400",
                    !error &&
                      !disabled &&
                      "border-gray-300 hover:border-gray-400 focus:border-red-400",
                  )}
                  onChange={handleSecondInputChange}
                />
              </div>
            </div>
          </FieldWrapper>
        )
      }}
    />
  )
}
