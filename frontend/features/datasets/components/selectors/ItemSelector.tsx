import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  items: string[];
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  label?: string;
  colorMap?: Record<string, string>;
};

export const ItemSelector = ({
  items,
  selectedItems,
  setSelectedItems,
  label = "Items",
  colorMap,
}: Props) => {
  const toggleItem = (item: string) => {
    setSelectedItems((prev) => {
      // 1個だけのときは外せない
      if (prev.includes(item) && prev.length === 1) {
        return prev;
      }

      return prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item];
    });
  };

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
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

      {/* 👇 スクロール領域 */}
      <div className="max-h-64 overflow-y-auto border rounded p-2 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded px-1 py-1"
          >
            {/* 色ドット */}
            {colorMap && (
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colorMap[item] }}
              />
            )}

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
