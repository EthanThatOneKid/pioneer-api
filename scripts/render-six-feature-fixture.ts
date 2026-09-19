import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { encodeIwp } from "../src/iwp.ts";
import { applyTransform, fitViewport, normalizeFeatureAnchors, type AffineTransform, type FeatureAnchor } from "../src/geometry.ts";

type RawFeature = readonly [string, number, number];
type Bubble = { number: string; feature: FeatureAnchor; anchor: { x: number; y: number }; center: { x: number; y: number } };

const output = join(process.cwd(), "artifacts/six-feature-fixture");
const width = 1200;
const height = 800;
const raw: RawFeature[] = [
  ["A17", 0.4, 0.4],
  ["A18", 1.2, 0.4],
  ["A19", 2.0, 0.4],
  ["A20", 0.4, 1.2],
  ["A21", 1.2, 1.2],
  ["A22", 2.0, 1.2],
];
const numbers = ["705", "102", "991", "314", "808", "127"];
const features = normalizeFeatureAnchors(raw.map(([sourceName, x, y]) => ({ recordType: "Pnt", sourceName, point: { x, y } })), "in");
const transform = fitViewport(features, width, height, 160);
const bubbles: Bubble[] = features.map((feature, index) => {
  const anchor = applyTransform(transform, feature.point);
  const offset = { x: index % 2 === 0 ? 52 : -52, y: index < 3 ? -42 : 42 };
  return { number: numbers[index], feature, anchor, center: { x: anchor.x + offset.x, y: anchor.y + offset.y } };
});

function esc(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;");
}

function frame(title: string, body: string, legend: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#f8fafc"/><text x="40" y="52" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="#0f172a">${esc(title)}</text><text x="40" y="82" font-family="Arial,sans-serif" font-size="15" fill="#475569">${esc(legend)}</text><rect x="40" y="110" width="${width - 80}" height="${height - 150}" fill="white" stroke="#cbd5e1" stroke-width="2"/>${body}</svg>`;
}

function axes(transform: AffineTransform): string {
  return `<path d="M 80 ${transform.f} H ${width - 80} M ${transform.e} 130 V ${height - 70}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="5 5"/><text x="${width - 100}" y="${transform.f - 8}" font-family="monospace" font-size="13" fill="#64748b">image x</text><text x="${transform.e + 8}" y="145" font-family="monospace" font-size="13" fill="#64748b">image y</text>`;
}

function pointMark(point: { x: number; y: number }, color: string, radius = 7): string {
  return `<circle cx="${point.x}" cy="${point.y}" r="${radius}" fill="${color}"/><path d="M ${point.x - 14} ${point.y} H ${point.x + 14} M ${point.x} ${point.y - 14} V ${point.y + 14}" stroke="${color}" stroke-width="2"/>`;
}

function sourceMarks(label: "source" | "final"): string {
  return features.map((feature, index) => {
    const point = applyTransform(transform, feature.point);
    const color = label === "source" ? "#2563eb" : "#15803d";
    const text = label === "source" ? feature.sourceName : `${feature.sourceName} → ${numbers[index]}`;
    return `${pointMark(point, color)}<text x="${point.x + 16}" y="${point.y - 12}" font-family="monospace" font-size="16" font-weight="700" fill="${color}">${esc(text)}</text>`;
  }).join("");
}

function bubbleMarks(): string {
  return bubbles.map((bubble) => `<g data-bubble-number="${bubble.number}"><path d="M ${bubble.anchor.x} ${bubble.anchor.y} L ${bubble.center.x} ${bubble.center.y}" stroke="#c2410c" stroke-width="2" stroke-dasharray="5 4"/><circle cx="${bubble.center.x}" cy="${bubble.center.y}" r="24" fill="#fff7ed" stroke="#c2410c" stroke-width="3"/><text x="${bubble.center.x}" y="${bubble.center.y + 7}" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#9a3412">${bubble.number}</text></g>`).join("");
}

function matchingLines(): string {
  return bubbles.map((bubble, index) => `<path d="M ${bubble.anchor.x} ${bubble.anchor.y} L ${bubble.center.x} ${bubble.center.y}" stroke="#7c3aed" stroke-width="3" stroke-dasharray="8 5"/><text x="${bubble.center.x + 30}" y="${bubble.center.y - 26}" font-family="monospace" font-size="15" fill="#6d28d9">${esc(features[index].sourceName)} → ${bubble.number}</text>`).join("");
}

function sourceCoordinates(): string {
  const minX = Math.min(...features.map((feature) => feature.point.x));
  const minY = Math.min(...features.map((feature) => feature.point.y));
  const scale = 8;
  return features.map((feature) => {
    const x = 180 + (feature.point.x - minX) * scale;
    const y = 680 - (feature.point.y - minY) * scale;
    return `${pointMark({ x, y }, "#2563eb")}<text x="${x + 16}" y="${y - 12}" font-family="monospace" font-size="17" fill="#2563eb">${esc(feature.sourceName)} (${feature.point.x.toFixed(1)}mm, ${feature.point.y.toFixed(1)}mm)</text>`;
  }).join("");
}

const sourceText = ["InSpec 1 (Version 2.91.0274)", "Programs 1", "Instructions 6", ...raw.map(([name, x, y], index) => `Pnt ${index + 1} F${index + 1} (Name \"${name}\") (Pnt (${x} ${y} 0))`), ""].join("\r\n");
const svgs: Record<string, string> = {
  "01-source-canonical.svg": frame("Layer 1 — canonical IWP geometry", sourceCoordinates(), "Six source features after inch → millimetre normalization; blue labels are arbitrary IWP names."),
  "02-rendered-source.svg": frame("Layer 2 — deterministic renderer", `${axes(transform)}${sourceMarks("source")}`, "The renderer places canonical feature anchors into a 1200×800 image coordinate system."),
  "03-bubbled-input.svg": frame("Layer 3 — bubbled input image", `${axes(transform)}${features.map((feature) => pointMark(applyTransform(transform, feature.point), "#111827")).join("")}${bubbleMarks()}`, "Orange numbers intentionally do not match the blue IWP names; leaders terminate at source anchors."),
  "04-registration-matches.svg": frame("Layer 4 — geometric matching", `${axes(transform)}${sourceMarks("source")}${bubbleMarks()}${matchingLines()}`, "Purple lines show source-anchor to bubble correspondence; observations may arrive in any order."),
  "05-final-relabeled-iwp.svg": frame("Layer 5 — output IWP labels", `${axes(transform)}${sourceMarks("final")}`, "Green labels are the new IWP names written from the matched bubble numbers."),
};

await mkdir(output, { recursive: true });
await Bun.write(join(output, "fixture.iwp"), encodeIwp(sourceText));
await Bun.write(join(output, "mapping.json"), JSON.stringify(numbers.map((to, index) => ({ recordType: "Pnt", from: raw[index][0], to })), null, 2));
await Bun.write(join(output, "transform.json"), JSON.stringify(transform, null, 2));
for (const [name, svg] of Object.entries(svgs)) await Bun.write(join(output, name), svg);
console.log(output);
