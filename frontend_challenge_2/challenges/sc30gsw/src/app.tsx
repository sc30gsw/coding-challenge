import { useState } from "react"
import { ErrorBoundary } from "~/components/ui/error-boundary"
import { SimulationForm } from "~/features/simulation/components/simulation-form"
import { SimulationResult } from "~/features/simulation/components/simulation-result"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

export function App() {
  const [currentPage, setCurrentPage] = useState<"form" | "result">("form")
  const [simulationData, setSimulationData] = useState<SimulationFormData | null>(null)

  const handleFormSubmit = (data: SimulationFormData) => {
    setSimulationData(data)
    setCurrentPage("result")
  }

  const handleBackToForm = () => {
    setCurrentPage("form")
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {currentPage === "form" && (
        <>
          {/* ヘッダーセクション */}
          <div className="bg-white py-8 text-center">
            <h1 className="font-bold text-2xl text-gray-900 leading-tight">
              電気代から
              <br />
              かんたんシミュレーション
            </h1>
            <p className="mt-4 text-gray-600 text-sm leading-relaxed">
              検針票を用意しなくてもOK
              <br />
              いくらおトクになるのか今すぐわかります！
            </p>
          </div>

          {/* フォームセクション */}
          <div className="px-4 pb-8">
            <ErrorBoundary>
              <SimulationForm onSubmit={handleFormSubmit} />
            </ErrorBoundary>
          </div>
        </>
      )}

      {currentPage === "result" && simulationData && (
        <div className="px-4 py-8">
          <ErrorBoundary>
            <SimulationResult data={simulationData} onBack={handleBackToForm} />
          </ErrorBoundary>
        </div>
      )}
    </main>
  )
}
