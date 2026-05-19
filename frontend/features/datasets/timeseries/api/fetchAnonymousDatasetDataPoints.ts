import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetDataPointsResponse } from "@/features/datasets/types/dataset";

export const fetchAnonymousDatasetDataPoints = async (
  publicId: string,
): Promise<DatasetDataPointsResponse> => {
  const { data } = await apiClient.get(
    `/datasets/anonymous/${publicId}/timeseries/`,
  );

  return data;
};
