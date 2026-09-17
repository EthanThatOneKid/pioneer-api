export type NamedRecord = {
  recordType: string;
  name: string;
  group?: string;
  start: number;
  end: number;
};

export type NameMapping = {
  group?: string;
  recordType?: string;
  from: string;
  to: string;
};

export const FEATURE_RECORD_TYPES = new Set([
  "Pnt",
  "Lin",
  "Crc",
  "Arc",
  "Elp",
  "Rec",
  "Pln",
  "Dst",
  "Gap",
  "Slt",
  "Ang",
  "CSpl",
  "ORn",
  "OSpl",
  "Sph",
  "Cyl",
  "Con",
  "Sys",
]);

function decodeUtf16Le(bytes: Uint8Array): string {
  const usable = bytes.byteLength % 2 === 0 ? bytes : bytes.slice(0, -1);
  const chars = new Uint16Array(usable.byteLength / 2);
  for (let index = 0; index < chars.length; index += 1) {
    chars[index] = usable[index * 2] | (usable[index * 2 + 1] << 8);
  }
  const chunks: string[] = [];
  for (let index = 0; index < chars.length; index += 8192) {
    chunks.push(String.fromCharCode(...chars.slice(index, index + 8192)));
  }
  return chunks.join("");
}

function encodeUtf16Le(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length * 2);
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    bytes[index * 2] = code & 0xff;
    bytes[index * 2 + 1] = code >> 8;
  }
  return bytes;
}

export function decodeIwp(bytes: Uint8Array): string {
  if (bytes.length < 2 || bytes[0] !== 0xff || bytes[1] !== 0xfe) {
    throw new Error("Expected a UTF-16 little-endian IWP file with a BOM");
  }
  return decodeUtf16Le(bytes.slice(2));
}

export function encodeIwp(text: string): Uint8Array {
  const body = encodeUtf16Le(text);
  const bytes = new Uint8Array(body.length + 2);
  bytes[0] = 0xff;
  bytes[1] = 0xfe;
  bytes.set(body, 2);
  return bytes;
}

export async function readIwp(path: string): Promise<string> {
  return decodeIwp(new Uint8Array(await Bun.file(path).arrayBuffer()));
}

export async function writeIwp(path: string, text: string): Promise<void> {
  await Bun.write(path, encodeIwp(text));
}

function recordTypeBefore(text: string, offset: number): string {
  const prefix = text.slice(Math.max(0, offset - 320), offset);
  const commandMatches = [...prefix.matchAll(/(?:^|[\r\n(])([A-Za-z][A-Za-z0-9]*)\s+(?:\d+\s+)?[^()]*$/g)];
  return commandMatches.at(-1)?.[1] ?? "Unknown";
}

export function extractNamedRecords(text: string): NamedRecord[] {
  const records: NamedRecord[] = [];
  const namePattern = /\(Name\s+"((?:[^"\\]|\\.)*)"\)/g;
  let currentGroup: string | undefined;
  let match: RegExpExecArray | null;
  while ((match = namePattern.exec(text))) {
    const recordType = recordTypeBefore(text, match.index);
    const name = match[1];
    if (recordType === "Prog") currentGroup = name;
    records.push({
      recordType,
      name,
      group: currentGroup,
      start: match.index,
      end: namePattern.lastIndex,
    });
  }
  return records;
}

export function extractProgramGroups(text: string): string[] {
  return extractNamedRecords(text)
    .filter((record) => record.recordType === "Prog")
    .map((record) => record.name);
}

export function extractFeatureRecords(text: string, group?: string): NamedRecord[] {
  return extractNamedRecords(text).filter((record) => {
    if (!FEATURE_RECORD_TYPES.has(record.recordType)) return false;
    return group === undefined || record.group === group;
  });
}

function mappingMatches(record: NamedRecord, mapping: NameMapping): boolean {
  return record.name === mapping.from
    && (!mapping.recordType || record.recordType === mapping.recordType)
    && (mapping.group === undefined || record.group === mapping.group);
}

export function assertUniqueTargets(records: NamedRecord[], mappings: NameMapping[]): void {
  const targets = new Set<string>();
  for (const mapping of mappings) {
    const targetKey = [mapping.group ?? "", mapping.recordType ?? "", mapping.to].join(":");
    if (targets.has(targetKey)) throw new Error(`Duplicate target label ${targetKey}`);
    targets.add(targetKey);
    const matches = records.filter((record) => mappingMatches(record, mapping));
    if (matches.length === 0) {
      throw new Error(`No named IWP record matches ${mapping.group ? `${mapping.group}/` : ""}${mapping.recordType ? `${mapping.recordType}:` : ""}${mapping.from}`);
    }
    if (matches.length > 1) {
      throw new Error(`Mapping ${mapping.from} matches ${matches.length} IWP records; add group and recordType constraints`);
    }
  }
}

export function replaceIwpNames(text: string, mappings: NameMapping[]): { text: string; replacements: number } {
  const records = extractNamedRecords(text);
  let replacements = 0;
  const namePattern = /\(Name\s+"((?:[^"\\]|\\.)*)"\)/g;
  const rewritten = text.replace(namePattern, (full, name: string, offset: number) => {
    const record = records.find((candidate) => candidate.start === offset);
    if (!record) return full;
    const mapping = mappings.find((candidate) => mappingMatches({ ...record, name }, candidate));
    if (!mapping) return full;
    replacements += 1;
    return full.replace(`"${name}"`, `"${mapping.to}"`);
  });
  return { text: rewritten, replacements };
}
