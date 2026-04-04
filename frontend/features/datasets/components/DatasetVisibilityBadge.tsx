import { Badge } from "@/components/ui/badge";

type Props = {
  isPublic: boolean;
};

export function DatasetVisibilityBadge({ isPublic }: Props) {
  return (
    <Badge variant={isPublic ? "default" : "secondary"}>
      {isPublic ? "Public" : "Private"}
    </Badge>
  );
}
