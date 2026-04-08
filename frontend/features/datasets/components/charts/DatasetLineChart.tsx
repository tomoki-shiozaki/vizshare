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
import { MetricSelector } from "@/features/datasets/components/metrics/MetricSelector";

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

  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // entity一覧
  const entities = useMemo(() => {
    return data ? Object.keys(data) : [];
  }, [data]);

  // 初期entity設定
  useEffect(() => {
    if (entities.length > 0) {
      setSelectedEntity((prev) => prev || entities[0]);
    }
  }, [entities]);

  // 選択entityのデータ
  const chartData: TimeSeriesPoint[] = useMemo(() => {
    if (!selectedEntity || !data) return [];
    return data[selectedEntity] ?? [];
  }, [data, selectedEntity]);

  // metric自動検出
  const metrics = useMemo(() => {
    if (chartData.length === 0) return [];
    return Object.keys(chartData[0]).filter((k) => k !== "time");
  }, [chartData]);

  // 初期metric設定
  useEffect(() => {
    if (metrics.length > 0) {
      setSelectedMetrics(metrics);
    }
  }, [selectedEntity, metrics]);

  // 色パレット
  const colors = metrics.map(
    (_, idx) => `hsl(${(idx * 137.5) % 360}, 65%, 50%)`,
  );

  // SelectBox options
  const options = entities.map((e) => ({
    value: e,
    label: e,
  }));

  // early return
  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || entities.length === 0) return <p>データがありません</p>;

  return (
    <div>
      <SelectBox
        id="entity-select"
        label="Entity 選択"
        options={options}
        value={selectedEntity}
        onChange={setSelectedEntity}
      />

      <MetricSelector
        metrics={metrics}
        selectedMetrics={selectedMetrics}
        setSelectedMetrics={setSelectedMetrics}
      />

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
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
              stroke={colors[metrics.indexOf(metric)]}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
