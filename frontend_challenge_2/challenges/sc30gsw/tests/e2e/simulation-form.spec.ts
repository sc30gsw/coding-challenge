import { expect, test } from "@playwright/test"
import {
  checkAccessibility,
  fillElectricityBill,
  fillEmail,
  fillPostalCode,
  selectCapacity,
  selectCompany,
  selectPlan,
  takeDeviceScreenshots,
  takeScreenshot,
} from "tests/e2e/test-helpers"

test.describe("電気料金シミュレーションフォーム", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.describe("E2Eテスト", () => {
    test.describe("正常系: 東京電力エリア", () => {
      test("従量電灯B（10A-60A）の入力フロー", async ({ page }) => {
        await fillPostalCode(page, "1000001")

        await selectCompany(page, "東京電力")
        await expect(page.getByText("シミュレーション対象外です。")).not.toBeVisible()

        await selectPlan(page, "従量電灯B")
        await expect(page.getByLabel("契約容量")).toBeVisible()

        const capacitySelect = page.getByLabel("契約容量").locator("..")
        await capacitySelect.click()
        await expect(page.getByRole("option", { name: "10A" })).toBeVisible()
        await expect(page.getByRole("option", { name: "30A" })).toBeVisible()
        await expect(page.getByRole("option", { name: "60A" })).toBeVisible()
        await page.keyboard.press("Escape")
        await selectCapacity(page, "30A")

        await fillElectricityBill(page, "5000")
        await fillEmail(page, "test@example.com")

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        await expect(page.getByText("シミュレーション結果")).toBeVisible()
      })

      test("従量電灯C（6-49kVA）の入力フロー", async ({ page }) => {
        await fillPostalCode(page, "1234567")
        await selectCompany(page, "東京電力")
        await selectPlan(page, "従量電灯C")

        const capacitySelect = page.getByLabel("契約容量").locator("..")
        await capacitySelect.click()
        await expect(page.getByRole("option", { name: "6kVA", exact: true })).toBeVisible()
        await expect(page.getByRole("option", { name: "25kVA", exact: true })).toBeVisible()
        await expect(page.getByRole("option", { name: "49kVA", exact: true })).toBeVisible()
        await page.keyboard.press("Escape")
        await selectCapacity(page, "10kVA")

        await fillElectricityBill(page, "15000")
        await fillEmail(page, "test@example.com")

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        await expect(page.getByText("シミュレーション結果")).toBeVisible()
      })

      test("東京電力従量電灯B選択時の契約容量必要メッセージの非表示確認", async ({ page }) => {
        await fillPostalCode(page, "1000001")
        await selectCompany(page, "東京電力")
        await selectPlan(page, "従量電灯B")

        const infoMessageContainer = page.getByTestId("no-contract-required-info")
        await expect(infoMessageContainer).toHaveClass(/invisible/)

        await expect(page.getByLabel("契約容量")).toBeVisible()
      })
    })

    test.describe("正常系: 関西電力エリア", () => {
      test("従量電灯A（契約容量なし）の入力フロー", async ({ page }) => {
        await fillPostalCode(page, "5000001")

        await selectCompany(page, "関西電力")
        await selectPlan(page, "従量電灯A")
        await expect(page.getByLabel("契約容量")).not.toBeVisible()

        await fillElectricityBill(page, "3000")
        await fillEmail(page, "test@example.com")

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        await expect(page.getByText("シミュレーション結果")).toBeVisible()
      })

      test("従量電灯A選択時の契約容量不要メッセージの表示確認", async ({ page }) => {
        await fillPostalCode(page, "5000001")
        await selectCompany(page, "関西電力")

        const infoMessageContainer = page.getByTestId("no-contract-required-info")
        await expect(infoMessageContainer).toHaveClass(/invisible/)

        await selectPlan(page, "従量電灯A")

        await expect(infoMessageContainer).toHaveClass(/visible/)
        await expect(page.getByTestId("no-contract-required-title")).toBeVisible()
        await expect(page.getByTestId("no-contract-required-message")).toBeVisible()

        await expect(page.getByLabel("契約容量")).not.toBeVisible()
      })

      test("従量電灯B（6-49kVA）の入力フロー", async ({ page }) => {
        await fillPostalCode(page, "5678901")
        await selectCompany(page, "関西電力")
        await selectPlan(page, "従量電灯B")

        const capacitySelect = page.getByLabel("契約容量").locator("..")
        await capacitySelect.click()
        await expect(page.getByRole("option", { name: "6kVA", exact: true })).toBeVisible()
        await expect(page.getByRole("option", { name: "49kVA", exact: true })).toBeVisible()
        await page.keyboard.press("Escape")
        await selectCapacity(page, "15kVA")

        await fillElectricityBill(page, "8000")
        await fillEmail(page, "test@example.com")

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeEnabled()
        await submitButton.click()

        await expect(page.getByText("シミュレーション結果")).toBeVisible()
      })

      test("従量電灯B選択時の契約容量必要メッセージの非表示確認", async ({ page }) => {
        await fillPostalCode(page, "5678901")
        await selectCompany(page, "関西電力")
        await selectPlan(page, "従量電灯B")

        const infoMessageContainer = page.getByTestId("no-contract-required-info")
        await expect(infoMessageContainer).toHaveClass(/invisible/)

        await expect(page.getByLabel("契約容量")).toBeVisible()
      })
    })

    test.describe("エラー系", () => {
      test("対象外エリアのエラー表示", async ({ page }) => {
        const outOfAreaPostalCodes = [
          "2000000",
          "3000000",
          "4000000",
          "6000000",
          "7000000",
          "8000000",
          "9000000",
        ] as const satisfies readonly string[]

        for (const postalCode of outOfAreaPostalCodes) {
          await page.reload()
          await fillPostalCode(page, postalCode)
          await expect(page.getByText("サービスエリア対象外です。")).toBeVisible()

          await expect(page.getByLabel("電力会社")).toBeDisabled()
          await expect(page.getByLabel("プラン")).toBeDisabled()
        }
      })

      test("その他電力会社選択時のエラー表示", async ({ page }) => {
        await fillPostalCode(page, "1000000")
        await selectCompany(page, "その他")
        await expect(page.getByText("シミュレーション対象外です。")).toBeVisible()

        await expect(page.getByLabel("プラン")).toBeDisabled()
      })

      test("低電気代入力時のエラー表示", async ({ page }) => {
        await fillPostalCode(page, "1000000")
        await selectCompany(page, "東京電力")
        await selectPlan(page, "従量電灯B")
        await selectCapacity(page, "30A")
        await fillElectricityBill(page, "999")
        await expect(page.getByText("電気代を正しく入力してください。")).toBeVisible()

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeDisabled()
      })

      test("不正メールアドレスのバリデーションエラー", async ({ page }) => {
        await fillPostalCode(page, "1000000")
        await selectCompany(page, "東京電力")
        await selectPlan(page, "従量電灯B")
        await selectCapacity(page, "30A")
        await fillElectricityBill(page, "5000")

        const invalidEmails = [
          "test",
          "test@",
          "@example.com",
          "test@.com",
          "test..test@example.com",
        ] as const satisfies readonly string[]

        for (const email of invalidEmails) {
          await fillEmail(page, email)
          await expect(page.getByText("メールアドレスを正しく入力してください。")).toBeVisible()

          const submitButton = page.getByRole("button", { name: "結果を見る" })
          await expect(submitButton).toBeDisabled()
        }
      })

      test("オートコンプリート機能でのメールアドレス入力", async ({ page }) => {
        await fillPostalCode(page, "1000000")
        await selectCompany(page, "東京電力")
        await selectPlan(page, "従量電灯B")
        await selectCapacity(page, "30A")
        await fillElectricityBill(page, "5000")

        const emailInput = page.getByLabel("メールアドレス")

        await emailInput.evaluate((input, email) => {
          const inputElement = input as HTMLInputElement
          inputElement.value = email
          inputElement.dispatchEvent(new Event("input", { bubbles: true }))
          inputElement.dispatchEvent(new Event("change", { bubbles: true }))
          inputElement.dispatchEvent(new Event("blur", { bubbles: true }))
        }, "autocomplete@example.com")

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeEnabled()

        await expect(page.getByText("メールアドレスを正しく入力してください。")).not.toBeVisible()
      })
    })
  })

  test.describe("アクセシビリティテスト", () => {
    test("WCAG 2.1 Level A/AA準拠", async ({ page }) => {
      await checkAccessibility(page)
    })

    test("フォーム入力中のアクセシビリティ", async ({ page }) => {
      await fillPostalCode(page, "1000000")
      await selectCompany(page, "東京電力")
      await checkAccessibility(page)

      await selectPlan(page, "従量電灯B")
      await selectCapacity(page, "30A")
      await checkAccessibility(page)

      await fillElectricityBill(page, "5000")
      await fillEmail(page, "test@example.com")
      await checkAccessibility(page)
    })

    test("エラー状態のアクセシビリティ", async ({ page }) => {
      await fillPostalCode(page, "2000000")
      await expect(page.getByText("サービスエリア対象外です。")).toBeVisible()
      await checkAccessibility(page)

      await page.reload()
      await fillPostalCode(page, "1000000")
      await selectCompany(page, "その他")
      await expect(page.getByText("シミュレーション対象外です。")).toBeVisible()
      await checkAccessibility(page)
    })

    test("キーボードナビゲーション", async ({ page }) => {
      const postalCodeInput = page.getByLabel("電気を使用する場所の郵便番号").first()
      await postalCodeInput.focus()
      await expect(postalCodeInput).toBeFocused()

      await fillPostalCode(page, "1000000")

      const companySelect = page.getByLabel("電力会社")
      await companySelect.focus()
      await expect(companySelect).toBeFocused()

      await selectCompany(page, "東京電力")

      const planSelect = page.getByLabel("プラン")
      await planSelect.focus()
      await expect(planSelect).toBeFocused()
    })

    test("スクリーンリーダー対応", async ({ page }) => {
      const postalCodeInput = page.getByLabel("電気を使用する場所の郵便番号").first()
      await expect(postalCodeInput).toHaveAttribute("aria-label", /郵便番号/)
      await fillPostalCode(page, "2000000")

      const errorMessage = page.getByText("サービスエリア対象外です。")
      await expect(errorMessage).toBeVisible()

      const errorContainer = errorMessage.locator("..")
      await expect(errorContainer).toHaveAttribute("aria-live", "polite")
    })

    test("フォーカス管理とタブオーダー", async ({ page }) => {
      const postalCodeInput = page.getByLabel("電気を使用する場所の郵便番号").first()
      await postalCodeInput.focus()
      await expect(postalCodeInput).toBeFocused()

      await fillPostalCode(page, "999")
      await page.keyboard.press("Tab")
      await expect(page.getByText("郵便番号は7桁で入力してください。")).toBeVisible()
    })

    test("カラーコントラスト", async ({ page }) => {
      const submitButton = page.getByRole("button", { name: "結果を見る" })

      await submitButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })
      await submitButton.evaluate((el) => {
        return window.getComputedStyle(el).color
      })

      await checkAccessibility(page)
    })
  })

  test.describe("ステップ依存関係のテスト", () => {
    test("全項目完了後に電力会社を「その他」に変更した場合、後続ステップが未完了状態になる", async ({
      page,
    }) => {
      // 全項目完了状態を作る
      await fillPostalCode(page, "1000001")
      await selectCompany(page, "東京電力")
      await selectPlan(page, "従量電灯B")
      await selectCapacity(page, "30A")
      await fillElectricityBill(page, "5000")
      await fillEmail(page, "test@example.com")

      const submitButton = page.getByRole("button", { name: "結果を見る" })
      await expect(submitButton).toBeEnabled()

      await selectCompany(page, "その他")

      // 後続のフィールドが無効化されることを確認
      await expect(page.getByText("シミュレーション対象外です。")).toBeVisible()
      await expect(page.getByLabel("プラン")).toBeDisabled()
      await expect(page.getByLabel("メールアドレス")).toBeDisabled()
      await expect(submitButton).toBeDisabled()
    })

    test("全項目完了後に郵便番号を対象外エリアに変更した場合、全ての後続ステップが未完了状態になる", async ({
      page,
    }) => {
      // 全項目完了状態を作る
      await fillPostalCode(page, "1000001")
      await selectCompany(page, "東京電力")
      await selectPlan(page, "従量電灯B")
      await selectCapacity(page, "30A")
      await fillElectricityBill(page, "5000")
      await fillEmail(page, "test@example.com")

      const submitButton = page.getByRole("button", { name: "結果を見る" })
      await expect(submitButton).toBeEnabled()

      // 郵便番号を対象外エリアに変更
      await fillPostalCode(page, "2000000")

      // 全ての後続フィールドが無効化されることを確認
      await expect(page.getByText("サービスエリア対象外です。")).toBeVisible()
      await expect(page.getByLabel("電力会社")).toBeDisabled()
      await expect(page.getByLabel("プラン")).toBeDisabled()
      await expect(page.getByLabel("メールアドレス")).toBeDisabled()
      await expect(submitButton).toBeDisabled()
    })
  })

  test.describe("フィールドリセット機能", () => {
    test("郵便番号をサービスエリア対象外に変更時のフィールドリセット", async ({ page }) => {
      await fillPostalCode(page, "1000001")
      await selectCompany(page, "東京電力")
      await selectPlan(page, "従量電灯B")
      await selectCapacity(page, "30A")
      await fillElectricityBill(page, "5000")
      await fillEmail(page, "test@example.com")

      const submitButton = page.getByRole("button", { name: "結果を見る" })
      await expect(submitButton).toBeEnabled()
      await fillPostalCode(page, "2000000")
      await expect(page.getByText("サービスエリア対象外です。")).toBeVisible()
      await expect(page.getByLabel("電力会社")).toBeDisabled()
      await expect(page.getByLabel("プラン")).toBeDisabled()
      await expect(page.getByLabel("メールアドレス")).toBeDisabled()
      await expect(submitButton).toBeDisabled()
    })

    test("電力会社をその他に変更時のフィールドリセット", async ({ page }) => {
      await fillPostalCode(page, "1000001")
      await selectCompany(page, "東京電力")
      await selectPlan(page, "従量電灯B")
      await selectCapacity(page, "30A")
      await fillElectricityBill(page, "5000")

      await selectCompany(page, "その他")
      await expect(page.getByText("シミュレーション対象外です。")).toBeVisible()

      await expect(page.getByLabel("プラン")).toBeDisabled()

      await expect(page.getByLabel("メールアドレス")).toBeDisabled()
    })

    test("リセットボタンでフォーム全体が完全にクリアされる", async ({ page }) => {
      await fillPostalCode(page, "1000001")
      await selectCompany(page, "東京電力")
      await selectPlan(page, "従量電灯B")
      await selectCapacity(page, "30A")
      await fillElectricityBill(page, "5000")
      await fillEmail(page, "test@example.com")

      const submitButton = page.getByRole("button", { name: "結果を見る" })
      await expect(submitButton).toBeEnabled()

      const resetButton = page.getByRole("button", { name: "リセット" })
      await resetButton.click()

      const postalCodeFirst = page.getByLabel("電気を使用する場所の郵便番号").first()
      const postalCodeSecond = page.getByLabel("電気を使用する場所の郵便番号（後半）")
      await expect(postalCodeFirst).toHaveValue("")
      await expect(postalCodeSecond).toHaveValue("")

      await expect(page.getByLabel("電力会社")).toBeDisabled()
      await expect(page.getByLabel("プラン")).toBeDisabled()
      await expect(page.getByLabel("契約容量")).not.toBeVisible()
      await expect(page.getByLabel("先月の電気代は？")).toBeDisabled()
      await expect(page.getByLabel("メールアドレス")).toBeDisabled()

      await expect(submitButton).toBeDisabled()

      await expect(page.getByText("サービスエリア対象外です。")).not.toBeVisible()
      await expect(page.getByText("シミュレーション対象外です。")).not.toBeVisible()
    })
  })

  test.describe("レスポンシブデザイン", () => {
    test("モバイル表示での動作確認", async ({ page, browserName }) => {
      if (browserName === "chromium" || browserName === "webkit") {
        await takeScreenshot(page, `mobile-${browserName}-initial.png`)

        await fillPostalCode(page, "1000000")
        await selectCompany(page, "東京電力")
        await selectPlan(page, "従量電灯B")
        await selectCapacity(page, "30A")
        await fillElectricityBill(page, "5000")
        await fillEmail(page, "test@example.com")
        await takeScreenshot(page, `mobile-${browserName}-complete.png`)

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeEnabled()

        const buttonSize = await submitButton.evaluate((el) => {
          const rect = el.getBoundingClientRect()
          return { width: rect.width, height: rect.height }
        })
        expect(buttonSize.height).toBeGreaterThanOrEqual(44)
      }
    })

    test("タブレット表示での動作確認", async ({ page, browserName }) => {
      if (browserName === "webkit") {
        await takeScreenshot(page, `tablet-${browserName}-initial.png`)

        await fillPostalCode(page, "5000000")
        await selectCompany(page, "関西電力")
        await selectPlan(page, "従量電灯A")
        await fillElectricityBill(page, "4000")
        await fillEmail(page, "test@example.com")
        await takeScreenshot(page, `tablet-${browserName}-complete.png`)

        const submitButton = page.getByRole("button", { name: "結果を見る" })
        await expect(submitButton).toBeEnabled()
      }
    })

    test("デスクトップ表示での動作確認", async ({ page, browserName }) => {
      await takeScreenshot(page, `desktop-${browserName}-initial.png`)

      await fillPostalCode(page, "1000000")
      await selectCompany(page, "東京電力")
      await selectPlan(page, "従量電灯B")
      await selectCapacity(page, "30A")
      await fillElectricityBill(page, "5000")
      await fillEmail(page, "test@example.com")
      await takeScreenshot(page, `desktop-${browserName}-complete.png`)

      const submitButton = page.getByRole("button", { name: "結果を見る" })
      await expect(submitButton).toBeEnabled()
      await submitButton.click()

      await expect(page.getByText("シミュレーション結果")).toBeVisible()
      await takeScreenshot(page, `desktop-${browserName}-result.png`)
    })

    test("各デバイス用統合スクリーンショット", async ({ page, browserName }) => {
      await takeDeviceScreenshots(page, "integration-test", browserName)
    })
  })
})
