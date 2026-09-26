import { beforeEach, expect, mock, test } from "bun:test";
import * as schema from "../../../../packages/db/schema";

let started: string[];
let release: () => void;
let gate: Promise<void>;
let owned = [{ id: "one", slug: "first", name: "Owned" }];
const member = [{ id: "one", slug: "first", name: "Member copy" }, { id: "two", slug: "second", name: "Second" }];
mock.module("@featul/db", () => ({
  ...schema,
  db: {
    select: () => {
      let table: unknown;
      const query = {
        from(value: unknown) { table = value; return query; },
        innerJoin() { return query; },
        where() { return query; },
        then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
          started.push(table === schema.workspace ? "owned" : "member");
          return gate.then(() => table === schema.workspace ? owned : member).then(resolve, reject);
        },
      };
      return query;
    },
  },
}));
const plan = mock(async () => "free");
mock.module("@featul/auth/billing", () => ({ getEffectiveWorkspacePlan: plan }));
const { listUserWorkspaces } = await import("../../src/lib/workspace");

beforeEach(() => {
  started = [];
  gate = new Promise<void>((resolve) => { release = resolve; });
  plan.mockClear();
});

test("overlaps ownership and membership reads while preserving merge order and plans", async () => {
  const pending = listUserWorkspaces("user");
  try {
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(started.sort()).toEqual(["member", "owned"]);
  } finally { release(); }
  expect(await pending).toEqual(member.map((row) => ({ ...row, plan: "free" })));
  expect(plan).toHaveBeenCalledTimes(2);
});

test("subsequent calls see changed database results", async () => {
  release();
  await listUserWorkspaces("user");
  owned = [{ id: "new", slug: "new", name: "New workspace" }];
  expect((await listUserWorkspaces("user"))[0]?.name).toBe("New workspace");
});
