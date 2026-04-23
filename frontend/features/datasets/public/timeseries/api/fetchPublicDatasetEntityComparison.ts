import { apiClient } from "@/features/auth/api/apiClient";
import type { PublicEntityComparisonPoint } from "@/features/datasets/types/publicDataset";

export const fetchPublicDatasetEntityComparison = async (
  datasetId: string,
  metric: string,
): Promise<PublicEntityComparisonPoint[]> => {
  const { data } = await apiClient.get<PublicEntityComparisonPoint[]>(
    `/datasets/public/${datasetId}/timeseries/entity/`,
    {
      params: { metric },
    },
  );

  return data;
};
