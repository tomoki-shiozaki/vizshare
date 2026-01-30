import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetList } from "@/features/dataset/types/dataset";

interface FetchDatasetListParams {
  limit: number;
  offset: number;
}

export async function fetchDatasetList({
  limit,
  offset,
}: FetchDatasetListParams): Promise<DatasetList> {
  const { data } = await apiClient.get<DatasetList>("/datasets/list/", {
    params: { limit, offset },
  });
  return data;
}
