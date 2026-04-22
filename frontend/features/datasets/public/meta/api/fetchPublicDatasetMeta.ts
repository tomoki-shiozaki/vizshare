import { apiClient } from "@/features/auth/api/apiClient";
import type { PublicDatasetMetaResponse } from "@/features/datasets/types/publicDataset";

export const fetchPublicDatasetMeta = async (
  datasetId: string,
): Promise<PublicDatasetMetaResponse> => {
  const { data } = await apiClient.get<PublicDatasetMetaResponse>(
    `/datasets/public/${datasetId}/meta/`,
  );

  return data;
};
