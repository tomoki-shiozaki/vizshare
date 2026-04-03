export const datasetKeys = {
  all: ["datasets"] as const,
  list: () => [...datasetKeys.all] as const,
};
