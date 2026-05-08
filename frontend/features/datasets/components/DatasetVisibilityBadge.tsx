import { Badge } from "@/components/ui/badge";
import type { DatasetVisibility } from "@/features/datasets/types/dataset";
type Props = {
  visibility: DatasetVisibility;
};

const config: Record<
  DatasetVisibility,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  public: {
    label: "Public",
    variant: "default",
  },
  private: {
    label: "Private",
    variant: "secondary",
  },
  unlisted: {
    label: "Unlisted",
    variant: "outline",
  },
};

export function DatasetVisibilityBadge({ visibility }: Props) {
  const { label, variant } = config[visibility];

  return <Badge variant={variant}>{label}</Badge>;
}
