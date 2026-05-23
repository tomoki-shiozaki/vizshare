import { apiClient } from "@/features/auth/api/apiClient";
import type {
  DatasetVisibilityResponse,
  DatasetVisibilityVars,
} from "@/features/datasets/types/dataset";

export const updateDatasetVisibility = async ({
  id,
  visibility,
}: DatasetVisibilityVars): Promise<DatasetVisibilityResponse> => {
  const { data } = await apiClient.patch(`/datasets/${id}/visibility/`, {
    visibility,
  });

  return data;
};
