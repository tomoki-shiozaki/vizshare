import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AnonymousDatasetListResponse } from "@/features/datasets/types/dataset";

interface AnonymousDatasetPreviewListProps {
  data: AnonymousDatasetListResponse;
}

export function AnonymousDatasetPreviewList({
  data,
}: AnonymousDatasetPreviewListProps) {
  if (data.results.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-blue-600">
          Recent Anonymous Uploads
        </h2>
      </div>

      <div
        className="
          flex gap-4 overflow-x-auto
          snap-x snap-mandatory pb-2
        "
      >
        {data.results.map((dataset) => (
          <Link
            key={dataset.public_id}
            href={`/anonymous/${dataset.public_id}`}
            className="min-w-[220px] snap-start"
          >
            <Card
              className="
                h-full transition
                hover:bg-muted overflow-hidden
              "
            >
              <CardHeader>
                <CardTitle className="text-base truncate">
                  {dataset.name}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-xs text-muted-foreground">View dataset →</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
