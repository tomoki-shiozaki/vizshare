"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDatasetVisibility } from "@/features/datasets/visibility/api/updateDatasetVisibility";
import { datasetKeys } from "@/features/datasets/queryKeys";
import { Switch } from "@/components/ui/switch"; // shadcn/ui の Switch を想定
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  datasetId: string;
  isPublic: boolean;
};

export function DatasetVisibilityToggle({ datasetId, isPublic }: Props) {
  const queryClient = useQueryClient();

  // ローカル状態で即時UI反映
  const [localPublic, setLocalPublic] = useState(isPublic);

  const mutation = useMutation({
    mutationFn: updateDatasetVisibility,
    onSuccess: () => {
      // 成功したらキャッシュを最新化
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(datasetId),
      });
      queryClient.invalidateQueries({
        queryKey: datasetKeys.all,
      });
    },
    onError: () => {
      // 失敗したら元に戻す
      setLocalPublic(isPublic);
    },
  });

  const handleToggle = () => {
    const nextState = !localPublic;
    setLocalPublic(nextState); // UIを即時更新
    mutation.mutate({
      id: datasetId,
      is_public: nextState,
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Switch
            checked={localPublic}
            onCheckedChange={handleToggle}
            disabled={mutation.isPending}
          />
          <span className="text-sm font-medium">
            {localPublic ? "公開中" : "非公開"}
          </span>
          {mutation.isPending && (
            <span className="text-xs text-gray-500 ml-1">更新中…</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {localPublic ? "現在公開中です" : "現在非公開です"}
      </TooltipContent>
    </Tooltip>
  );
}
