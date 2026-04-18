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
import { useState, useMemo, useEffect } from "react";
import { Loading, SelectBox } from "@/components/common";
import { ItemSelector } from "@/features/datasets/components/selectors/ItemSelector";
import { useDatasetEntityComparison } from "@/features/datasets/timeseries/hooks/useDatasetEntityComparison";

type Props = {
  datasetId: string;
};

export const DatasetEntityComparisonChart = ({ datasetId }: Props) => {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  const { data, isLoading, isError } = useDatasetEntityComparison(
    datasetId,
    selectedMetric,
  );

  // ---- entity一覧 ----
  const entities = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => k !== "time");
  }, [data]);

  // ---- metric一覧（仮想的にAPI構造から取得）----
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return [];
    return ["value"]; // ← 本来はAPI設計次第（ここ重要）
  }, [data]);

  // ---- 初期 metric ----
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selectedMetric && metrics.length > 0) {
      setSelectedMetric(metrics[0]);
    }
  }, [metrics, selectedMetric]);

  // ---- 初期 entity ----
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!entities.length) return;
    if (selectedEntities.length > 0) return;

    setSelectedEntities(entities.slice(0, 3));
  }, [entities, selectedEntities.length]);

  // ---- color ----
  const getColor = (idx: number) => `hsl(${(idx * 137.5) % 360}, 65%, 50%)`;

  // ---- loading ----
  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || data.length === 0) return <p>データがありません</p>;

  return (
    <div>
      {/* Metric選択 */}
      <SelectBox
        id="metric-select"
        label="Metric 選択"
        options={metrics.map((m) => ({ value: m, label: m }))}
        value={selectedMetric}
        onChange={setSelectedMetric}
      />

      {/* Entity選択 */}
      <ItemSelector
        items={entities}
        selectedItems={selectedEntities}
        setSelectedItems={setSelectedEntities}
        label="Entities"
      />

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis width={60} />
          <Tooltip />
          <Legend />

          {selectedEntities.map((entity, idx) => (
            <Line
              key={entity}
              dataKey={entity}
              stroke={getColor(idx)}
              type="monotone"
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
