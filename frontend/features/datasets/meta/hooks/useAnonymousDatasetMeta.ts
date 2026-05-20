import { useQuery } from "@tanstack/react-query";
import { fetchAnonymousDatasetMeta } from "@/features/datasets/meta/api/fetchAnonymousDatasetMeta";
import type { DatasetMetaResponse } from "@/features/datasets/types/dataset";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useAnonymousDatasetMeta = (publicId: string) => {
  return useQuery<DatasetMetaResponse>({
    queryKey: datasetKeys.anonymousMeta(publicId),
    queryFn: () => fetchAnonymousDatasetMeta(publicId),
    staleTime: 1000 * 60 * 60,
  });
};
