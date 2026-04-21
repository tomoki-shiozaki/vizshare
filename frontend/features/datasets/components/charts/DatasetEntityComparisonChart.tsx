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
import { useDatasetMeta } from "@/features/datasets/meta/hooks/useDatasetMeta";

type Props = {
  datasetId: string;
};

export const DatasetEntityComparisonChart = ({ datasetId }: Props) => {
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  // ---- meta ----
  const {
    data: meta,
    isLoading: isMetaLoading,
    isError: isMetaError,
  } = useDatasetMeta(datasetId);

  const entities = useMemo(() => meta?.entities ?? [], [meta]);
  const metrics = useMemo(() => meta?.metrics ?? [], [meta]);

  // ---- metric（derived）----
  const actualMetric = selectedMetric || metrics[0] || "";

  // ---- 🔥 初期選択をここで一度だけ入れる ----

  useEffect(() => {
    if (entities.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedEntities((prev) => {
      if (prev.length > 0) return prev;
      return entities.slice(0, 3);
    });
  }, [entities]);

  // ---- data ----
  const {
    data,
    isLoading: isDataLoading,
    isError: isDataError,
  } = useDatasetEntityComparison(datasetId, actualMetric);

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    entities.forEach((entity, idx) => {
      map[entity] = `hsl(${(idx * 137.5) % 360}, 65%, 50%)`;
    });
    return map;
  }, [entities]);

  // ---- loading ----
  if (isMetaLoading || isDataLoading) return <Loading />;
  if (isMetaError || isDataError) return <p>データ取得に失敗しました</p>;
  if (!meta) return <p>メタデータがありません</p>;
  if (!data || data.length === 0) return <p>データがありません</p>;

  return (
    <div className="flex gap-6 items-start">
      {/* 左：コントロール */}
      <div className="w-64 shrink-0 space-y-4">
        <SelectBox
          id="metric-select"
          label="Metric 選択"
          options={metrics.map((m) => ({ value: m, label: m }))}
          value={actualMetric}
          onChange={setSelectedMetric}
        />

        {/* 👇 ラッパー削除 */}
        <ItemSelector
          items={entities}
          selectedItems={selectedEntities}
          setSelectedItems={setSelectedEntities}
          label="Entities"
          colorMap={colorMap}
        />
      </div>

      {/* 右：グラフ */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* グラフ */}
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis width={60} />
              <Tooltip />
              {/* 👇 Legend無効化 */}
              <Legend content={() => null} />

              {selectedEntities.map((entity) => (
                <Line
                  key={entity}
                  dataKey={entity}
                  stroke={colorMap[entity]}
                  type="monotone"
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 👇 下にLegend */}
        <div className="mt-2 max-h-24 overflow-y-auto border-t pt-2 text-xs flex flex-wrap gap-3">
          {selectedEntities.map((entity) => (
            <div key={entity} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorMap[entity] }}
              />
              <span className="truncate max-w-[120px]">{entity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
