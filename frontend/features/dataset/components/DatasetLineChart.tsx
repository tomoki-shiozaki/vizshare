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
import { useEffect, useState } from "react";
import { Loading, SelectBox } from "@/components/common";
import { useDatasetDataPoints } from "@/features/dataset/hooks/useDatasetDataPoints";
import type { TimeSeriesPoint } from "@/features/dataset/types/dataset";

type DatasetChartProps = {
  datasetId: string | number;
};

export const DatasetLineChart = ({ datasetId }: DatasetChartProps) => {
  // データ取得（カスタムフック）
  const { data, isLoading, isError } = useDatasetDataPoints(String(datasetId));

  // 選択中の entity
  const [selectedEntity, setSelectedEntity] = useState<string>("");

  // データ取得後に初期 entity をセット
  useEffect(() => {
    if (data) {
      const id = setTimeout(() => {
        setSelectedEntity((prev) => prev || Object.keys(data)[0] || "");
      }, 0);
      return () => clearTimeout(id); // クリーンアップ
    }
  }, [data]);

  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || Object.keys(data).length === 0) return <p>データがありません</p>;

  const entities = Object.keys(data);

  // 選択中の entity のデータ
  const chartData: TimeSeriesPoint[] = selectedEntity
    ? (data[selectedEntity] ?? [])
    : [];

  // SelectBox 用オプション
  const options = entities.map((e) => ({
    value: e,
    label: e,
  }));

  // metric を自動検出（time 以外を抽出）
  const metrics =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter((k) => k !== "time")
      : [];

  // グラフの色パレット
  const colors = ["#1890ff", "#faad14", "#ff4d4f", "#52c41a", "#722ed1"];

  return (
    <div>
      <SelectBox
        id="entity-select"
        label="Entity 選択"
        options={options}
        value={selectedEntity}
        onChange={setSelectedEntity}
      />

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          {metrics.map((metric, idx) => (
            <Line
              key={metric}
              dataKey={metric}
              stroke={colors[idx % colors.length]}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
