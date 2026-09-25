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

export function bubbleAnchor(bubble: BubbleObservation): Point2D {
  return {
    x: bubble.anchorX ?? bubbleCenter(bubble).x,
    y: bubble.anchorY ?? bubbleCenter(bubble).y,
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

function solveMinimumAssignment(costs: number[][], forbidden?: { row: number; column: number }): { assignment: number[]; cost: number } | null {
  const size = costs.length;
  if (size === 0 || costs.some((row) => row.length !== size)) return null;
  const finiteCosts = costs.flat().filter(Number.isFinite);
  if (finiteCosts.length === 0) return null;
  const maximum = Math.max(...finiteCosts);
  const blocked = Math.max(maximum * size * 1000 + 1, 1e12);
  const matrix = costs.map((row, rowIndex) => row.map((cost, columnIndex) => {
    if (forbidden?.row === rowIndex && forbidden.column === columnIndex) return blocked;
    return Number.isFinite(cost) ? cost : blocked;
  }));
  const u = Array<number>(size + 1).fill(0);
  const v = Array<number>(size + 1).fill(0);
  const p = Array<number>(size + 1).fill(0);
  const way = Array<number>(size + 1).fill(0);
  for (let row = 1; row <= size; row += 1) {
    p[0] = row;
    let column0 = 0;
    const minimum = Array<number>(size + 1).fill(Number.POSITIVE_INFINITY);
    const used = Array<boolean>(size + 1).fill(false);
    do {
      used[column0] = true;
      const row0 = p[column0];
      let delta = Number.POSITIVE_INFINITY;
      let column1 = 0;
      for (let column = 1; column <= size; column += 1) {
        if (used[column]) continue;
        const candidate = matrix[row0 - 1][column - 1] - u[row0] - v[column];
        if (candidate < minimum[column]) {
          minimum[column] = candidate;
          way[column] = column0;
        }
        if (minimum[column] < delta) {
          delta = minimum[column];
          column1 = column;
        }
      }
      if (!Number.isFinite(delta)) return null;
      for (let column = 0; column <= size; column += 1) {
        if (used[column]) {
          u[p[column]] += delta;
          v[column] -= delta;
        } else {
          minimum[column] -= delta;
        }
      }
      column0 = column1;
    } while (p[column0] !== 0);
    do {
      const column1 = way[column0];
      p[column0] = p[column1];
      column0 = column1;
    } while (column0 !== 0);
  }
  const assignment = Array<number>(size).fill(-1);
  for (let column = 1; column <= size; column += 1) assignment[p[column] - 1] = column - 1;
  const cost = assignment.reduce((total, column, row) => total + matrix[row][column], 0);
  if (cost >= blocked) return null;
  return { assignment, cost };
}

export function matchBubblesToFeatures(
  features: FeatureAnchor[],
  bubbles: BubbleObservation[],
  worldToImage: AffineTransform,
  tolerance: number,
  ambiguityRatio = 0.02,
): BubbleMatch[] {
  if (features.length === 0 || features.length !== bubbles.length) {
    const difference = Math.abs(features.length - bubbles.length);
    const cause = bubbles.length > features.length
      ? `${difference} more bubbles than features, so the detector may have reported a bubble twice or invented one`
      : `${difference} fewer bubbles than features, so the detector may have missed one`;
    throw new Error(`Could not establish a one-to-one bubble match: ${features.length} features, ${bubbles.length} bubbles (${cause})`);
  }
  const projected = features.map((feature) => applyTransform(worldToImage, feature.point));
  const costs = projected.map((point) => bubbles.map((bubble) => {
    const anchor = bubbleAnchor(bubble);
    const distance = Math.hypot(point.x - anchor.x, point.y - anchor.y);
    return distance <= tolerance ? distance : Number.POSITIVE_INFINITY;
  }));
  const best = solveMinimumAssignment(costs);
  if (!best) throw new Error(`Could not establish a one-to-one bubble match within tolerance ${tolerance}`);
  const alternatives = best.assignment.map((column, row) => solveMinimumAssignment(costs, { row, column }))
    .filter((candidate): candidate is { assignment: number[]; cost: number } => candidate !== null);
  const secondBest = alternatives.length === 0 ? Number.POSITIVE_INFINITY : Math.min(...alternatives.map((candidate) => candidate.cost));
  if (Number.isFinite(secondBest) && secondBest - best.cost <= Math.max(1, best.cost * ambiguityRatio)) {
    throw new Error(`Bubble assignment is ambiguous: best cost ${best.cost.toFixed(3)}, alternate cost ${secondBest.toFixed(3)}`);
  }
  return best.assignment.map((column, row) => ({
    feature: features[row],
    bubble: bubbles[column],
    distance: costs[row][column],
  }));
}

export function matchesToNameMappings(matches: BubbleMatch[]): NameMapping[] {
  return matches.map(({ feature, bubble }) => ({
    group: feature.group,
    recordType: feature.recordType,
    from: feature.sourceName,
    to: bubble.number,
  }));
}
