"use client";

import { useState } from "react";
import type { DatasetSchema } from "@/features/datasets/types/dataset";

type Props = {
  schema: DatasetSchema;
};

export function DatasetSchemaView({ schema }: Props) {
  const [expanded, setExpanded] = useState(false);

  const MAX = 10;
  const metrics = schema.metrics ?? [];

  const visibleMetrics = expanded ? metrics : metrics.slice(0, MAX);
  const restCount = metrics.length - MAX;

  return (
    <div className="mt-2 border rounded">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">役割</th>
            <th className="p-2 text-left">CSV列名</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="p-2 text-gray-500">Time</td>
            <td className="p-2">{schema.time}</td>
          </tr>

          <tr>
            <td className="p-2 text-gray-500">Entity</td>
            <td className="p-2">{schema.entity ?? "__default__"}</td>
          </tr>

          {/* Metricsまとめ表示 */}
          <tr>
            <td className="p-2 text-gray-500 align-top">Metrics</td>
            <td className="p-2">
              <div className="flex flex-wrap gap-1">
                {visibleMetrics.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                  >
                    {m}
                  </span>
                ))}

                {!expanded && restCount > 0 && (
                  <span className="text-xs text-gray-500">
                    +{restCount} more
                  </span>
                )}
              </div>

              {metrics.length > MAX && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-xs text-blue-500 hover:underline"
                >
                  {expanded ? "閉じる" : "すべて表示"}
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
