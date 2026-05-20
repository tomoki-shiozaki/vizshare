"use client";

import { useState, useMemo, useEffect } from "react";
import { Loading } from "@/components/common";
import { useAnonymousDatasetEntityComparison } from "@/features/datasets/timeseries/hooks/useAnonymousDatasetEntityComparison";
import { useAnonymousDatasetMeta } from "@/features/datasets/meta/hooks/useAnonymousDatasetMeta";
import { DatasetEntityComparisonChartPure } from "./DatasetEntityComparisonChartPure";

type Props = {
  publicId: string;
};

export const AnonymousDatasetEntityComparisonChart = ({ publicId }: Props) => {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  // ---- meta ----
  const {
    data: meta,
    isLoading: isMetaLoading,
    isError: isMetaError,
  } = useAnonymousDatasetMeta(publicId);

  const entities = useMemo(() => meta?.entities ?? [], [meta]);
  const metrics = useMemo(() => meta?.metrics ?? [], [meta]);

  // ---- metric（derived）----
  const actualMetric = selectedMetric || metrics[0] || "";

  // ---- 初期選択 ----
  useEffect(() => {
    if (entities.length === 0) return;

    setSelectedEntities((prev) => {
      if (prev.length > 0) return prev;
      return entities.slice(0, 3);
    });
  }, [entities]);

  // ---- data ----
  const {
    data,
    isLoading: isDataLoading,
    isError: isDataError,
  } = useAnonymousDatasetEntityComparison(publicId, actualMetric);

  if (isMetaLoading || isDataLoading) return <Loading />;
  if (isMetaError || isDataError) return <p>データ取得に失敗しました</p>;
  if (!meta) return <p>メタデータがありません</p>;
  if (!data || data.length === 0) return <p>データがありません</p>;

  return (
    <DatasetEntityComparisonChartPure
      entities={entities}
      metrics={metrics}
      data={data}
      selectedEntities={selectedEntities}
      setSelectedEntities={setSelectedEntities}
      selectedMetric={selectedMetric}
      setSelectedMetric={setSelectedMetric}
    />
  );
};
