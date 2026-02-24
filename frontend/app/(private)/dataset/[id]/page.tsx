"use client";

import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { DatasetDetail } from "@/features/dataset/components/DatasetDetail";
import { DatasetLineChart } from "@/features/dataset/components/DatasetLineChart";

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;

  return (
    <PageLayout
      title="Dataset 詳細とグラフ"
      description="Dataset の詳細情報と各列の構造、時系列データの傾向を確認できます"
    >
      <DatasetDetail id={id} />
      <DatasetLineChart datasetId={id} />
    </PageLayout>
  );
}
