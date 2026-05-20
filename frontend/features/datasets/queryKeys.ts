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

  publicEntityComparison: (id: string, metric: string) =>
    [...datasetKeys.all, "publicEntityComparison", id, metric] as const,

  publicMeta: (id: string) => [...datasetKeys.all, "publicMeta", id] as const,

  anonymousList: () => [...datasetKeys.all, "anonymous"] as const,

  anonymousDetail: (publicId: string) =>
    [...datasetKeys.all, "anonymousDetail", publicId] as const,

  anonymousDataPoints: (publicId: string) =>
    [...datasetKeys.all, "anonymousDataPoints", publicId] as const,
};
