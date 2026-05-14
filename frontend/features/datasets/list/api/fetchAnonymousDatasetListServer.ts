import "server-only";

import { cookies } from "next/headers";

import type { AnonymousDatasetListResponse } from "@/features/datasets/types/dataset";

const BASE_URL = process.env.API_URL;

interface FetchAnonymousDatasetListParams {
  limit?: number;
  offset?: number;
}

export async function fetchAnonymousDatasetListServer(
  params: FetchAnonymousDatasetListParams = {},
): Promise<AnonymousDatasetListResponse> {
  const { limit = 10, offset = 0 } = params;

  if (!BASE_URL) {
    throw new Error("API_URL is not defined");
  }

  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const cookieStore = await cookies();

  const res = await fetch(
    `${BASE_URL}/datasets/anonymous/?${searchParams.toString()}`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },

      next: {
        revalidate: 60,
      },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();

    throw new Error(
      `Failed to fetch anonymous dataset list: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  return res.json();
}
