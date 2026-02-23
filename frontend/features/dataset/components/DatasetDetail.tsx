"use client";

import { fetchDatasetDetail } from "@/features/dataset/api/fetchDatasetDetail";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DatasetStatus } from "@/features/dataset/components/DatasetStatus";

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

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  if (!dataset) return <div>No data found</div>;

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
          <p>Time: {dataset.schema.time}</p>
          <p>Entity: {dataset.schema.entity ?? "default"}</p>
          <p>Metrics: {dataset.schema.metrics.join(", ")}</p>
        </>
      )}
    </div>
  );
}
