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
import { ItemSelector } from "@/features/datasets/components/selectors/ItemSelector";

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

  // ---- entity一覧 ----
  const entities = useMemo(() => (data ? Object.keys(data) : []), [data]);

  // ---- 初期entity設定 ----
  useEffect(() => {
    if (entities.length > 0) {
      setSelectedEntity((prev) => prev || entities[0]);
    }
  }, [entities]);

  // ---- 選択entityのデータ ----
  const chartData: TimeSeriesPoint[] = useMemo(() => {
    if (!selectedEntity || !data) return [];
    return data[selectedEntity] ?? [];
  }, [data, selectedEntity]);

  // ---- metric自動検出 ----
  const metrics = useMemo(() => {
    if (chartData.length === 0) return [];
    return Object.keys(chartData[0]).filter((k) => k !== "time");
  }, [chartData]);

  // ---- 初期 metrics 選択 ----
  useEffect(() => {
    if (metrics.length > 0 && selectedMetrics.length === 0) {
      setSelectedMetrics(metrics);
    }
  }, [metrics, selectedMetrics.length]);

  // ---- colors ----
  const getColor = (idx: number) => `hsl(${(idx * 137.5) % 360}, 65%, 50%)`;

  // ---- SelectBox options ----
  const options = entities.map((e) => ({ value: e, label: e }));

  // ---- early return ----
  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || entities.length === 0) return <p>データがありません</p>;

  return (
    <div className="flex gap-6 items-start">
      {/* 左：コントロール */}
      <div className="w-64 shrink-0 space-y-4">
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
      </div>

      {/* 右：グラフ */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis width={60} />
              <Tooltip />
              {/* 👇 デフォルトLegendを無効化 */}
              <Legend content={() => null} />

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
        </div>

        {/* 👇 カスタムLegend */}
        <div className="mt-2 max-h-24 overflow-y-auto border-t pt-2 text-xs flex flex-wrap gap-3">
          {selectedMetrics.map((metric, idx) => (
            <div key={metric} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColor(idx) }}
              />
              <span className="truncate max-w-[120px]">{metric}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
