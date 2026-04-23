import { useQuery } from "@tanstack/react-query";
import { fetchDatasetEntityComparison } from "@/features/datasets/timeseries/api/fetchDatasetEntityComparison";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useDatasetEntityComparison = (
  datasetId: string,
  metric: string,
) => {
  return useQuery({
    queryKey: datasetKeys.entityComparison(datasetId, metric),
    queryFn: () => fetchDatasetEntityComparison(datasetId, metric),
    staleTime: 1000 * 60 * 60,
    placeholderData: (previousData) => previousData,
  });
};
