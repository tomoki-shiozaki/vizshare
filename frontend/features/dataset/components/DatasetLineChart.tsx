"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { useDatasetDataPoints } from "../hooks/useDatasetDataPoints";

type Props = {
  datasetId: string;
};

export const DatasetLineChart = ({ datasetId }: Props) => {
  const { data: points, isLoading, error } = useDatasetDataPoints(datasetId);

  const seriesList = useMemo(() => {
    if (!points) return [];
    return Array.from(new Set(points.map((p) => p.series ?? "value")));
  }, [points]);

  if (isLoading) return <p>Loading chart...</p>;
  if (error) return <p>Failed to load chart</p>;
  if (!points?.length) return <p>No data</p>;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="time"
            tickFormatter={(v) => new Date(v).toLocaleDateString()}
          />

          <YAxis />

          <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />

          {seriesList.map((s) => (
            <Line
              key={s}
              type="monotone"
              data={points.filter((p) => (p.series ?? "value") === s)}
              dataKey="value"
              dot={false}
              name={s}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
