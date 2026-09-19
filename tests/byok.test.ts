import { expect, test } from "bun:test";
import { page } from "../src/web.ts";
import { resolveGeminiApiKey } from "../src/vision.ts";

test("the review page requires a per-request Gemini key and clears it after submission", () => {
  const html = page();
  expect(html).toContain('id="apiKey"');
  expect(html).toContain("x-google-gemini-api-key");
  expect(html).toContain("finally");
  expect(html).toContain("does not store it, and does not log it");
  expect(html).not.toContain("name=\"apiKey\"");
});

test("BYOK vision input takes precedence over the server environment", () => {
  expect(resolveGeminiApiKey(" visitor-key ", "server-key")).toBe("visitor-key");
  expect(resolveGeminiApiKey(undefined, "server-key")).toBe("server-key");
  expect(() => resolveGeminiApiKey("  ", "")).toThrow("API key is required");
});
