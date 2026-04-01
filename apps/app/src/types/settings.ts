export interface FeedbackBoardSettings {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  isVisible: boolean;
  isActive: boolean;
  allowAnonymous: boolean;
  allowComments: boolean;
  hidePublicMemberIdentity: boolean;
  sortOrder: number;
  postCount: number;
}

export interface FeedbackTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface ChangelogTag {
  id: string;
  name: string;
}

export type IntegrationType = "discord" | "slack";

export interface Integration {
  id: string;
  type: IntegrationType;
  isActive: boolean | null;
  lastTriggeredAt: Date | null;
  createdAt: Date;
}
