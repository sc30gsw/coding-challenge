import { IconAlertTriangleFilled } from "@tabler/icons-react"
import type { ReactNode } from "react"

type FieldWrapperProps = {
  label?: string
  name: string
  error?: string
  required?: boolean
  disabled?: boolean
  children: ReactNode
  description?: string
  hideLabel?: boolean
}

export function FieldWrapper({
  label,
  name,
  error,
  required = false,
  disabled = false,
  children,
  description,
  hideLabel = false,
}: FieldWrapperProps) {
  return (
    <div className="space-y-2">
      {!hideLabel && label && (
        <label
          htmlFor={name}
          className={`block font-medium text-sm ${disabled ? "text-gray-400" : "text-gray-700"}`}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {description && <p className="text-gray-600 text-sm">{description}</p>}

      <div className="relative">{children}</div>

      {error && (
        <div
          className="flex items-center gap-2 rounded-lg bg-red-400 p-3 text-white"
          role="alert"
          aria-live="polite"
        >
          <IconAlertTriangleFilled size={16} />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
