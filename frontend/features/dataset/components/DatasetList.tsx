"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchDatasetList } from "@/features/dataset/api/fetchDatasetList";
import type { DatasetStatus } from "@/features/dataset/types/dataset";

const STATUS_LABEL: Record<DatasetStatus, string> = {
  uploaded: "アップロード済み",
  processing: "処理中",
  parsed: "解析完了",
  failed: "失敗",
};

export function DatasetList() {
  const limit = 10;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["datasets"],

    initialPageParam: 0,

    queryFn: ({ pageParam }) => fetchDatasetList({ limit, offset: pageParam }),

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
    <Card className="max-w-2xl">
      <CardContent className="pt-6 space-y-4">
        <h2 className="text-xl font-semibold text-blue-600">CSV一覧</h2>

        {isLoading && <p className="text-sm text-gray-500">読み込み中…</p>}

        {error && (
          <p className="text-sm text-red-500">{(error as Error).message}</p>
        )}

        {!isLoading && datasets.length === 0 && (
          <p className="text-sm text-gray-500">
            まだCSVがアップロードされていません。
          </p>
        )}

        <ul className="space-y-2">
          {datasets.map((ds) => (
            <li
              key={ds.id}
              className="border rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{ds.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(ds.created_at).toLocaleString()} {ds.id}
                </p>
              </div>

              <span
                className={`text-sm px-2 py-1 rounded
                  ${ds.status === "parsed" && "bg-green-100 text-green-700"}
                  ${ds.status === "processing" && "bg-yellow-100 text-yellow-700"}
                  ${ds.status === "uploaded" && "bg-gray-100 text-gray-700"}
                  ${ds.status === "failed" && "bg-red-100 text-red-700"}
                `}
              >
                {STATUS_LABEL[ds.status]}
              </span>
            </li>
          ))}
        </ul>

        {hasNextPage && (
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "読み込み中…" : "もっと見る"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
