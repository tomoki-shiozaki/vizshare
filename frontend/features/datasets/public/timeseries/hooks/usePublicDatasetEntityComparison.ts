import { useQuery } from "@tanstack/react-query";
import { fetchPublicDatasetEntityComparison } from "@/features/datasets/public/timeseries/api/fetchPublicDatasetEntityComparison";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const usePublicDatasetEntityComparison = (
  datasetId: string,
  metric: string,
) => {
  return useQuery({
    queryKey: datasetKeys.publicEntityComparison(datasetId, metric),
    queryFn: () => fetchPublicDatasetEntityComparison(datasetId, metric),
    staleTime: 1000 * 60 * 60,
    placeholderData: (previousData) => previousData,
  });
};
