import { useQuery } from "@tanstack/react-query";
import { fetchDatasetDataPoints } from "@/features/dataset/api/fetchDatasetDataPoints";

export const useDatasetDataPoints = (datasetId?: string) => {
  return useQuery({
    queryKey: ["dataset-datapoints", datasetId],
    queryFn: () => fetchDatasetDataPoints(datasetId!),
    enabled: !!datasetId,
  });
};
