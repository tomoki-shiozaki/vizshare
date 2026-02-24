import Link from "next/link";
import type { DatasetListResponse } from "@/features/dataset/types/dataset";
import { DatasetBadge } from "@/features/dataset/components/DatasetBadge";

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

      <DatasetBadge status={dataset.status} />
    </li>
  );
}
