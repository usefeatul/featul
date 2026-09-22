/** Role granted when the invite is accepted. */
export type InviteRole = "admin" | "member" | "viewer";

export type InviteUser = {
  name?: string;
  email?: string;
  image?: string | null;
};

/** Token lookup payload for the invite accept page. */
export type InviteByTokenResponse = {
  invite?: {
    workspaceName?: string | null;
    workspaceSlug?: string | null;
    workspaceLogo?: string | null;
    role?: InviteRole | null;
    invitedByName?: string | null;
  };
};

/** Accept result; workspaceSlug is where to redirect on success. */
export type AcceptInviteResponse = {
  ok?: boolean;
  workspaceSlug?: string | null;
};
