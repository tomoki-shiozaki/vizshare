import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetListResponse } from "@/features/datasets/types/dataset";

interface FetchPublicDatasetListParams {
  limit: number;
  offset: number;
}

export async function fetchPublicDatasetList({
  limit,
  offset,
}: FetchPublicDatasetListParams): Promise<DatasetListResponse> {
  const { data } = await apiClient.get<DatasetListResponse>(
    "/datasets/public/",
    {
      params: { limit, offset },
    },
  );

  return data;
}
