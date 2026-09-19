import { expect, test } from "bun:test";
import { denormalizeBubbleObservations, type GeminiBubbleDetection } from "../src/vision.ts";

test("denormalizes Gemini observations into matcher pixel coordinates", () => {
  const detection: GeminiBubbleDetection = {
    observations: [{
      number: "705",
      box: { left: 0.1, top: 0.2, width: 0.05, height: 0.06 },
      leaderEndpoint: { x: 0.15, y: 0.25 },
      confidence: 0.9,
    }],
  };
  expect(denormalizeBubbleObservations(detection, { width: 1800, height: 1200 })).toEqual([{
    number: "705",
    left: 180,
    top: 240,
    width: 90,
    height: 72,
    anchorX: 270,
    anchorY: 300,
    confidence: 90,
  }]);
});

test("rejects malformed normalized output before geometry matching", () => {
  const detection: GeminiBubbleDetection = {
    observations: [{
      number: "not-a-number",
      box: { left: 0.1, top: 0.2, width: 0.05, height: 0.06 },
      leaderEndpoint: { x: 0.15, y: 0.25 },
      confidence: 0.9,
    }],
  };
  expect(() => denormalizeBubbleObservations(detection, { width: 1800, height: 1200 })).toThrow("non-numeric bubble label");
});
