import type { paths } from "@/types/api";

// =============================
// List
// =============================

export type PaginatedPublicDatasetListResponse =
  paths["/api/v1/datasets/public/"]["get"]["responses"][200]["content"]["application/json"];

// =============================
// Detail
// =============================

export type PublicDatasetDetailResponse =
  paths["/api/v1/datasets/public/{id}/"]["get"]["responses"][200]["content"]["application/json"];

// =============================
// TimeSeries
// =============================

export type PublicEntityComparisonPoint = { time: string } & Record<
  string,
  number | null
>;

export type PublicDatasetMetaResponse =
  paths["/api/v1/datasets/public/{id}/meta/"]["get"]["responses"][200]["content"]["application/json"];
