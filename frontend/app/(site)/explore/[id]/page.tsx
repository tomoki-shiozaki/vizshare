"use client";

import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout/PageLayout";
import { PublicDatasetDetail } from "@/features/datasets/public/detail/components/PublicDatasetDetail";
import { DatasetLineChart } from "@/features/datasets/components/DatasetLineChart";
import { usePublicDatasetDataPoints } from "@/features/datasets/public/timeseries/hooks/usePublicDatasetDataPoints";

export default function PublicDatasetPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  return (
    <PageLayout
      title="Dataset 詳細とグラフ"
      description="Dataset の詳細情報と各列の構造、時系列データの傾向を確認できます"
    >
      <PublicDatasetDetail id={id} />
      <DatasetLineChart
        datasetId={id}
        useDataPoints={usePublicDatasetDataPoints}
      />
    </PageLayout>
  );
}
