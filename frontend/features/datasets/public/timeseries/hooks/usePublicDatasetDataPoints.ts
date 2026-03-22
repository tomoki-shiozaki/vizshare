import { useQuery } from "@tanstack/react-query";
import { fetchPublicDatasetDataPoints } from "@/features/datasets/public/timeseries/api/fetchPublicDatasetDataPoints";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";

export const usePublicDatasetDataPoints = (datasetId: string) => {
  return useQuery<DatasetDataPointsResponse>({
    queryKey: ["publicDatasetDataPoints", datasetId],
    queryFn: () => fetchPublicDatasetDataPoints(datasetId),
    staleTime: 1000 * 60 * 60, // 1時間キャッシュ
  });
};
