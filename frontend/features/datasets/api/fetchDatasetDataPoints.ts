import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";

export const fetchDatasetDataPoints = async (
  datasetId: string,
): Promise<DatasetDataPointsResponse> => {
  const { data } = await apiClient.get(`/datasets/${datasetId}/data/`);
  return data;
};
