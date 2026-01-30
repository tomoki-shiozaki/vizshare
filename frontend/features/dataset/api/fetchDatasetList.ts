import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetListResponse } from "@/features/dataset/types/dataset";

interface FetchDatasetListParams {
  limit: number;
  offset: number;
}

export async function fetchDatasetList({
  limit,
  offset,
}: FetchDatasetListParams): Promise<DatasetListResponse> {
  const { data } = await apiClient.get<DatasetListResponse>("/datasets/list/", {
    params: { limit, offset },
  });
  return data;
}
