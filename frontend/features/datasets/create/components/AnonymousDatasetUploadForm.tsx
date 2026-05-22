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

  // =========================
  // Validation
  // =========================
  const validate = (): boolean => {
    if (!file) {
      setMessage({
        type: "error",
        text: "CSVファイルを選択してください",
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

  // =========================
  // Upload
  // =========================
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

  // =========================
  // Sample CSV
  // =========================
  const downloadSampleCsv = () => {
    const csvContent = `time,entity,sales,profit
2024-01-01,Japan,100,20
2024-01-02,Japan,120,25
2024-01-03,Japan,115,23
2024-01-04,Japan,130,30
2024-01-05,Japan,140,35
2024-01-01,USA,80,15
2024-01-02,USA,95,18
2024-01-03,USA,90,16
2024-01-04,USA,105,22
2024-01-05,USA,110,24`;

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
    <Card className="w-full border-blue-200 shadow-sm">
      <CardContent className="space-y-6 pt-6">
        {/* =========================
            Header
        ========================= */}
        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              CSVをアップロードして、
              <br />
              すぐにグラフ化
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              ログイン不要で試せます。
              <br />
              CSVをアップロードすると、 時系列グラフを自動生成します。
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-blue-600">STEP 1</p>

              <p className="mt-1 text-sm">CSVファイルを選択</p>
            </div>

            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-blue-600">STEP 2</p>

              <p className="mt-1 text-sm">Time列とMetric列を指定</p>
            </div>

            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-blue-600">STEP 3</p>

              <p className="mt-1 text-sm">自動でグラフ化</p>
            </div>
          </div>
        </div>

        {/* =========================
            File Input
        ========================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous-dataset-file">CSVファイル</Label>

            <button
              type="button"
              onClick={downloadSampleCsv}
              className="
                text-xs text-blue-600
                hover:text-blue-800 hover:underline
              "
            >
              サンプルCSVをダウンロード
            </button>
          </div>

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

        {/* =========================
            Schema Selector
        ========================= */}
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

        {/* =========================
            Upload Button
        ========================= */}
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={uploading || !isValid}
        >
          {uploading ? "アップロード中..." : "グラフを生成"}
        </Button>

        {/* =========================
            Message
        ========================= */}
        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* =========================
            Footer
        ========================= */}
        <div className="border-t pt-4 text-xs text-muted-foreground space-y-2">
          <p>
            CSV形式について詳しく知りたい場合は、
            CSV仕様ページを参照してください。
          </p>

          <Link
            href="/docs/csv-format"
            className="underline hover:text-foreground"
          >
            CSVフォーマットを見る
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
