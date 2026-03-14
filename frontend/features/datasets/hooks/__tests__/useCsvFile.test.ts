import { renderHook, act } from "@testing-library/react";
import { useCsvFile } from "@/features/datasets/hooks/useCsvFile";
import { readCsvHeaders, suggestColumns } from "@/features/datasets/utils/csv";
import { ChangeEvent } from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// =======================
// モジュールモック
// =======================
vi.mock("@/features/dataset/utils/csv", () => ({
  readCsvHeaders: vi.fn(),
  suggestColumns: vi.fn(),
}));

// 型安全なモック取得
const mockReadCsvHeaders = vi.mocked(readCsvHeaders);
const mockSuggestColumns = vi.mocked(suggestColumns);

describe("useCsvFile", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // suggestColumns はテスト中は固定値を返す
    mockSuggestColumns.mockImplementation(() => ({
      suggestedTime: "time",
      suggestedEntity: "entity",
      suggestedMetrics: ["metric1", "metric2"],
    }));
  });

  it("CSV読み込み成功時に状態が更新される", async () => {
    const mockFile = new File(["a,b,c,d\n1,2,3,4"], "test.csv", {
      type: "text/csv",
    });

    // readCsvHeaders はヘッダーとサンプル行を返す
    mockReadCsvHeaders.mockResolvedValue({
      headers: ["time", "entity", "metric1", "metric2"],
      rows: [["2023-01-01", "A", "10", "20"]],
    });

    const { result } = renderHook(() => useCsvFile());

    // 型安全な input 作成
    const input = document.createElement("input");
    Object.defineProperty(input, "files", {
      value: [mockFile],
      writable: false,
    });

    const event = { target: input } as ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleFileChange(event);
    });

    expect(result.current.file).toBe(mockFile);
    expect(result.current.headers).toEqual([
      "time",
      "entity",
      "metric1",
      "metric2",
    ]);
    expect(result.current.sampleRows).toEqual([
      ["2023-01-01", "A", "10", "20"],
    ]);
    expect(result.current.timeColumn).toBe("time");
    expect(result.current.entityColumn).toBe("entity");
    expect(result.current.metrics).toEqual(["metric1", "metric2"]);
  });

  it("CSV読み込み失敗時にエラーメッセージが設定される", async () => {
    const mockFile = new File([""], "empty.csv", { type: "text/csv" });

    mockReadCsvHeaders.mockRejectedValue(new Error("空ファイル"));

    const { result } = renderHook(() => useCsvFile());

    const input = document.createElement("input");
    Object.defineProperty(input, "files", {
      value: [mockFile],
      writable: false,
    });

    const event = { target: input } as ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleFileChange(event);
    });

    expect(result.current.message).toEqual({
      type: "error",
      text: "CSV読み込み失敗: 空ファイル（例: 空ファイル、カンマ区切りなし、文字コード非対応）",
    });
  });

  it("toggleMetric が正しく動作する", () => {
    const { result } = renderHook(() => useCsvFile());

    act(() => result.current.toggleMetric("metric1"));
    expect(result.current.metrics).toContain("metric1");

    act(() => result.current.toggleMetric("metric1"));
    expect(result.current.metrics).not.toContain("metric1");
  });

  it("reset が状態を初期化する", () => {
    const { result } = renderHook(() => useCsvFile());

    act(() => {
      result.current.setTimeColumn("time");
      result.current.toggleMetric("metric1");
      result.current.reset();
    });

    expect(result.current.timeColumn).toBe("");
    expect(result.current.metrics).toEqual([]);
    expect(result.current.file).toBeNull();
    expect(result.current.headers).toEqual([]);
    expect(result.current.sampleRows).toEqual([]);
  });
});
