import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  decodeIwp,
  encodeIwp,
  extractFeatureRecords,
} from "../src/iwp.ts";
import {
  fitViewport,
  matchBubblesToFeatures,
  normalizeFeatureAnchors,
  type BubbleObservation,
} from "../src/geometry.ts";
import { extractPointAnchors, renderBubbledSvg, renderIwpSvg } from "../src/render.ts";
import { rewriteIwpFromBubbles } from "../src/pipeline.ts";

const fixtureFeatures = [
  ["A17", 0.4, 0.4],
  ["A18", 1.2, 0.4],
  ["A19", 2.0, 0.4],
  ["A20", 0.4, 1.2],
  ["A21", 1.2, 1.2],
  ["A22", 2.0, 1.2],
] as const;

function fixtureIwp(): string {
  return [
    "InSpec 1 (Version 2.91.0274)",
    "Programs 1",
    "Instructions 6",
    ...fixtureFeatures.map(([name, x, y], index) =>
      `Pnt ${index + 1} F${index + 1} (Name \"${name}\") (Pnt (${x} ${y} 0))`),
    "",
  ].join("\r\n");
}

describe("deterministic six-feature IWP-to-bubble proof", () => {
  test("renders, matches mismatched labels, and rewrites all six names", async () => {
    const source = fixtureIwp();
    const rawFeatures = extractPointAnchors(source);
    const features = normalizeFeatureAnchors(rawFeatures, "in");
    expect(features).toHaveLength(6);

    const transform = fitViewport(features, 1000, 700, 120);
    const bubbleNumbersByFeature = ["705", "102", "991", "314", "808", "127"];
    const bubbles: BubbleObservation[] = features.map((feature, index) => {
      const point = {
        x: transform.a * feature.point.x + transform.c * feature.point.y + transform.e,
        y: transform.b * feature.point.x + transform.d * feature.point.y + transform.f,
      };
      return {
        number: bubbleNumbersByFeature[index],
        left: point.x - 18,
        top: point.y - 18,
        width: 36,
        height: 36,
        confidence: 100,
      };
    }).reverse();

    const directory = await mkdtemp(join(tmpdir(), "pioneer-api-six-feature-"));
    const sourceSvgPath = join(directory, "fixture-source.svg");
    const bubbledSvgPath = join(directory, "fixture-bubbled.svg");
    await Bun.write(sourceSvgPath, renderIwpSvg(features, transform, 1000, 700, true));
    await Bun.write(bubbledSvgPath, renderBubbledSvg(
      features,
      transform,
      features.map((feature, index) => ({ number: bubbleNumbersByFeature[index], feature })),
      1000,
      700,
    ));

    const matches = matchBubblesToFeatures(features, bubbles, transform, 0.01);
    expect(matches).toHaveLength(6);
    const rewritten = rewriteIwpFromBubbles(source, bubbles, transform, 0.01, "in");
    const mappingPairs = rewritten.mappings.map(({ from, to }) => `${from}->${to}`).sort();

    expect(mappingPairs).toEqual([
      "A17->705",
      "A18->102",
      "A19->991",
      "A20->314",
      "A21->808",
      "A22->127",
    ].sort());
    expect(rewritten.replacements).toBe(6);
    expect(rewritten.text).toContain('(Name "705")');
    expect(rewritten.text).toContain('(Name "127")');
    expect(rewritten.text).not.toContain('(Name "A17")');
    expect(rewritten.text).not.toContain('(Name "A22")');
    expect(decodeIwp(encodeIwp(rewritten.text))).toBe(rewritten.text);
    expect(extractFeatureRecords(rewritten.text)).toHaveLength(6);
    expect((await readFile(sourceSvgPath, "utf8"))).toContain("data-source-name=\"A17\"");
    expect((await readFile(bubbledSvgPath, "utf8"))).toContain("data-bubble-number=\"705\"");
  });
});
