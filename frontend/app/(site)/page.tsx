import { HomeLayout } from "@/components/layout/HomeLayout";
import { CardLink } from "@/components/common/CardLink";
import { fetchPublicDatasetListServer } from "@/features/datasets/public/list/api/fetchPublicDatasetServer";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const data = await fetchPublicDatasetListServer();

  return (
    <HomeLayout
      title="Vizshare"
      description="CSVファイルをアップロードしてデータをグラフとして可視化・共有できるアプリです。"
    >
      <div className="space-y-10">
        {/* Primary actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <CardLink href="/datasets">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              My Datasets
            </h2>
            <p className="text-gray-500 text-sm">
              CSVをアップロードして自分のデータセットを管理します。
            </p>
          </CardLink>

          <CardLink href="/explore">
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              Public Datasets
            </h2>
            <p className="text-gray-500 text-sm">
              公開されているデータセットを閲覧できます。
            </p>
          </CardLink>
        </div>

        {/* Latest Public datasets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-600">
              Latest Public Datasets
            </h2>

            <Link
              href="/explore"
              className="text-sm text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {data.results.map((dataset) => (
              <Link
                key={dataset.id}
                href={`/explore/${dataset.id}`}
                className="min-w-[220px] snap-start"
              >
                <Card className="h-full hover:bg-muted transition">
                  <CardHeader>
                    <CardTitle className="text-base">{dataset.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      View dataset →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
