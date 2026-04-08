import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  metrics: string[];
  selectedMetrics: string[];
  setSelectedMetrics: React.Dispatch<React.SetStateAction<string[]>>;
};

export const MetricSelector = ({
  metrics,
  selectedMetrics,
  setSelectedMetrics,
}: Props) => {
  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) => {
      // 1個だけのときは外せない
      if (prev.includes(metric) && prev.length === 1) {
        return prev;
      }

      return prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric];
    });
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Metrics ({selectedMetrics.length})
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMetrics(metrics)}
          >
            All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setSelectedMetrics(metrics.length ? [metrics[0]] : [])
            }
          >
            Single
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {metrics.map((metric) => (
          <div key={metric} className="flex items-center space-x-2">
            <Checkbox
              id={`metric-${metric}`}
              checked={selectedMetrics.includes(metric)}
              onCheckedChange={() => toggleMetric(metric)}
            />
            <Label htmlFor={`metric-${metric}`} className="text-sm">
              {metric}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
