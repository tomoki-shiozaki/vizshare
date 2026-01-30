import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { DatasetListResponse } from "@/features/dataset/types/dataset";
import { STATUS_LABEL, STATUS_VARIANT } from "@/features/dataset/constants";

type Dataset = DatasetListResponse["results"][number];

type Props = {
  dataset: Dataset;
};

export function DatasetListItem({ dataset }: Props) {
  const clickable = dataset.status === "parsed";

  return (
    <li
      className={`border rounded-lg p-3 flex items-center justify-between transition
        ${clickable ? "hover:bg-gray-50" : "opacity-60"}
      `}
    >
      <div>
        {clickable ? (
          <Link
            href={`/dataset/${dataset.id}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {dataset.name}
          </Link>
        ) : (
          <p className="font-medium">{dataset.name}</p>
        )}

        <p className="text-xs text-gray-500">
          {new Date(dataset.created_at).toLocaleString()}
        </p>
      </div>

      <Badge variant={STATUS_VARIANT[dataset.status]}>
        {STATUS_LABEL[dataset.status]}
      </Badge>
    </li>
  );
}
