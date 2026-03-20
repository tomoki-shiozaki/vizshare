import { PageLayout } from "@/components/layout/PageLayout";
import { PublicDatasetDetail } from "@/features/datasets/public/detail/components/PublicDatasetDetail";
import { DatasetLineChart } from "@/features/datasets/timeseries/components/DatasetLineChart";

interface Props {
  params: { id: string };
}

// async function にする
export default async function PublicDatasetPage({ params }: Props) {
  // params が Promise の場合は await で展開
  const { id } = await params;

  return (
    <PageLayout
      title="Dataset 詳細とグラフ"
      description="Dataset の詳細情報と各列の構造、時系列データの傾向を確認できます"
    >
      <PublicDatasetDetail id={id} />
      <DatasetLineChart datasetId={id} />
    </PageLayout>
  );
}
