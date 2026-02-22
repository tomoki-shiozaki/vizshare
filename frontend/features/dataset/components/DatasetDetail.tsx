"use client";

import { fetchDatasetDetail } from "@/features/dataset/api/fetchDatasetDetail";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

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
      <p>Status: {dataset.status}</p>
      <p>Created: {new Date(dataset.created_at).toLocaleString()}</p>

      {/* schema */}
      <h2>Data Structure</h2>
      <p>Time: {dataset.schema.time}</p>
      <p>Entity: {dataset.schema.entity ?? "default"}</p>
      <p>Metrics: {dataset.schema.metrics.join(", ")}</p>

      {/* parse_result */}
      <h2>Parse Result</h2>
      {dataset.status === "failed" && (
        <div style={{ color: "red" }}>{dataset.parse_result?.message}</div>
      )}
      {dataset.status === "processing" && <div>Processing...</div>}
      {dataset.status === "parsed" && <div>Parsed successfully</div>}
    </div>
  );
}
