import { HomeLayout } from "@/components/layout/HomeLayout";
import { CardLink } from "@/components/common/CardLink";

export default function HomePage() {
  return (
    <HomeLayout
      title="Vizshare"
      description="CSVファイルをアップロードしてデータをグラフとして可視化・共有できるアプリです。"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* My datasets */}
        <CardLink href="/datasets">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            My Datasets
          </h2>
          <p className="text-gray-500 text-sm">
            CSVをアップロードして自分のデータセットを管理します。
          </p>
        </CardLink>

        {/* Public datasets */}
        <CardLink href="/explore">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            Public Datasets
          </h2>
          <p className="text-gray-500 text-sm">
            公開されているデータセットを閲覧できます。
          </p>
        </CardLink>
      </div>
    </HomeLayout>
  );
}
