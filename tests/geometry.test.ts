import { describe, expect, test } from "bun:test";
import { matchBubblesToFeatures, type AffineTransform, type FeatureAnchor } from "../src/geometry.ts";
import type { BubbleObservation } from "../src/ocr.ts";

const identity: AffineTransform = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

function bubble(number: string, left: number): BubbleObservation {
  return { number, left, top: 0, width: 0, height: 0, confidence: 1 };
}

const features: FeatureAnchor[] = [
  { recordType: "Pnt", sourceName: "A", point: { x: 0, y: 0 } },
  { recordType: "Pnt", sourceName: "B", point: { x: 10, y: 0 } },
];

describe("global bubble assignment", () => {
  test("minimizes total distance instead of consuming a useful candidate greedily", () => {
    const matches = matchBubblesToFeatures(features, [bubble("100", 9), bubble("200", 18)], identity, 20);
    expect(matches.map((match) => [match.feature.sourceName, match.bubble.number])).toEqual([
      ["A", "100"],
      ["B", "200"],
    ]);
  });

  test("rejects equally plausible assignments", () => {
    expect(() => matchBubblesToFeatures(features, [bubble("100", 5), bubble("200", 5)], identity, 20)).toThrow(
      "Bubble assignment is ambiguous",
    );
  });
});
