import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetUploadResponse } from "@/features/datasets/types/dataset";
import type { UploadVars } from "@/features/datasets/types/dataset";

export async function uploadDataset(
  vars: UploadVars,
): Promise<DatasetUploadResponse> {
  const { file, schema } = vars;

  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("source_file", file);
  formData.append("schema", JSON.stringify(schema));

  const res = await apiClient.post<DatasetUploadResponse>(
    "/datasets/create/",
    formData,
  );

  return res.data;
}
