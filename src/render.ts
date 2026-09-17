import type { FeatureAnchor, AffineTransform } from "./geometry.ts";
import { applyTransform } from "./geometry.ts";

const numberPattern = "[-+]?\\d+(?:\\.\\d+)?(?:[eE][-+]?\\d+)?";
const pointPattern = new RegExp(
  `^Pnt\\s+\\S+\\s+\\S+\\s+\\(Name\\s+\"((?:[^\"\\\\]|\\\\.)*)\"\\).*?\\(Pnt\\s+\\((${numberPattern})\\s+(${numberPattern})\\s+(${numberPattern})\\)\\)`,
  "gm",
);

export function extractPointAnchors(text: string, group?: string): FeatureAnchor[] {
  const anchors: FeatureAnchor[] = [];
  let match: RegExpExecArray | null;
  while ((match = pointPattern.exec(text))) {
    anchors.push({
      recordType: "Pnt",
      sourceName: match[1],
      group,
      point: { x: Number(match[2]), y: Number(match[3]) },
    });
  }
  return anchors;
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;");
}

export function renderIwpSvg(
  features: FeatureAnchor[],
  worldToImage: AffineTransform,
  width: number,
  height: number,
  labels = false,
): string {
  const body = features.map((feature) => {
    const point = applyTransform(worldToImage, feature.point);
    const label = labels
      ? `<text x="${point.x + 8}" y="${point.y - 8}" font-family="monospace" font-size="14">${escapeXml(feature.sourceName)}</text>`
      : "";
    return `<g data-record-type="${escapeXml(feature.recordType)}" data-source-name="${escapeXml(feature.sourceName)}"><circle cx="${point.x}" cy="${point.y}" r="5" fill="#111827"/><path d="M ${point.x - 10} ${point.y} H ${point.x + 10} M ${point.x} ${point.y - 10} V ${point.y + 10}" stroke="#111827" stroke-width="2"/>${label}</g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/>${body}</svg>`;
}

export function renderBubbledSvg(
  features: FeatureAnchor[],
  worldToImage: AffineTransform,
  bubbles: Array<{ number: string; feature: FeatureAnchor }>,
  width: number,
  height: number,
): string {
  const source = renderIwpSvg(features, worldToImage, width, height);
  const overlay = bubbles.map(({ number, feature }) => {
    const point = applyTransform(worldToImage, feature.point);
    const radius = 18;
    return `<g data-bubble-number="${escapeXml(number)}"><circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="#fff7ed" stroke="#c2410c" stroke-width="3"/><text x="${point.x}" y="${point.y + 6}" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#9a3412">${escapeXml(number)}</text></g>`;
  }).join("");
  return source.replace("</svg>", `${overlay}</svg>`);
}
