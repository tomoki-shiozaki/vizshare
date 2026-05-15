import { apiClient } from "@/features/auth/api/apiClient";

import type { AnonymousDatasetListResponse } from "@/features/datasets/types/dataset";

interface FetchAnonymousDatasetListParams {
  limit: number;
  offset: number;
}

export async function fetchAnonymousDatasetList({
  limit,
  offset,
}: FetchAnonymousDatasetListParams): Promise<AnonymousDatasetListResponse> {
  const { data } = await apiClient.get<AnonymousDatasetListResponse>(
    "/datasets/anonymous/",
    {
      params: {
        limit,
        offset,
      },
    },
  );

  return data;
}
