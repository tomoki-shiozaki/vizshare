"use client";

import { useState } from "react";
import { apiClient } from "@/features/auth/api/apiClient";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function DatasetPage() {
  const [file, setFile] = useState<File | null>(null);
  const [timeColumn, setTimeColumn] = useState(""); // schema: time列
  const [valueColumn, setValueColumn] = useState(""); // schema: value列
  const [seriesColumn, setSeriesColumn] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("ファイルを選択してください");
      return;
    }
    if (!timeColumn || !valueColumn) {
      setMessage("Time列とValue列を入力してください");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("source_file", file);

      // schema を JSON 文字列で送信（series は任意）
      const schema: Record<string, string> = {
        time: timeColumn,
        value: valueColumn,
      };

      if (seriesColumn) {
        schema.series = seriesColumn;
      }

      formData.append("schema", JSON.stringify(schema));

      const res = await apiClient.post("/dataset/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(`アップロード成功: ID ${res.data.id}, 名前 ${res.data.name}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`アップロード失敗: ${error.message}`);
      } else {
        setMessage("アップロード失敗: 不明なエラー");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageLayout
      title="データセットアップロード"
      description="CSV ファイルを選択してアップロードしてください"
    >
      <Card className="max-w-xl">
        <CardContent className="space-y-6 pt-6">
          {/* CSV形式の説明 */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-medium mb-1">CSVファイルの形式について</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                CSVファイルの<strong>1行目はヘッダ行</strong>
                である必要があります。
              </li>
              <li>
                <strong>Time列</strong>・<strong>Value列</strong>には、
                ヘッダ行に記載されている列名を入力してください。
              </li>
              <li>
                指定した列名がCSVに存在しない場合、アップロードは失敗します。
              </li>
            </ul>
            <p className="mt-2">
              例:{" "}
              <code className="rounded bg-white px-1">time,value,series</code>
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

          {/* schema入力フォーム */}
          <div className="space-y-2">
            <Label htmlFor="time-column">Time列</Label>
            <input
              id="time-column"
              type="text"
              value={timeColumn}
              onChange={(e) => setTimeColumn(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="例: timestamp"
              disabled={uploading}
            />

            <Label htmlFor="value-column">Value列</Label>
            <input
              id="value-column"
              type="text"
              value={valueColumn}
              onChange={(e) => setValueColumn(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="例: value"
              disabled={uploading}
            />

            <Label htmlFor="series-column">
              Series列 <span className="text-muted-foreground">(任意)</span>
            </Label>
            <input
              id="series-column"
              type="text"
              value={seriesColumn}
              onChange={(e) => setSeriesColumn(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="例: Country.Code"
              disabled={uploading}
            />
          </div>

          {/* アップロードボタン */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading || !file || !timeColumn || !valueColumn}
            >
              {uploading ? "アップロード中..." : "アップロード"}
            </Button>
          </div>

          {/* メッセージ */}
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
