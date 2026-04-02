"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPublicDatasetList } from "@/features/datasets/public/list/api/fetchPublicDatasetList";
import { PublicDatasetListItem } from "@/features/datasets/public/list/components/PublicDatasetListItem";

export function PublicDatasetList() {
  const limit = 12;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["public-datasets"],

    initialPageParam: 0,

    queryFn: ({ pageParam }) =>
      fetchPublicDatasetList({ limit, offset: pageParam }),

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined;
      return allPages.length * limit;
    },

    // 公開データは基本ポーリング不要
    refetchInterval: false,
  });

  const datasets = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-600">
          公開データセット
        </h2>

        {isLoading && <Loading message="データセットを読み込み中..." />}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>取得に失敗しました</AlertTitle>
            <AlertDescription>
              {"message" in error ? error.message : "不明なエラー"}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && datasets.length === 0 && (
          <p className="text-sm text-gray-500">
            公開されているデータセットはまだありません。
          </p>
        )}

        <ul className="space-y-2">
          {datasets.map((ds) => (
            <PublicDatasetListItem key={ds.id} dataset={ds} />
          ))}
        </ul>

        {hasNextPage && (
          <Button
            className="mt-2"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "読み込み中…" : "もっと見る"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
