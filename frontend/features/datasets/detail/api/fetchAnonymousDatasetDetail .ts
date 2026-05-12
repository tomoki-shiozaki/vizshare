import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetDetailResponse } from "@/features/datasets/types/dataset";

export const fetchAnonymousDatasetDetail = async (
  id: string,
): Promise<DatasetDetailResponse> => {
  const { data } = await apiClient.get(`/datasets/anonymous/${id}/`);

  return data;
};
