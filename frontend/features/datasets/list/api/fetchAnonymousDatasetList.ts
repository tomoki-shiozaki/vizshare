import { apiClient } from "@/features/auth/api/apiClient";

import type { AnonymousDatasetListResponse } from "@/features/datasets/types/dataset";

export async function fetchAnonymousDatasetList(): Promise<AnonymousDatasetListResponse> {
  const { data } = await apiClient.get<AnonymousDatasetListResponse>(
    "/datasets/anonymous/",
  );

  return data;
}
