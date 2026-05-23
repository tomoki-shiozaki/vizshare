"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Loading } from "@/components/common";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { fetchAnonymousDatasetDetail } from "@/features/datasets/detail/api/fetchAnonymousDatasetDetail";
import { DatasetSchemaView } from "@/features/datasets/detail/components/DatasetSchema";
import { DatasetBadge } from "@/features/datasets/components/DatasetBadge";
import { DatasetVisibilityBadge } from "@/features/datasets/components/DatasetVisibilityBadge";
import { datasetKeys } from "@/features/datasets/queryKeys";

type Props = {
  publicId: string;
};

export function AnonymousDatasetDetail({ publicId }: Props) {
  const {
    data: dataset,
    isLoading,
    error,
  } = useQuery({
    queryKey: datasetKeys.anonymousDetail(publicId),
    queryFn: () => fetchAnonymousDatasetDetail(publicId),
    enabled: !!publicId,
  });

  if (isLoading) {
    return <Loading message="Datasetを読み込み中..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Datasetの取得に失敗しました</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!dataset) {
    return <p className="text-sm text-gray-500">Datasetが見つかりません。</p>;
  }

  return (
    <div className="space-y-4">
      {/* 戻るボタン */}
      <Link href="/">
        <Button variant="outline" size="sm">
          <ChevronLeft className="w-4 h-4 mr-2" />
          トップへ戻る
        </Button>
      </Link>

      {/* ヘッダー */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{dataset.name}</h1>

        <p className="text-sm text-gray-500">
          作成日: {new Date(dataset.created_at).toLocaleString()}
        </p>

        {dataset.expires_at && (
          <p className="text-sm text-orange-600">
            有効期限: {new Date(dataset.expires_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* ステータス */}
      <div className="flex items-center gap-2">
        <DatasetBadge
          status={dataset.status}
          message={dataset.parse_result?.message}
        />

        <DatasetVisibilityBadge visibility={dataset.visibility} />
      </div>

      {/* Schema */}
      {dataset.status === "parsed" && (
        <div>
          <h2 className="text-lg font-medium">データ構造</h2>

          <DatasetSchemaView schema={dataset.schema} />
        </div>
      )}
    </div>
  );
}
