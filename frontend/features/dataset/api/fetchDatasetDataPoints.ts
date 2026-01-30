import { apiClient } from "@/features/auth/api/apiClient";
import type { DataPoint } from "@/features/dataset/types/dataset";

export const fetchDatasetDataPoints = async (
  datasetId: string,
): Promise<DataPoint[]> => {
  const { data } = await apiClient.get(`/datasets/${datasetId}/datapoints/`);
  return data;
};
