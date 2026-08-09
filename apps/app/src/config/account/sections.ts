export type AccountSection = { value: string; label: string; desc: string }

export const ACCOUNT_SECTIONS: AccountSection[] = [
  { value: "profile", label: "Profile", desc: "Update your personal info" },
  { value: "security", label: "Security", desc: "Manage password and sessions" },
  { value: "appearance", label: "Appearance", desc: "Choose light, dark, or system" },
]

export function getAccountSectionMeta(v: string) {
  const found = ACCOUNT_SECTIONS.find((s) => s.value === v)
  return found || { value: "profile", label: "Account", desc: "Manage your account" }
}
