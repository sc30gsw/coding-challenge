import { describe, expect, it } from "vitest"
import { AREA_CODES } from "~/features/simulation/constants/company-codes"
import { VALIDATION_TEXTS } from "~/features/simulation/constants/field-definitions"
import { detectAreaFromPostalCode } from "~/features/simulation/utils/area-detection"

describe("area-detection", () => {
  describe("detectAreaFromPostalCode", () => {
    it("東京電力エリア（1で始まる郵便番号）を正しく判定する", () => {
      const result = detectAreaFromPostalCode("1234567")

      expect(result).toEqual({
        area: AREA_CODES.TOKYO,
        areaName: "東京電力エリア",
        isSupported: true,
      })
    })

    it("関西電力エリア（5で始まる郵便番号）を正しく判定する", () => {
      const result = detectAreaFromPostalCode("5678901")

      expect(result).toEqual({
        area: AREA_CODES.KANSAI,
        areaName: "関西電力エリア",
        isSupported: true,
      })
    })

    it("対象外エリアを正しく判定する", () => {
      const result = detectAreaFromPostalCode("2345678")

      expect(result).toEqual({
        area: AREA_CODES.UNSUPPORTED,
        areaName: "サービスエリア対象外",
        isSupported: false,
        errorMessage: VALIDATION_TEXTS.UNSUPPORTED_AREA_ERROR,
      })
    })

    it("7桁でない郵便番号の場合エラーを返す", () => {
      const result = detectAreaFromPostalCode("123456")

      expect(result).toEqual({
        area: AREA_CODES.UNSUPPORTED,
        areaName: "サービスエリア対象外",
        isSupported: false,
        errorMessage: VALIDATION_TEXTS.POSTAL_CODE_7_DIGITS_ERROR,
      })
    })

    it("数字以外が含まれる場合エラーを返す", () => {
      const result = detectAreaFromPostalCode("12345ab")

      expect(result).toEqual({
        area: AREA_CODES.UNSUPPORTED,
        areaName: "サービスエリア対象外",
        isSupported: false,
        errorMessage: VALIDATION_TEXTS.POSTAL_CODE_DIGITS_ONLY_ERROR,
      })
    })

    it("空文字・nullの場合エラーを返す", () => {
      const result = detectAreaFromPostalCode("")

      expect(result).toEqual({
        area: AREA_CODES.UNSUPPORTED,
        areaName: "サービスエリア対象外",
        isSupported: false,
        errorMessage: VALIDATION_TEXTS.POSTAL_CODE_7_DIGITS_ERROR,
      })
    })
  })
})
