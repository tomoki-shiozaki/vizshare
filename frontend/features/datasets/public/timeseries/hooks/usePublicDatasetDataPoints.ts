import { useQuery } from "@tanstack/react-query";
import { fetchPublicDatasetDataPoints } from "@/features/datasets/public/timeseries/api/fetchPublicDatasetDataPoints";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const usePublicDatasetDataPoints = (datasetId: string) => {
  return useQuery<DatasetDataPointsResponse>({
    queryKey: datasetKeys.publicDataPoints(datasetId),
    queryFn: () => fetchPublicDatasetDataPoints(datasetId),
    staleTime: 1000 * 60 * 60, // 1時間キャッシュ
  });
};
