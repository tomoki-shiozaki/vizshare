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
