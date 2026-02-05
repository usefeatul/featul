export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
};

export type AuthMode = "sign-in" | "sign-up";
