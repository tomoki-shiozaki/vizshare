"use client";

import { fetchDatasetDetail } from "@/features/dataset/api/fetchDatasetDetail";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DatasetStatus } from "@/features/dataset/components/DatasetStatus";
import { Loading } from "@/components/common";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type Props = {
  id: string;
};

export function DatasetDetail({ id }: Props) {
  const {
    data: dataset,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dataset", id],
    queryFn: () => fetchDatasetDetail(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <Loading message="Datasetを読み込み中..." />;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Datasetの取得に失敗しました</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!dataset) {
    return <p className="text-sm text-gray-500">Datasetが見つかりません。</p>;
  }

  return (
    <div className="p-4">
      {/* 戻る */}
      <Link href="/dataset">← Dataset一覧に戻る</Link>

      {/* ヘッダー */}
      <h1>{dataset.name}</h1>
      <p>Created: {new Date(dataset.created_at).toLocaleString()}</p>

      {/* 状態表示（ここに集約） */}
      <h2>Status</h2>
      <DatasetStatus
        status={dataset.status}
        message={dataset.parse_result?.message}
      />

      {/* parsed のときだけ schema 表示 */}
      {dataset.status === "parsed" && (
        <>
          <h2>Data Structure</h2>

          <div className="mt-2 border rounded">
            <div className="grid grid-cols-2 gap-2 p-3 text-sm">
              <div className="text-gray-500">Time column</div>
              <div>{dataset.schema.time}</div>

              <div className="text-gray-500">Entity column</div>
              <div>{dataset.schema.entity ?? "default"}</div>

              <div className="text-gray-500">Metrics</div>
              <div>{dataset.schema.metrics.join(", ")}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
