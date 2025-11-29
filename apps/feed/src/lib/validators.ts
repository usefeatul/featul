import { z } from "zod"

const validTlds = new Set([
  "com","net","org","io","co","ai","app","dev","gg","xyz","me","us","uk","ca","de","fr","it","es","nl","br","in","jp","ru","ch","se","no","fi","pl","cz","sk","id","au","nz","be","dk","pt","gr","mx","za","ar","tw","kr","hk","sg","ie","il","at","tr","sa","ua","vn","ph","th","my","cl","pe","uy","lu","li","ro","bg","hu","lt","lv","ee","rs","ba","md","ge","am","az","by","kz","uz","tm","tj","kg","pa","do","cr","gt","hn","ni","jm","tt","pr","ae","qa","kw","om","bh","eg","ma","tn","dz","cc","biz","info","tech"
])

export const cleanSlug = (v: string) => v.toLowerCase().replace(/[^a-z]/g, "")
export const slugifyFromName = (name: string) => cleanSlug(name.toLowerCase().trim())

export const isDomainValid = (domain: string) => {
  const v = domain.trim().toLowerCase()
  if (!/^[a-z0-9.-]+$/.test(v)) return false
  if (v.length > 253) return false
  const parts = v.split(".")
  if (parts.length < 2) return false
  const tld = parts.pop() as string
  if (!validTlds.has(tld)) return false
  for (const label of parts) {
    if (!/^[a-z0-9-]{1,63}$/.test(label)) return false
    if (label.startsWith("-") || label.endsWith("-")) return false
  }
  return true
}

export const suggestDomainFix = (domain: string) => {
  const v = domain.trim().toLowerCase()
  const m = v.match(/^(.*)\.([a-z0-9]{2,})$/i)
  if (!m) return null
  const t = m[2]
  const base = m[1]
  if (t && ["kom","con","cpm","cm","coom","comm","c0m"].includes(t)) return `${base}.com`
  if (t && ["nt","neet"].includes(t)) return `${base}.net`
  return null
}

export const isNameValid = (name: string) => z.string().min(1).safeParse(name.trim()).success

export const isSlugValid = (slug: string) => z.string().min(5).regex(/^[a-z]+$/).safeParse(slug.trim()).success

export const isTimezoneValid = (tz: string) => z.string().min(1).safeParse(String(tz)).success

export const workspaceSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1).refine(isDomainValid),
  slug: z.string().min(5).regex(/^[a-z]+$/),
  timezone: z.string().min(1),
})