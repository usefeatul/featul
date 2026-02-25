import { z } from "zod"

const DOMAIN_LABEL_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const DOMAIN_TLD_REGEX = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/

const hasHttpPrefix = (value: string) => /^https?:\/\//i.test(value)

const withHttpPrefix = (value: string) =>
  hasHttpPrefix(value) ? value : `https://${value}`

export const normalizeDomainHost = (value: string) =>
  value.trim().toLowerCase().replace(/\.$/, "")

export const getTopLevelDomain = (host: string) => {
  const normalized = normalizeDomainHost(host)
  const labels = normalized.split(".")
  return labels[labels.length - 1] || ""
}

export const isDomainHostValid = (value: string) => {
  const normalized = normalizeDomainHost(value)
  if (!normalized) return false
  if (normalized.length > 253) return false

  const labels = normalized.split(".")
  if (labels.length < 2) return false

  const tld = labels[labels.length - 1] || ""
  if (!DOMAIN_TLD_REGEX.test(tld)) return false

  for (const label of labels) {
    if (!DOMAIN_LABEL_REGEX.test(label)) return false
  }

  return true
}

const hasOnlyHostInUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return (
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      parsed.pathname === "/" &&
      !parsed.search &&
      !parsed.hash
    )
  } catch {
    return false
  }
}

export const domainHostSchema = z
  .string()
  .trim()
  .transform(normalizeDomainHost)
  .refine(isDomainHostValid, { message: "Invalid domain host" })

export const domainUrlSchema = z
  .string()
  .trim()
  .transform(withHttpPrefix)
  .pipe(z.string().url())
  .refine(hasOnlyHostInUrl, { message: "Domain URL must contain only a host" })
  .refine((value) => {
    try {
      return isDomainHostValid(new URL(value).hostname)
    } catch {
      return false
    }
  }, { message: "Invalid domain host" })
