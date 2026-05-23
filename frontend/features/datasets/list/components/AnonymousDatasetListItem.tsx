import Link from "next/link";

import type { AnonymousDatasetListResponse } from "@/features/datasets/types/dataset";

import { DatasetBadge } from "@/features/datasets/components/DatasetBadge";

type Dataset = AnonymousDatasetListResponse["results"][number];

type Props = {
  dataset: Dataset;
};

export function AnonymousDatasetListItem({ dataset }: Props) {
  const clickable = dataset.status === "parsed";

  return (
    <li
      className={`
        border rounded-lg p-3 flex items-center justify-between transition min-w-0
        ${clickable ? "hover:bg-gray-50" : "opacity-60"}
      `}
    >
      <div className="flex-1 min-w-0">
        {clickable ? (
          <Link
            href={`/datasets/anonymous/${dataset.public_id}`}
            className="font-medium text-blue-600 hover:underline truncate block"
          >
            {dataset.name}
          </Link>
        ) : (
          <p className="font-medium truncate">{dataset.name}</p>
        )}

        <p className="text-xs text-gray-500 truncate">
          {new Date(dataset.created_at).toLocaleString()}
        </p>
      </div>

      <div className="ml-3 flex items-center gap-2 flex-shrink-0">
        <DatasetBadge status={dataset.status} />
      </div>
    </li>
  );
}
