import { expect, test } from "bun:test";
import {
  DETECTOR_PROMPT_VERSION,
  MAX_DETECTED_BUBBLES,
  MAX_DETECTOR_OUTPUT_TOKENS,
  buildBubbleDetectionPrompt,
  denormalizeBubbleObservations,
  type GeminiBubbleDetection,
} from "../src/vision.ts";

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

test("detector prompt is drawing-agnostic and carries no fixture literals", () => {
  const prompt = buildBubbleDetectionPrompt();
  expect(prompt).not.toMatch(/\bsix\b/i);
  expect(prompt).not.toMatch(/\bfixture\b/i);
  expect(prompt).not.toMatch(/\b(?:orange|black|gray|grey)\b/i);
  expect(prompt).not.toMatch(/\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\b\s+(?:orange|numbered|black)/i);
  expect(prompt).not.toMatch(/\b\d+\b/);
  expect(prompt).toMatch(/do not assume a fixed count/);
  expect(prompt).toMatch(/normalized to the full image/);
  expect(prompt).toMatch(/leader/);
});

test("detector prompt states an expected count only when the caller supplies one", () => {
  expect(buildBubbleDetectionPrompt()).not.toContain("expected to carry about");
  expect(buildBubbleDetectionPrompt({ expectedCount: 42 })).toContain("expected to carry about 42 bubbles");
});

test("exposes a prompt version, bubble budget, and output budget", () => {
  expect(DETECTOR_PROMPT_VERSION).toMatch(/^iwp-bubble-detector\/\d+$/);
  expect(MAX_DETECTED_BUBBLES).toBeGreaterThan(1);
  expect(MAX_DETECTOR_OUTPUT_TOKENS).toBeGreaterThanOrEqual(4096);
});

test("rejects detections beyond the supported bubble budget", () => {
  const detection: GeminiBubbleDetection = {
    observations: Array.from({ length: MAX_DETECTED_BUBBLES + 1 }, (_, index) => ({
      number: String(index + 1),
      box: { left: 0.1, top: 0.1, width: 0.01, height: 0.01 },
      leaderEndpoint: { x: 0.1, y: 0.1 },
      confidence: 0.9,
    })),
  };
  expect(() => denormalizeBubbleObservations(detection, { width: 100, height: 100 }))
    .toThrow(`this slice accepts 1-${MAX_DETECTED_BUBBLES}`);
});
