export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/

export function isStrongPassword(pwd: string) {
  return strongPasswordRegex.test(pwd)
}

export const strongPasswordPattern = strongPasswordRegex.source

export function getPasswordError(pwd: string) {
  const s = String(pwd || "")
  if (s.length < 8) return "Should be at least 8 characters long."
  if (s.length > 128) return "Should be at most 128 characters long."
  if (!/[A-Z]/.test(s)) return "Include at least one uppercase letter."
  if (!/[a-z]/.test(s)) return "Include at least one lowercase letter."
  if (!/\d/.test(s)) return "Include at least one number."
  if (!/[^A-Za-z0-9]/.test(s)) return "Include at least one symbol."
  return null
}