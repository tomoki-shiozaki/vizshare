import { apiClient } from "@/features/auth/api/apiClient";
import type { EntityComparisonPoint } from "@/features/datasets/types/dataset";

export const fetchDatasetEntityComparison = async (
  datasetId: string,
  metric: string,
): Promise<EntityComparisonPoint[]> => {
  const { data } = await apiClient.get<EntityComparisonPoint[]>(
    `/datasets/${datasetId}/timeseries/entity/`,
    {
      params: { metric },
    },
  );
  return data;
};
