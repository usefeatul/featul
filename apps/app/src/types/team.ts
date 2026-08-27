/** Workspace membership roles; owner is a separate flag on Member. */
export type Role = "admin" | "member" | "viewer";
export type DateValue = string | Date;

export interface Member {
  userId: string;
  role: Role;
  isOwner?: boolean;
  joinedAt?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
  image?: string;
}

/** Pending or accepted workspace invite; acceptedAt null means still open. */
export interface Invite {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  expiresAt: DateValue;
  acceptedAt?: DateValue | null;
  createdAt: DateValue;
}
