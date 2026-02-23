type Schema = {
  time: string;
  entity?: string | null;
  metrics: string[];
};

type Props = {
  schema: Schema;
};

export function DatasetSchema({ schema }: Props) {
  return (
    <div className="mt-2 border rounded">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">CSV Column</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="p-2 text-gray-500">Time</td>
            <td className="p-2">{schema.time}</td>
          </tr>

          <tr>
            <td className="p-2 text-gray-500">Entity</td>
            <td className="p-2">{schema.entity ?? "default"}</td>
          </tr>

          {schema.metrics.map((m) => (
            <tr key={m}>
              <td className="p-2 text-gray-500">Metric</td>
              <td className="p-2">{m}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
