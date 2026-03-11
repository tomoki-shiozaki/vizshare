import { Label } from "@/components/ui/label";

type Props = {
  headers: string[];
  sampleRows: string[][];
  timeColumn: string;
  setTimeColumn: (v: string) => void;
  entityColumn: string;
  setEntityColumn: (v: string) => void;
  metrics: string[];
  toggleMetric: (v: string) => void;
  disabled?: boolean;
};

export function CsvSchemaSelector({
  headers,
  sampleRows,
  timeColumn,
  setTimeColumn,
  entityColumn,
  setEntityColumn,
  metrics,
  toggleMetric,
  disabled,
}: Props) {
  const getSample = (h: string) => {
    if (sampleRows.length === 0) return "";
    const idx = headers.indexOf(h);
    return sampleRows[0][idx] || "";
  };

  return (
    <div className="space-y-4">
      {/* Time列 */}
      <div>
        <Label htmlFor="time-column">Time列（必須）</Label>
        <select
          id="time-column"
          value={timeColumn}
          onChange={(e) => setTimeColumn(e.target.value)}
          className="block w-full rounded-md border px-3 py-2 text-sm"
          disabled={disabled}
        >
          <option value="">選択してください</option>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h} {sampleRows.length > 0 && `(例: ${getSample(h)})`}
            </option>
          ))}
        </select>
      </div>

      {/* Entity列 */}
      <div>
        <Label htmlFor="entity-column">Entity列（任意）</Label>
        <select
          id="entity-column"
          value={entityColumn}
          onChange={(e) => setEntityColumn(e.target.value)}
          className="block w-full rounded-md border px-3 py-2 text-sm"
          disabled={disabled}
        >
          <option value="">指定しない</option>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h} {sampleRows.length > 0 && `(例: ${getSample(h)})`}
            </option>
          ))}
        </select>
      </div>

      {/* Metrics */}
      <div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Metric列（複数選択）</legend>

          <div className="space-y-1 border rounded-md p-3">
            {headers.map((h) => (
              <label key={h} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={metrics.includes(h)}
                  onChange={() => toggleMetric(h)}
                  disabled={disabled}
                />
                {h} {sampleRows.length > 0 && `(例: ${getSample(h)})`}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
