import { describe, it, expect } from "vitest";
import { readCsvHeaders, suggestColumns } from "@/features/datasets/utils/csv";

describe("readCsvHeaders", () => {
  it("正常なCSVを読み込める", async () => {
    const csvContent = "time,entity,metric1\n2023-01-01,A,10";
    const file = new File([csvContent], "test.csv", { type: "text/csv" });

    const result = await readCsvHeaders(file);

    expect(result.headers).toEqual(["time", "entity", "metric1"]);
    expect(result.rows).toEqual([["2023-01-01", "A", "10"]]);
  });

  it("空ファイルではエラーを投げる", async () => {
    const file = new File([""], "empty.csv", { type: "text/csv" });

    await expect(readCsvHeaders(file)).rejects.toThrow("CSVが空です");
  });

  it("ヘッダが空の場合はエラーを投げる", async () => {
    const file = new File([",,"], "noheader.csv", { type: "text/csv" });

    await expect(readCsvHeaders(file)).rejects.toThrow(
      "ヘッダが見つかりません",
    );
  });
});

describe("suggestColumns", () => {
  it("time, entity, metrics を正しく推定する", () => {
    const headers = ["Date", "Country", "Sales", "Profit"];
    const result = suggestColumns(headers);

    expect(result.suggestedTime).toBe("Date");
    expect(result.suggestedEntity).toBe("Country");
    expect(result.suggestedMetrics).toEqual(["Country", "Sales", "Profit"]);
  });

  it("timeやentityが見つからない場合は空文字を返す", () => {
    const headers = ["foo", "bar", "value"];
    const result = suggestColumns(headers);

    expect(result.suggestedTime).toBe("");
    expect(result.suggestedEntity).toBe("");
    expect(result.suggestedMetrics).toEqual(["value"]);
  });
});
