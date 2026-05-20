"use client";

import { useParams } from "next/navigation";

import { PageLayout } from "@/components/layout";
import { AnonymousDatasetDetail } from "@/features/datasets/detail/components/AnonymousDatasetDetail";
import { DatasetLineChart } from "@/features/datasets/components/charts/DatasetLineChart";
import { useAnonymousDatasetDataPoints } from "@/features/datasets/timeseries/hooks/useAnonymousDatasetDataPoints";
import { AnonymousDatasetEntityComparisonChart } from "@/features/datasets/components/charts/AnonymousDatasetEntityComparisonChart";

export default function AnonymousDatasetDetailPage() {
  const { publicId } = useParams<{ publicId: string }>();

  if (!publicId) return null;

  return (
    <PageLayout
      title="Dataset 詳細"
      description="アップロードした Dataset の詳細情報を確認できます"
    >
      <AnonymousDatasetDetail publicId={publicId} />

      <DatasetLineChart
        datasetId={publicId}
        useDataPoints={useAnonymousDatasetDataPoints}
      />

      <AnonymousDatasetEntityComparisonChart publicId={publicId} />
    </PageLayout>
  );
}
