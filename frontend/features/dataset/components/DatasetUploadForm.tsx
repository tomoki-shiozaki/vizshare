"use client";

import { useState, ChangeEvent } from "react";
import { uploadDataset } from "@/features/dataset/api/uploadDataset";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Message = { type: "success" | "error"; text: string } | null;

export function DatasetUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  // ⭐ CSVヘッダ一覧
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]); // サンプル行
  const [timeColumn, setTimeColumn] = useState("");
  const [entityColumn, setEntityColumn] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);
  const [message, setMessage] = useState<Message>(null);

  const queryClient = useQueryClient();

  // =========================
  // CSVヘッダ＆サンプル取得
  // =========================
  const readCsvHeaders = async (
    file: File,
  ): Promise<{ headers: string[]; rows: string[][] }> => {
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
  };

  // =========================
  // アップロードMutation
  // =========================
  const uploadMutation = useMutation({
    mutationFn: uploadDataset,
    onSuccess: (data) => {
      setMessage({
        type: "success",
        text: `アップロード成功: ID ${data.id}, 名前 ${data.name}`,
      });
      // reset
      setFile(null);
      setHeaders([]);
      setSampleRows([]);
      setTimeColumn("");
      setEntityColumn("");
      setMetrics([]);
      // ⭐ CSV一覧を即更新
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? `アップロード失敗: ${error.message}`
            : "アップロード失敗: 不明なエラー",
      });
    },
  });

  const uploading = uploadMutation.isPending;
  const isValid = !!file && timeColumn.trim() !== "" && metrics.length > 0;

  // =========================
  // ファイル選択
  // =========================
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setMessage(null);

    try {
      const { headers: h, rows } = await readCsvHeaders(selected);
      setHeaders(h);
      setSampleRows(rows);

      // 自動予選択
      const lowerHeaders = h.map((s) => s.toLowerCase());
      const suggestedTime =
        h[
          lowerHeaders.findIndex(
            (s) => s.includes("time") || s.includes("date"),
          )
        ] || "";

      const entityKeywords = [
        "entity",
        "country",
        "product",
        "name",
        "category",
      ];
      const suggestedEntity =
        h[
          lowerHeaders.findIndex((s) =>
            entityKeywords.some((kw) => s.includes(kw)),
          )
        ] || "";

      const metricKeywords = ["value", "sales", "profit", "amount", "count"];
      const suggestedMetrics = h.filter((s) =>
        metricKeywords.some((kw) => s.toLowerCase().includes(kw)),
      );

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

  // =========================
  // metric toggle
  // =========================
  const toggleMetric = (column: string) => {
    setMetrics((prev) =>
      prev.includes(column)
        ? prev.filter((m) => m !== column)
        : [...prev, column],
    );
  };

  // =========================
  // validation
  // =========================
  const validate = (): boolean => {
    if (!file) {
      setMessage({ type: "error", text: "ファイルを選択してください" });
      return false;
    }
    if (!timeColumn.trim()) {
      setMessage({ type: "error", text: "Time列は必須です" });
      return false;
    }
    if (metrics.length === 0) {
      setMessage({ type: "error", text: "Metric列は1つ以上指定してください" });
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    if (!validate()) return;
    if (!file) return; // 念のためのガード
    setMessage(null);

    uploadMutation.mutate({
      file,
      schema: {
        time: timeColumn,
        ...(entityColumn && { entity: entityColumn }),
        metrics,
      },
    });
  };

  const downloadSampleCsv = () => {
    const csvContent = `time,entity,sales,profit
2024-01-01,Japan,100,20
2024-01-02,Japan,120,25
2024-01-03,Japan,115,23
2024-01-04,Japan,130,30
2024-01-05,Japan,140,35
2024-01-06,Japan,135,32
2024-01-07,Japan,150,40
2024-01-08,Japan,160,42
2024-01-09,Japan,155,38
2024-01-10,Japan,170,45
2024-01-01,USA,80,15
2024-01-02,USA,95,18
2024-01-03,USA,90,16
2024-01-04,USA,105,22
2024-01-05,USA,110,24
2024-01-06,USA,108,23
2024-01-07,USA,120,28
2024-01-08,USA,125,30
2024-01-09,USA,118,27
2024-01-10,USA,130,32`;

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_dataset.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-6 pt-6">
        {/* CSV説明 */}
        <details className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <summary className="cursor-pointer font-medium select-none">
            CSVファイルの形式について
            <span className="ml-2 text-xs text-gray-500">
              （クリックで詳細）
            </span>
          </summary>

          <div className="mt-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                CSVファイルの<strong>1行目はヘッダ行</strong>
                である必要があります。
              </li>

              <li>
                CSV選択後、各列の役割（Time / Entity / Metric）を選択します。
              </li>

              <li>
                <strong>Time列（必須）</strong>： 時間・日付を表す列です（例:
                2024-01-01, 2024/01/01 12:00）。 グラフの横軸になります。
              </li>

              <li>
                <strong>Entity列（任意）</strong>：
                データの分類・対象を表す列です（例：国、商品名など）。
                指定しない場合はすべてのデータが1つの系列として扱われます。
              </li>

              <li>
                <strong>Metric列（必須・複数可）</strong>：
                数値データの列です。グラフの縦軸（値）になります。
              </li>
            </ul>

            <p className="mt-2 font-medium">例:</p>
            <pre className="bg-white p-2 rounded text-xs mt-1">
              {`time,entity,sales,profit
2024-01-01,Japan,100,20`}
            </pre>

            <p className="mt-3 text-sm">
              詳細なCSV仕様は
              <a
                href="/docs/csv-format"
                className="underline ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                こちら
              </a>
              を参照してください。
            </p>

            <button
              type="button"
              onClick={downloadSampleCsv}
              className="mt-2 text-sm underline text-blue-700 hover:text-blue-900"
            >
              サンプルCSVをダウンロード
            </button>
          </div>
        </details>

        {/* ファイル選択 */}
        <div className="space-y-2">
          <Label htmlFor="dataset-file">CSVファイル</Label>
          <input
            id="dataset-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="
                block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:cursor-not-allowed disabled:opacity-60
              "
            disabled={uploading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              選択中: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* schema（CSV選択後のみ表示） */}
        {headers.length > 0 && (
          <div className="space-y-4">
            {/* Time列 */}
            <div>
              <Label htmlFor="time-column">Time列（必須）</Label>
              <select
                id="time-column"
                value={timeColumn}
                onChange={(e) => setTimeColumn(e.target.value)}
                className="block w-full rounded-md border px-3 py-2 text-sm"
                disabled={uploading}
              >
                <option value="">選択してください</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}{" "}
                    {sampleRows.length > 0
                      ? `(例: ${sampleRows[0][headers.indexOf(h)] || ""})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity列 */}
            <div>
              <Label htmlFor="entity-column">Entity列（任意）</Label>
              <select
                id="entity-column"
                value={entityColumn}
                onChange={(e) => setEntityColumn(e.target.value)}
                className="block w-full rounded-md border px-3 py-2 text-sm"
                disabled={uploading}
              >
                <option value="">指定しない</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}{" "}
                    {sampleRows.length > 0
                      ? `(例: ${sampleRows[0][headers.indexOf(h)] || ""})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Metrics列 */}
            <div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  Metric列（複数選択）
                </legend>
                <div className="space-y-1 border rounded-md p-3">
                  {headers.map((h) => (
                    <label key={h} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={metrics.includes(h)}
                        onChange={() => toggleMetric(h)}
                        disabled={uploading}
                      />
                      {h}{" "}
                      {sampleRows.length > 0
                        ? `(例: ${sampleRows[0][headers.indexOf(h)] || ""})`
                        : ""}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* サンプルプレビュー */}
            {sampleRows.length > 0 && (
              <div className="text-sm border p-2 rounded">
                <p className="font-medium mb-1">CSVサンプル行</p>
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="border px-1 py-0.5 bg-gray-100">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((h, i) => (
                          <td key={i} className="border px-1 py-0.5">
                            {row[i] || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ボタン */}
        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={uploading || !isValid}>
            {uploading ? "アップロード中..." : "アップロード"}
          </Button>
        </div>

        {/* メッセージ */}
        {message && (
          <p
            className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
