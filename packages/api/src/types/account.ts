import type { auth } from "@featul/auth/auth";

export type RequestCarrier = {
  req?: {
    raw?: {
      headers?: HeadersInit;
    };
  };
  request?: {
    headers?: HeadersInit;
  };
};

export type HeaderAppender = {
  header: (name: string, value: string, options?: { append?: boolean }) => void;
};

export type DeviceSessionEntry = {
  session?: {
    token?: string | null;
  } | null;
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export type SessionCarrier = {
  session?: {
    token?: string | null;
  } | null;
};

export type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[];
};

export type AuthHeadersResult = {
  headers?: Headers;
};

export type DeviceSessionAuthApi = typeof auth.api & {
  bootstrapCurrentDeviceSession: (input: {
    headers: Headers;
    returnHeaders: true;
  }) => Promise<AuthHeadersResult>;
  revokeDeviceSession: (input: {
    headers: Headers;
    body: { sessionToken: string };
    returnHeaders: true;
  }) => Promise<AuthHeadersResult>;
};
