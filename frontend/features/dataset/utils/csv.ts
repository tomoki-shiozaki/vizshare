export type CsvSample = { headers: string[]; rows: string[][] };

export async function readCsvHeaders(file: File): Promise<CsvSample> {
  const CHUNK_SIZE = 256 * 1024; // 256KB
  const blob = file.slice(0, CHUNK_SIZE);
  const buffer = await blob.arrayBuffer();

  const tryDecode = (encoding: string, fatal = false) =>
    new TextDecoder(encoding, { fatal }).decode(buffer);

  let text: string;
  try {
    text = tryDecode("utf-8", true);
  } catch {
    text = tryDecode("shift_jis");
  }

  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error("CSVが空です");

  const headers = lines[0]
    .replace(/^\uFEFF/, "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  if (headers.length === 0) throw new Error("ヘッダが見つかりません");

  const rows = lines
    .slice(1, 4)
    .map((line) => line.split(",").map((v) => v.trim()));

  return { headers, rows };
}
