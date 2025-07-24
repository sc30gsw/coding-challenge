import { IconArrowLeft, IconBolt, IconCalculator, IconMail, IconMapPin } from "@tabler/icons-react"
import { ELECTRICITY_COMPANIES } from "~/features/simulation/constants"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

type SimulationResultProps = {
  data: SimulationFormData
  onBack: () => void
}

export function SimulationResult({ data, onBack }: SimulationResultProps) {
  const company = ELECTRICITY_COMPANIES.find((c) => c.code === data.company)
  const plan = company?.supportedPlans.find((p) => p.code === data.plan)

  const calculateEstimate = () => {
    const baseRate = data.electricityBill
    const discount = Math.floor(baseRate * 0.1) // 10%割引と仮定

    return {
      current: baseRate,
      estimated: baseRate - discount,
      savings: discount,
    }
  }

  const estimate = calculateEstimate()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <IconArrowLeft size={16} />
            <span className="font-medium text-sm">戻る</span>
          </button>
        </div>
        <div className="text-center">
          <h1 className="font-bold text-2xl text-gray-900 sm:text-3xl">シミュレーション結果</h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">
            お客様の電気料金をシミュレーションしました
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <IconCalculator className="text-red-400" size={20} />
          <h2 className="font-bold text-gray-900 text-lg">料金比較</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 現在の料金 */}
          <div className="rounded-lg border p-4">
            <div className="text-center">
              <p className="font-medium text-gray-600 text-sm">現在の電気代</p>
              <p className="mt-1 font-bold text-2xl text-gray-900">
                {estimate.current.toLocaleString("ja-JP")}円
              </p>
              <p className="text-gray-500 text-xs">月額</p>
            </div>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="text-center">
              <p className="font-medium text-green-700 text-sm">切り替え後予想</p>
              <p className="mt-1 font-bold text-2xl text-green-800">
                {estimate.estimated.toLocaleString("ja-JP")}円
              </p>
              <p className="text-green-600 text-xs">月額</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-red-50 p-4 text-center">
          <p className="font-medium text-red-700 text-sm">月間節約予想額</p>
          <p className="mt-1 font-bold text-3xl text-red-800">
            {estimate.savings.toLocaleString("ja-JP")}円
          </p>
          <p className="mt-2 text-red-600 text-sm">
            年間で約{(estimate.savings * 12).toLocaleString("ja-JP")}円の節約が期待できます
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <IconBolt className="text-red-400" size={20} />
          <h2 className="font-bold text-gray-900 text-lg">ご入力内容</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <IconMapPin className="text-gray-400" size={16} />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">郵便番号</p>
              <p className="text-gray-600 text-sm">
                {data.postalCode.slice(0, 3)}-{data.postalCode.slice(3)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <IconBolt className="text-gray-400" size={16} />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">電力会社・プラン</p>
              <p className="text-gray-600 text-sm">
                {company?.name} - {plan?.name}
              </p>
            </div>
          </div>

          {data.capacity && (
            <div className="flex items-center gap-3">
              <IconCalculator className="text-gray-400" size={16} />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">契約容量</p>
                <p className="text-gray-600 text-sm">{data.capacity}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <IconMail className="text-gray-400" size={16} />
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">メールアドレス</p>
              <p className="text-gray-600 text-sm">{data.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 text-center">
        <p className="mb-4 text-gray-600 text-sm">
          より詳細な見積もりをご希望の場合は、お気軽にお問い合わせください。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            再計算する
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600"
          >
            お問い合わせ
          </button>
        </div>
      </div>
    </div>
  )
}
