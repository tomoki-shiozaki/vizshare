import type { DatasetStatus } from "@/features/dataset/types/dataset";

export const STATUS_LABEL: Record<DatasetStatus, string> = {
  uploaded: "アップロード済み",
  processing: "処理中",
  parsed: "解析完了",
  failed: "失敗",
};

export const STATUS_VARIANT: Record<
  DatasetStatus,
  "default" | "secondary" | "destructive"
> = {
  parsed: "default",
  processing: "secondary",
  uploaded: "secondary",
  failed: "destructive",
};
