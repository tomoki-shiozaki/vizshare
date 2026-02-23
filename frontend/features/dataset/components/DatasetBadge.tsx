import { Badge } from "@/components/ui/badge";
import type { DatasetStatus } from "@/features/dataset/types/dataset";
import { STATUS_LABEL, STATUS_VARIANT } from "@/features/dataset/constants";

type Props = {
  status: DatasetStatus;
  /** failed の場合のみ詳細メッセージを表示 */
  message?: string | null;
};

export function DatasetBadge({ status, message }: Props) {
  if (status === "failed") {
    return (
      <Badge variant="destructive">{message ?? STATUS_LABEL[status]}</Badge>
    );
  }

  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
