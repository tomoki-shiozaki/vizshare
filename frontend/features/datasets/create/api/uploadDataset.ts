import { apiClient } from "@/features/auth/api/apiClient";
import type {
  AnonymousDatasetUploadResponse,
  DatasetUploadResponse,
} from "@/features/datasets/types/dataset";
import type { UploadVars } from "@/features/datasets/types/dataset";

async function uploadDatasetBase<T>(
  endpoint: string,
  vars: UploadVars,
): Promise<T> {
  const { file, schema } = vars;

  const formData = new FormData();

  formData.append("name", file.name);
  formData.append("source_file", file);
  formData.append("schema", JSON.stringify(schema));

  const res = await apiClient.post<T>(endpoint, formData);

  return res.data;
}

export function uploadDataset(vars: UploadVars) {
  return uploadDatasetBase<DatasetUploadResponse>("/datasets/create/", vars);
}

export function uploadAnonymousDataset(vars: UploadVars) {
  return uploadDatasetBase<AnonymousDatasetUploadResponse>(
    "/datasets/anonymous/create/",
    vars,
  );
}
