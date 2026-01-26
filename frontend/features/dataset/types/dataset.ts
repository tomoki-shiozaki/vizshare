import type { components, paths } from "@/types/api";

export type DatasetUploadResponse =
  paths["/api/v1/dataset/upload/"]["post"]["responses"][201]["content"]["application/json"];

export type DatasetList =
  paths["/api/v1/dataset/list/"]["get"]["responses"][200]["content"]["application/json"];
export type DatasetStatus = components["schemas"]["StatusEnum"];
