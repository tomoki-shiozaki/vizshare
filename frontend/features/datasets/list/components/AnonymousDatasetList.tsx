"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchAnonymousDatasetList } from "@/features/datasets/list/api/fetchAnonymousDatasetList";

import { AnonymousDatasetListItem } from "@/features/datasets/list/components/AnonymousDatasetListItem";

import { datasetKeys } from "@/features/datasets/queryKeys";

export function AnonymousDatasetList() {
  const limit = 10;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: datasetKeys.anonymousList(),

    initialPageParam: 0,

    queryFn: ({ pageParam }) =>
      fetchAnonymousDatasetList({
        limit,
        offset: pageParam,
      }),

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined;

      return allPages.length * limit;
    },

    // processing がある間だけポーリング
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) =>
        page.results.some((ds) => ds.status === "processing"),
      )
        ? 3000
        : false,
  });

  const datasets = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-600">匿名CSV一覧</h2>

        {isLoading && <Loading message="匿名CSV一覧を読み込み中..." />}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>匿名CSV一覧の取得に失敗しました</AlertTitle>

            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {!isLoading && datasets.length === 0 && (
          <p className="text-sm text-gray-500">
            まだ匿名CSVがアップロードされていません。
          </p>
        )}

        <ul className="space-y-2">
          {datasets.map((ds) => (
            <AnonymousDatasetListItem key={ds.public_id} dataset={ds} />
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
