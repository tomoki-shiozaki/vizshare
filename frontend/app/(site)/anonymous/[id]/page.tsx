"use client";

import { useParams } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { AnonymousDatasetDetail } from "@/features/datasets/detail/components/AnonymousDatasetDetail";

export default function AnonymousDatasetDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <PageLayout
      title="Dataset 詳細"
      description="アップロードした Dataset の詳細情報を確認できます"
    >
      <AnonymousDatasetDetail id={id} />
    </PageLayout>
  );
}
