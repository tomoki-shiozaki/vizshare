import { apiClient } from "@/features/auth/api/apiClient";
import type { DataPointsResponse } from "@/features/dataset/types/dataset";

export const fetchDatasetDataPoints = async (
  datasetId: string,
): Promise<DataPointsResponse> => {
  const { data } = await apiClient.get(`/datasets/${datasetId}/data-points/`);

  return data;
};
