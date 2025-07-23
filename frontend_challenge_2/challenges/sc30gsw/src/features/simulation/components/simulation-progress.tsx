import { IconCheck } from "@tabler/icons-react"
import { clsx } from "clsx"
import type { FormStep } from "~/features/simulation/types"

type SimulationProgressProps = {
  steps: FormStep[]
}

export function SimulationProgress({ steps }: SimulationProgressProps) {
  // 現在のステップを特定
  const currentStepIndex = steps.findIndex((step) => step.enabled && !step.completed)
  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null

  return (
    <div className="rounded-lg bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base">入力ステップ</h3>
        {currentStep && (
          <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700 text-xs">
            {currentStep.name}を入力中
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const isActive = currentStep?.id === step.id
          const isCompleted = step.completed
          const isEnabled = step.enabled

          return (
            <div
              key={step.id}
              className={clsx(
                "flex items-center gap-1 rounded-full px-2 py-1 font-medium text-xs transition-colors sm:px-3",
                isCompleted && "bg-green-100 text-green-700",
                isActive && !isCompleted && "bg-red-100 text-red-700",
                !isEnabled && !isCompleted && "bg-gray-100 text-gray-400",
              )}
            >
              {isCompleted && <IconCheck size={12} />}
              <span className="text-xs">
                {index + 1}. {step.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
