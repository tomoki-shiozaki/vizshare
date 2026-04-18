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
import { Loading } from "@/components/common";
import { ItemSelector } from "@/features/datasets/components/selectors/ItemSelector";
import { useDatasetEntityComparison } from "@/features/datasets/timeseries/hooks/useDatasetEntityComparison";

type Props = {
  datasetId: string;
};

export const DatasetEntityComparisonChart = ({ datasetId }: Props) => {
  const { data, isLoading, isError } = useDatasetEntityComparison(datasetId);

  // ---- entity一覧 ----
  const entities = useMemo(() => {
    if (!data || data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.filter((k) => k !== "time");
  }, [data]);

  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);

  // ---- 初期選択 ----
  useEffect(() => {
    if (entities.length > 0 && selectedEntities.length === 0) {
      setSelectedEntities(entities.slice(0, 3));
    }
  }, [entities, selectedEntities.length]);

  // ---- color ----
  const getColor = (idx: number) => `hsl(${(idx * 137.5) % 360}, 65%, 50%)`;

  // ---- loading ----
  if (isLoading) return <Loading />;
  if (isError) return <p>データ取得に失敗しました</p>;
  if (!data || data.length === 0) return <p>データがありません</p>;

  return (
    <div>
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
