import type { NameMapping } from "./iwp.ts";
import type { BubbleObservation } from "./ocr.ts";

export type Point2D = { x: number; y: number };

export type AffineTransform = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

export type FeatureAnchor = {
  recordType: string;
  sourceName: string;
  group?: string;
  point: Point2D;
};

export type BubbleMatch = {
  feature: FeatureAnchor;
  bubble: BubbleObservation;
  distance: number;
};

export type LinearUnit = "mm" | "in" | "m" | "um";

export const millimetresPerUnit: Record<LinearUnit, number> = {
  mm: 1,
  in: 25.4,
  m: 1000,
  um: 0.001,
};

export function normalizeFeatureAnchors(features: FeatureAnchor[], unit: LinearUnit): FeatureAnchor[] {
  const factor = millimetresPerUnit[unit];
  return features.map((feature) => ({
    ...feature,
    point: { x: feature.point.x * factor, y: feature.point.y * factor },
  }));
}

export function applyTransform(transform: AffineTransform, point: Point2D): Point2D {
  return {
    x: transform.a * point.x + transform.c * point.y + transform.e,
    y: transform.b * point.x + transform.d * point.y + transform.f,
  };
}

export function bubbleCenter(bubble: BubbleObservation): Point2D {
  return {
    x: bubble.left + bubble.width / 2,
    y: bubble.top + bubble.height / 2,
  };
}

export function fitViewport(
  features: FeatureAnchor[],
  width: number,
  height: number,
  padding = 80,
): AffineTransform {
  if (features.length === 0) throw new Error("Cannot fit a viewport without features");
  const xs = features.map((feature) => feature.point.x);
  const ys = features.map((feature) => feature.point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY);
  return {
    a: scale,
    b: 0,
    c: 0,
    d: -scale,
    e: padding - minX * scale,
    f: height - padding + minY * scale,
  };
}

export function matchBubblesToFeatures(
  features: FeatureAnchor[],
  bubbles: BubbleObservation[],
  worldToImage: AffineTransform,
  tolerance: number,
): BubbleMatch[] {
  const candidates = features.flatMap((feature) => bubbles.map((bubble) => ({
    feature,
    bubble,
    distance: Math.hypot(
      applyTransform(worldToImage, feature.point).x - bubbleCenter(bubble).x,
      applyTransform(worldToImage, feature.point).y - bubbleCenter(bubble).y,
    ),
  }))).filter((candidate) => candidate.distance <= tolerance)
    .sort((left, right) => left.distance - right.distance);
  const usedFeatures = new Set<FeatureAnchor>();
  const usedBubbles = new Set<BubbleObservation>();
  const matches: BubbleMatch[] = [];
  for (const candidate of candidates) {
    if (usedFeatures.has(candidate.feature) || usedBubbles.has(candidate.bubble)) continue;
    usedFeatures.add(candidate.feature);
    usedBubbles.add(candidate.bubble);
    matches.push(candidate);
  }
  if (matches.length !== features.length || matches.length !== bubbles.length) {
    throw new Error(`Could not establish a one-to-one bubble match: ${matches.length}/${features.length} features, ${matches.length}/${bubbles.length} bubbles`);
  }
  return matches;
}

export function matchesToNameMappings(matches: BubbleMatch[]): NameMapping[] {
  return matches.map(({ feature, bubble }) => ({
    group: feature.group,
    recordType: feature.recordType,
    from: feature.sourceName,
    to: bubble.number,
  }));
}
