import { useQuery } from "@tanstack/react-query";
import { fetchAnonymousDatasetEntityComparison } from "@/features/datasets/timeseries/api/fetchAnonymousDatasetEntityComparison";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useAnonymousDatasetEntityComparison = (
  publicId: string,
  metric: string,
) => {
  return useQuery({
    queryKey: datasetKeys.anonymousEntityComparison(publicId, metric),
    queryFn: () => fetchAnonymousDatasetEntityComparison(publicId, metric),
    staleTime: 1000 * 60 * 60,
    placeholderData: (previousData) => previousData,
  });
};
