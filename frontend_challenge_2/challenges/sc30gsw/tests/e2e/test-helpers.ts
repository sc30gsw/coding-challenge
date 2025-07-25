import AxeBuilder from "@axe-core/playwright"
import { expect, type Page } from "@playwright/test"

export async function fillPostalCode(page: Page, postalCode: string) {
  const firstInput = page.getByLabel("電気を使用する場所の郵便番号").first()
  const secondInput = page.getByLabel("電気を使用する場所の郵便番号（後半）")
  
  const firstPart = postalCode.slice(0, 3)
  const secondPart = postalCode.slice(3, 7)
  
  await firstInput.fill(firstPart)
  await secondInput.fill(secondPart)
  await secondInput.blur()
}

export async function selectCompany(page: Page, company: string) {
  const select = page.getByLabel("電力会社").locator("..")
  await select.click()
  await page.getByRole('option', { name: company }).click()
}

export async function selectPlan(page: Page, plan: string) {
  const select = page.getByLabel("プラン").locator("..")
  await select.click()
  await page.getByRole('option', { name: plan }).click()
}

export async function selectCapacity(page: Page, capacity: string) {
  const select = page.getByLabel("契約容量").locator("..")
  await select.click()
  await page.getByRole('option', { name: capacity }).click()
}

export async function fillElectricityBill(page: Page, amount: string) {
  const input = page.getByLabel("先月の電気代は？")
  await input.fill(amount)
  await input.blur()
}

export async function fillEmail(page: Page, email: string) {
  const input = page.getByLabel("メールアドレス")
  await input.fill(email)
  await input.blur()
}

function getDevicePrefix(browserName: string) {
  if (browserName.includes("Mobile")) {
    return "mobile"
  }

  if (browserName === "iPad") {
    return "tablet"
  }

  return "desktop"
}

function getTestPostalCode(browserName: string) {
  if (browserName.includes("Mobile") || browserName === "iPad") {
    return "5000000"
  }

  return "1000000"
}

function getTestCompany(browserName: string) {
  if (browserName.includes("Mobile") || browserName === "iPad") {
    return "関西電力"
  }

  return "東京電力"
}

function getTestPlan(browserName: string) {
  if (browserName.includes("Mobile")) {
    return "従量電灯A"
  }

  if (browserName === "iPad") {
    return "従量電灯B"
  }

  return "従量電灯B"
}

function getTestCapacity(browserName: string) {
  if (browserName === "iPad") {
    return "15kVA"
  }

  return "30A"
}

function getTestElectricityBill(browserName: string) {
  if (browserName.includes("Mobile")) {
    return "3000"
  }

  if (browserName === "iPad") {
    return "8000"
  }

  return "5000"
}

function getTestEmail(browserName: string): string {
  const device = getDevicePrefix(browserName)
  return `${device}@example.com`
}

export async function checkAccessibility(page: Page, skipRules?: string[]) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude(".ignore-a11y")
    .disableRules(["color-contrast", "label", ...(skipRules || [])])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
}

export async function takeScreenshot(
  page: Page,
  filename: string,
  options?: { fullPage?: boolean; clip?: Record<"x" | "y" | "width" | "height", number> },
) {
  await page.screenshot({
    path: `tests/e2e/simulation/screenshots/${filename}`,
    fullPage: options?.fullPage ?? true,
    clip: options?.clip,
  })
}

export async function takeDeviceScreenshots(page: Page, testName: string, browserName: string) {
  const devicePrefix = getDevicePrefix(browserName)
  const cleanBrowserName = browserName.replace(" ", "-")

  await takeScreenshot(page, `${devicePrefix}-${testName}-initial-${cleanBrowserName}.png`)
  await fillPostalCode(page, getTestPostalCode(browserName))
  await selectCompany(page, getTestCompany(browserName))

  if (browserName !== "Mobile Chrome" || testName !== "kansai-a") {
    await selectPlan(page, getTestPlan(browserName))

    if (getTestPlan(browserName) !== "従量電灯A") {
      await selectCapacity(page, getTestCapacity(browserName))
    }
  }

  await fillElectricityBill(page, getTestElectricityBill(browserName))
  await fillEmail(page, getTestEmail(browserName))

  await takeScreenshot(page, `${devicePrefix}-${testName}-complete-${cleanBrowserName}.png`)
}
