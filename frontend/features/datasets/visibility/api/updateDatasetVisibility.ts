import { apiClient } from "@/features/auth/api/apiClient";
import type {
  DatasetVisibilityResponse,
  DatasetVisibilityVars,
} from "@/features/datasets/types/dataset";

export const updateDatasetVisibility = async ({
  id,
  is_public,
}: DatasetVisibilityVars): Promise<DatasetVisibilityResponse> => {
  const { data } = await apiClient.patch(`/datasets/${id}/visibility/`, {
    is_public,
  });

  return data;
};
