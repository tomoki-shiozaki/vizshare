import { HomeLayout } from "@/components/layout/HomeLayout";
import { CardLink } from "@/components/common/CardLink";

export default function HomePage() {
  return (
    <HomeLayout
      title="Vizshare"
      description="CSVファイルをアップロードしてデータをグラフとして可視化できるアプリです。"
    >
      <div className="grid gap-6">
        {/* Dataset 一覧 */}
        <CardLink href="/dataset">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            データセット管理
          </h2>
          <p className="text-gray-500 text-sm">
            CSVをアップロードしてデータを管理・可視化できるアプリです。
          </p>
        </CardLink>
      </div>
    </HomeLayout>
  );
}
