import Link from "next/link";
import type { PaginatedPublicDatasetListResponse } from "@/features/datasets/types/publicDataset";

type PublicDataset = PaginatedPublicDatasetListResponse["results"][number];

type Props = {
  dataset: PublicDataset;
};

export function PublicDatasetListItem({ dataset }: Props) {
  return (
    <li className="border rounded-lg p-3 hover:bg-gray-50 transition min-w-0">
      <div className="min-w-0">
        <Link
          href={`/datasets/${dataset.id}`}
          className="font-medium text-blue-600 hover:underline truncate block"
        >
          {dataset.name}
        </Link>

        <p className="text-xs text-gray-500 truncate">by {dataset.owner}</p>

        <p className="text-xs text-gray-400 truncate">
          {new Date(dataset.created_at).toLocaleString()}
        </p>
      </div>
    </li>
  );
}
