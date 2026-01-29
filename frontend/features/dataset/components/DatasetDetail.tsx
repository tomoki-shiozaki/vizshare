"use client";

import { fetchDatasetDetail } from "@/features/dataset/api/fetchDatasetDetail";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();

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

  if (error instanceof Error)
    return <div style={{ color: "red" }}>Error: {error.message}</div>;

  if (!dataset) return <div>No data found</div>;

  return (
    <div style={{ padding: "16px" }}>
      <h1>Dataset Detail (ID: {id})</h1>

      <p>
        <strong>Name:</strong> {dataset.name}
      </p>

      <p>
        <strong>Status:</strong> {dataset.status}
      </p>

      <p>
        <strong>Created at:</strong>{" "}
        {new Date(dataset.created_at).toLocaleString()}
      </p>

      <h2>Schema</h2>
      <pre style={{ background: "#f0f0f0", padding: "8px" }}>
        {JSON.stringify(dataset.schema, null, 2)}
      </pre>

      <h2>Parse Result</h2>
      <pre style={{ background: "#f0f0f0", padding: "8px" }}>
        {JSON.stringify(dataset.parse_result, null, 2)}
      </pre>
    </div>
  );
}
