"use client";

import { fetchPublicDatasetDetail } from "@/features/datasets/public/detail/api/fetchPublicDatasetDetail";
import type { PublicDatasetDetailResponse } from "@/features/datasets/types/publicDataset";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loading } from "@/components/common";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";

type Props = {
  id: string;
};

export function PublicDatasetDetail({ id }: Props) {
  const {
    data: dataset,
    isLoading,
    error,
  } = useQuery<PublicDatasetDetailResponse>({
    queryKey: ["publicDataset", id],
    queryFn: () => fetchPublicDatasetDetail(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <Loading message="Datasetを読み込み中..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Datasetの取得に失敗しました</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "不明なエラー"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!dataset) {
    return <p className="text-sm text-gray-500">Datasetが見つかりません。</p>;
  }

  return (
    <div className="space-y-4">
      {/* 戻るボタン */}
      <Link href="/explore">
        <Button variant="outline" size="sm">
          <ChevronLeft className="w-4 h-4 mr-2" />
          公開Dataset一覧に戻る
        </Button>
      </Link>

      {/* ヘッダー */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{dataset.name}</h1>
        <p className="text-sm text-gray-500">
          作成者: {dataset.owner} / 作成日:{" "}
          {new Date(dataset.created_at).toLocaleString()}
        </p>
      </div>

      {/* ダウンロード */}
      <div>
        <a
          href={dataset.download_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>
            <Download className="w-4 h-4 mr-2" />
            ダウンロード
          </Button>
        </a>
      </div>
    </div>
  );
}
