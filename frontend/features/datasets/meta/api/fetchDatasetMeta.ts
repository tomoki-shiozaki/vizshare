import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetMetaResponse } from "@/features/datasets/types/dataset";

export const fetchDatasetMeta = async (
  datasetId: string,
): Promise<DatasetMetaResponse> => {
  const { data } = await apiClient.get(`/datasets/${datasetId}/meta/`);
  return data;
};
