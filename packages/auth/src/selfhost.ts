/** Self-hosted installs (selfhost/install.sh) run without Stripe billing or a hosted email provider. */
export function isSelfHosted() {
  return ["1", "true", "yes", "on"].includes(String(process.env.FEATUL_SELF_HOSTED ?? "").trim().toLowerCase())
}
