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
import { SelectBox } from "@/components/common";
import { ItemSelector } from "@/features/datasets/components/selectors/ItemSelector";
import { useMemo } from "react";
import type { EntityComparisonPoint } from "@/features/datasets/types/dataset";

type Props = {
  entities: string[];
  metrics: string[];
  data: EntityComparisonPoint[];

  selectedEntities: string[];
  setSelectedEntities: React.Dispatch<React.SetStateAction<string[]>>;

  selectedMetric: string;
  setSelectedMetric: React.Dispatch<React.SetStateAction<string>>;
};

export const DatasetEntityComparisonChartPure = ({
  entities,
  metrics,
  data,
  selectedEntities,
  setSelectedEntities,
  selectedMetric,
  setSelectedMetric,
}: Props) => {
  const actualMetric = selectedMetric || metrics[0] || "";

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    entities.forEach((entity, idx) => {
      map[entity] = `hsl(${(idx * 137.5) % 360}, 65%, 50%)`;
    });
    return map;
  }, [entities]);

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
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis
                width={60}
                tickFormatter={(value) => {
                  if (value >= 1_000_000)
                    return `${(value / 1_000_000).toFixed(1)}M`;
                  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
                  return value.toLocaleString();
                }}
              />
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
