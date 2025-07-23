import { IconAlertTriangleFilled, IconCircleArrowRight, IconLoader } from "@tabler/icons-react"
import { clsx } from "clsx"
import { FormProvider } from "react-hook-form"
import { FieldLabel } from "~/components/ui/field-label"
import { SectionHeader } from "~/components/ui/section-header"
import { CapacitySelectField } from "~/features/simulation/components/fields/capacity-select-field"
import { CompanySelectField } from "~/features/simulation/components/fields/company-select-field"
import { ElectricityBillField } from "~/features/simulation/components/fields/electricity-bill-field"
import { EmailField } from "~/features/simulation/components/fields/email-field"
import { PlanSelectField } from "~/features/simulation/components/fields/plan-select-field"
import { PostalCodeField } from "~/features/simulation/components/fields/postal-code-field"
import { SimulationProgress } from "~/features/simulation/components/simulation-progress"
import { useSimulationForm } from "~/features/simulation/hooks/use-simulation-form"
import type { SimulationFormData } from "~/features/simulation/types/schema/simulation-schema"

type SimulationFormProps = {
  defaultValues?: Partial<SimulationFormData>
  onSubmit?: (data: SimulationFormData) => void | Promise<void>
}

export function SimulationForm({ defaultValues, onSubmit }: SimulationFormProps) {
  const {
    form,
    formData,
    formState,
    handlePostalCodeChange,
    handleCompanyChange,
    handlePlanChange,
    steps,
    resetForm,
    isSubmitting,
    canSubmit,
    customErrors,
    submit,
  } = useSimulationForm({ defaultValues, onSubmit })
  const {
    formState: { errors },
  } = form

  // フィールドエラーを取得
  const getFieldError = (fieldName: keyof SimulationFormData) => {
    return customErrors[fieldName] || errors[fieldName]?.message
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-2xl space-y-4">
        <SimulationProgress steps={steps} />
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="space-y-4"
        >
          <section className="rounded-lg bg-white p-6">
            <SectionHeader title="郵便番号を入力してください" className="mb-4" />
            <FieldLabel label="電気を使用する場所の郵便番号" />
            <PostalCodeField
              error={getFieldError("postalCode")}
              onChange={handlePostalCodeChange}
            />
          </section>

          <section className="rounded-lg bg-white p-6">
            <SectionHeader title="電気のご使用状況について教えてください" />

            <div className="space-y-6">
              <div>
                <FieldLabel label="電力会社" />
                <CompanySelectField
                  error={getFieldError("company")}
                  disabled={!formState.enabledFields.company}
                  area={formData.area}
                  onChange={handleCompanyChange}
                />
              </div>

              <div>
                <FieldLabel label="プラン" />
                <PlanSelectField
                  error={getFieldError("plan")}
                  disabled={!formState.enabledFields.plan}
                  company={formData.company}
                  onChange={handlePlanChange}
                />
              </div>

              {formState.enabledFields.capacity && (
                <div>
                  <FieldLabel label="契約容量" />
                  <CapacitySelectField
                    error={getFieldError("capacity")}
                    disabled={!formState.enabledFields.capacity}
                    company={formData.company}
                    plan={formData.plan}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg bg-white p-6">
            <SectionHeader title="現在の電気の使用状況について教えてください" />

            <div className="space-y-6">
              <div>
                <FieldLabel label="先月の電気代は？" />
                <ElectricityBillField
                  error={getFieldError("electricityBill")}
                  disabled={!formState.enabledFields.electricityBill}
                />
              </div>

              <div>
                <FieldLabel label="メールアドレス" />
                <EmailField
                  error={getFieldError("email")}
                  disabled={!formState.enabledFields.email}
                />
              </div>
            </div>
          </section>

          {customErrors.submit && (
            <div className="flex items-center gap-3 rounded-lg bg-red-400 p-4 text-white">
              <IconAlertTriangleFilled size={20} />
              <p className="text-sm">{customErrors.submit}</p>
            </div>
          )}

          <div className="mx-6 flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={clsx(
                "relative flex w-full items-center justify-center rounded-lg px-6 py-4 font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                canSubmit && !isSubmitting && "cursor-pointer bg-slate-600 hover:bg-slate-700",
                (!canSubmit || isSubmitting) && "cursor-not-allowed bg-gray-400",
              )}
            >
              {isSubmitting ? "送信中..." : "結果を見る"}
              {isSubmitting ? (
                <IconLoader className="absolute top-4 right-4 animate-spin" />
              ) : (
                <IconCircleArrowRight stroke={2} size={20} className="absolute top-5 right-4" />
              )}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer text-gray-600 text-sm underline transition-colors hover:text-gray-800 hover:opacity-70"
            >
              リセット
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
