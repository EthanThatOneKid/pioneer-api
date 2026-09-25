import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { decodeIwp, encodeIwp } from "./iwp.ts";
import { rewriteIwpFromBubbles } from "./pipeline.ts";
import type { AffineTransform, LinearUnit } from "./geometry.ts";
import { detectBubblesWithGemini } from "./vision.ts";
import { readRasterSize, type RasterMediaType } from "./image.ts";
import { page } from "./web.ts";

const MAX_IWP_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const imageTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const affineKeys = ["a", "b", "c", "d", "e", "f"] as const;

const errorSchema = z.object({ error: z.string() }).openapi("Error");
const healthSchema = z.object({ service: z.string(), status: z.literal("ok") }).openapi("Health");
const relabelSummarySchema = z.object({
  provider: z.string(),
  modelId: z.string(),
  promptVersion: z.string(),
  replacements: z.number(),
  observations: z.number(),
  matches: z.array(z.object({ from: z.string(), to: z.string(), distancePx: z.number() })),
  usage: z.unknown().optional(),
}).openapi("RelabelSummary");

const healthRoute = createRoute({
  method: "get",
  path: "/healthz",
  responses: { 200: { content: { "application/json": { schema: healthSchema } }, description: "Service health" } },
});

const relabelRoute = createRoute({
  method: "post",
  path: "/api/v1/relabellings",
  request: {
    body: {
      required: true,
      content: { "multipart/form-data": { schema: z.object({ iwp: z.any().optional(), image: z.any().optional() }).passthrough() } },
    },
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ summary: relabelSummarySchema, outputBase64: z.string() }) } }, description: "Relabeled IWP" },
    400: { content: { "application/json": { schema: errorSchema } }, description: "Invalid request" },
    413: { content: { "application/json": { schema: errorSchema } }, description: "Upload too large" },
    500: { content: { "application/json": { schema: errorSchema } }, description: "Processing failure" },
  },
});

function parseOptionalCount(fields: Record<string, unknown>, key: string): number | undefined {
  const raw = fields[key];
  if (raw === undefined || raw === null || String(raw).trim() === "") return undefined;
  const value = Math.trunc(Number(raw));
  if (!Number.isFinite(value) || value < 1) throw new Error(`Invalid numeric field: ${key}`);
  return value;
}

function parseNumber(fields: Record<string, unknown>, key: string, fallback: number): number {
  const value = Number(fields[key] ?? fallback);
  if (!Number.isFinite(value)) throw new Error(`Invalid numeric field: ${key}`);
  return value;
}

function readTransform(fields: Record<string, unknown>): AffineTransform {
  const transform = Object.fromEntries(affineKeys.map((key) => [key, parseNumber(fields, key, 0)])) as AffineTransform;
  if (transform.a === 0 || transform.d === 0) throw new Error("Affine transform must have non-zero scale");
  return transform;
}

function getUpload(fields: Record<string, unknown>, key: string): File {
  const value = fields[key];
  if (!(value instanceof File) || value.size === 0) throw new Error(`Missing upload: ${key}`);
  return value;
}

function mediaType(file: File): "image/png" | "image/jpeg" | "image/webp" {
  if (!imageTypes.has(file.type)) throw new Error("Image must be PNG, JPEG, or WebP");
  return file.type as "image/png" | "image/jpeg" | "image/webp";
}

function imageDimensions(bytes: Uint8Array, type: string): { width: number; height: number } {
  return readRasterSize(bytes, type as RasterMediaType);
}

function jsonError(message: string, status: 400 | 413 | 500): Response {
  return Response.json({ error: message }, { status });
}

export const app = new OpenAPIHono();

app.get("/", (c) => c.html(page()));
app.get("/openapi.json", (c) => c.json(app.getOpenAPI31Document({ openapi: "3.1.0", info: { title: "Pioneer API IWP Review", version: "0.1.0" } })));
app.openapi(healthRoute, (c) => c.json({ service: "pioneer-api-iwp-review", status: "ok" }, 200));
app.openapi(relabelRoute, async (c) => {
  try {
    const fields = c.req.valid("form") as Record<string, unknown>;
    const iwp = getUpload(fields, "iwp");
    const image = getUpload(fields, "image");
    if (iwp.size > MAX_IWP_BYTES) return jsonError("IWP file exceeds 10 MiB", 413) as never;
    if (image.size > MAX_IMAGE_BYTES) return jsonError("Image exceeds 20 MiB", 413) as never;
    if (!iwp.name.toLowerCase().endsWith(".iwp")) throw new Error("IWP upload must use the .iwp extension");
    const type = mediaType(image);
    const [iwpBytes, imageBytes] = await Promise.all([iwp.arrayBuffer(), image.arrayBuffer()]);
    const iwpText = decodeIwp(new Uint8Array(iwpBytes));
    const imageData = new Uint8Array(imageBytes);
    const dimensions = imageDimensions(imageData, type);
    const provider = String(fields.provider ?? "gemini-proof");
    if (provider !== "gemini-proof") throw new Error("Only the Gemini synthetic-proof provider is enabled in this review service");
    const apiKey = c.req.header("x-google-gemini-api-key")?.trim();
    const detected = await detectBubblesWithGemini({
      image: imageData,
      mediaType: type,
      imageSize: dimensions,
      apiKey,
      expectedCount: parseOptionalCount(fields, "expectedCount"),
    });
    const result = rewriteIwpFromBubbles(
      iwpText,
      detected.observations,
      readTransform(fields),
      parseNumber(fields, "tolerance", 90),
      (String(fields.unit ?? "in") as LinearUnit),
    );
    const output = encodeIwp(result.text);
    return c.json({
      summary: {
        provider: "gemini-proof",
        modelId: detected.modelId,
        promptVersion: detected.promptVersion,
        replacements: result.replacements,
        observations: detected.observations.length,
        matches: result.matches.map((match) => ({ from: match.feature.sourceName, to: match.bubble.number, distancePx: Number(match.distance.toFixed(3)) })),
        usage: detected.usage,
      },
      outputBase64: Buffer.from(output).toString("base64"),
    }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "IWP relabeling failed";
    const status = message.includes("required") || message.includes("returned") ? 500 : 400;
    return jsonError(message, status) as never;
  }
});

app.notFound((c) => c.json({ error: "Not found" }, 404));

if (import.meta.main) {
  const port = Number(process.env.PIONEER_REVIEW_PORT ?? process.env.PORT ?? 8787);
  Bun.serve({ port, fetch: app.fetch });
  console.log(`pioneer-api-iwp-review listening on ${port}`);
}
