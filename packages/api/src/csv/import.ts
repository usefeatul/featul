const HTTP_URL_REGEX = /https?:\/\/[^\s<>"'|;,]+/gi

export const CSV_IMPORT_ROW_LIMIT = 5000

export const CSV_IMPORT_ISSUE_CAP = 100

export type CsvImportField =
  | "id"
  | "title"
  | "content"
  | "roadmapStatus"
  | "upvotes"
  | "board"
  | "authorName"
  | "authorEmail"
  | "attachments"
  | "image"
  | "createdAt"
  | "updatedAt"

type ParsedCsv = {
  headers: string[]
  rows: string[][]
}

type HeaderMapResult = {
  fieldIndex: Partial<Record<CsvImportField, number>>
  mappedFields: CsvImportField[]
  warnings: string[]
}

const FIELD_ALIASES: Record<CsvImportField, string[]> = {
  id: ["id", "postid", "requestid", "feedbackid"],
  title: ["title", "posttitle", "requesttitle", "featuretitle", "name", "subject"],
  content: ["description", "content", "body", "details", "postcontent", "requestcontent", "text"],
  roadmapStatus: ["status", "roadmapstatus", "roadmap", "state", "stage", "column"],
  upvotes: ["upvotes", "votes", "votecount", "likes", "score"],
  board: ["board", "boardname", "boardslug", "category", "list"],
  authorName: ["authorname", "author", "createdby", "submittername", "creatorname"],
  authorEmail: ["authoremail", "email", "submitteremail", "creatoremail", "useremail"],
  attachments: ["attachments", "attachment", "attachmenturls", "fileurls", "files", "images", "imageurls"],
  image: ["image", "imageurl", "imageurlsingle", "coverimage", "thumbnail", "photo", "picture"],
  createdAt: ["createdat", "created", "createddate", "datecreated", "submittedat", "timestamp"],
  updatedAt: ["updatedat", "updated", "updateddate", "dateupdated", "modifiedat"],
}

const NORMALIZED_ALIAS_TO_FIELD = (() => {
  const map = new Map<string, CsvImportField>()
  const fields = Object.keys(FIELD_ALIASES) as CsvImportField[]
  for (const field of fields) {
    const aliases = FIELD_ALIASES[field]
    for (const alias of aliases) {
      map.set(normalizeHeaderKey(alias), field)
    }
  }
  return map
})()

export function normalizeHeaderKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "")
}

export function parseCsvContent(csvContent: string): ParsedCsv {
  const text = stripBom(csvContent)
  if (!text.trim()) {
    return { headers: [], rows: [] }
  }

  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === undefined) break

    if (inQuotes) {
      if (char === '"') {
        const next = text[i + 1]
        if (next === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ",") {
      row.push(field)
      field = ""
      continue
    }

    if (char === "\n") {
      row.push(field)
      field = ""
      if (!isEmptyRow(row)) {
        rows.push(row)
      }
      row = []
      continue
    }

    if (char === "\r") {
      row.push(field)
      field = ""
      if (text[i + 1] === "\n") {
        i += 1
      }
      if (!isEmptyRow(row)) {
        rows.push(row)
      }
      row = []
      continue
    }

    field += char
  }

  if (inQuotes) {
    throw new Error("Invalid CSV: unmatched quote")
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (!isEmptyRow(row)) {
      rows.push(row)
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = rows[0] || []
  const dataRows = rows.slice(1)
  return { headers, rows: dataRows }
}

export function buildSmartColumnMap(headers: string[]): HeaderMapResult {
  const fieldIndex: Partial<Record<CsvImportField, number>> = {}
  const warnings: string[] = []

  headers.forEach((rawHeader, index) => {
    const normalized = normalizeHeaderKey(rawHeader)
    if (!normalized) return
    const field = NORMALIZED_ALIAS_TO_FIELD.get(normalized)
    if (!field) return

    const existingIndex = fieldIndex[field]
    if (existingIndex === undefined) {
      fieldIndex[field] = index
      return
    }

    warnings.push(
      `Duplicate mapping for "${field}" found in columns "${headers[existingIndex] || existingIndex}" and "${rawHeader}". Using the first column.`
    )
  })

  const mappedFields = Object.keys(fieldIndex) as CsvImportField[]
  const mappedIndices = new Set<number>(mappedFields.map((field) => fieldIndex[field] as number))
  const unmappedHeaders = headers.filter((_, index) => !mappedIndices.has(index))
  if (unmappedHeaders.length > 0) {
    warnings.push(`Unmapped columns were ignored: ${unmappedHeaders.join(", ")}`)
  }

  return { fieldIndex, mappedFields, warnings }
}

export function getMappedCell(
  row: string[],
  fieldIndex: Partial<Record<CsvImportField, number>>,
  field: CsvImportField
): string {
  const index = fieldIndex[field]
  if (index === undefined) return ""
  return row[index] ?? ""
}

export function parseUrlList(rawValue: string): string[] {
  const trimmed = rawValue.trim()
  if (!trimmed) return []

  const found = trimmed.match(HTTP_URL_REGEX) || []
  if (found.length > 0) {
    const parsed = dedupe(found.map(cleanUrlToken).filter(isValidHttpUrl))
    if (parsed.length > 0) {
      return parsed
    }
  }

  const splitTokens = trimmed
    .split(/[\n;,|]+/g)
    .map((token) => cleanUrlToken(token))
    .filter(Boolean)

  return dedupe(splitTokens.filter(isValidHttpUrl))
}

export function inferAttachmentName(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname
    const lastSegment = pathname.split("/").filter(Boolean).pop()
    if (lastSegment) {
      return decodeURIComponent(lastSegment)
    }
  } catch {
    // Ignore parse failures and fall through to fallback naming.
  }
  return `image-${index + 1}`
}

export function inferAttachmentType(url: string): string {
  const normalized = url.toLowerCase()
  if (normalized.endsWith(".png")) return "image/png"
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg"
  if (normalized.endsWith(".webp")) return "image/webp"
  if (normalized.endsWith(".gif")) return "image/gif"
  if (normalized.endsWith(".svg")) return "image/svg+xml"
  return "image"
}

function stripBom(value: string): string {
  return value.replace(/^\uFEFF/, "")
}

function isEmptyRow(row: string[]): boolean {
  return row.every((cell) => cell.trim().length === 0)
}

function cleanUrlToken(value: string): string {
  return value.trim().replace(/[),.;]+$/g, "")
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values))
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}
