export type InviteRole = "admin" | "member" | "viewer";

export type InviteUser = {
  name?: string;
  email?: string;
  image?: string | null;
};

export type InviteByTokenResponse = {
  invite?: {
    workspaceName?: string | null;
    workspaceSlug?: string | null;
    workspaceLogo?: string | null;
    role?: InviteRole | null;
    invitedByName?: string | null;
  };
};

export type AcceptInviteResponse = {
  ok?: boolean;
  workspaceSlug?: string | null;
};
