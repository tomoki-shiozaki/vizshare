"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDatasetVisibility } from "@/features/datasets/visibility/api/updateDatasetVisibility";
import { datasetKeys } from "@/features/datasets/queryKeys";
import type { DatasetVisibility } from "@/features/datasets/types/dataset";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  datasetId: string;
  visibility: DatasetVisibility;
};

const visibilityLabel: Record<DatasetVisibility, string> = {
  public: "公開",
  private: "非公開",
  unlisted: "限定公開",
};

export function DatasetVisibilityToggle({ datasetId, visibility }: Props) {
  const queryClient = useQueryClient();
  // ローカル状態で即時UI反映
  const [localVisibility, setLocalVisibility] =
    useState<DatasetVisibility>(visibility);

  const mutation = useMutation({
    mutationFn: updateDatasetVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(datasetId),
      });
      queryClient.invalidateQueries({
        queryKey: datasetKeys.all,
      });
    },
    onError: () => {
      // 失敗したら元に戻す
      setLocalVisibility(visibility);
    },
  });

  const handleChange = (next: DatasetVisibility) => {
    if (next === localVisibility) return;

    const message =
      next === "public"
        ? "このデータセットを公開しますか？"
        : next === "private"
          ? "このデータセットを非公開にしますか？"
          : "このデータセットを限定公開にしますか？";

    if (!window.confirm(message)) return;

    setLocalVisibility(next); // UIを即時更新

    mutation.mutate({
      id: datasetId,
      visibility: next,
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Select
            value={localVisibility}
            onValueChange={(value: DatasetVisibility) => handleChange(value)}
            disabled={mutation.isPending}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="public">{visibilityLabel.public}</SelectItem>
              <SelectItem value="private">{visibilityLabel.private}</SelectItem>
              <SelectItem value="unlisted">
                {visibilityLabel.unlisted}
              </SelectItem>
            </SelectContent>
          </Select>

          {mutation.isPending && (
            <span className="text-xs text-gray-500">更新中…</span>
          )}
        </div>
      </TooltipTrigger>

      <TooltipContent>現在: {visibilityLabel[localVisibility]}</TooltipContent>
    </Tooltip>
  );
}
