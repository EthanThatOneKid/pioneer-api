export type BubbleObservation = {
  number: string;
  left: number;
  top: number;
  width: number;
  height: number;
  confidence: number;
  anchorX?: number;
  anchorY?: number;
};

export function parseTesseractTsv(tsv: string): BubbleObservation[] {
  const rows = tsv.split(/\r?\n/).slice(1);
  const observations: BubbleObservation[] = [];
  for (const row of rows) {
    if (!row.trim()) continue;
    const fields = row.split("\t");
    if (fields.length < 12) continue;
    const text = fields.slice(11).join(" ").trim();
    if (!/^\d{1,5}$/.test(text)) continue;
    const confidence = Number(fields[10]);
    if (!Number.isFinite(confidence) || confidence < 0) continue;
    observations.push({
      number: text,
      left: Number(fields[6]),
      top: Number(fields[7]),
      width: Number(fields[8]),
      height: Number(fields[9]),
      confidence,
    });
  }
  return observations;
}

export async function ocrBubbles(imagePath: string): Promise<BubbleObservation[]> {
  const process = Bun.spawn(["tesseract", imagePath, "stdout", "--psm", "11", "tsv"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);
  if (exitCode !== 0) {
    const detail = stderr.trim() || "tesseract failed";
    throw new Error(`OCR failed: ${detail}`);
  }
  return parseTesseractTsv(stdout);
}
