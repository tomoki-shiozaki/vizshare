"use client";

import { useCsvFile } from "@/features/datasets/hooks/useCsvFile";
import { uploadDataset } from "@/features/datasets/api/uploadDataset";
import { CsvSchemaSelector } from "@/features/datasets/components/CsvSchemaSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function DatasetUploadForm() {
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

  const queryClient = useQueryClient();

  // =========================
  // アップロードMutation
  // =========================
  const uploadMutation = useMutation({
    mutationKey: ["datasetUpload"],
    mutationFn: uploadDataset,

    onSuccess: (data) => {
      reset();

      queryClient.invalidateQueries({
        queryKey: ["datasets"],
      });

      setMessage({
        type: "success",
        text: `アップロード成功: ${data.name} が一覧に追加されました`,
      });
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
    <Card className="w-full">
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
