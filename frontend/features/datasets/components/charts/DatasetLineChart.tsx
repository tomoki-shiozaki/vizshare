"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState, useMemo } from "react";
import { Loading } from "@/components/common";
import type {
  DatasetDataPointsResponse,
  MergedTimeSeriesPoint,
} from "@/features/datasets/types/dataset";
import { ItemSelector } from "@/features/datasets/components/selectors/ItemSelector";
import { useDatasetMeta } from "@/features/datasets/meta/hooks/useDatasetMeta";

type DatasetChartProps = {
  datasetId: string;
  useDataPoints: (
    datasetId: string,
    params: {
      entities?: string[];
      metrics?: string[];
    },
  ) => {
    data?: DatasetDataPointsResponse;
    isLoading: boolean;
    isError: boolean;
  };
};

export const DatasetLineChart = ({
  datasetId,
  useDataPoints,
}: DatasetChartProps) => {
  // ---- meta ----
  const {
    data: meta,
    isLoading: metaLoading,
    isError: metaError,
  } = useDatasetMeta(datasetId);

  // ---- filters ----
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // ---- data ----
  const { data, isLoading, isError } = useDataPoints(datasetId, {
    entities: selectedEntities,
    metrics: selectedMetrics,
  });

  // ---- meta derived ----
  const entities = useMemo(() => meta?.entities ?? [], [meta?.entities]);

  const metrics = useMemo(() => meta?.metrics ?? [], [meta?.metrics]);

  // ---- init ----
  useEffect(() => {
    if (entities.length > 0 && selectedEntities.length === 0) {
      setSelectedEntities([entities[0]]);
    }
  }, [entities, selectedEntities.length]);

  useEffect(() => {
    if (metrics.length > 0 && selectedMetrics.length === 0) {
      setSelectedMetrics([metrics[0]]);
    }
  }, [metrics, selectedMetrics.length]);

  const getColor = (idx: number) => `hsl(${(idx * 137.5) % 360}, 65%, 50%)`;

  // =========================================================
  // ① flat results → pivot index
  // =========================================================
  const indexedData = useMemo(() => {
    if (!data?.results) return null;

    const map: Record<string, Map<number, Record<string, number | null>>> = {};

    for (const r of data.results) {
      if (!r.entity) continue;
      if (r.time == null) continue;

      const entity = r.entity;
      const time = Number(r.time);

      if (!map[entity]) {
        map[entity] = new Map();
      }

      const entityMap = map[entity];

      const prev = entityMap.get(time) ?? { time };

      entityMap.set(time, {
        ...prev,
        [r.metric]: r.value ?? null,
      });
    }

    return map;
  }, [data]);

  // =========================================================
  // ② time axis
  // =========================================================
  const allTimes = useMemo(() => {
    if (!indexedData || selectedEntities.length === 0) return [];

    const set = new Set<number>();

    for (const entity of selectedEntities) {
      const entityMap = indexedData[entity];
      if (!entityMap) continue;

      for (const time of entityMap.keys()) {
        set.add(time);
      }
    }

    return Array.from(set).sort((a, b) => a - b);
  }, [indexedData, selectedEntities]);

  // =========================================================
  // ③ merged chart data
  // =========================================================
  const mergedChartData: MergedTimeSeriesPoint[] = useMemo(() => {
    if (
      !indexedData ||
      selectedEntities.length === 0 ||
      selectedMetrics.length === 0
    ) {
      return [];
    }

    return allTimes.map((time) => {
      const point: MergedTimeSeriesPoint = { time };

      for (const entity of selectedEntities) {
        const entityMap = indexedData[entity];
        const p = entityMap?.get(time);

        for (const metric of selectedMetrics) {
          point[`${entity}_${metric}`] = p?.[metric] ?? null;
        }
      }

      return point;
    });
  }, [indexedData, allTimes, selectedEntities, selectedMetrics]);

  // ---- loading / error ----
  if (metaLoading || isLoading) return <Loading />;
  if (metaError || isError) return <p>データ取得に失敗しました</p>;

  if (!meta || entities.length === 0 || metrics.length === 0)
    return <p>データがありません</p>;

  return (
    <div>
      {/* ---- selectors ---- */}
      <ItemSelector
        items={entities}
        selectedItems={selectedEntities}
        setSelectedItems={setSelectedEntities}
        label="Entities"
      />

      <ItemSelector
        items={metrics}
        selectedItems={selectedMetrics}
        setSelectedItems={setSelectedMetrics}
        label="Metrics"
      />

      {/* ---- chart ---- */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />

          {selectedEntities.flatMap((entity, eIdx) =>
            selectedMetrics.map((metric, mIdx) => {
              const key = `${entity}_${metric}`;

              return (
                <Line
                  key={key}
                  dataKey={key}
                  stroke={getColor(eIdx * 10 + mIdx)}
                  type="monotone"
                  connectNulls
                />
              );
            }),
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
