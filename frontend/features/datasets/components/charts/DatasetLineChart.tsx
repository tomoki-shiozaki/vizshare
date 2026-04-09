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
import type {
  DatasetDataPointsResponse,
  TimeSeriesPoint,
} from "@/features/datasets/types/dataset";
import { ItemSelector } from "@/features/datasets/components/metrics/ItemSelector";
import { Button } from "@/components/ui/button";
import { MergedTimeSeriesPoint } from "@/features/datasets/types/dataset";

type DatasetChartProps = {
  datasetId: string;
  useDataPoints: (datasetId: string) => {
    data?: DatasetDataPointsResponse;
    isLoading: boolean;
    isError: boolean;
  };
};

export const DatasetLineChart = ({
  datasetId,
  useDataPoints,
}: DatasetChartProps) => {
  const { data, isLoading, isError } = useDataPoints(datasetId);

  // ---- Mode state ----
  // "metrics" = Single Entity × Multiple Metrics
  // "entities" = Multiple Entities × Single Metric
  const [mode, setMode] = useState<"metrics" | "entities">("metrics");

  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  // ---- entity一覧 ----
  const entities = useMemo(() => (data ? Object.keys(data) : []), [data]);

  // ---- 初期entity設定 ----
  useEffect(() => {
    if (entities.length > 0) {
      setSelectedEntity((prev) => prev || entities[0]);

      setSelectedEntities((prev) => (prev.length === 0 ? [entities[0]] : prev));
    }
  }, [entities]);

  // 選択entityのデータ
  const chartDataSingleEntity: TimeSeriesPoint[] = useMemo(() => {
    if (!selectedEntity || !data) return [];
    return data[selectedEntity] ?? [];
  }, [data, selectedEntity]);

  // ---- metric自動検出 ----
  const metrics = useMemo(() => {
    if (chartDataSingleEntity.length === 0) return [];
    return Object.keys(chartDataSingleEntity[0]).filter((k) => k !== "time");
  }, [chartDataSingleEntity]);

  // ---- 初期 metrics 選択 ----
  useEffect(() => {
    if (metrics.length > 0 && selectedMetrics.length === 0) {
      setSelectedMetrics(metrics);
    }
  }, [metrics, selectedMetrics.length]);

  // ---- 初期 metric (entitiesモード用) ----
  useEffect(() => {
    if (metrics.length > 0 && !selectedMetric) {
      setSelectedMetric(metrics[0]);
    }
  }, [metrics, selectedMetric]);

  // ---- colors ----
  const getColor = (idx: number) => `hsl(${(idx * 137.5) % 360}, 65%, 50%)`;

  // ---- SelectBox options ----
  const options = entities.map((e) => ({ value: e, label: e }));

  // ---- chartData for entities mode ----
  const mergedChartData: MergedTimeSeriesPoint[] = useMemo(() => {
    if (!data || selectedEntities.length === 0 || !selectedMetric) return [];

    const allTimes = Array.from(
      new Set(
        selectedEntities.flatMap((e) => (data[e] ?? []).map((p) => p.time)),
      ),
    ).sort((a, b) => Number(a) - Number(b));

    return allTimes.map((time) => {
      const point: MergedTimeSeriesPoint = { time };
      selectedEntities.forEach((entity) => {
        const entityPoint = data[entity]?.find((p) => p.time === time);
        point[entity] = entityPoint
          ? Number(entityPoint[selectedMetric])
          : null;
      });
      return point;
    });
  }, [data, selectedEntities, selectedMetric]);

  // ---- early return ----
  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || entities.length === 0) return <p>データがありません</p>;

  return (
    <div>
      {/* --- Mode切替 --- */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={mode === "metrics" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("metrics")}
        >
          Metrics比較
        </Button>
        <Button
          variant={mode === "entities" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("entities")}
        >
          Entity比較
        </Button>
      </div>

      {mode === "metrics" ? (
        <>
          {/* Single Entity × Multiple Metrics */}
          <SelectBox
            id="entity-select"
            label="Entity 選択"
            options={options}
            value={selectedEntity}
            onChange={setSelectedEntity}
          />

          <ItemSelector
            items={metrics}
            selectedItems={selectedMetrics}
            setSelectedItems={setSelectedMetrics}
            label="Metrics"
          />

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartDataSingleEntity}
              margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis width={60} />
              <Tooltip />
              <Legend />
              {selectedMetrics.map((metric) => (
                <Line
                  key={metric}
                  dataKey={metric}
                  stroke={getColor(metrics.indexOf(metric))}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <>
          {/* Multiple Entities × Single Metric */}
          <SelectBox
            id="metric-select"
            label="Metric 選択"
            options={metrics.map((m) => ({ value: m, label: m }))}
            value={selectedMetric}
            onChange={setSelectedMetric}
          />

          <ItemSelector
            items={entities}
            selectedItems={selectedEntities}
            setSelectedItems={setSelectedEntities}
            label="Entities"
          />

          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={mergedChartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis width={60} />
              <Tooltip />
              <Legend />
              {selectedEntities.map((entity) => (
                <Line
                  key={entity}
                  dataKey={entity}
                  stroke={getColor(entities.indexOf(entity))}
                  type="monotone"
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};
