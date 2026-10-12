import { expect, test } from "bun:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { emailOTP, multiSession } from "better-auth/plugins";
import { passwordAuthentication } from "../../packages/auth/src/credentials";

const origin = "https://app.example.com";
const email = "password-test@example.com";
const password = "Original-password1!";
const newPassword = "Replacement-password2!";

async function fixture() {
  let otp = "";
  let resetToken = "";
  const instance = betterAuth({
    ...passwordAuthentication,
    baseURL: origin,
    secret: "password-session-regression-test-secret-123456789",
    database: memoryAdapter({ user: [], account: [], session: [], verification: [] }),
    databaseHooks: {},
    socialProviders: {},
    rateLimit: { enabled: false },
    emailVerification: {},
    emailAndPassword: {
      ...passwordAuthentication.emailAndPassword,
      requireEmailVerification: false,
      sendResetPassword: async ({ token }) => { resetToken = token; },
    },
    plugins: [
      emailOTP({ sendVerificationOTP: async (data) => { otp = data.otp; } }),
      multiSession(),
    ],
  });

  async function request(path: string, body?: object, cookie = "") {
    return instance.handler(new Request(`${origin}/api/auth${path}`, {
      method: body ? "POST" : "GET",
      headers: { origin, "content-type": "application/json", cookie },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }));
  }

  async function signIn(accountEmail = email, accountPassword = password) {
    const response = await request("/sign-in/email", {
      email: accountEmail, password: accountPassword,
    });
    expect(response.status).toBe(200);
    return response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
  }

  for (const accountEmail of [email, "unrelated@example.com"]) {
    const response = await request("/sign-up/email", {
      email: accountEmail, password, name: "Session test",
    });
    expect(response.status).toBe(200);
  }
  const cookies = [await signIn(), await signIn()];
  const unrelatedCookie = await signIn("unrelated@example.com");

  async function expectSessions(active: boolean) {
    for (const cookie of cookies) {
      const response = await request("/get-session", undefined, cookie);
      const session = await response.json();
      if (active) expect(session?.user.email).toBe(email);
      else {
        expect(session).toBeNull();
        const protectedResponse = await request("/list-sessions", undefined, cookie);
        expect(protectedResponse.status).toBe(401);
      }
    }
    const unrelated = await request("/get-session", undefined, unrelatedCookie);
    expect((await unrelated.json())?.user.email).toBe("unrelated@example.com");
  }

  async function expectPasswordChanged(response: Response) {
    expect(response.status).toBe(200);
    expect(response.headers.getSetCookie().some((cookie) =>
      cookie.includes("session_token=;") && cookie.includes("Max-Age=0")
    )).toBe(true);
    await expectSessions(false);
    const context = await instance.$context;
    const user = await context.internalAdapter.findUserByEmail(email);
    expect(await context.internalAdapter.listSessions(user!.user.id)).toHaveLength(0);
    expect((await request("/sign-in/email", { email, password })).status).toBe(401);
    await signIn(email, newPassword);
  }

  return {
    request, cookies, expectSessions, expectPasswordChanged,
    getOtp: () => otp,
    getResetToken: () => resetToken,
  };
}

for (const revokeOtherSessions of [undefined, false, true]) {
  test(`password changes revoke every session with revokeOtherSessions=${revokeOtherSessions}`, async () => {
    const f = await fixture();
    const response = await f.request("/change-password", {
      currentPassword: password, newPassword, revokeOtherSessions,
    }, f.cookies[0]);
    await f.expectPasswordChanged(response);
    expect((await response.json()).token).toBeNull();
  });
}

test("email OTP password reset revokes every session", async () => {
  const f = await fixture();
  expect((await f.request("/email-otp/send-verification-otp", {
    email, type: "forget-password",
  })).status).toBe(200);
  expect(f.getOtp()).not.toBe("");
  await f.expectPasswordChanged(await f.request("/email-otp/reset-password", {
    email, otp: f.getOtp(), password: newPassword,
  }, f.cookies[0]));
});

test("token password reset revokes every session without an authenticated request", async () => {
  const f = await fixture();
  expect((await f.request("/request-password-reset", { email })).status).toBe(200);
  expect(f.getResetToken()).not.toBe("");
  await f.expectPasswordChanged(await f.request("/reset-password", {
    token: f.getResetToken(), newPassword,
  }));
});

test("failed password changes and resets preserve existing sessions", async () => {
  const f = await fixture();
  for (const [path, body] of [
    ["/change-password", { currentPassword: "Wrong-password1!", newPassword }],
    ["/change-password", { currentPassword: password, newPassword: "short" }],
    ["/email-otp/reset-password", { email, otp: "invalid", password: newPassword }],
    ["/reset-password", { token: "invalid", newPassword }],
  ] as const) {
    const response = await f.request(path, body, f.cookies[0]);
    expect(response.status).toBeGreaterThanOrEqual(400);
    await f.expectSessions(true);
  }
});
