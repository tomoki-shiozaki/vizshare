import { PageLayout } from "@/components/layout/PageLayout";
import { AnonymousDatasetList } from "@/features/datasets/list/components/AnonymousDatasetList";

export default function AnonymousDatasetsPage() {
  return (
    <PageLayout
      title="匿名データセット一覧"
      description="匿名でアップロードされたCSVデータを閲覧できます。"
    >
      <AnonymousDatasetList />
    </PageLayout>
  );
}
