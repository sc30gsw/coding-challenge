import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useMemo, useState } from "react"
import {
  type SimulationFormData,
  simulationSchema,
  validateSimulationForm,
} from "~/features/simulation/types/schema/simulation-schema"
import { detectAreaFromPostalCode } from "~/features/simulation/utils/area-detection"
import {
  analyzeFormState,
  canSubmitForm,
  getFieldsToReset,
  updateFormStepsWithErrors,
} from "~/features/simulation/utils/form-state"
import { useSafeForm } from "~/hooks/use-safe-form"

type UseSimulationFormOptions = {
  defaultValues?: Partial<SimulationFormData>
  onSubmit?: (data: SimulationFormData) => void | Promise<void>
}
/**
 * 電気料金シミュレーションフォームの状態管理フック
 */
export function useSimulationForm({ defaultValues = {}, onSubmit }: UseSimulationFormOptions = {}) {
  // フォーム状態
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})

  // 最終的なデフォルト値を構築
  const finalDefaultValues = useMemo(() => {
    const baseDefaults = {
      postalCode: "",
      area: "unsupported",
      company: "tepco",
      plan: "juryoB",
      electricityBill: 0,
      email: "",
      capacity: null,
    } as const satisfies SimulationFormData

    return {
      ...baseDefaults,
      ...defaultValues,
    }
  }, [defaultValues])

  // React Hook Form初期化
  const form = useSafeForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    mode: "onChange",
    defaultValues: finalDefaultValues,
  })

  const {
    reset,
    watch,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    handleSubmit,
  } = form

  // 現在のフォームデータ
  const formData = watch()

  // フォーム状態分析
  const formState = useMemo(() => analyzeFormState(formData), [formData])

  // フォームエラーを文字列形式に変換
  const formErrors = useMemo(() => {
    const formErrorsMap: Record<string, string> = {}
    Object.entries(errors).forEach(([key, error]) => {
      if (error?.message) {
        formErrorsMap[key] = error.message
      }
    })

    return { ...formErrorsMap, ...customErrors }
  }, [errors, customErrors])

  // ステップ情報（エラー付き）
  const steps = useMemo(
    () => updateFormStepsWithErrors(formData, formErrors),
    [formData, formErrors],
  )

  // 送信可能かどうか
  const canSubmit = useMemo(() => canSubmitForm(formData, formErrors), [formData, formErrors])

  // 郵便番号変更時のエリア自動設定とフォームリセット
  const handlePostalCodeChange = useCallback(
    (postalCode: string) => {
      const previousFormData = getValues()
      const areaResult = detectAreaFromPostalCode(postalCode)

      // エリアを自動設定
      setValue("area", areaResult.area as "tokyo" | "kansai" | "unsupported")

      // エラーメッセージの設定/クリア
      setCustomErrors((prev) => {
        const newErrors = { ...prev }
        if (areaResult.errorMessage) {
          newErrors.postalCode = areaResult.errorMessage
        } else {
          delete newErrors.postalCode
        }
        return newErrors
      })

      // フォームリセットが必要なフィールドを特定
      const fieldsToReset = getFieldsToReset(previousFormData, {
        ...previousFormData,
        postalCode,
        area: areaResult.area as "tokyo" | "kansai" | "unsupported",
      })

      // 必要に応じてフィールドをリセット
      if (fieldsToReset.length > 0) {
        resetFieldsFromIndex(fieldsToReset)
      }
    },
    [form],
  )

  // 電力会社変更時の処理
  const handleCompanyChange = useCallback(
    (company: SimulationFormData["company"]) => {
      const previousFormData = form.getValues()

      // "その他"が選択された場合のエラーメッセージ
      setCustomErrors((prev) => {
        const newErrors = { ...prev }
        if (company === "other") {
          newErrors.company = "シミュレーション対象外です。"
        } else {
          delete newErrors.company
        }
        return newErrors
      })

      // プラン以降をリセット
      const fieldsToReset = getFieldsToReset(previousFormData, { ...previousFormData, company })

      if (fieldsToReset.length > 0) {
        resetFieldsFromIndex(fieldsToReset)
      }
    },
    [form],
  )

  // プラン変更時の処理
  const handlePlanChange = useCallback(
    (plan: SimulationFormData["plan"]) => {
      const previousFormData = getValues()

      // 契約容量をリセット
      const fieldsToReset = getFieldsToReset(previousFormData, { ...previousFormData, plan })

      if (fieldsToReset.length > 0) {
        resetFieldsFromIndex(fieldsToReset)
      }
    },
    [form],
  )

  // フィールドリセット関数
  const resetFieldsFromIndex = useCallback(
    (fieldNames: Array<keyof SimulationFormData>) => {
      fieldNames.forEach((fieldName) => {
        if (fieldName === "area") {
          // エリアは郵便番号から自動設定されるのでスキップ
          return
        }
        if (fieldName === "capacity") {
          setValue("capacity", null)
        } else {
          setValue(fieldName, "" as any)
        }
      })
    },
    [form],
  )

  // フォーム全体リセット
  const resetForm = useCallback(() => {
    reset()
    setCustomErrors({})
  }, [form])

  // フォーム送信処理
  const submit = useCallback(() => {
    const submitHandler = handleSubmit(async (data) => {
      try {
        const typedData = data as unknown as SimulationFormData

        // カスタムバリデーション実行
        const customValidationErrors = validateSimulationForm(typedData)
        if (Object.keys(customValidationErrors).length > 0) {
          setCustomErrors(customValidationErrors)
          return
        }

        // 送信処理実行
        await onSubmit?.(typedData)
      } catch (error) {
        console.error("Form submission error:", error)
        setCustomErrors({ submit: "送信中にエラーが発生しました。再度お試しください。" })
      }
    })

    submitHandler()
  }, [form, onSubmit])

  // フィールド変更時の自動処理
  // useEffect(() => {
  //   const subscription = form.watch((data, { name }) => {
  //     if (name === "postalCode" && data.postalCode) {
  //       handlePostalCodeChange(data.postalCode)
  //     } else if (name === "company" && data.company) {
  //       handleCompanyChange(data.company)
  //     } else if (name === "plan" && data.plan) {
  //       handlePlanChange(data.plan)
  //     }
  //   })

  //   return subscription.unsubscribe
  // }, [form, handlePostalCodeChange, handleCompanyChange, handlePlanChange])

  return {
    form,
    formData,
    formState,
    handlePostalCodeChange,
    handleCompanyChange,
    handlePlanChange,
    steps,
    handleSubmit,
    resetForm,
    resetFieldsFromIndex,
    isSubmitting,
    canSubmit,
    customErrors,
    formErrors,
    submit,
  } as const
}
