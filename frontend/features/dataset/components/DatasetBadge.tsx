import { Badge } from "@/components/ui/badge";
import type { DatasetStatus } from "@/features/dataset/types/dataset";
import { STATUS_LABEL, STATUS_VARIANT } from "@/features/dataset/constants";
import { Check, Loader2, AlertCircle } from "lucide-react";

type Props = {
  status: DatasetStatus;
  /** failed の場合のみ詳細メッセージを表示 */
  message?: string | null;
};

export function DatasetBadge({ status, message }: Props) {
  // アイコンをステータスごとに選択
  let icon: React.ReactNode = null;
  switch (status) {
    case "parsed":
      icon = <Check className="w-3 h-3 mr-1 inline-block" />;
      break;
    case "processing":
      icon = <Loader2 className="w-3 h-3 mr-1 inline-block animate-spin" />;
      break;
    case "failed":
      icon = <AlertCircle className="w-3 h-3 mr-1 inline-block" />;
      break;
  }

  // Badge の色とラベル
  const variant = status === "failed" ? "destructive" : STATUS_VARIANT[status];
  const label =
    status === "failed"
      ? (message ?? STATUS_LABEL[status])
      : STATUS_LABEL[status];

  return (
    <Badge
      variant={variant}
      className="text-xs px-1.5 py-0.5 inline-flex items-center gap-1"
    >
      {icon}
      {label}
    </Badge>
  );
}
