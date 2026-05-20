import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetMetaResponse } from "@/features/datasets/types/dataset";

export const fetchAnonymousDatasetMeta = async (
  publicId: string,
): Promise<DatasetMetaResponse> => {
  const { data } = await apiClient.get(`/datasets/anonymous/${publicId}/meta/`);

  return data;
};
