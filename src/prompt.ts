import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const guidancePath = join(dirname(fileURLToPath(import.meta.url)), "prompts", "iwp-bubble-detector.md");

function readPromptFile(): string {
  return readFileSync(guidancePath, "utf8");
}

function parsePromptFile(source: string): { version: string; guidance: string } {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source.replace(/\r\n/g, "\n"));
  if (!match) throw new Error(`Detector prompt file is missing its frontmatter: ${guidancePath}`);
  const versionLine = match[1].split("\n").find((line) => line.startsWith("version:"));
  const version = versionLine?.slice("version:".length).trim();
  if (!version) throw new Error(`Detector prompt file is missing a version: ${guidancePath}`);
  const guidance = match[2].trim();
  if (!guidance) throw new Error(`Detector prompt file has no guidance below its frontmatter: ${guidancePath}`);
  return { version, guidance };
}

const promptFile = parsePromptFile(readPromptFile());

export const DETECTOR_PROMPT_VERSION = `iwp-bubble-detector/${promptFile.version}`;

export const DETECTOR_PROMPT_GUIDANCE = promptFile.guidance;

export const DETECTOR_PROMPT_PATH = guidancePath;

export function buildBubbleDetectionPrompt(options: { expectedCount?: number } = {}): string {
  const guidance = DETECTOR_PROMPT_GUIDANCE.split("\n").filter((line) => line.trim().length > 0);
  if (options.expectedCount !== undefined) {
    guidance.splice(1, 0, `This drawing is expected to carry about ${options.expectedCount} bubbles; treat that as a hint, not a target.`);
  }
  return guidance.join(" ");
}
