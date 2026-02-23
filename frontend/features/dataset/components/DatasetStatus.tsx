import type { DatasetStatus } from "@/features/dataset/types/dataset";

type Props = {
  status: DatasetStatus;
  message?: string;
};

export function DatasetStatus({ status, message }: Props) {
  switch (status) {
    case "uploaded":
      return <div>アップロード済み（処理待ち）</div>;

    case "processing":
      return <div>CSVを解析中です...</div>;

    case "failed":
      return <div style={{ color: "red" }}>{message ?? "解析失敗"}</div>;

    case "parsed":
      return <div>解析完了</div>;

    default:
      return null;
  }
}
