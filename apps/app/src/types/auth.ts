/** Auth form user snippet and sign-in vs sign-up mode. */
export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
};

export type AuthMode = "sign-in" | "sign-up";
