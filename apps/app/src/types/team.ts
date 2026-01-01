export type Role = "admin" | "member" | "viewer";

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
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}
