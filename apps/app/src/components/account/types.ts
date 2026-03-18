export type UserIdentity = {
  name?: string;
  email?: string;
  image?: string | null;
};

export type SessionUser = UserIdentity & {
  id?: string;
};

export type CurrentSessionState = {
  user: SessionUser | null;
  userId: string | null;
};

export type DeviceAccount = {
  userId: string;
  name: string;
  image: string;
  isCurrent: boolean;
};

export type UserDropdownAccount = DeviceAccount;
