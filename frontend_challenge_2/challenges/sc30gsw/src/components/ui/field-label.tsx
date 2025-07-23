type FieldLabelProps = {
  label: string
  required?: boolean
  className?: string
}

export function FieldLabel({ label, required = true, className }: FieldLabelProps) {
  return (
    <div className={`mb-2 flex items-center gap-2 ${className || ""}`}>
      {required && (
        <span className="rounded bg-red-400 px-2 py-1 font-medium text-white text-xs sm:text-sm">
          必須
        </span>
      )}
      <span className="font-bold text-gray-900 text-sm sm:text-base">{label}</span>
    </div>
  )
}
