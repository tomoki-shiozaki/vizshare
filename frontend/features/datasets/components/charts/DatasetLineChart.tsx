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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

  // metricトグル
  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) => {
      // 1個だけのときは外せない
      if (prev.includes(metric) && prev.length === 1) {
        return prev;
      }

      return prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric];
    });
  };

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

      {/* metric選択 */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Metrics ({selectedMetrics.length})
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMetrics(metrics)}
            >
              All
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedMetrics(metrics.length ? [metrics[0]] : [])
              }
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {metrics.map((metric) => (
            <div key={metric} className="flex items-center space-x-2">
              <Checkbox
                id={`metric-${metric}`}
                checked={selectedMetrics.includes(metric)}
                onCheckedChange={() => toggleMetric(metric)}
              />
              <Label htmlFor={`metric-${metric}`} className="text-sm">
                {metric}
              </Label>
            </div>
          ))}
        </div>
      </div>

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
