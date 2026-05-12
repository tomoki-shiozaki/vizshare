import { apiClient } from "@/features/auth/api/apiClient";
import type { AnonymousDatasetDetailResponse } from "@/features/datasets/types/dataset";

export const fetchAnonymousDatasetDetail = async (
  id: string,
): Promise<AnonymousDatasetDetailResponse> => {
  const { data } = await apiClient.get(`/datasets/anonymous/${id}/`);

  return data;
};
