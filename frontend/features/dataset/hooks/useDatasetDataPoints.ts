import { useQuery } from "@tanstack/react-query";
import { fetchDatasetDataPoints } from "@/features/dataset/api/fetchDatasetDataPoints";
import type { DatasetDataPointsResponse } from "@/features/dataset/types/dataset";

export const useDatasetDataPoints = (datasetId: string) => {
  return useQuery<DatasetDataPointsResponse>({
    queryKey: ["datasetDataPoints", datasetId],
    queryFn: () => fetchDatasetDataPoints(datasetId),
    staleTime: 1000 * 60 * 60,
  });
};
