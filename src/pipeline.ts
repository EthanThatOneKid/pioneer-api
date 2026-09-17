import {
  assertUniqueTargets,
  extractFeatureRecords,
  replaceIwpNames,
  type NameMapping,
} from "./iwp.ts";
import {
  matchBubblesToFeatures,
  matchesToNameMappings,
  normalizeFeatureAnchors,
  type AffineTransform,
  type BubbleMatch,
  type LinearUnit,
} from "./geometry.ts";
import { extractPointAnchors } from "./render.ts";
import type { BubbleObservation } from "./ocr.ts";

export type RewriteResult = {
  text: string;
  replacements: number;
  mappings: NameMapping[];
  matches: BubbleMatch[];
};

export function rewriteIwpFromBubbles(
  iwpText: string,
  bubbles: BubbleObservation[],
  worldToImage: AffineTransform,
  tolerance: number,
  unit: LinearUnit = "mm",
): RewriteResult {
  const rawFeatures = extractPointAnchors(iwpText);
  const features = normalizeFeatureAnchors(rawFeatures, unit);
  if (features.length === 0) throw new Error("No renderable Pnt features found in the IWP");
  const matches = matchBubblesToFeatures(features, bubbles, worldToImage, tolerance);
  const mappings = matchesToNameMappings(matches);
  assertUniqueTargets(extractFeatureRecords(iwpText), mappings);
  const rewritten = replaceIwpNames(iwpText, mappings);
  if (rewritten.replacements !== mappings.length) {
    throw new Error(`Expected ${mappings.length} replacements but made ${rewritten.replacements}`);
  }
  return { ...rewritten, mappings, matches };
}
