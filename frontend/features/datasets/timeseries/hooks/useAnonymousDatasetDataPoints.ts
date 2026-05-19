import { useQuery } from "@tanstack/react-query";
import { fetchAnonymousDatasetDataPoints } from "@/features/datasets/timeseries/api/fetchAnonymousDatasetDataPoints";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useAnonymousDatasetDataPoints = (publicId: string) => {
  return useQuery<DatasetDataPointsResponse>({
    queryKey: datasetKeys.anonymousDataPoints(publicId),
    queryFn: () => fetchAnonymousDatasetDataPoints(publicId),
    staleTime: 1000 * 60 * 60,
    enabled: !!publicId,
  });
};
