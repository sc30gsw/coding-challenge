import { IconInfoCircle } from "@tabler/icons-react"
import clsx from "clsx"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"
import { isCapacityRequired } from "~/features/simulation/utils/capacity-options"

export default function NoContractRequiredInfo({
  company,
  plan,
  hasError,
}: Pick<SimulationFormData, "company" | "plan"> & Record<"hasError", boolean>) {
  const shouldShow = company && plan && !hasError && !isCapacityRequired(company, plan)

  return (
    <div
      className={clsx("rounded-lg bg-blue-50", shouldShow ? "visible p-4" : "invisible h-0")}
      data-testid="no-contract-required-info"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-blue-100 p-1">
          <IconInfoCircle stroke={2} className="text-blue-700" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-blue-800 text-sm" data-testid="no-contract-required-title">
            契約容量の入力は不要です
          </h4>
          <p
            className="mt-1 text-blue-700 text-xs leading-relaxed"
            data-testid="no-contract-required-message"
          >
            選択されたプランでは契約容量の設定は必要ありません。そのまま次のステップにお進みください。
          </p>
        </div>
      </div>
    </div>
  )
}
