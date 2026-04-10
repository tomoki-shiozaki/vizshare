import type { PaginatedPublicDatasetListResponse } from "@/features/datasets/types/publicDataset";

const BASE_URL = process.env.API_URL || "http://localhost:8000/api/v1";

export async function fetchPublicDatasetListServer(
  limit = 5,
  offset = 0,
): Promise<PaginatedPublicDatasetListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const res = await fetch(`${BASE_URL}/datasets/public/?${params}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch public datasets");
  }

  return res.json();
}
