import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { applyTransform, normalizeFeatureAnchors, type AffineTransform } from "../src/geometry.ts";

type GeminiResult = {
  detection: {
    observations: Array<{
      number: string;
      leaderEndpoint: { x: number; y: number };
    }>;
  };
};

const directory = join(process.cwd(), "artifacts/six-feature-fixture");
const inputPath = process.env.PIONEER_GEMINI_OUTPUT ?? join(directory, "04-gemini-bubbles.json");
const outputPath = process.env.PIONEER_GEMINI_EVALUATION ?? join(directory, "05-gemini-evaluation.json");
const canvas = { width: 1200, height: 800 };
const raster = { width: 1800, height: 1200 };
const transform = JSON.parse(await readFile(join(directory, "transform.json"), "utf8")) as AffineTransform;
const raw = [
  ["A17", 0.4, 0.4, "705"],
  ["A18", 1.2, 0.4, "102"],
  ["A19", 2.0, 0.4, "991"],
  ["A20", 0.4, 1.2, "314"],
  ["A21", 1.2, 1.2, "808"],
  ["A22", 2.0, 1.2, "127"],
] as const;
const features = normalizeFeatureAnchors(raw.map(([sourceName, x, y]) => ({
  recordType: "Pnt",
  sourceName,
  point: { x, y },
})), "in");
const expected = raw.map(([sourceName, , , number], index) => {
  const point = applyTransform(transform, features[index].point);
  return {
    sourceName,
    number,
    leaderEndpoint: { x: point.x / canvas.width, y: point.y / canvas.height },
  };
});
const result = JSON.parse(await readFile(inputPath, "utf8")) as GeminiResult;
const observations = result.detection.observations;
const expectedNumbers = new Set(expected.map((item) => item.number));
const observedNumbers = new Set(observations.map((item) => item.number));
const errors = expected.map((item) => {
  const observation = observations.find((candidate) => candidate.number === item.number);
  if (!observation) return { ...item, found: false, errorPixels: null };
  const errorPixels = Math.hypot(
    (observation.leaderEndpoint.x - item.leaderEndpoint.x) * raster.width,
    (observation.leaderEndpoint.y - item.leaderEndpoint.y) * raster.height,
  );
  return { ...item, found: true, errorPixels };
});
const matched = errors.filter((item) => item.found);
const maxErrorPixels = Math.max(...matched.map((item) => item.errorPixels ?? Infinity));
const evaluation = {
  inputPath,
  modelId: (JSON.parse(await readFile(inputPath, "utf8")) as { modelId?: string }).modelId ?? "unknown",
  expectedCount: expected.length,
  observedCount: observations.length,
  missingNumbers: expected.filter((item) => !observedNumbers.has(item.number)).map((item) => item.number),
  unexpectedNumbers: observations.filter((item) => !expectedNumbers.has(item.number)).map((item) => item.number),
  maxLeaderEndpointErrorPixels: maxErrorPixels,
  passed: expectedNumbers.size === observedNumbers.size && errors.every((item) => item.found && (item.errorPixels ?? Infinity) <= 80),
  errors,
};
await Bun.write(outputPath, JSON.stringify(evaluation, null, 2));
console.log(JSON.stringify(evaluation, null, 2));
if (!evaluation.passed) process.exit(1);
