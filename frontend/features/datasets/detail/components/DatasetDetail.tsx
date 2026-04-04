"use client";

import { fetchDatasetDetail } from "@/features/datasets/detail/api/fetchDatasetDetail";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loading } from "@/components/common";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DatasetSchemaView } from "@/features/datasets/detail/components/DatasetSchema";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { DatasetBadge } from "@/features/datasets/components/DatasetBadge";
import { DatasetVisibilityBadge } from "@/features/datasets/components/DatasetVisibilityBadge";
import { DatasetVisibilityToggle } from "@/features/datasets/visibility/components/DatasetVisibilityToggle";
import { datasetKeys } from "@/features/datasets/queryKeys";

type Props = {
  id: string;
};

export function DatasetDetail({ id }: Props) {
  const {
    data: dataset,
    isLoading,
    error,
  } = useQuery({
    queryKey: datasetKeys.detail(id),
    queryFn: () => fetchDatasetDetail(id),
    enabled: !!id,
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
      <Link href="/datasets">
        <Button variant="outline" size="sm">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Dataset一覧に戻る
        </Button>
      </Link>

      {/* ヘッダー */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{dataset.name}</h1>
        <p className="text-sm text-gray-500">
          作成日: {new Date(dataset.created_at).toLocaleString()}
        </p>
      </div>

      {/* ステータス */}
      <div className="flex items-center gap-2">
        <DatasetBadge
          status={dataset.status}
          message={dataset.parse_result?.message}
        />
        <DatasetVisibilityBadge isPublic={dataset.is_public} />

        <DatasetVisibilityToggle
          datasetId={dataset.id}
          isPublic={dataset.is_public}
        />
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
