import type { components, paths } from "@/types/api";

export type DatasetUploadResponse =
  paths["/api/v1/datasets/upload/"]["post"]["responses"][201]["content"]["application/json"];
export type DatasetUploadSchema = {
  time: string;
  entity?: string;
  metrics: string[];
};
export type UploadVars = {
  file: File;
  schema: DatasetUploadSchema;
};

export type DatasetListResponse =
  paths["/api/v1/datasets/list/"]["get"]["responses"][200]["content"]["application/json"];

export type DatasetDetailResponse =
  paths["/api/v1/datasets/{id}/"]["get"]["responses"][200]["content"]["application/json"];

export type DatasetStatus = components["schemas"]["StatusEnum"];
export type DatasetSchema = components["schemas"]["DatasetSchema"];

export type TimeSeriesPoint = {
  time: string;
  [metric: string]: number | string; // time 以外は任意の metric
};
export type DatasetDataPointsResponse = Record<string, TimeSeriesPoint[]>;
