import { PageLayout } from "@/components/layout/PageLayout";
import { PublicDatasetList } from "@/features/datasets/public/list/components/PublicDatasetList";

export default function PublicDatasetsPage() {
  return (
    <PageLayout
      title="公開データセット一覧"
      description="ユーザーによって公開されたCSVデータを閲覧できます。"
    >
      <PublicDatasetList />
    </PageLayout>
  );
}
