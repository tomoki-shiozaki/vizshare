import { useQuery } from "@tanstack/react-query";
import { fetchPublicDatasetEntityComparison } from "@/features/datasets/public/timeseries/api/fetchPublicDatasetEntityComparison";
import type { PublicEntityComparisonPoint } from "@/features/datasets/types/publicDataset";

export const usePublicDatasetEntityComparison = (
  datasetId: string,
  metric: string,
) => {
  return useQuery<PublicEntityComparisonPoint[]>({
    queryKey: ["publicDatasetEntityComparison", datasetId, metric],
    queryFn: () => fetchPublicDatasetEntityComparison(datasetId, metric),
    staleTime: 1000 * 60 * 60,
    placeholderData: (previousData) => previousData,
  });
};
