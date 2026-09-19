import { describe, expect, test } from "bun:test";
import {
  extractFeatureRecords,
  extractNamedRecords,
  extractProgramGroups,
  replaceIwpNames,
  encodeIwp,
  decodeIwp,
  type NameMapping,
} from "../src/iwp.ts";
import { parseTesseractTsv } from "../src/ocr.ts";

describe("IWP label rewriting", () => {
  const source = "InSpec 1 (Version 2.91.0274)\r\nProg 1 ABC (Name \"Hole group\")\r\nPnt 1 ABC (Name \"17\") (Pnt (1 2 3))\r\nPnt 2 DEF (Name \"18\") (Pnt (4 5 6))\r\n";

  test("decodes and re-encodes UTF-16LE without changing line endings", () => {
    const bytes = encodeIwp(source);
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xfe);
    expect(decodeIwp(bytes)).toBe(source);
  });

  test("extracts program groups and feature records", () => {
    expect(extractProgramGroups(source)).toEqual(["Hole group"]);
    expect(extractFeatureRecords(source, "Hole group").map(({ recordType, name, group }) => ({ recordType, name, group }))).toEqual([
      { recordType: "Pnt", name: "17", group: "Hole group" },
      { recordType: "Pnt", name: "18", group: "Hole group" },
    ]);
  });

  test("rewrites only mapped names while preserving group membership", () => {
    const records = extractNamedRecords(source);
    expect(records.map(({ recordType, name, group }) => ({ recordType, name, group }))).toEqual([
      { recordType: "Prog", name: "Hole group", group: "Hole group" },
      { recordType: "Pnt", name: "17", group: "Hole group" },
      { recordType: "Pnt", name: "18", group: "Hole group" },
    ]);
    const mappings: NameMapping[] = [
      { group: "Hole group", recordType: "Pnt", from: "17", to: "101" },
      { group: "Hole group", recordType: "Pnt", from: "18", to: "102" },
    ];
    const result = replaceIwpNames(source, mappings);
    expect(result.replacements).toBe(2);
    expect(result.text).toContain("(Name \"Hole group\")");
    expect(result.text).toContain("(Name \"101\")");
    expect(result.text).toContain("(Name \"102\")");
    expect(result.text).toContain("\r\n");
  });
});

describe("bubble OCR", () => {
  test("extracts numeric bubble labels and bounding boxes from TSV", () => {
    const tsv = [
      "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext",
      "5\t1\t1\t1\t1\t1\t20\t30\t40\t20\t96.4\t101",
      "5\t1\t1\t1\t2\t1\t80\t90\t40\t20\t91.0\tNote",
      "5\t1\t1\t1\t3\t1\t140\t150\t40\t20\t88.2\t102",
    ].join("\n");
    expect(parseTesseractTsv(tsv)).toEqual([
      { number: "101", left: 20, top: 30, width: 40, height: 20, confidence: 96.4 },
      { number: "102", left: 140, top: 150, width: 40, height: 20, confidence: 88.2 },
    ]);
  });
});
