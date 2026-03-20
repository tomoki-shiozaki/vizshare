import { apiClient } from "@/features/auth/api/apiClient";
import type { PublicDatasetDetailResponse } from "@/features/datasets/types/publicDataset";

export const fetchPublicDatasetDetail = async (
  id: string,
): Promise<PublicDatasetDetailResponse> => {
  const { data } = await apiClient.get(`/datasets/${id}/`);
  return data;
};
