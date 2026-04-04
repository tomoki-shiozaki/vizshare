import { useQuery } from "@tanstack/react-query";
import { fetchDatasetDataPoints } from "@/features/datasets/timeseries/api/fetchDatasetDataPoints";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useDatasetDataPoints = (datasetId: string) => {
  return useQuery<DatasetDataPointsResponse>({
    queryKey: datasetKeys.dataPoints(datasetId),
    queryFn: () => fetchDatasetDataPoints(datasetId),
    staleTime: 1000 * 60 * 60,
  });
};
