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

export function useSimulationForm({ defaultValues = {}, onSubmit }: UseSimulationFormOptions = {}) {
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})

  const finalDefaultValues = useMemo(() => {
    const baseDefaults = {
      postalCode: "",
      area: "unsupported",
      company: "tepco",
      plan: undefined,
      electricityBill: 0,
      email: "",
      capacity: null,
    } as const satisfies SimulationFormData

    return {
      ...baseDefaults,
      ...defaultValues,
    }
  }, [defaultValues])

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
    clearErrors,
  } = form

  const formData = watch()
  const formState = useMemo(() => analyzeFormState(formData), [formData])
  const formErrors = useMemo(() => {
    const formErrorsMap: Record<string, string> = {}
    Object.entries(errors).forEach(([key, error]) => {
      if (error?.message) {
        formErrorsMap[key] = error.message
      }
    })

    if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s.]+$/.test(formData.email)) {
      formErrorsMap.email = "メールアドレスを正しく入力してください。"
    }

    return { ...formErrorsMap, ...customErrors }
  }, [errors, customErrors, formData.email])

  const steps = useMemo(
    () => updateFormStepsWithErrors(formData, formErrors),
    [formData, formErrors],
  )

  const canSubmit = useMemo(() => canSubmitForm(formData, formErrors), [formData, formErrors])

  const handlePostalCodeChange = useCallback(
    (postalCode: string) => {
      const previousFormData = getValues()
      const areaResult = detectAreaFromPostalCode(postalCode)

      // エリアを自動設定
      setValue("area", areaResult.area as "tokyo" | "kansai" | "unsupported")

      setCustomErrors((prev) => {
        const newErrors = { ...prev }
        if (areaResult.errorMessage) {
          newErrors.postalCode = areaResult.errorMessage
        } else {
          delete newErrors.postalCode
        }
        return newErrors
      })

      // ? clearErrors("postalCode") を実行しないとcanSubmitの状態が更新されず、ボタンが活性化しない
      if (!areaResult.errorMessage) {
        clearErrors("postalCode")
      }

      const fieldsToReset = getFieldsToReset(previousFormData, {
        ...previousFormData,
        postalCode,
        area: areaResult.area as "tokyo" | "kansai" | "unsupported",
      })

      if (fieldsToReset.length > 0) {
        resetFieldsFromIndex(fieldsToReset)
      }
    },
    [form],
  )

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

      const fieldsToReset = getFieldsToReset(previousFormData, { ...previousFormData, company })

      if (fieldsToReset.length > 0) {
        resetFieldsFromIndex(fieldsToReset)
      }
    },
    [form],
  )

  const handlePlanChange = useCallback(
    (plan: SimulationFormData["plan"]) => {
      const previousFormData = getValues()

      const fieldsToReset = getFieldsToReset(previousFormData, { ...previousFormData, plan })

      if (fieldsToReset.length > 0) {
        resetFieldsFromIndex(fieldsToReset)
      }
    },
    [form],
  )

  const resetFieldsFromIndex = useCallback(
    (fieldNames: Array<keyof SimulationFormData>) => {
      fieldNames.forEach((fieldName) => {
        if (fieldName === "area") {
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

  const resetForm = useCallback(() => {
    reset()
    setCustomErrors({})
  }, [form])

  const submit = useCallback(() => {
    const submitHandler = handleSubmit(async (data) => {
      try {
        const typedData = data as unknown as SimulationFormData

        const customValidationErrors = validateSimulationForm(typedData)
        if (Object.keys(customValidationErrors).length > 0) {
          setCustomErrors(customValidationErrors)
          return
        }

        await onSubmit?.(typedData)
      } catch (error) {
        console.error("Form submission error:", error)
        setCustomErrors({ submit: "送信中にエラーが発生しました。再度お試しください。" })
      }
    })

    submitHandler()
  }, [form, onSubmit])

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
    submit,
  } as const
}
