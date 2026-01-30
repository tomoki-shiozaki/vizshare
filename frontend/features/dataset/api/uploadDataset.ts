import { apiClient } from "@/features/auth/api/apiClient";
import type { DatasetUploadResponse } from "@/features/dataset/types/dataset";

export type UploadVars = {
  file: File;
  timeColumn: string;
  valueColumn: string;
  seriesColumn?: string;
};

export async function uploadDataset(
  vars: UploadVars,
): Promise<DatasetUploadResponse> {
  const { file, timeColumn, valueColumn, seriesColumn } = vars;

  const formData = new FormData();
  formData.append("name", file.name);
  formData.append("source_file", file);

  const schema: Record<string, string> = {
    time: timeColumn,
    value: valueColumn,
  };
  if (seriesColumn) schema.series = seriesColumn;

  formData.append("schema", JSON.stringify(schema));

  const res = await apiClient.post<DatasetUploadResponse>(
    "/datasets/upload/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return res.data;
}
