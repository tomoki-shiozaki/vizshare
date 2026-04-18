import { useQuery } from "@tanstack/react-query";
import { fetchDatasetEntityComparison } from "@/features/datasets/timeseries/api/fetchDatasetEntityComparison";
import type { EntityComparisonPoint } from "@/features/datasets/types/dataset";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useDatasetEntityComparison = (datasetId: string) => {
  return useQuery<EntityComparisonPoint[]>({
    queryKey: datasetKeys.entityComparison(datasetId),
    queryFn: () => fetchDatasetEntityComparison(datasetId),
    staleTime: 1000 * 60 * 60,
  });
};
