import "./setup";
import { expect, test } from "bun:test";
import { getTableConfig } from "drizzle-orm/pg-core";
import { commentReport, postReport } from "@featul/db";
import {
  anonymousNetworkKey,
  getRequestFingerprint,
} from "../../packages/api/src/request/fingerprint";
import { createCommentInputSchema } from "../../packages/api/src/validators/comment";
import {
  VOICE_MONTHLY_TRANSCRIPTIONS,
  voiceMonthKey,
} from "../../packages/api/src/router/comment/voice-quota";

const visitor = (ip: string, userAgent: string) =>
  new Request("https://app.example.com/api", {
    headers: { "x-forwarded-for": ip, "user-agent": userAgent },
  });

test("anonymous identity ignores the user-agent and client fingerprints", () => {
  const first = getRequestFingerprint(visitor("203.0.113.7", "agent-a"), "client-1");
  expect(getRequestFingerprint(visitor("203.0.113.7", "agent-b"), "client-2")).toBe(first);
  expect(getRequestFingerprint(visitor("203.0.113.8", "agent-a"))).not.toBe(first);
});

test("IPv6 visitors share one identity per /64 and mapped IPv4 matches IPv4", () => {
  expect(anonymousNetworkKey("2001:db8:1:2::1")).toBe("2001:db8:1:2::/64");
  expect(anonymousNetworkKey("2001:0db8:0001:0002:ffff:1:2:3")).toBe("2001:db8:1:2::/64");
  expect(anonymousNetworkKey("2001:db8::5")).toBe("2001:db8:0:0::/64");
  expect(anonymousNetworkKey("::ffff:203.0.113.7")).toBe("203.0.113.7");
  expect(getRequestFingerprint(visitor("2001:db8:1:2::1", "a"))).toBe(
    getRequestFingerprint(visitor("2001:db8:1:2:abcd::9", "b")),
  );
});

test("comment input drops client-supplied mentions", () => {
  const parsed = createCommentInputSchema.parse({
    postId: "p1",
    content: "hi @Owner",
    metadata: { mentions: ["Owner"], attachments: [] },
  });
  expect(parsed.metadata).toEqual({ attachments: [] });
});

test("reports are unique per item and reporter", () => {
  for (const [table, column] of [
    [postReport, "post_id"],
    [commentReport, "comment_id"],
  ] as const) {
    const unique = getTableConfig(table).indexes.find(
      (index) => index.config.unique,
    );
    expect(unique?.config.columns.map((col) => (col as { name: string }).name)).toEqual([
      column,
      "reported_by",
    ]);
  }
});

test("voice transcription budget is monthly and per workspace", () => {
  expect(VOICE_MONTHLY_TRANSCRIPTIONS.free).toBeLessThan(VOICE_MONTHLY_TRANSCRIPTIONS.starter);
  expect(voiceMonthKey("w1", new Date(Date.UTC(2026, 9, 24)))).toBe("voice:{w1}:month:2026-10");
});
