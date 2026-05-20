"use client";

import { useState, useMemo } from "react";
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

  // ---- 初期選択（derived）----
  const initialSelectedEntities = useMemo(() => {
    return entities.slice(0, 3);
  }, [entities]);

  // ---- 実際に使う選択値 ----
  const effectiveSelectedEntities =
    selectedEntities.length > 0 ? selectedEntities : initialSelectedEntities;

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
      selectedEntities={effectiveSelectedEntities}
      setSelectedEntities={setSelectedEntities}
      selectedMetric={selectedMetric}
      setSelectedMetric={setSelectedMetric}
    />
  );
};
