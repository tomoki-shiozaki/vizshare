import { apiClient } from "@/features/auth/api/apiClient";
import type { PaginatedPublicDatasetListResponse } from "@/features/datasets/types/publicDataset";

interface FetchPublicDatasetListParams {
  limit: number;
  offset: number;
}

export async function fetchPublicDatasetList({
  limit,
  offset,
}: FetchPublicDatasetListParams): Promise<PaginatedPublicDatasetListResponse> {
  const { data } = await apiClient.get<PaginatedPublicDatasetListResponse>(
    "/datasets/public/",
    {
      params: { limit, offset },
    },
  );

  return data;
}
