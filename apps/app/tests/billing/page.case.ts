import { expect, mock, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"

let eligible = true
// Other settings sections are not rendered by this page, and their server
// dependencies are unrelated to the billing prop chain under test.
for (const component of [
  "branding/Branding", "team/Team", "feedback/Feedback", "changelog/Changelog",
  "domain/Domain", "integrations/Integrations", "data/Data", "workspace/Workspace", "board/Board",
]) {
  mock.module(`../../src/components/settings/${component}`, () => ({ default: () => null }))
}
mock.module("@/lib/workspace", () => ({
  getSettingsInitialData: async () => ({
    initialPlan: "free", initialWorkspaceId: "workspace", initialWorkspaceOwnerId: "owner",
    initialTrialEligible: eligible, initialBillingSubscription: null,
  }),
}))
mock.module("@featul/auth/session", () => ({ getServerSession: async () => ({ user: { id: "owner" } }) }))
mock.module("@/lib/seo", () => ({ createPageMetadata: () => ({}) }))
const { default: Page } = await import("../../src/app/workspaces/[slug]/settings/[section]/page")

async function renderBilling() {
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: "workspace", section: "billing" }) }))
}

test("eligible workspaces see both trial durations and explicit free-trial actions", async () => {
  eligible = true
  const html = await renderBilling()
  expect(html).toContain("Start 7-day free trial")
  expect(html).toContain("Start 3-day free trial")
  expect(html).toContain("7-day free trial. Cancel anytime.")
  expect(html).toContain("3-day free trial. Cancel anytime.")
})

test("ineligible workspaces see paid actions and no promise of a new trial", async () => {
  eligible = false
  const html = await renderBilling()
  expect(html).not.toContain("Start 7-day free trial")
  expect(html).not.toContain("Start 3-day free trial")
  expect(html).toContain("Choose plan")
  expect(html).toContain("Paid plan. Cancel anytime.")
  expect(html).toContain("Not available")
})
