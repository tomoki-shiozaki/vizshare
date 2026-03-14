import { useQuery } from "@tanstack/react-query";
import { fetchDatasetDataPoints } from "@/features/datasets/api/fetchDatasetDataPoints";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";

export const useDatasetDataPoints = (datasetId: string) => {
  return useQuery<DatasetDataPointsResponse>({
    queryKey: ["datasetDataPoints", datasetId],
    queryFn: () => fetchDatasetDataPoints(datasetId),
    staleTime: 1000 * 60 * 60,
  });
};
