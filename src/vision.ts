import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import type { BubbleObservation } from "./ocr.ts";

const normalizedObservationSchema = z.object({
  number: z.string(),
  box: z.object({
    left: z.number(),
    top: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  leaderEndpoint: z.object({
    x: z.number(),
    y: z.number(),
  }),
  confidence: z.number(),
});

const detectionSchema = z.object({
  observations: z.array(normalizedObservationSchema),
});

export type GeminiBubbleDetection = z.infer<typeof detectionSchema>;

export type DetectionImageSize = {
  width: number;
  height: number;
};
export const DETECTOR_PROMPT_VERSION = "iwp-bubble-detector/2";

export const MAX_DETECTED_BUBBLES = 32;

export const MAX_DETECTOR_OUTPUT_TOKENS = 8192;

export function buildBubbleDetectionPrompt(options: { expectedCount?: number } = {}): string {
  const guidance = [
    "Detect every numbered bubble annotation in this engineering drawing image.",
    "Report the number printed inside each bubble, the normalized bounding box of the bubble, and the normalized point where that bubble's leader line touches the feature it annotates.",
    "Coordinates must be normalized to the full image: x = horizontal fraction, y = vertical fraction, origin at the top-left.",
    "The leader endpoint is not the bubble center: follow the leader line to the feature it points at.",
    "Return the digits of each bubble label only, without any surrounding text.",
    "Report each visible bubble exactly once. The number of bubbles varies by drawing, so do not assume a fixed count and do not invent a bubble to reach an expected total.",
    "Bubbles are not a fixed colour, size, or shape and may be partially occluded or overlapped by drawing content, so do not rely on any single visual style.",
    "Do not read, infer, or copy labels from any source file; report only text that is visible in the image.",
    "Preserve no ordering assumption, and lower confidence when the label or the leader endpoint is uncertain.",
  ];
  if (options.expectedCount !== undefined) {
    guidance.splice(1, 0, `This drawing is expected to carry about ${options.expectedCount} bubbles; treat that as a hint, not a target.`);
  }
  return guidance.join(" ");
}

export function resolveGeminiApiKey(inputApiKey?: string): string {
  const apiKey = inputApiKey?.trim();
  if (!apiKey) throw new Error("A Google Gemini API key is required");
  return apiKey;
}

function assertNormalizedDetection(detection: GeminiBubbleDetection): void {
  if (detection.observations.length < 1 || detection.observations.length > MAX_DETECTED_BUBBLES) {
    throw new Error(`Gemini returned ${detection.observations.length} observations; this slice accepts 1-${MAX_DETECTED_BUBBLES}`);
  }
  for (const observation of detection.observations) {
    if (!/^\d{1,5}$/.test(observation.number)) {
      throw new Error(`Gemini returned a non-numeric bubble label: ${observation.number}`);
    }
    const values = [
      observation.box.left,
      observation.box.top,
      observation.box.width,
      observation.box.height,
      observation.leaderEndpoint.x,
      observation.leaderEndpoint.y,
      observation.confidence,
    ];
    if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
      throw new Error(`Gemini returned coordinates outside normalized range for bubble ${observation.number}`);
    }
  }
}

export function denormalizeBubbleObservations(
  detection: GeminiBubbleDetection,
  image: DetectionImageSize,
): BubbleObservation[] {
  assertNormalizedDetection(detection);
  return detection.observations.map((observation) => ({
    number: observation.number,
    left: observation.box.left * image.width,
    top: observation.box.top * image.height,
    width: observation.box.width * image.width,
    height: observation.box.height * image.height,
    anchorX: observation.leaderEndpoint.x * image.width,
    anchorY: observation.leaderEndpoint.y * image.height,
    confidence: observation.confidence * 100,
  }));
}

export async function detectBubblesWithGemini(input: {
  image: Uint8Array;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  imageSize: DetectionImageSize;
  modelId?: string;
  apiKey?: string;
  expectedCount?: number;
}): Promise<{
  detection: GeminiBubbleDetection;
  observations: BubbleObservation[];
  modelId: string;
  promptVersion: string;
  usage: unknown;
}> {
  const apiKey = resolveGeminiApiKey(input.apiKey);
  const modelId = input.modelId ?? process.env.PIONEER_GEMINI_MODEL ?? "gemini-3.6-flash";
  const google = createGoogleGenerativeAI({ apiKey });
  const result = await generateText({
    model: google(modelId),
    temperature: 0,
    maxOutputTokens: MAX_DETECTOR_OUTPUT_TOKENS,
    output: Output.object({ schema: detectionSchema }),
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: buildBubbleDetectionPrompt({ expectedCount: input.expectedCount }),
        },
        { type: "file", data: input.image, mediaType: input.mediaType },
      ],
    }],
  });
  if (!result.output) throw new Error("Gemini returned no structured bubble output");
  return {
    detection: result.output,
    observations: denormalizeBubbleObservations(result.output, input.imageSize),
    modelId,
    promptVersion: DETECTOR_PROMPT_VERSION,
    usage: result.usage,
  };
}
