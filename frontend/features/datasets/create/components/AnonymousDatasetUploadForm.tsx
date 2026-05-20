"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { CsvSchemaSelector } from "@/features/datasets/create/components/CsvSchemaSelector";

import { useCsvFile } from "@/features/datasets/create/hooks/useCsvFile";

import { uploadAnonymousDataset } from "@/features/datasets/create/api/uploadDataset";

export function AnonymousDatasetUploadForm() {
  const router = useRouter();

  const {
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
  } = useCsvFile();

  const uploadMutation = useMutation({
    mutationFn: uploadAnonymousDataset,

    onSuccess: (data) => {
      reset();

      setMessage({
        type: "success",
        text: `アップロード成功: ${data.name}`,
      });

      router.push(`/datasets/anonymous/${data.public_id}`);
    },

    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "不明なエラー";

      setMessage({
        type: "error",
        text: `アップロード失敗: ${message}`,
      });
    },
  });

  const uploading = uploadMutation.isPending;

  const isValid = !!file && timeColumn.trim() !== "" && metrics.length > 0;

  const validate = (): boolean => {
    if (!file) {
      setMessage({
        type: "error",
        text: "ファイルを選択してください",
      });

      return false;
    }

    if (!timeColumn.trim()) {
      setMessage({
        type: "error",
        text: "Time列は必須です",
      });

      return false;
    }

    if (metrics.length === 0) {
      setMessage({
        type: "error",
        text: "Metric列を1つ以上選択してください",
      });

      return false;
    }

    return true;
  };

  const handleUpload = () => {
    if (!validate()) return;
    if (!file) return;

    setMessage(null);

    uploadMutation.mutate({
      file,
      schema: {
        time: timeColumn,
        ...(entityColumn && {
          entity: entityColumn,
        }),
        metrics,
      },
    });
  };

  return (
    <Card className="w-full border-blue-200">
      <CardContent className="space-y-6 pt-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            CSVをアップロードして グラフを作成
          </h2>

          <p className="text-sm text-muted-foreground">
            ログイン不要で試せます。 CSVをアップロードすると、
            自動でグラフ化されます。
          </p>
        </div>

        {/* File input */}
        <div className="space-y-2">
          <Label htmlFor="anonymous-dataset-file">CSVファイル</Label>

          <input
            id="anonymous-dataset-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="
              block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:cursor-not-allowed disabled:opacity-60
            "
          />

          {file && (
            <p className="text-sm text-muted-foreground">
              選択中:
              <span className="ml-1 font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* Schema selector */}
        {headers.length > 0 && (
          <CsvSchemaSelector
            headers={headers}
            sampleRows={sampleRows}
            timeColumn={timeColumn}
            setTimeColumn={setTimeColumn}
            entityColumn={entityColumn}
            setEntityColumn={setEntityColumn}
            metrics={metrics}
            toggleMetric={toggleMetric}
            disabled={uploading}
          />
        )}

        {/* Upload button */}
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={uploading || !isValid}
        >
          {uploading ? "アップロード中..." : "CSVをアップロード"}
        </Button>

        {/* Message */}
        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Footer */}
        <div className="border-t pt-4 text-xs text-muted-foreground space-y-2">
          <p>サンプルCSVで試したい場合は、 CSV仕様ページを参照してください。</p>

          <Link href="/docs/csv-format" className="underline">
            CSVフォーマットを見る
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
