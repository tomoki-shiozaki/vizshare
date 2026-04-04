export const datasetKeys = {
  all: ["datasets"] as const,
  list: () => [...datasetKeys.all] as const,
  detail: (id: string) => [...datasetKeys.all, "detail", id] as const,
};
