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
import { Loading, SelectBox } from "@/components/common";
import { ItemSelector } from "@/features/datasets/components/selectors/ItemSelector";
import { Button } from "@/components/ui/button";
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
    data?: {
      results: {
        entity: string;
        metric: string;
        time: number;
        value: number | null;
      }[];
    };
    isLoading: boolean;
    isError: boolean;
  };
};

const MAX_LINES = 8;

export const DatasetLineChart = ({
  datasetId,
  useDataPoints,
}: DatasetChartProps) => {
  // -----------------------------
  // mode
  // -----------------------------
  const [mode, setMode] = useState<"metrics" | "entities">("metrics");

  // -----------------------------
  // meta
  // -----------------------------
  const {
    data: meta,
    isLoading: metaLoading,
    isError: metaError,
  } = useDatasetMeta(datasetId);

  const entities = useMemo(() => meta?.entities ?? [], [meta]);
  const metrics = useMemo(() => meta?.metrics ?? [], [meta]);

  // -----------------------------
  // selections
  // -----------------------------
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");

  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // -----------------------------
  // init
  // -----------------------------
  useEffect(() => {
    if (entities.length > 0 && !selectedEntity) {
      setSelectedEntity(entities[0]);
    }
  }, [entities, selectedEntity]);

  useEffect(() => {
    if (metrics.length > 0 && !selectedMetric) {
      setSelectedMetric(metrics[0]);
    }
  }, [metrics, selectedMetric]);

  useEffect(() => {
    if (metrics.length > 0 && selectedMetrics.length === 0) {
      setSelectedMetrics([metrics[0]]);
    }
  }, [metrics, selectedMetrics.length]);

  // -----------------------------
  // mode制御
  // -----------------------------
  useEffect(() => {
    if (mode === "metrics") {
      if (selectedEntity) {
        setSelectedEntities([selectedEntity]);
      }
    } else {
      if (selectedMetric) {
        setSelectedMetrics([selectedMetric]);
      }
    }
  }, [mode, selectedEntity, selectedMetric]);

  // -----------------------------
  // fetch params（安全化）
  // -----------------------------
  const queryEntities =
    mode === "metrics"
      ? selectedEntity
        ? [selectedEntity]
        : []
      : selectedEntities;

  const queryMetrics =
    mode === "metrics"
      ? selectedMetrics
      : selectedMetric
        ? [selectedMetric]
        : [];

  const { data, isLoading, isError } = useDataPoints(datasetId, {
    entities: queryEntities,
    metrics: queryMetrics,
  });

  // -----------------------------
  // chart data
  // -----------------------------
  const chartData = useMemo(() => {
    if (!data?.results || data.results.length === 0) return [];

    const timeMap = new Map<number, Record<string, number | null>>();

    for (const r of data.results) {
      const key = `${r.entity}__${r.metric}`;
      const time = r.time;

      if (!timeMap.has(time)) {
        timeMap.set(time, { time });
      }

      timeMap.get(time)![key] = r.value ?? null;
    }

    return Array.from(timeMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v);
  }, [data]);

  // -----------------------------
  // series keys
  // -----------------------------
  const seriesKeys = useMemo(() => {
    if (mode === "metrics") {
      return selectedMetrics.map((m) => `${selectedEntity}__${m}`);
    }
    return selectedEntities.map((e) => `${e}__${selectedMetric}`);
  }, [mode, selectedEntity, selectedMetric, selectedEntities, selectedMetrics]);

  const limitedSeriesKeys = seriesKeys.slice(0, MAX_LINES);

  // -----------------------------
  // 描画ガード（これが重要）
  // -----------------------------
  const isReady =
    chartData.length > 0 &&
    limitedSeriesKeys.length > 0 &&
    limitedSeriesKeys.some((k) => chartData[0]?.[k] !== undefined);

  // -----------------------------
  // loading
  // -----------------------------
  if (metaLoading || isLoading) return <Loading />;
  if (metaError || isError) return <p>データ取得に失敗しました</p>;
  if (!meta) return <p>データがありません</p>;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div>
      {/* mode */}
      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant={mode === "metrics" ? "default" : "outline"}
          onClick={() => setMode("metrics")}
        >
          Metrics比較
        </Button>
        <Button
          size="sm"
          variant={mode === "entities" ? "default" : "outline"}
          onClick={() => setMode("entities")}
        >
          Entity比較
        </Button>
      </div>

      {/* selectors */}
      {mode === "metrics" ? (
        <>
          <SelectBox
            id="entity"
            label="Entity"
            options={entities.map((e) => ({ value: e, label: e }))}
            value={selectedEntity}
            onChange={setSelectedEntity}
          />

          <ItemSelector
            items={metrics}
            selectedItems={selectedMetrics}
            setSelectedItems={(items) =>
              setSelectedMetrics(items.slice(0, MAX_LINES))
            }
            label={`Metrics（最大${MAX_LINES}）`}
          />
        </>
      ) : (
        <>
          <SelectBox
            id="metric"
            label="Metric"
            options={metrics.map((m) => ({ value: m, label: m }))}
            value={selectedMetric}
            onChange={setSelectedMetric}
          />

          <ItemSelector
            items={entities}
            selectedItems={selectedEntities}
            setSelectedItems={(items) =>
              setSelectedEntities(items.slice(0, MAX_LINES))
            }
            label={`Entities（最大${MAX_LINES}）`}
          />
        </>
      )}

      {/* chart */}
      {!isReady ? (
        <Loading />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            key={limitedSeriesKeys.join("-")} // ← 強制再描画
            data={chartData}
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis width={60} />
            <Tooltip />
            <Legend />

            {limitedSeriesKeys.map((key, i) => (
              <Line
                key={key}
                dataKey={key}
                stroke={`hsl(${(i * 137.5) % 360}, 65%, 50%)`}
                type="monotone"
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
