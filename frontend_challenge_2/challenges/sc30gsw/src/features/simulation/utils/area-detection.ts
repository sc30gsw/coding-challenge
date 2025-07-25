import { ELECTRICITY_AREAS } from "~/features/simulation/constants"

/**
 * 郵便番号に基づいてエリアを判定する
 * @param postalCode 7桁の郵便番号文字列
 * @returns エリア判定結果
 */
export function detectAreaFromPostalCode(postalCode?: string) {
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
