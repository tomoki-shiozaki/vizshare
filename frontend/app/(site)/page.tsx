import Link from "next/link";

import { HomeLayout } from "@/components/layout/HomeLayout";

import { Card } from "@/components/ui/card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CardLink } from "@/components/common/CardLink";

import { AnonymousDatasetUploadForm } from "@/features/datasets/create/components/AnonymousDatasetUploadForm";

import { fetchPublicDatasetListServer } from "@/features/datasets/public/list/api/fetchPublicDatasetServer";

export default async function HomePage() {
  const data = await fetchPublicDatasetListServer();

  return (
    <HomeLayout
      title="Vizshare"
      description="
        CSVファイルをアップロードして、
        データをグラフとして可視化・共有できます。
      "
    >
      <div className="space-y-14">
        {/* Hero */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              CSVをアップロードして、 すぐにグラフ化
            </h2>

            <p className="text-muted-foreground">
              ログイン不要で試せます。 Time series データをアップロードすると、
              自動でグラフとして可視化できます。
            </p>
          </div>

          <AnonymousDatasetUploadForm />
        </section>

        {/* Navigation */}
        <section>
          <div className="grid gap-6 md:grid-cols-2">
            <CardLink href="/datasets">
              <h2 className="text-xl font-semibold text-blue-600 mb-2">
                My Datasets
              </h2>

              <p className="text-gray-500 text-sm">
                ログインしてデータセットを管理します。
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
        </section>

        {/* Latest public datasets */}
        <section>
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

          <div
            className="
            flex gap-4 overflow-x-auto
            snap-x snap-mandatory pb-2
          "
          >
            {data.results.map((dataset) => (
              <Link
                key={dataset.id}
                href={`/explore/${dataset.id}`}
                className="min-w-[220px] snap-start"
              >
                <Card
                  className="
                  h-full hover:bg-muted
                  transition overflow-hidden
                "
                >
                  <CardHeader>
                    <CardTitle className="text-base truncate">
                      {dataset.name}
                    </CardTitle>
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
        </section>
      </div>
    </HomeLayout>
  );
}
