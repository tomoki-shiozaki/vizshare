import { PageLayout } from "@/components/layout";

export default function CsvFormatPage() {
  return (
    <PageLayout
      title="CSVフォーマット"
      description="VizshareではCSVファイルをアップロードすることで、時系列データの折れ線グラフを作成できます。このページではCSVの作成方法を説明します。"
    >
      <section className="space-y-6 text-sm leading-relaxed">
        {/* 基本ルール */}
        <div>
          <h2 className="text-lg font-semibold mb-2">基本ルール</h2>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              CSVファイルの<strong>1行目はヘッダ行</strong>
              である必要があります。
            </li>
            <li>
              アップロード後、各列の役割（Time / Entity / Metric）を選択します。
            </li>
            <li>
              <strong>Time列</strong>は必須です。
            </li>
            <li>
              <strong>Metric列</strong>は1つ以上必要です。
            </li>
            <li>
              <strong>Entity列</strong>は任意です。
            </li>
          </ul>
        </div>

        {/* 列の役割 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">列の役割</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Time列（必須）</h3>

              <p>
                時間・日付を表す列です。グラフの<strong>X軸</strong>になります。
              </p>

              <p className="mt-2">対応している主な形式：</p>

              <pre className="bg-gray-100 p-3 rounded text-xs mt-1">
                {`2020
1990.0
2023-01
2023/02
2023-01-15
2023/01/15
15/01/2023
2023-01-15T13:45:00Z`}
              </pre>

              <p className="mt-2">
                年・年月・日付・ISO日時などの形式は自動的に解析されます。
              </p>

              <p className="mt-2">
                解析できない値（例: <code>Q1 2023</code> や <code>Stage1</code>
                など）が含まれる場合、グラフは
                <strong>CSVファイルの行順</strong>
                をそのまま使用して表示されます。
              </p>
            </div>

            <div>
              <h3 className="font-medium">Entity列（任意）</h3>

              <p>データの対象を表します（例：国、商品、センサーなど）。</p>

              <p className="mt-2">
                Entityを指定すると、対象ごとに<strong>別の線</strong>
                として表示されます。
              </p>
            </div>

            <div>
              <h3 className="font-medium">Metric列（必須）</h3>

              <p>
                数値データの列です。グラフの<strong>Y軸</strong>になります。
              </p>

              <p className="mt-2">
                複数のMetricを指定すると、同じグラフに複数の線を表示できます。
              </p>
            </div>
          </div>
        </div>

        {/* CSV例 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">CSV例</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-1">最もシンプルな例</h3>

              <pre className="bg-gray-100 p-3 rounded text-xs">
                {`time,value
2024-01-01,10
2024-01-02,15
2024-01-03,12`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-1">Entityを含む例</h3>

              <pre className="bg-gray-100 p-3 rounded text-xs">
                {`time,entity,value
2024-01-01,Japan,10
2024-01-02,Japan,12
2024-01-01,USA,8
2024-01-02,USA,9`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium mb-1">複数Metricの例</h3>

              <pre className="bg-gray-100 p-3 rounded text-xs">
                {`time,entity,sales,profit
2024-01-01,Japan,100,20
2024-01-02,Japan,120,25
2024-01-03,Japan,115,23`}
              </pre>
            </div>
          </div>
        </div>

        {/* 注意事項 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">注意事項</h2>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              CSVは<strong>カンマ区切り</strong>である必要があります。
            </li>
            <li>
              1行目は<strong>必ずヘッダ行</strong>にしてください。
            </li>
            <li>
              Metric列は<strong>数値データ</strong>を含む必要があります。
            </li>
            <li>空欄の値は許可されています。</li>
          </ul>
        </div>

        {/* CSV作成方法 */}
        <div>
          <h2 className="text-lg font-semibold mb-2">CSV作成のヒント</h2>

          <p>
            Excel や Google Sheets で表を作成し、
            <strong>CSV形式でエクスポート</strong>すると簡単に作成できます。
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
