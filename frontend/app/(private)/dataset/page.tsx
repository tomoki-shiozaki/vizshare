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
        <div className="w-full md:w-1/2 min-w-0">
          <DatasetUploadForm />
        </div>

        {/* CSV一覧 */}
        <div className="w-full md:w-1/2 min-w-0">
          <DatasetList />
        </div>
      </div>
    </PageLayout>
  );
}
