import { ELECTRICITY_AREAS } from "~/features/simulation/constants"
import { AREA_CODES } from "~/features/simulation/constants/company-codes"
import { VALIDATION_TEXTS } from "~/features/simulation/constants/field-definitions"
import {
  KANSAI_AREA_FIRST_DIGIT,
  POSTAL_CODE_LENGTH,
  POSTAL_CODE_REGEX,
  TOKYO_AREA_FIRST_DIGIT,
} from "~/features/simulation/constants/validation"

/**
 * 郵便番号に基づいてエリアを判定する
 * @param postalCode 7桁の郵便番号文字列
 * @returns エリア判定結果
 */
export function detectAreaFromPostalCode(postalCode?: string) {
  if (!postalCode || postalCode.length !== POSTAL_CODE_LENGTH) {
    return {
      area: AREA_CODES.UNSUPPORTED,
      areaName: VALIDATION_TEXTS.UNSUPPORTED_AREA,
      isSupported: false,
      errorMessage: VALIDATION_TEXTS.POSTAL_CODE_7_DIGITS_ERROR,
    }
  }

  // 数字のみかチェック
  if (!POSTAL_CODE_REGEX.test(postalCode)) {
    return {
      area: AREA_CODES.UNSUPPORTED,
      areaName: VALIDATION_TEXTS.UNSUPPORTED_AREA,
      isSupported: false,
      errorMessage: VALIDATION_TEXTS.POSTAL_CODE_DIGITS_ONLY_ERROR,
    }
  }

  const firstDigit = postalCode.charAt(0)

  // 東京電力エリア判定
  if (firstDigit === TOKYO_AREA_FIRST_DIGIT) {
    return {
      area: AREA_CODES.TOKYO,
      areaName: ELECTRICITY_AREAS[AREA_CODES.TOKYO].name,
      isSupported: true,
    }
  }

  // 関西電力エリア判定
  if (firstDigit === KANSAI_AREA_FIRST_DIGIT) {
    return {
      area: AREA_CODES.KANSAI,
      areaName: ELECTRICITY_AREAS[AREA_CODES.KANSAI].name,
      isSupported: true,
    }
  }

  // その他のエリア（対象外）
  return {
    area: AREA_CODES.UNSUPPORTED,
    areaName: VALIDATION_TEXTS.UNSUPPORTED_AREA,
    isSupported: false,
    errorMessage: VALIDATION_TEXTS.UNSUPPORTED_AREA_ERROR,
  }
}
