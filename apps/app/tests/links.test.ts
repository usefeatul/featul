import { expect, test } from "bun:test"
import {
  getSafePostHref,
  parsePostContentLinks,
} from "../src/lib/post/links"

test("linkifies bare domains, www domains, and full URLs", () => {
  expect(
    parsePostContentLinks(
      "Visit example.com, www.example.org/docs or https://example.net?a=1."
    )
  ).toEqual([
    { type: "text", value: "Visit " },
    { type: "link", value: "example.com", href: "https://example.com/" },
    { type: "text", value: ", " },
    {
      type: "link",
      value: "www.example.org/docs",
      href: "https://www.example.org/docs",
    },
    { type: "text", value: " or " },
    {
      type: "link",
      value: "https://example.net?a=1",
      href: "https://example.net/?a=1",
    },
    { type: "text", value: "." },
  ])
})

test("does not turn email addresses into links", () => {
  expect(parsePostContentLinks("Email hello@example.com instead")).toEqual([
    { type: "text", value: "Email hello@example.com instead" },
  ])
})

test("keeps balanced URL parentheses and excludes sentence punctuation", () => {
  expect(parsePostContentLinks("See https://example.com/docs_(new)."))
    .toEqual([
      { type: "text", value: "See " },
      {
        type: "link",
        value: "https://example.com/docs_(new)",
        href: "https://example.com/docs_(new)",
      },
      { type: "text", value: "." },
    ])
})

test("only permits web protocols", () => {
  expect(getSafePostHref("javascript:alert(1)")).toBeNull()
  expect(getSafePostHref("ftp://example.com")).toBeNull()
  expect(getSafePostHref("example.com")).toBe("https://example.com/")
})
