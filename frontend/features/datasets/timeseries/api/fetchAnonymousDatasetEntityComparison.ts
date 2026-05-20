import { apiClient } from "@/features/auth/api/apiClient";
import type { EntityComparisonPoint } from "@/features/datasets/types/dataset";

export const fetchAnonymousDatasetEntityComparison = async (
  publicId: string,
  metric: string,
): Promise<EntityComparisonPoint[]> => {
  const { data } = await apiClient.get<EntityComparisonPoint[]>(
    `/datasets/anonymous/${publicId}/timeseries/entity/`,
    {
      params: { metric },
    },
  );

  return data;
};
