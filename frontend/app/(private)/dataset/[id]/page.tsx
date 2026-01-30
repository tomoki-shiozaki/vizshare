"use client";

import { useParams } from "next/navigation";
import { DatasetDetail } from "@/features/dataset/components/DatasetDetail";
import { DatasetLineChart } from "@/features/dataset/components/DatasetLineChart";

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <>
      <DatasetDetail />;
      <DatasetLineChart datasetId={id} />
    </>
  );
}
