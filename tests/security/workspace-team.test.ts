import "./setup";
import { expect, mock, test } from "bun:test";
const procedure = {
  input: () => procedure,
  get: (fn: unknown) => fn,
  post: (fn: unknown) => fn,
};
mock.module("../../packages/api/src/jstack.ts", () => ({
  j: { router: (routes: unknown) => routes },
  privateProcedure: procedure,
  publicProcedure: procedure,
}));
mock.module("../../packages/auth/src/auth.ts", () => ({
  auth: { api: { getSession: async () => null } },
}));
const realEmail = await import("../../packages/auth/src/email.ts");
const sentReservations: string[] = [];
mock.module("../../packages/auth/src/email.ts", () => ({
  ...realEmail,
  sendReservationEmail: async (to: string) => {
    sentReservations.push(to);
  },
}));
const { createReservationRouter } =
  await import("../../packages/api/src/router/reservation");
const { createTeamRouter } = await import("../../packages/api/src/router/team");
const { createWorkspaceRouter } =
  await import("../../packages/api/src/router/workspace");
const { createChangelogRouter } =
  await import("../../packages/api/src/router/changelog");

type Write = { kind: "insert" | "update" | "delete"; values?: unknown };

function fixture(rows: unknown[][]) {
  let queries = 0;
  const writes: Write[] = [];
  const chain = (result: unknown): any => {
    const builder: any = {
      from: () => builder,
      innerJoin: () => builder,
      leftJoin: () => builder,
      where: () => builder,
      set: () => builder,
      values: () => builder,
      onConflictDoNothing: () => builder,
      returning: () => Promise.resolve(result),
      limit: () => Promise.resolve(result),
      then: (resolve: any, reject: any) =>
        Promise.resolve(result).then(resolve, reject),
    };
    return builder;
  };
  const database = {
    select() {
      const result = rows[queries++];
      if (!result) throw new Error("Unexpected query");
      return chain(result);
    },
    insert() {
      writes.push({ kind: "insert" });
      return chain([{ id: "new" }]);
    },
    update() {
      const builder = chain([]);
      builder.set = (values: unknown) => {
        writes.push({ kind: "update", values });
        return builder;
      };
      return builder;
    },
    delete() {
      writes.push({ kind: "delete" });
      return chain([]);
    },
  };
  return { database: database as any, writes, queries: () => queries };
}

const c = {
  superjson: (v: unknown) => v,
  json: (v: unknown) => v,
  header() {},
  req: {
    raw: new Request("https://app.example.com/api/reservation/reserve", {
      method: "POST",
      headers: { origin: "https://app.example.com" },
    }),
  },
};
const future = () => new Date(Date.now() + 60 * 60 * 1000);

test("re-reserving a pending slug for the same email sends no new email", async () => {
  const routes = createReservationRouter() as any;
  const f = fixture([
    [],
    [{ count: 0 }],
    [
      {
        id: "r1",
        email: "a@example.com",
        status: "reserved",
        confirmedAt: null,
        expiresAt: future(),
      },
    ],
  ]);
  const before = sentReservations.length;
  await expect(
    routes.reserve({
      ctx: { db: f.database },
      input: { slug: "acme", email: "a@example.com" },
      c,
    }),
  ).resolves.toEqual({ ok: true });
  expect(sentReservations.length).toBe(before);
  expect(f.writes).toEqual([]);
});

test("a pending reservation from another email cannot be overwritten", async () => {
  const routes = createReservationRouter() as any;
  const f = fixture([
    [],
    [{ count: 0 }],
    [
      {
        id: "r1",
        email: "victim@example.com",
        status: "reserved",
        confirmedAt: null,
        expiresAt: future(),
      },
    ],
  ]);
  await expect(
    routes.reserve({
      ctx: { db: f.database },
      input: { slug: "acme", email: "other@example.com" },
      c,
    }),
  ).rejects.toMatchObject({ status: 409 });
  expect(f.writes).toEqual([]);
});

test("confirming the emailed token marks the reservation confirmed", async () => {
  const routes = createReservationRouter() as any;
  const f = fixture([
    [{ id: "r1", status: "reserved", confirmedAt: null, expiresAt: future() }],
  ]);
  await routes.confirm({ ctx: { db: f.database }, input: { token: "t" }, c });
  const update = f.writes.find((w) => w.kind === "update")?.values as any;
  expect(update?.confirmedAt).toBeInstanceOf(Date);
  expect(update?.expiresAt.getTime()).toBeGreaterThan(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );
});

test("members without manage rights can leave, the owner cannot", async () => {
  const routes = createTeamRouter() as any;
  const ws = { id: "w1", ownerId: "owner", name: "Acme", slug: "acme" };
  const leave = fixture([[ws], [{ email: "viewer@example.com" }]]);
  await expect(
    routes.removeMember({
      ctx: { db: leave.database, session: { user: { id: "viewer" } } },
      input: { slug: "acme", userId: "viewer" },
      c,
    }),
  ).resolves.toEqual({ ok: true });
  expect(leave.writes.some((w) => w.kind === "delete")).toBe(true);

  const owner = fixture([[ws]]);
  await expect(
    routes.removeMember({
      ctx: { db: owner.database, session: { user: { id: "owner" } } },
      input: { slug: "acme", userId: "owner" },
      c,
    }),
  ).rejects.toMatchObject({ status: 403 });

  const other = fixture([[ws], []]);
  await expect(
    routes.removeMember({
      ctx: { db: other.database, session: { user: { id: "viewer" } } },
      input: { slug: "acme", userId: "someone-else" },
      c,
    }),
  ).rejects.toMatchObject({ status: 403 });
  expect(other.writes).toEqual([]);
});

test("only the owner can delete a workspace", async () => {
  const routes = createWorkspaceRouter() as any;
  const f = fixture([[{ id: "w1", ownerId: "owner", name: "Acme" }]]);
  await expect(
    routes.delete({
      ctx: { db: f.database, session: { user: { id: "admin" } } },
      input: { slug: "acme", confirmName: "Acme" },
      c,
    }),
  ).rejects.toMatchObject({ status: 403 });
  expect(f.queries()).toBe(1);
  expect(f.writes).toEqual([]);
});

test("changelog settings and tags require active membership", async () => {
  const routes = createChangelogRouter() as any;
  for (const name of ["settings", "tagsList"]) {
    const f = fixture([[{ id: "w1", ownerId: "owner", slug: "acme" }], []]);
    await expect(
      routes[name]({
        ctx: { db: f.database, session: { user: { id: "outsider" } } },
        input: { slug: "acme" },
        c,
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(f.queries()).toBe(2);
  }
});
