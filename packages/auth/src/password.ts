export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/

export function isStrongPassword(pwd: string) {
  return strongPasswordRegex.test(pwd)
}

export const strongPasswordPattern = strongPasswordRegex.source