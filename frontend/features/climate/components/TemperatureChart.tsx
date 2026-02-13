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
import { fetchTemperatureData } from "@/features/climate/api/climateApi";
import type { TemperatureData } from "@/features/climate/types/climate";
import { Loading, SelectBox } from "@/components/common";

const regionLabels: Record<string, string> = {
  "Northern Hemisphere": "北半球",
  "Southern hemisphere": "南半球",
  World: "世界",
};

// 初期選択地域を決める関数
const getInitialRegion = (data: TemperatureData | undefined): string => {
  if (!data) return "";
  if (data["World"]) return "World";
  const regions = Object.keys(data);
  return regions[0] || "";
};

export const TemperatureChart = () => {
  const { data, isLoading, isError } = useQuery<TemperatureData>({
    queryKey: ["temperatureData"],
    queryFn: fetchTemperatureData,
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30日
  });

  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // データ取得後、初期地域をセット
  useEffect(() => {
    if (data && !selectedRegion) {
      const id = setTimeout(() => {
        setSelectedRegion(getInitialRegion(data));
      });
      return () => clearTimeout(id);
    }
  }, [data, selectedRegion]);

  if (isLoading) return <Loading />;
  if (isError) return <p>データの取得に失敗しました</p>;
  if (!data) return <p>データがありません</p>;

  // データに含まれる地域名の配列を取得
  const regions = Object.keys(data);
  if (regions.length === 0) return <p>地域データがありません</p>;

  const chartData = selectedRegion ? (data[selectedRegion] ?? []) : [];

  // SelectBox 用のオプション配列を作成

  // 順序固定用の配列
  const order = ["World", "Northern Hemisphere", "Southern hemisphere"];
  // order にある地域を順序通りに取得
  // value: 内部的に扱う地域キー
  // label: ユーザーに表示する地域名（日本語ラベルがあればそれを使用）
  const orderedOptions = order
    .filter((region) => regions.includes(region)) // データがあるものだけ
    .map((region) => ({
      value: region,
      label: regionLabels[region] || region,
    }));

  // order にない地域を末尾に追加（将来地域が増えても対応）
  const extraOptions = regions
    .filter((region) => !order.includes(region))
    .map((region) => ({
      value: region,
      label: regionLabels[region] || region,
    }));

  const options = [...orderedOptions, ...extraOptions];

  // 線の設定を配列でまとめて簡潔に
  const lines = [
    { key: "upper", color: "#ff4d4f", name: "上限値" },
    { key: "global_average", color: "#faad14", name: "平均値" },
    { key: "lower", color: "#1890ff", name: "下限値" },
  ];

  return (
    <div>
      {/* 地域選択 */}
      <SelectBox
        id="region-select"
        label="地域選択"
        options={options}
        value={selectedRegion}
        onChange={setSelectedRegion}
      />

      {/* チャート */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            label={{
              value: "基準平均からの変化 (°C)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.key}
              dataKey={line.key}
              stroke={line.color}
              name={line.name}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
