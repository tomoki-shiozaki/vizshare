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

  const [timeColumn, setTimeColumn] = useState("");
  const [entityColumn, setEntityColumn] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);

  const [message, setMessage] = useState<Message>(null);

  const queryClient = useQueryClient();

  // =========================
  // CSVヘッダ取得
  // =========================
  const readCsvHeaders = async (file: File): Promise<string[]> => {
    const text = await file.text();
    const firstLine = text.split(/\r?\n/)[0];
    return firstLine
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
  };

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
  // CSV選択時
  // =========================
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setMessage(null);

    try {
      const h = await readCsvHeaders(selected);
      setHeaders(h);

      // 既存選択リセット
      setTimeColumn("");
      setEntityColumn("");
      setMetrics([]);
    } catch {
      setMessage({
        type: "error",
        text: "CSVヘッダの読み込みに失敗しました",
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
      setMessage({
        type: "error",
        text: "Metric列は1つ以上指定してください",
      });
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

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-6 pt-6">
        {/* CSV説明 */}
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium mb-1">CSVファイルの形式について</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              CSVファイルの<strong>1行目はヘッダ行</strong>
              である必要があります。
            </li>
            <li>CSV選択後、列をプルダウンから選択できます</li>
            <li>Metric列は複数選択できます</li>
          </ul>
          <p className="mt-2">
            例:{" "}
            <code className="rounded bg-white px-1">
              time,entity,sales,profit
            </code>
          </p>
        </div>

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
            {/* Time */}
            <div>
              <Label>Time列（必須）</Label>
              <select
                value={timeColumn}
                onChange={(e) => setTimeColumn(e.target.value)}
                className="block w-full rounded-md border px-3 py-2 text-sm"
                disabled={uploading}
              >
                <option value="">選択してください</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity */}
            <div>
              <Label>Entity列（任意）</Label>
              <select
                value={entityColumn}
                onChange={(e) => setEntityColumn(e.target.value)}
                className="block w-full rounded-md border px-3 py-2 text-sm"
                disabled={uploading}
              >
                <option value="">指定しない</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Metrics */}
            <div>
              <Label>Metric列（複数選択）</Label>
              <div className="space-y-1 border rounded-md p-3">
                {headers.map((h) => (
                  <label key={h} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={metrics.includes(h)}
                      onChange={() => toggleMetric(h)}
                      disabled={uploading}
                    />
                    {h}
                  </label>
                ))}
              </div>
            </div>
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
            className={`text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
