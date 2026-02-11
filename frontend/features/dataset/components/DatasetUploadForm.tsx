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

  const [timeColumn, setTimeColumn] = useState("");
  const [entityColumn, setEntityColumn] = useState("");
  const [metricsInput, setMetricsInput] = useState("");

  const [message, setMessage] = useState<Message>(null);

  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadDataset,
    onSuccess: (data) => {
      setMessage({
        type: "success",
        text: `アップロード成功: ID ${data.id}, 名前 ${data.name}`,
      });

      // reset
      setFile(null);
      setTimeColumn("");
      setEntityColumn("");
      setMetricsInput("");

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const parseMetrics = (): string[] =>
    metricsInput
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

  const validate = (): boolean => {
    if (!file) {
      setMessage({ type: "error", text: "ファイルを選択してください" });
      return false;
    }
    if (!timeColumn) {
      setMessage({ type: "error", text: "Time列は必須です" });
      return false;
    }
    const metrics = parseMetrics();
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
        entity: entityColumn || undefined,
        metrics: parseMetrics(),
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
            <li>1行目はヘッダ行である必要があります</li>
            <li>列名はヘッダに記載された名前を入力してください</li>
            <li>Metric列は複数指定できます</li>
          </ul>
          <p className="mt-2">
            例:{" "}
            <code className="rounded bg-white px-1">
              time,entity,sales,profit
            </code>
          </p>
        </div>

        {/* ファイル */}
        <div className="space-y-2">
          <Label>CSVファイル</Label>
          <input
            key={file?.name ?? "empty"}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm"
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              選択中: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* schema */}
        <div className="space-y-2">
          <Label>Time列（必須）</Label>
          <input
            value={timeColumn}
            onChange={(e) => setTimeColumn(e.target.value)}
            placeholder="例: date"
            disabled={uploading}
            className="block w-full rounded-md border px-3 py-2 text-sm"
          />

          <Label>
            Entity列 <span className="text-muted-foreground">(任意)</span>
          </Label>
          <input
            value={entityColumn}
            onChange={(e) => setEntityColumn(e.target.value)}
            placeholder="例: country"
            disabled={uploading}
            className="block w-full rounded-md border px-3 py-2 text-sm"
          />

          <Label>Metric列（複数可・カンマ区切り）</Label>
          <input
            value={metricsInput}
            onChange={(e) => setMetricsInput(e.target.value)}
            placeholder="例: sales, profit, cost"
            disabled={uploading}
            className="block w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {/* ボタン */}
        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={uploading}>
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
