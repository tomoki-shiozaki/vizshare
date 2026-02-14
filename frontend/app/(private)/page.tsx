import { HomeLayout } from "@/components/layout/HomeLayout";
import { CardLink } from "@/components/common/CardLink";

export default function HomePage() {
  return (
    <HomeLayout
      title="気候変動データアプリ"
      description="このアプリは、世界の気候変動に関するデータをわかりやすく可視化し、
      地域ごとの動向を比較できるツールです。"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 気温データ */}
        <CardLink href="/climate/temperature">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            気温グラフ
          </h2>
          <p className="text-gray-500 text-sm">
            世界・北半球・南半球の年度ごとの気温変化をグラフで確認できます。
          </p>
        </CardLink>

        {/* CO₂排出量 */}
        <CardLink href="/climate/co2">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            CO₂排出量マップ
          </h2>
          <p className="text-gray-500 text-sm">
            国・地域ごとのCO₂排出量の推移を地図で確認できます。
          </p>
        </CardLink>

        {/* Dataset 一覧 */}
        <CardLink href="/dataset">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            データセット管理
          </h2>
          <p className="text-gray-500 text-sm">
            CSVファイルをアップロードしたり、データの一覧を確認できます。
          </p>
        </CardLink>
      </div>
    </HomeLayout>
  );
}
