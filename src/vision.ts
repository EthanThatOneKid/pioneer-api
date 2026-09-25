import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import type { BubbleObservation } from "./ocr.ts";
import { buildBubbleDetectionPrompt, DETECTOR_PROMPT_VERSION } from "./prompt.ts";

export * from "./prompt.ts";

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

export const MAX_DETECTED_BUBBLES = 32;

export const MAX_DETECTOR_OUTPUT_TOKENS = 8192;

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
