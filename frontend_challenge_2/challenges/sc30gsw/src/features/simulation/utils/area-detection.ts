import { ELECTRICITY_AREAS } from "~/features/simulation/constants"
import type { ElectricityArea } from "~/features/simulation/types"

/**
 * 郵便番号に基づいてエリアを判定する
 * @param postalCode 7桁の郵便番号文字列
 * @returns エリア判定結果
 */
export function detectAreaFromPostalCode(postalCode: string) {
  // 郵便番号の形式チェック
  if (!postalCode || postalCode.length !== 7) {
    return {
      area: "unsupported",
      areaName: "サービスエリア対象外",
      isSupported: false,
      errorMessage: "郵便番号は7桁で入力してください。",
    }
  }

  // 数字のみかチェック
  if (!/^\d{7}$/.test(postalCode)) {
    return {
      area: "unsupported",
      areaName: "サービスエリア対象外",
      isSupported: false,
      errorMessage: "郵便番号は数字のみで入力してください。",
    }
  }

  const firstDigit = postalCode.charAt(0)

  // 東京電力エリア判定
  if (firstDigit === "1") {
    return {
      area: "tokyo",
      areaName: ELECTRICITY_AREAS.tokyo.name,
      isSupported: true,
    }
  }

  // 関西電力エリア判定
  if (firstDigit === "5") {
    return {
      area: "kansai",
      areaName: ELECTRICITY_AREAS.kansai.name,
      isSupported: true,
    }
  }

  // その他のエリア（対象外）
  return {
    area: "unsupported",
    areaName: "サービスエリア対象外",
    isSupported: false,
    errorMessage: "サービスエリア対象外です。",
  }
}

/**
 * エリアが対応しているかチェックする
 * @param area エリアコード
 * @returns 対応しているかのboolean
 */
export function isSupportedArea(area: ElectricityArea["code"]) {
  return area === "tokyo" || area === "kansai"
}

/**
 * 郵便番号の先頭桁から利用可能な電力会社を取得する
 * @param postalCode 7桁の郵便番号文字列
 * @returns 利用可能な電力会社コードの配列
 */
export function getAvailableCompaniesForPostalCode(postalCode: string) {
  const result = detectAreaFromPostalCode(postalCode)

  if (!result.isSupported) {
    return []
  }

  switch (result.area) {
    case "tokyo":
      return ["tepco", "other"]
    case "kansai":
      return ["kepco", "other"]
    default:
      return []
  }
}

/**
 * エリア情報を取得する
 * @param areaCode エリアコード
 * @returns エリア情報
 */
export function getAreaInfo(areaCode: ElectricityArea["code"]) {
  return ELECTRICITY_AREAS[areaCode]
}

/**
 * 郵便番号が変更された際のバリデーション
 * @param postalCode 郵便番号
 * @param previousArea 前回のエリア
 * @returns バリデーション結果
 */
export function validatePostalCodeChange(
  postalCode: string,
  previousArea?: ElectricityArea["code"],
) {
  const result = detectAreaFromPostalCode(postalCode)

  // 入力が無効な場合
  if (!result.isSupported && result.errorMessage) {
    return {
      isValid: false,
      newArea: result.area,
      shouldResetForm: false,
      errorMessage: result.errorMessage,
    }
  }

  // エリアが変更された場合、フォームをリセットする必要がある
  const shouldResetForm = previousArea !== undefined && previousArea !== result.area

  return {
    isValid: result.isSupported,
    newArea: result.area,
    shouldResetForm,
    errorMessage: result.errorMessage,
  }
}

/**
 * 郵便番号の部分入力時のリアルタイムフィードバック
 * @param partialPostalCode 部分的な郵便番号入力
 * @returns フィードバック情報
 */
export function getPostalCodeInputFeedback(partialPostalCode: string) {
  if (!partialPostalCode) {
    return {
      canPredict: false,
      feedback: "郵便番号を入力してください。",
    }
  }

  if (partialPostalCode.length >= 1) {
    const firstDigit = partialPostalCode.charAt(0)

    if (firstDigit === "1") {
      return {
        canPredict: true,
        predictedArea: "tokyo",
        feedback: "東京電力エリアです。",
      }
    }

    if (firstDigit === "5") {
      return {
        canPredict: true,
        predictedArea: "kansai",
        feedback: "関西電力エリアです。",
      }
    }

    return {
      canPredict: true,
      predictedArea: "unsupported",
      feedback: "サービスエリア対象外の可能性があります。",
    }
  }

  return {
    canPredict: false,
    feedback: "7桁の郵便番号を入力してください。",
  }
}
