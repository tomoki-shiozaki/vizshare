import { useQuery } from "@tanstack/react-query";
import { fetchDatasetDataPoints } from "@/features/dataset/api/fetchDatasetDataPoints";

export const useDatasetDataPoints = (datasetId: string) => {
  return useQuery({
    queryKey: ["dataset-datapoints", datasetId],
    queryFn: async () => {
      const res = await fetchDatasetDataPoints(datasetId!);

      return res.results.map((p) => ({
        time: p.time ?? p.raw_time!, // 正規化
        value: p.value,
        series: p.series,
      }));
    },
    enabled: !!datasetId,
  });
};
