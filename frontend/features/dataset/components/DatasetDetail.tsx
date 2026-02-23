"use client";

import { fetchDatasetDetail } from "@/features/dataset/api/fetchDatasetDetail";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DatasetStatus } from "@/features/dataset/components/DatasetStatus";
import { Loading } from "@/components/common";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { DatasetSchemaView } from "@/features/dataset/components/DatasetSchema";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type Props = {
  id: string;
};

export function DatasetDetail({ id }: Props) {
  const {
    data: dataset,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dataset", id],
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
    <div className="p-4 space-y-4">
      {/* 戻るボタン */}
      <Link href="/dataset" passHref>
        <Button variant="outline" size="sm">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Dataset一覧に戻る
        </Button>
      </Link>

      {/* ヘッダー */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{dataset.name}</h1>
        <p className="text-sm text-gray-500">
          Created: {new Date(dataset.created_at).toLocaleString()}
        </p>
      </div>

      {/* Status */}
      <div>
        <h2 className="text-lg font-medium">Status</h2>
        <DatasetStatus
          status={dataset.status}
          message={dataset.parse_result?.message}
        />
      </div>

      {/* Schema */}
      {dataset.status === "parsed" && (
        <div>
          <h2 className="text-lg font-medium">Data Structure</h2>
          <DatasetSchemaView schema={dataset.schema} />
        </div>
      )}
    </div>
  );
}
