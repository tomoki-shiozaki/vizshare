import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  items: string[];
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  label?: string;
};

export const ItemSelector = ({
  items,
  selectedItems,
  setSelectedItems,
  label = "Items",
}: Props) => {
  const toggleItem = (item: string) => {
    // 1個だけのときは外せない
    if (selectedItems.includes(item) && selectedItems.length === 1) {
      return;
    }

    const next = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];

    setSelectedItems(next);
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {label} ({selectedItems.length})
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedItems(items)}
          >
            All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedItems(items.length ? [items[0]] : [])}
          >
            Single
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`item-${item}`}
              checked={selectedItems.includes(item)}
              onCheckedChange={() => toggleItem(item)}
            />
            <Label htmlFor={`item-${item}`} className="text-sm">
              {item}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
