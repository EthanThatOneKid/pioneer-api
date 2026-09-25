import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { detectBubblesWithGemini } from "../src/vision.ts";

const imagePath = process.env.PIONEER_FIXTURE_IMAGE ?? join(
  import.meta.dir,
  "../artifacts/six-feature-fixture/03-bubbled-input.png",
);
const outputPath = process.env.PIONEER_GEMINI_OUTPUT ?? join(
  dirname(imagePath),
  "04-gemini-bubbles.json",
);

async function imageSize(path: string): Promise<{ width: number; height: number }> {
  const process = Bun.spawn(["identify", "-format", "%w %h", path], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if (exitCode !== 0) throw new Error(`Could not read image dimensions: ${stderr.trim()}`);
  const [width, height] = stdout.trim().split(/\s+/).map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error(`Invalid dimensions from identify: ${stdout}`);
  return { width, height };
}

const image = await readFile(imagePath);
const result = await detectBubblesWithGemini({
  image,
  mediaType: "image/png",
  imageSize: await imageSize(imagePath),
  apiKey: process.env.PIONEER_GEMINI_API_KEY,
});
await mkdir(dirname(outputPath), { recursive: true });
await Bun.write(outputPath, JSON.stringify({
  imagePath,
  outputPath,
  modelId: result.modelId,
  promptVersion: result.promptVersion,
  usage: result.usage,
  detection: result.detection,
  observations: result.observations,
}, null, 2));
console.log(JSON.stringify({ outputPath, modelId: result.modelId, promptVersion: result.promptVersion, count: result.observations.length, usage: result.usage }, null, 2));
