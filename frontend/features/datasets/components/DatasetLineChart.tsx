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
  Brush,
} from "recharts";
import { useEffect, useState } from "react";
import { Loading, SelectBox } from "@/components/common";
import type {
  DatasetDataPointsResponse,
  TimeSeriesPoint,
} from "@/features/datasets/types/dataset";

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

  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [metricsToShow, setMetricsToShow] = useState<string[]>([]);

  // データ取得後に初期選択セット
  useEffect(() => {
    if (data) {
      const entities = Object.keys(data);
      setSelectedEntities((prev) => (prev.length ? prev : [entities[0]]));

      const initialMetrics = data[entities[0]]?.length
        ? Object.keys(data[entities[0]][0]).filter((k) => k !== "time")
        : [];
      setMetricsToShow(initialMetrics);
    }
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || Object.keys(data).length === 0) return <p>データがありません</p>;

  const entities = Object.keys(data);

  // 選択中のEntityのデータをマージしてchartDataを作成
  const chartData: TimeSeriesPoint[] = [];
  if (selectedEntities.length > 0) {
    const maxLength = Math.max(
      ...selectedEntities.map((e) => data[e]?.length || 0),
    );
    for (let i = 0; i < maxLength; i++) {
      const point: TimeSeriesPoint = { time: "" };
      selectedEntities.forEach((e) => {
        const entityData = data[e] || [];
        const entityPoint = entityData[i] || {};
        Object.entries(entityPoint).forEach(([k, v]) => {
          if (k !== "time") {
            point[`${e}_${k}`] = v;
          } else {
            point.time = entityPoint.time || point.time;
          }
        });
      });
      chartData.push(point);
    }
  }

  // 全ラインのメトリクスリスト
  const allMetrics = selectedEntities.flatMap((e) => {
    const entityMetrics = data[e]?.[0]
      ? Object.keys(data[e][0]).filter((k) => k !== "time")
      : [];
    return entityMetrics.map((m) => `${e}_${m}`);
  });

  const colors = allMetrics.map(
    (_, idx) => `hsl(${(idx * 137.5) % 360}, 65%, 50%)`,
  );

  return (
    <div>
      {/* Entity選択マルチセレクト */}
      <SelectBox
        id="entity-select"
        label="Entity 選択"
        options={entities.map((e) => ({ value: e, label: e }))}
        value={selectedEntities}
        onChange={setSelectedEntities}
      />

      {/* Metric選択 */}
      <div className="my-2">
        <p>表示するMetricを選択:</p>
        {allMetrics.map((metric) => (
          <label key={metric} className="mr-4">
            <input
              type="checkbox"
              checked={metricsToShow.includes(metric)}
              onChange={(e) => {
                if (e.target.checked) {
                  setMetricsToShow((prev) => [...prev, metric]);
                } else {
                  setMetricsToShow((prev) => prev.filter((m) => m !== metric));
                }
              }}
            />
            {metric}
          </label>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis width={60} />
          <Tooltip
            formatter={(value?: number, name?: string) => [
              value !== undefined ? value.toFixed(2) : "-",
              name || "",
            ]}
          />
          <Legend />
          {metricsToShow.map((metric, idx) => (
            <Line
              key={metric}
              dataKey={metric}
              stroke={colors[idx]}
              type="monotone"
              dot={false}
            />
          ))}
          <Brush dataKey="time" height={30} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
