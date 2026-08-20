import { streamOpenRouterChat } from "../services/openrouter";
import {
  AI_STREAM_BODY_SYSTEM_PROMPT,
  AI_STREAM_TITLE_SYSTEM_PROMPT,
} from "./constants";
import { buildBodyStreamPrompt, buildTitleStreamPrompt } from "./prompts";
import { extractTitleLine, isValidChangelogTitle, resolveAiChangelogTitle } from "./title";
import type { AiSourcePost, ChangelogAiStreamEvent, StructuredGenerationAction } from "./types";

function emitBodyStreamEvents(
  body: string,
  state: { sentBodyLength: number },
  send: (event: ChangelogAiStreamEvent) => void,
) {
  if (body.length <= state.sentBodyLength) return;

  const delta = body.slice(state.sentBodyLength);
  if (!delta) return;

  send({ type: "delta", text: delta });
  state.sentBodyLength = body.length;
}

async function generateChangelogTitle(input: {
  model: string;
  action: StructuredGenerationAction;
  temperature: number;
  prompt?: string;
  tone?: "user-friendly" | "technical" | "brief";
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
}) {
  const requestTitle = async (extraInstruction?: string) => {
    let raw = "";
    await streamOpenRouterChat(
      {
        model: input.model,
        messages: [
          { role: "system", content: AI_STREAM_TITLE_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              buildTitleStreamPrompt({
                action: input.action,
                prompt: input.prompt,
                tone: input.tone,
                workspaceName: input.workspaceName,
                sourcePosts: input.sourcePosts,
              }),
              extraInstruction,
            ]
              .filter(Boolean)
              .join("\n\n"),
          },
        ],
        temperature: Math.min(input.temperature, 0.35),
        max_tokens: 120,
      },
      (text) => {
        raw += text;
      },
    );
    return raw;
  };

  let titleRaw = await requestTitle();
  const firstTitle = extractTitleLine(titleRaw);
  if (!firstTitle || !isValidChangelogTitle(firstTitle)) {
    titleRaw = await requestTitle(
      "The previous title was too generic or invalid. Rewrite it to explicitly mention the shipped feedback topics below.",
    );
  }

  return resolveAiChangelogTitle(titleRaw, input.sourcePosts);
}

export async function streamStructuredChangelog(input: {
  model: string;
  action: StructuredGenerationAction;
  temperature: number;
  maxBodyTokens: number;
  prompt?: string;
  tone?: "user-friendly" | "technical" | "brief";
  detailLevel?: "standard" | "detailed";
  workspaceName?: string;
  sourcePosts?: AiSourcePost[];
  send: (event: ChangelogAiStreamEvent) => void;
}) {
  const finalTitle = await generateChangelogTitle(input);
  input.send({ type: "title", text: finalTitle });

  const structuredState = { sentBodyLength: 0 };
  let body = "";

  await streamOpenRouterChat(
    {
      model: input.model,
      messages: [
        { role: "system", content: AI_STREAM_BODY_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildBodyStreamPrompt({
            action: input.action,
            title: finalTitle,
            prompt: input.prompt,
            tone: input.tone,
            detailLevel: input.detailLevel,
            workspaceName: input.workspaceName,
            sourcePosts: input.sourcePosts,
          }),
        },
      ],
      temperature: input.temperature,
      max_tokens: input.maxBodyTokens,
    },
    (text) => {
      body += text;
      emitBodyStreamEvents(body, structuredState, input.send);
    },
  );

  return {
    title: finalTitle,
    contentMarkdown: body.trim(),
  };
}
