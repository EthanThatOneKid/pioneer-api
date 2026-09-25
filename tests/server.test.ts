import { describe, expect, test } from "bun:test";
import { app } from "../src/server.ts";

describe("Hono review service", () => {
  test("serves the review UI and OpenAPI document", async () => {
    const page = await app.request("/");
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("IWP relabeling proof");

    const openapi = await app.request("/openapi.json");
    expect(openapi.status).toBe(200);
    const document = await openapi.json();
    expect(document.paths["/api/v1/relabellings"].post).toBeDefined();
    expect(document.components.schemas.RelabelSummary.properties.promptVersion).toBeDefined();
  });

  test("rejects incomplete uploads with a structured error", async () => {
    const response = await app.request("/api/v1/relabellings", {
      method: "POST",
      body: new FormData(),
      headers: { Accept: "application/json" },
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("Missing upload: iwp");
  });
});
