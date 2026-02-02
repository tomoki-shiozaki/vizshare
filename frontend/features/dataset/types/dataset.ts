import type { components, paths } from "@/types/api";

export type DatasetUploadResponse =
  paths["/api/v1/datasets/upload/"]["post"]["responses"][201]["content"]["application/json"];

export type DatasetListResponse =
  paths["/api/v1/datasets/list/"]["get"]["responses"][200]["content"]["application/json"];

export type DatasetDetailResponse =
  paths["/api/v1/datasets/{id}/"]["get"]["responses"][200]["content"]["application/json"];

export type DatasetStatus = components["schemas"]["StatusEnum"];

export type DataPointsResponse =
  paths["/api/v1/datasets/{dataset_id}/data-points/"]["get"]["responses"][200]["content"]["application/json"];
