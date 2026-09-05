export type {
  AiAction,
  AiChatMessage,
  AiDetailLevel,
  AiTone,
} from "@featul/api/ai/types";

export type AiChatStarter = {
  label: string;
  prompt: string;
  attachFeedback?: boolean;
};
