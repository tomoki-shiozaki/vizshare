import type { paths } from "@/types/api";

export type PaginatedPublicDatasetListResponse =
  paths["/api/v1/datasets/public/"]["get"]["responses"][200]["content"]["application/json"];
