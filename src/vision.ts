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
export function resolveGeminiApiKey(inputApiKey?: string, environmentApiKey = process.env.PIONEER_GEMINI_API_KEY): string {
  const apiKey = inputApiKey?.trim() || environmentApiKey?.trim();
  if (!apiKey) throw new Error("A Google Gemini API key is required");
  return apiKey;
}

function assertNormalizedDetection(detection: GeminiBubbleDetection): void {
  if (detection.observations.length < 1 || detection.observations.length > 32) {
    throw new Error(`Gemini returned ${detection.observations.length} observations; expected 1-32`);
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
}): Promise<{
  detection: GeminiBubbleDetection;
  observations: BubbleObservation[];
  modelId: string;
  usage: unknown;
}> {
  const apiKey = resolveGeminiApiKey(input.apiKey);
  const modelId = input.modelId ?? process.env.PIONEER_GEMINI_MODEL ?? "gemini-3.6-flash";
  const google = createGoogleGenerativeAI({ apiKey });
  const result = await generateText({
    model: google(modelId),
    temperature: 0,
    maxOutputTokens: 2048,
    output: Output.object({ schema: detectionSchema }),
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: [
            "Detect every numbered bubble in this engineering-annotation fixture.",
            "The image contains six orange numbered bubbles, gray leader lines, and six black geometry features.",
            "Return the number printed inside each bubble, its normalized bounding box, and the normalized point where its leader line touches the black geometry.",
            "Coordinates must be normalized to the full image: x = horizontal fraction, y = vertical fraction, origin at the top-left.",
            "The leader endpoint is not the bubble center. Do not infer or copy any source IWP labels; only report visible bubble text.",
            "Return all visible bubbles, preserve no ordering assumption, and lower confidence when the text or endpoint is uncertain.",
          ].join(" "),
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
    usage: result.usage,
  };
}
