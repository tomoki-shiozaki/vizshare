import { useQuery } from "@tanstack/react-query";
import { fetchDatasetDataPoints } from "@/features/datasets/timeseries/api/fetchDatasetDataPoints";
import { datasetKeys } from "@/features/datasets/queryKeys";

export const useDatasetDataPoints = (datasetId: string) => {
  return useQuery({
    queryKey: datasetKeys.dataPoints(datasetId),
    queryFn: async () => {
      const res = await fetchDatasetDataPoints(datasetId);

      return {
        ...res,
        results: res.results
          .filter((r) => r.entity && r.time != null)
          .map((r) => ({
            entity: r.entity!, // filter済み
            metric: r.metric,
            time: Number(r.time), // string → number
            value: r.value ?? null, // undefined → null
          })),
      };
    },
    staleTime: 1000 * 60 * 60,
  });
};
