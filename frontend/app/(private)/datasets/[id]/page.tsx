"use client";

import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { DatasetDetail } from "@/features/datasets/detail/components/DatasetDetail";
import { DatasetLineChart } from "@/features/datasets/components/DatasetLineChart";
import { useDatasetDataPoints } from "@/features/datasets/timeseries/hooks/useDatasetDataPoints";

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  return (
    <PageLayout
      title="Dataset 詳細とグラフ"
      description="Dataset の詳細情報と各列の構造、時系列データの傾向を確認できます"
    >
      <DatasetDetail id={id} />
      <DatasetLineChart datasetId={id} useDataPoints={useDatasetDataPoints} />
    </PageLayout>
  );
}
