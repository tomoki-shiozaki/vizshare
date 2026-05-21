"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Loading } from "@/components/common";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { fetchAnonymousDatasetList } from "@/features/datasets/list/api/fetchAnonymousDatasetList";

import { datasetKeys } from "@/features/datasets/queryKeys";

export function AnonymousDatasetPreviewList() {
  const { data, isLoading, error } = useQuery({
    queryKey: datasetKeys.anonymousList({
      limit: 5,
      offset: 0,
    }),
    queryFn: () =>
      fetchAnonymousDatasetList({
        limit: 5,
        offset: 0,
      }),
  });

  if (isLoading) {
    return <Loading message="Anonymous datasets を読み込み中..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Anonymous datasets の取得に失敗しました</AlertTitle>

        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data || data.results.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-blue-600">
          Recent Anonymous Uploads
        </h2>

        <Link
          href="/datasets/anonymous"
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
            key={dataset.public_id}
            href={`/datasets/anonymous/${dataset.public_id}`}
            className="min-w-[220px] snap-start"
          >
            <Card
              className="
                h-full transition
                hover:bg-muted overflow-hidden
              "
            >
              <CardHeader>
                <CardTitle className="text-base truncate">
                  {dataset.name}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-xs text-muted-foreground">View dataset →</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
