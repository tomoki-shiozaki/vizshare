import { PageLayout } from "@/components/layout";
import { DatasetUploadForm } from "@/features/dataset/components/DatasetUploadForm";
import { DatasetList } from "@/features/dataset/components/DatasetList";

export default function DatasetPage() {
  return (
    <PageLayout
      title="データセット管理"
      description="CSVのアップロードと一覧表示"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* アップロードフォーム */}
        <div className="flex-1">
          <DatasetUploadForm />
        </div>

        {/* CSV一覧 */}
        <div className="flex-1">
          <DatasetList />
        </div>
      </div>
    </PageLayout>
  );
}
