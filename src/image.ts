export type RasterMediaType = "image/png" | "image/jpeg" | "image/webp";

function readUint32(bytes: Uint8Array, offset: number): number {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, false);
}

export function readRasterSize(bytes: Uint8Array, mediaType: RasterMediaType): { width: number; height: number } {
  if (mediaType === "image/png" && bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { width: readUint32(bytes, 16), height: readUint32(bytes, 20) };
  }
  if (mediaType === "image/webp" && bytes.length >= 30 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") {
    const kind = new TextDecoder().decode(bytes.slice(12, 16));
    if (kind === "VP8X") return { width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16), height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16) };
  }
  if (mediaType === "image/jpeg") {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      if (marker >= 0xc0 && marker <= 0xc3) return { height: (bytes[offset + 5] << 8) | bytes[offset + 6], width: (bytes[offset + 7] << 8) | bytes[offset + 8] };
      if (length < 2) break;
      offset += 2 + length;
    }
  }
  throw new Error("Could not read raster dimensions; use a valid PNG, JPEG, or WebP image");
}
