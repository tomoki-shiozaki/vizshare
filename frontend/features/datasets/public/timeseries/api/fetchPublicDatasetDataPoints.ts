import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";

export const fetchPublicDatasetDataPoints = async (
  datasetId: string,
): Promise<DatasetDataPointsResponse> => {
  const { data } = await apiClient.get(
    `/datasets/public/${datasetId}/timeseries/`,
  );
  return data;
};
