export type {
  AiAction,
  AiChatIntent,
  AiChatMessage,
  AiDetailLevel,
  AiTone,
} from "@featul/api/ai/types";

export type AiChatStarter = {
  label: string;
  prompt: string;
  attachFeedback?: boolean;
  attachThisWeek?: boolean;
  publishCheck?: boolean;
  primary?: boolean;
};
