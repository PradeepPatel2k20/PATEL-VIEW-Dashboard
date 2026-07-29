import { describe, it, expect } from "vitest";
import { cn, timeAgo, isRecentRelease, slugify, looksLikeUrl } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", undefined, "font-bold")).toBe("text-sm font-bold");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Sitecore XM Cloud")).toBe("sitecore-xm-cloud");
  });
  it("strips non-alphanumeric characters", () => {
    expect(slugify("Jira / Confluence!!")).toBe("jira-confluence");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Node.js--  ")).toBe("node-js");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for very recent timestamps", () => {
    expect(timeAgo(new Date().toISOString())).toBe("just now");
  });
  it("returns minutes for timestamps within the hour", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });
  it("returns days for timestamps over 24h old", () => {
    const twoDaysAgo = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toMatch(/\dd ago/);
  });
});

describe("isRecentRelease", () => {
  it("returns true for a release within the threshold", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(isRecentRelease(tenDaysAgo, 30)).toBe(true);
  });
  it("returns false for a release older than the threshold", () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(isRecentRelease(sixtyDaysAgo, 30)).toBe(false);
  });
});

describe("looksLikeUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(looksLikeUrl("https://example.com")).toBe(true);
    expect(looksLikeUrl("http://example.com")).toBe(true);
  });
  it("rejects descriptive notes and empty strings", () => {
    expect(looksLikeUrl("N/A - no dedicated status page")).toBe(false);
    expect(looksLikeUrl("")).toBe(false);
  });
});
