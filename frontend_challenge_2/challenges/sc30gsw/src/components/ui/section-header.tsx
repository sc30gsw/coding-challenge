type SectionHeaderProps = {
  title: string
  className?: string
}

export function SectionHeader({ title, className }: SectionHeaderProps) {
  return (
    <div className={`mb-6 flex items-center gap-2 sm:gap-3 ${className || ""}`}>
      <div className="h-4 w-1 sm:h-6 sm:w-1 rounded-full bg-red-400" />
      <h2 className="font-bold text-gray-900 text-base sm:text-lg">{title}</h2>
    </div>
  )
}
