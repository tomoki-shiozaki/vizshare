import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetDetail } from "@/features/dataset/types/dataset";

export const fetchDatasetDetail = async (
  id: string,
): Promise<DatasetDetail> => {
  const { data } = await apiClient.get(`/dataset/${id}/`);
  return data;
};
