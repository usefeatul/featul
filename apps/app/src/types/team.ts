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

export interface Invite {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  expiresAt: DateValue;
  acceptedAt?: DateValue | null;
  createdAt: DateValue;
}
