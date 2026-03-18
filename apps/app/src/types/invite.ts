export type InviteUser = {
  name?: string;
  email?: string;
  image?: string | null;
};

export type InviteByTokenResponse = {
  invite?: {
    workspaceName?: string | null;
    workspaceLogo?: string | null;
    invitedByName?: string | null;
  };
};
