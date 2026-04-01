import { describe, expect, it } from "vitest";
import {
  getMemberLimitMessage,
  getPlanLimits,
  isDataImportsAllowed,
  isIntegrationsAllowed,
  normalizePlan,
} from "./plan";

describe("plan helpers", () => {
  it("normalizes unknown plans to free", () => {
    expect(normalizePlan("enterprise")).toBe("free");
    expect(normalizePlan(" PROFESSIONAL ")).toBe("professional");
  });

  it("returns plan limits for known plans", () => {
    expect(getPlanLimits("free")).toMatchObject({
      maxMembers: 3,
      allowIntegrations: false,
      allowDataImports: false,
    });
    expect(getPlanLimits("professional").maxMembers).toBe(10);
  });

  it("reports capability flags by plan", () => {
    expect(isIntegrationsAllowed("free")).toBe(false);
    expect(isIntegrationsAllowed("starter")).toBe(true);
    expect(isDataImportsAllowed("free")).toBe(false);
    expect(isDataImportsAllowed("professional")).toBe(true);
  });

  it("builds a member limit message with the normalized label", () => {
    expect(getMemberLimitMessage("starter", 5)).toBe(
      "Starter plan allows up to 5 members.",
    );
  });
});
