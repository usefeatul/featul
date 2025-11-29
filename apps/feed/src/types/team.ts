export type Role = "admin" | "member" | "viewer";

export type Member = {
  userId: string;
  role: Role;
  isOwner?: boolean;
  joinedAt?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
  image?: string;
};

export type Invite = {
  id: string;
  email: string;
  role: Role;
  invitedBy: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
};

