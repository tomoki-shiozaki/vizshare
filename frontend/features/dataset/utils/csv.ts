export type CsvSample = { headers: string[]; rows: string[][] };

// =========================
// CSVヘッダ＆サンプル取得
// =========================
export async function readCsvHeaders(file: File): Promise<CsvSample> {
  const CHUNK_SIZE = 256 * 1024; // 256KB
  const blob = file.slice(0, CHUNK_SIZE);
  const buffer = await blob.arrayBuffer();

  // UTF-8 → Shift_JIS の順で試す
  const tryDecode = (encoding: string, fatal = false) =>
    new TextDecoder(encoding, { fatal }).decode(buffer);

  let text: string;

  try {
    // ① UTF-8（壊れてたら例外）
    text = tryDecode("utf-8", true);
  } catch {
    // ② 日本CSV想定 → Shift_JIS
    text = tryDecode("shift_jis");
  }
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error("CSVが空です");

  const headers = lines[0]
    .replace(/^\uFEFF/, "") // BOM除去
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  if (headers.length === 0) throw new Error("ヘッダが見つかりません");

  const rows = lines
    .slice(1, 4)
    .map((line) => line.split(",").map((v) => v.trim())); // 先頭3行をサンプル
  return { headers, rows };
}

export function suggestColumns(headers: string[]): {
  suggestedTime: string;
  suggestedEntity: string;
  suggestedMetrics: string[];
} {
  const lowerHeaders = headers.map((h) => h.toLowerCase());

  const timeIndex = lowerHeaders.findIndex(
    (s) => s.includes("time") || s.includes("date"),
  );
  const suggestedTime = timeIndex >= 0 ? headers[timeIndex] : "";

  const entityKeywords = ["entity", "country", "product", "name", "category"];
  const entityIndex = lowerHeaders.findIndex((h) =>
    entityKeywords.some((kw) => h.includes(kw)),
  );
  const suggestedEntity = entityIndex >= 0 ? headers[entityIndex] : "";

  const metricKeywords = ["value", "sales", "profit", "amount", "count"];
  const suggestedMetrics = headers.filter((h) =>
    metricKeywords.some((kw) => h.toLowerCase().includes(kw)),
  );

  return { suggestedTime, suggestedEntity, suggestedMetrics };
}
