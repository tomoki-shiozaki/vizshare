export const datasetKeys = {
  all: ["datasets"] as const,

  list: () => [...datasetKeys.all] as const,
  detail: (id: string) => [...datasetKeys.all, "detail", id] as const,
  dataPoints: (id: string) => [...datasetKeys.all, "dataPoints", id] as const,

  entityComparison: (id: string, metric: string) =>
    [...datasetKeys.all, "entityComparison", id, metric] as const,
  meta: (id: string) => [...datasetKeys.all, "meta", id] as const,

  publicList: () => [...datasetKeys.all, "public"] as const,
  publicDetail: (id: string) =>
    [...datasetKeys.all, "publicDetail", id] as const,
  publicDataPoints: (id: string) =>
    [...datasetKeys.all, "publicDataPoints", id] as const,

  publicEntityComparison: (id: string) =>
    [...datasetKeys.all, "publicEntityComparison", id] as const,
};
