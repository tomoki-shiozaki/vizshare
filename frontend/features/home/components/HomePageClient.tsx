"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuthContext } from "@/features/auth/context";

import { HomeLayout } from "@/components/layout/HomeLayout";

import { Card } from "@/components/ui/card";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CardLink } from "@/components/common/CardLink";

import { AnonymousDatasetUploadForm } from "@/features/datasets/create/components/AnonymousDatasetUploadForm";

import { fetchAnonymousDatasetList } from "@/features/datasets/list/api/fetchAnonymousDatasetList";

import { AnonymousDatasetPreviewList } from "@/features/datasets/home/components/AnonymousDatasetPreviewList";

import type { PaginatedPublicDatasetListResponse } from "@/features/datasets/types/publicDataset";

import type { AnonymousDatasetListResponse } from "@/features/datasets/types/dataset";

type HomePageClientProps = {
  publicData: PaginatedPublicDatasetListResponse;
};

export function HomePageClient({ publicData }: HomePageClientProps) {
  const { currentUsername } = useAuthContext();

  const isLoggedIn = !!currentUsername;

  const [anonymousData, setAnonymousData] =
    useState<AnonymousDatasetListResponse | null>(null);

  const [anonymousLoading, setAnonymousLoading] = useState(false);

  useEffect(() => {
    // ログイン中なら匿名データは不要
    if (isLoggedIn) {
      setAnonymousData(null);
      return;
    }

    const fetchData = async () => {
      try {
        setAnonymousLoading(true);

        const data = await fetchAnonymousDatasetList({
          limit: 5,
          offset: 0,
        });

        setAnonymousData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setAnonymousLoading(false);
      }
    };

    void fetchData();
  }, [isLoggedIn]);

  return (
    <HomeLayout
      title="Vizshare"
      description="
        CSVファイルをアップロードして、
        データをグラフとして可視化・共有できます。
      "
    >
      <div className="space-y-14">
        {/* =========================
            Hero
        ========================= */}
        <section className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              {isLoggedIn
                ? "データセットを管理・可視化"
                : "CSVをアップロードして、すぐにグラフ化"}
            </h2>

            <p className="text-muted-foreground">
              {isLoggedIn
                ? "アップロードした Dataset を管理し、グラフとして可視化できます。"
                : "ログイン不要で試せます。Time series データをアップロードすると、自動でグラフとして可視化できます。"}
            </p>
          </div>

          {/* =========================
              未ログイン: 匿名アップロード
          ========================= */}
          {!isLoggedIn && (
            <>
              <AnonymousDatasetUploadForm />

              {!anonymousLoading && anonymousData && (
                <AnonymousDatasetPreviewList data={anonymousData} />
              )}
            </>
          )}

          {/* =========================
              ログイン済み: Dashboard導線
          ========================= */}
          {isLoggedIn && (
            <div className="grid gap-6 md:grid-cols-2">
              <CardLink href="/datasets">
                <h2 className="text-xl font-semibold text-blue-600 mb-2">
                  My Datasets
                </h2>

                <p className="text-gray-500 text-sm">
                  自分のデータセットを管理します。
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
          )}
        </section>

        {/* =========================
            未ログイン向け Navigation
        ========================= */}
        {!isLoggedIn && (
          <section>
            <div className="grid gap-6 md:grid-cols-3">
              <CardLink href="/login">
                <h2 className="text-xl font-semibold text-blue-600 mb-2">
                  Login
                </h2>

                <p className="text-gray-500 text-sm">
                  ログインしてデータセットを管理できます。
                </p>
              </CardLink>

              <CardLink href="/signup">
                <h2 className="text-xl font-semibold text-blue-600 mb-2">
                  Signup
                </h2>

                <p className="text-gray-500 text-sm">
                  アカウントを作成して継続利用できます。
                </p>
              </CardLink>

              <CardLink href="/explore">
                <h2 className="text-xl font-semibold text-blue-600 mb-2">
                  Public Datasets
                </h2>

                <p className="text-gray-500 text-sm">
                  公開データセットを閲覧できます。
                </p>
              </CardLink>
            </div>
          </section>
        )}

        {/* =========================
            Latest Public Datasets
        ========================= */}
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
            {publicData.results.map((dataset) => (
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
