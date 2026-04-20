import { useQuery } from "@tanstack/react-query";
import { fetchDatasetMeta } from "@/features/datasets/meta/api/fetchDatasetMeta";
import type { DatasetMetaResponse } from "@/features/datasets/types/dataset";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useDatasetMeta = (datasetId: string) => {
  return useQuery<DatasetMetaResponse>({
    queryKey: datasetKeys.meta(datasetId),
    queryFn: () => fetchDatasetMeta(datasetId),
    staleTime: 1000 * 60 * 60,
  });
};
