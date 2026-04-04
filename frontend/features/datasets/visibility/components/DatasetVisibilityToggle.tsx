"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { updateDatasetVisibility } from "@/features/datasets/visibility/api/updateDatasetVisibility";
import { datasetKeys } from "@/features/datasets/queryKeys";

type Props = {
  datasetId: string;
  isPublic: boolean;
};

export function DatasetVisibilityToggle({ datasetId, isPublic }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateDatasetVisibility,
    onSuccess: () => {
      // 個別データの query を無効化
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(datasetId),
      });

      // 一覧も更新
      queryClient.invalidateQueries({
        queryKey: datasetKeys.all,
      });
    },
  });

  const handleClick = () => {
    mutation.mutate({
      id: datasetId,
      is_public: !isPublic,
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={mutation.isPending}
    >
      {isPublic ? "非公開にする" : "公開する"}
    </Button>
  );
}
