"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { updateDatasetVisibility } from "@/features/datasets/visibility/api/updateDatasetVisibility";

type Props = {
  datasetId: number;
  isPublic: boolean;
};

export function DatasetVisibilityToggle({ datasetId, isPublic }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateDatasetVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dataset", datasetId.toString()],
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
