import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  decodeIwp,
  encodeIwp,
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
  ["A17", 10, 10],
  ["A18", 30, 10],
  ["A19", 50, 10],
  ["A20", 10, 30],
  ["A21", 30, 30],
  ["A22", 50, 30],
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
  test("renders, matches, and rewrites all six labels without changing the IWP envelope", async () => {
    const source = fixtureIwp();
    const rawFeatures = extractPointAnchors(source);
    const features = normalizeFeatureAnchors(rawFeatures, "in");
    expect(features).toHaveLength(6);

    const transform = fitViewport(features, 1000, 700, 120);
    const numbers = ["101", "102", "103", "104", "105", "106"];
    const bubbles: BubbleObservation[] = features.map((feature, index) => {
      const point = {
        x: transform.a * feature.point.x + transform.c * feature.point.y + transform.e,
        y: transform.b * feature.point.x + transform.d * feature.point.y + transform.f,
      };
      return {
        number: numbers[index],
        left: point.x - 18,
        top: point.y - 18,
        width: 36,
        height: 36,
        confidence: 100,
      };
    });

    const directory = await mkdtemp(join(tmpdir(), "pioneer-api-six-feature-"));
    const sourcePath = join(directory, "fixture.iwp");
    const sourceSvgPath = join(directory, "fixture-source.svg");
    const bubbledSvgPath = join(directory, "fixture-bubbled.svg");
    await Bun.write(sourcePath, encodeIwp(source));
    await Bun.write(sourceSvgPath, renderIwpSvg(features, transform, 1000, 700, true));
    await Bun.write(bubbledSvgPath, renderBubbledSvg(
      features,
      transform,
      features.map((feature, index) => ({ number: numbers[index], feature })),
      1000,
      700,
    ));

    const matches = matchBubblesToFeatures(features, bubbles, transform, 0.01);
    expect(matches).toHaveLength(6);
    const rewritten = rewriteIwpFromBubbles(source, bubbles, transform, 0.01, "in");

    expect(rewritten.replacements).toBe(6);
    expect(rewritten.text).toContain('(Name "101")');
    expect(rewritten.text).toContain('(Name "106")');
    expect(rewritten.text).not.toContain('(Name "A17")');
    expect(rewritten.text).not.toContain('(Name "A22")');
    expect(decodeIwp(encodeIwp(rewritten.text))).toBe(rewritten.text);
    expect((await readFile(sourceSvgPath, "utf8"))).toContain("data-source-name=\"A17\"");
    expect((await readFile(bubbledSvgPath, "utf8"))).toContain("data-bubble-number=\"101\"");
  });
});
