const appUrl = (process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://app.featul.com").replace(
  /\/$/,
  ""
);

export const APP_URL = appUrl;
export const AUTH_SIGN_IN_URL = `${appUrl}/auth/signin`;
export const AUTH_SIGN_UP_URL = `${appUrl}/auth/signup`;
