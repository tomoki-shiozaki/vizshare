import type { components, paths } from "@/types/api";

export type DatasetUploadResponse =
  paths["/api/v1/datasets/upload/"]["post"]["responses"][201]["content"]["application/json"];

export type DatasetList =
  paths["/api/v1/datasets/list/"]["get"]["responses"][200]["content"]["application/json"];

export type DatasetDetail =
  paths["/api/v1/datasets/{id}/"]["get"]["responses"][200]["content"]["application/json"];

export type DatasetStatus = components["schemas"]["StatusEnum"];

export type DataPoint = {
  id: string;
  time: string; // ISO datetime
  value: number; // ← Serializer に合わせて変更してね
  row_index: number;
};
