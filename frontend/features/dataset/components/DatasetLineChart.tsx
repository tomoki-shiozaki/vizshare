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
import { useQuery } from "@tanstack/react-query";
import { Loading, SelectBox } from "@/components/common";

// 型定義（DatasetData API から返るデータ）
export type TimeSeriesPoint = {
  time: string;
  [metric: string]: number | string | undefined;
};
export type TimeSeriesDataByEntity = Record<string, TimeSeriesPoint[]>;

// Fetch 関数（Dataset ID を受け取る）
const fetchDatasetData = async (datasetId: number) => {
  const res = await fetch(`/api/dataset/${datasetId}/data/`);
  if (!res.ok) throw new Error("データ取得失敗");
  return (await res.json()) as TimeSeriesDataByEntity;
};

// Entity のラベル（必要なら日本語に変換）
const entityLabels: Record<string, string> = {
  default: "デフォルト",
  Japan: "日本",
  World: "世界",
};

type DatasetChartProps = {
  datasetId: number;
};

export const DatasetChart = ({ datasetId }: DatasetChartProps) => {
  const { data, isLoading, isError } = useQuery<TimeSeriesDataByEntity>({
    queryKey: ["datasetData", datasetId],
    queryFn: () => fetchDatasetData(datasetId),
    staleTime: 1000 * 60 * 60, // 1時間
  });

  const [selectedEntity, setSelectedEntity] = useState<string>("");

  // データ取得後に初期 entity をセット
  useEffect(() => {
    if (data && !selectedEntity) {
      const firstEntity = Object.keys(data)[0] || "";
      setSelectedEntity(firstEntity);
    }
  }, [data, selectedEntity]);

  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || Object.keys(data).length === 0) return <p>データがありません</p>;

  const entities = Object.keys(data);

  const chartData = selectedEntity ? (data[selectedEntity] ?? []) : [];

  // SelectBox 用オプション
  const options = entities.map((e) => ({
    value: e,
    label: entityLabels[e] || e,
  }));

  // metric を自動検出（最初のデータポイントから）
  const metrics =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter((k) => k !== "time")
      : [];

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
