import type { components, paths } from "@/types/api";

// =============================
// Upload
// =============================

export type DatasetUploadResponse =
  paths["/api/v1/datasets/create/"]["post"]["responses"][201]["content"]["application/json"];

export type DatasetUploadSchema = {
  time: string;
  entity?: string;
  metrics: string[];
};

export type UploadVars = {
  file: File;
  schema: DatasetUploadSchema;
};

// =============================
// List
// =============================

export type DatasetListResponse =
  paths["/api/v1/datasets/"]["get"]["responses"][200]["content"]["application/json"];

// =============================
// Detail
// =============================

export type DatasetDetailResponse =
  paths["/api/v1/datasets/{id}/"]["get"]["responses"][200]["content"]["application/json"];

// =============================
// Common
// =============================

export type DatasetStatus = components["schemas"]["StatusEnum"];

export type DatasetSchema = components["schemas"]["DatasetSchema"];

// =============================
// TimeSeries
// =============================

export type DatasetDataPointsResponse =
  paths["/api/v1/datasets/{id}/data-points/"]["get"]["responses"][200]["content"]["application/json"];

export type DatasetMetaResponse =
  paths["/api/v1/datasets/{id}/meta/"]["get"]["responses"][200]["content"]["application/json"];

// =============================
// Visibility
// =============================

export type DatasetVisibilityResponse =
  paths["/api/v1/datasets/{id}/visibility/"]["patch"]["responses"][200]["content"]["application/json"];

export type DatasetVisibilityVars = {
  id: string;
  is_public: boolean;
};
