import { basename, dirname, join } from "node:path";
import {
  assertUniqueTargets,
  extractFeatureRecords,
  extractNamedRecords,
  extractProgramGroups,
  readIwp,
  replaceIwpNames,
  writeIwp,
  type NameMapping,
} from "./iwp.ts";
import { ocrBubbles, parseTesseractTsv, type BubbleObservation } from "./ocr.ts";

type Args = {
  iwp?: string;
  image?: string;
  bubbleTsv?: string;
  mapping?: string;
  output?: string;
  group?: string;
  inspect: boolean;
};

function help(): never {
  console.log(`Usage:
  bun run src/cli.ts --inspect --iwp input.iwp
  bun run src/cli.ts --iwp input.iwp --image bubbled.png --mapping mapping.json --output relabeled.iwp
  bun run src/cli.ts --iwp input.iwp --bubble-tsv bubbles.tsv --mapping mapping.json --output relabeled.iwp

The mapping file is a JSON array of {group, recordType, from, to}. The target
labels must be detected in the image or TSV before the IWP is rewritten.`);
  process.exit(0);
}

function parseArgs(argv: string[]): Args {
  const args: Args = { inspect: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--iwp") args.iwp = argv[++index];
    else if (value === "--image") args.image = argv[++index];
    else if (value === "--bubble-tsv") args.bubbleTsv = argv[++index];
    else if (value === "--mapping") args.mapping = argv[++index];
    else if (value === "--output") args.output = argv[++index];
    else if (value === "--group") args.group = argv[++index];
    else if (value === "--inspect") args.inspect = true;
    else if (value === "--help" || value === "-h") help();
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!args.iwp) throw new Error("--iwp is required");
  if (!args.inspect && !args.image && !args.bubbleTsv) {
    throw new Error("--image or --bubble-tsv is required unless --inspect is used");
  }
  if (args.image && args.bubbleTsv) throw new Error("Use either --image or --bubble-tsv, not both");
  return args;
}

async function parseMappings(path: string, group?: string): Promise<NameMapping[]> {
  const parsed = JSON.parse(await Bun.file(path).text());
  if (!Array.isArray(parsed)) throw new Error("Mapping file must contain a JSON array");
  return parsed.map((mapping) => ({ ...mapping, group: mapping.group ?? group }));
}

async function readBubbles(args: Args): Promise<BubbleObservation[]> {
  if (args.image) return ocrBubbles(args.image);
  if (args.bubbleTsv) return parseTesseractTsv(await Bun.file(args.bubbleTsv).text());
  return [];
}

try {
  const args = parseArgs(Bun.argv.slice(2));
  const iwpText = await readIwp(args.iwp!);
  const records = extractNamedRecords(iwpText);
  const features = extractFeatureRecords(iwpText, args.group);

  if (args.inspect) {
    console.log(JSON.stringify({
      iwp: args.iwp,
      programGroups: extractProgramGroups(iwpText),
      namedRecordCount: records.length,
      featureCount: features.length,
      features,
    }, null, 2));
    process.exit(0);
  }

  const bubbles = await readBubbles(args);
  const bubbleNumbers = new Set(bubbles.map((bubble) => bubble.number));
  if (!args.mapping) {
    console.log(JSON.stringify({
      iwp: args.iwp,
      image: args.image,
      bubbleTsv: args.bubbleTsv,
      programGroups: extractProgramGroups(iwpText),
      featureCount: features.length,
      features,
      bubbles,
      next: "Provide a mapping JSON array with {group, recordType, from, to}; target labels must be visible bubbles.",
    }, null, 2));
    process.exit(0);
  }

  const mappings = args.mapping ? await parseMappings(args.mapping, args.group) : [];
  const targetNumbers = new Set<string>();
  for (const mapping of mappings) {
    if (!bubbleNumbers.has(mapping.to)) {
      throw new Error(`Mapping target ${mapping.to} was not detected in the bubbled image`);
    }
    if (targetNumbers.has(mapping.to)) throw new Error(`Bubble label ${mapping.to} is mapped more than once`);
    targetNumbers.add(mapping.to);
  }
  assertUniqueTargets(records, mappings);
  const result = replaceIwpNames(iwpText, mappings);
  if (result.replacements !== mappings.length) {
    throw new Error(`Expected ${mappings.length} replacements but made ${result.replacements}`);
  }
  const output = args.output ?? join(dirname(args.iwp!), `${basename(args.iwp!, ".iwp")}.rewritten.iwp`);
  await writeIwp(output, result.text);
  console.log(JSON.stringify({
    input: args.iwp,
    image: args.image,
    bubbleTsv: args.bubbleTsv,
    output,
    group: args.group,
    replacements: result.replacements,
    detectedBubbles: bubbles.length,
  }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
