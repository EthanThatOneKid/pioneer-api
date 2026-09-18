import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import type { BubbleObservation } from "./ocr.ts";

const normalizedObservationSchema = z.object({
  number: z.string().regex(/^\d{1,5}$/),
  box: z.object({
    left: z.number().min(0).max(1),
    top: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1),
  }),
  leaderEndpoint: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }),
  confidence: z.number().min(0).max(1),
});

const detectionSchema = z.object({
  observations: z.array(normalizedObservationSchema).min(1).max(32),
});

export type GeminiBubbleDetection = z.infer<typeof detectionSchema>;

export type DetectionImageSize = {
  width: number;
  height: number;
};

export function denormalizeBubbleObservations(
  detection: GeminiBubbleDetection,
  image: DetectionImageSize,
): BubbleObservation[] {
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
}): Promise<{
  detection: GeminiBubbleDetection;
  observations: BubbleObservation[];
  modelId: string;
  usage: unknown;
}> {
  const apiKey = process.env.PIONEER_GEMINI_API_KEY;
  if (!apiKey) throw new Error("PIONEER_GEMINI_API_KEY is required");
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
