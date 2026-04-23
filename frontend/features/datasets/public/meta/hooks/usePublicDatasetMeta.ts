import { useQuery } from "@tanstack/react-query";
import { fetchPublicDatasetMeta } from "@/features/datasets/public/meta/api/fetchPublicDatasetMeta";
import type { PublicDatasetMetaResponse } from "@/features/datasets/types/publicDataset";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const usePublicDatasetMeta = (datasetId: string) => {
  return useQuery<PublicDatasetMetaResponse>({
    queryKey: datasetKeys.publicMeta(datasetId),
    queryFn: () => fetchPublicDatasetMeta(datasetId),
    staleTime: 1000 * 60 * 60,
  });
};
