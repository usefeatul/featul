import { sendOpenRouterChat } from "./openrouter"
import { normalizeStatus, type StatusKey } from "../shared/status"

type SuggestionInput = {
  title: string
  body: string
  labels: string[]
  issueState: string
  issueStateReason?: string | null
  statusLabelMap?: Record<string, string>
}

type StatusSuggestion = {
  suggestedStatus: StatusKey
  confidence: number
  reason: string
  source: "rule" | "ai" | "fallback"
}

const STATUS_HINTS = ["pending", "review", "planned", "progress", "completed", "closed"]

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function parseStatusToken(raw: string): StatusKey {
  return normalizeStatus(String(raw || "pending"))
}

function deterministicSuggestion(input: SuggestionInput): StatusSuggestion | null {
  const labels = input.labels.map((label) => label.trim().toLowerCase()).filter(Boolean)
  const statusLabelMap = input.statusLabelMap || {}

  for (const label of labels) {
    const mapped = statusLabelMap[label]
    if (mapped) {
      return {
        suggestedStatus: parseStatusToken(mapped),
        confidence: 0.95,
        reason: `Mapped from label '${label}'`,
        source: "rule",
      }
    }
  }

  if (input.issueState.toLowerCase() === "closed") {
    const reason = (input.issueStateReason || "").trim().toLowerCase()
    if (reason === "completed") {
      return {
        suggestedStatus: "completed",
        confidence: 0.85,
        reason: "GitHub issue closed with reason 'completed'",
        source: "rule",
      }
    }
    if (reason === "not_planned") {
      return {
        suggestedStatus: "closed",
        confidence: 0.85,
        reason: "GitHub issue closed with reason 'not_planned'",
        source: "rule",
      }
    }

    return {
      suggestedStatus: "closed",
      confidence: 0.7,
      reason: "GitHub issue is closed",
      source: "rule",
    }
  }

  return null
}

function buildAiPrompt(input: SuggestionInput): string {
  return [
    "Classify this GitHub issue into one roadmap status.",
    `Allowed statuses: ${STATUS_HINTS.join(", ")}.`,
    "Return strict JSON only: {\"status\": string, \"confidence\": number, \"reason\": string }.",
    "Do not use markdown.",
    "Prefer pending/review unless there is strong evidence for a later stage.",
    `Issue state: ${input.issueState}${input.issueStateReason ? ` (reason: ${input.issueStateReason})` : ""}`,
    `Labels: ${input.labels.length > 0 ? input.labels.join(", ") : "none"}`,
    `Title: ${input.title}`,
    `Body: ${(input.body || "").slice(0, 4000)}`,
  ].join("\n")
}

function extractJsonPayload(text: string): { status?: unknown; confidence?: unknown; reason?: unknown } | null {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1)) as { status?: unknown; confidence?: unknown; reason?: unknown }
  } catch {
    return null
  }
}

async function aiSuggestion(input: SuggestionInput): Promise<StatusSuggestion | null> {
  if (!String(process.env.OPENROUTER_API_KEY || "").trim()) {
    return null
  }

  try {
    const model = String(process.env.OPENROUTER_MODEL || "openrouter/auto")
    const result = await sendOpenRouterChat({
      model,
      messages: [
        {
          role: "system",
          content:
            "You map software issues to product roadmap statuses. Return only JSON and keep reasons concise.",
        },
        { role: "user", content: buildAiPrompt(input) },
      ],
      temperature: 0.2,
      max_tokens: 250,
      response_format: { type: "json_object" },
    })

    const text = (result as any)?.choices?.[0]?.message?.content
    if (!text || typeof text !== "string") return null

    const payload = extractJsonPayload(text)
    if (!payload) return null

    const status = parseStatusToken(String(payload.status || "pending"))
    const confidence = clampConfidence(Number(payload.confidence))
    const reason = String(payload.reason || "AI suggested based on issue context").trim().slice(0, 400)

    return {
      suggestedStatus: status,
      confidence: confidence || 0.55,
      reason: reason || "AI suggested based on issue context",
      source: "ai",
    }
  } catch {
    return null
  }
}

export async function suggestRoadmapStatus(input: SuggestionInput): Promise<StatusSuggestion> {
  const rule = deterministicSuggestion(input)
  if (rule) return rule

  const ai = await aiSuggestion(input)
  if (ai) return ai

  return {
    suggestedStatus: "pending",
    confidence: 0.4,
    reason: "Defaulted to pending due to limited status signals",
    source: "fallback",
  }
}

export type { StatusSuggestion, SuggestionInput }
