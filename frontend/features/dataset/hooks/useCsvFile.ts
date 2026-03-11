import { useState, ChangeEvent } from "react";
import { readCsvHeaders, suggestColumns } from "@/features/dataset/utils/csv";

export type CsvState = {
  file: File | null;
  headers: string[];
  sampleRows: string[][];
  timeColumn: string;
  entityColumn: string;
  metrics: string[];
  message: { type: "success" | "error"; text: string } | null;
};

export function useCsvFile() {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [timeColumn, setTimeColumn] = useState("");
  const [entityColumn, setEntityColumn] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);
  const [message, setMessage] = useState<CsvState["message"]>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setMessage(null);

    try {
      const { headers: h, rows } = await readCsvHeaders(selected);
      setHeaders(h);
      setSampleRows(rows);

      const { suggestedTime, suggestedEntity, suggestedMetrics } =
        suggestColumns(h);
      setTimeColumn(suggestedTime);
      setEntityColumn(suggestedEntity);
      setMetrics(suggestedMetrics);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? `CSV読み込み失敗: ${err.message}（例: 空ファイル、カンマ区切りなし、文字コード非対応）`
            : "CSV読み込み失敗: 不明なエラー",
      });
    }
  };

  const toggleMetric = (column: string) => {
    setMetrics((prev) =>
      prev.includes(column)
        ? prev.filter((m) => m !== column)
        : [...prev, column],
    );
  };

  const reset = () => {
    setFile(null);
    setHeaders([]);
    setSampleRows([]);
    setTimeColumn("");
    setEntityColumn("");
    setMetrics([]);
    setMessage(null);
  };

  return {
    file,
    headers,
    sampleRows,
    timeColumn,
    setTimeColumn,
    entityColumn,
    setEntityColumn,
    metrics,
    toggleMetric,
    message,
    setMessage,
    handleFileChange,
    reset,
  };
}
