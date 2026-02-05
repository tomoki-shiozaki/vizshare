# Time Series CSV Specification (v1)

本ドキュメントは、時系列折れ線グラフ用データを本アプリケーションに取り込むための
CSVフォーマットおよび内部正規形を定義する。

目的は以下である：

- ユーザーがExcel等で容易に作成できるCSV形式を提供する
- 内部DBでは拡張性の高い正規形（long format）で保持する
- Entity切替・複数系列（metric）表示に対応する

---

## 外部CSV仕様（アップロード形式）

### 基本構造

外部CSVは **必ず1行目にヘッダー行を含む** ものとする。

ヘッダーは各列の意味を表す。
外部CSVは以下の列構造を持つものとする：

[time][entity][metric...]

例：

```csv
Year,Entity,anomaly,lower,upper
2000,Japan,0.12,0.05,0.18
2001,Japan,0.15,0.09,0.21
2000,USA,0.08,0.03,0.14
```

### Schema 指定（列マッピング）

アップロード時、ユーザーは CSV ヘッダーの中から以下を指定する：

- time 列（必須・1列）
- entity 列（任意・最大1列）
- metrics 列（1列以上・複数指定可）

※ schema には以下のキーが存在する：

- time（必須）
- metrics（必須・1列以上）
- entity（任意）

time と metrics は必須キーであり、指定されない場合はアップロードをエラーとする。
entity が未指定の場合、サーバー側では "default" が自動的に使用される。

例：

```json
{
  "time": "Year",
  "entity": "Entity",
  "metrics": ["anomaly", "lower", "upper"]
}
```

この schema に基づき、サーバー側は：

- time / entity 列を固定フィールドとして扱う
- metrics に指定された列のみを展開対象とする
- 指定されなかった列は無視される。
- metrics に含まれない数値列が存在しても、それらは取り込まれない。
- metrics は最低1列以上指定する必要がある。

### 列の意味

### time（必須・1列）

- **説明**: 時系列軸として扱う列

- **形式例**（MVP対象）:
  - 年のみ: `2020`, `1990.0`
  - 年-月: `2023-01`, `2023/02`
  - 完全日付: `2023-01-15`, `2023/01/15`, `15/01/2023`
  - 日時（オプション）: `2023-01-15T13:45:00Z`
  - 期間ラベル（非対応）: `Q1 2023`, `2023H1`, `FY2022`
  - 順序ラベル（非対応）: `Step1`, `Stage2`

- **パースルール**:
  1. 元の文字列は `raw_time` としてそのまま保持する。
  2. 年・年-月・日付・日時は `datetime` に変換し、`time` 列へ格納する。
     - MVPでは **Year / Year-Month / Date** 形式に対応。
     - 日時や特殊ラベルは今は未対応とし、`NULL` として処理。
  3. パース不可能な場合は `time = NULL` とする。
  4. 表示およびグラフ描画時の並び順は以下とする：
     - 対象系列内のすべての行に `time` が存在する場合：  
       → `time` 昇順で並べる。
     - 1件でも `time = NULL` が含まれる場合：  
       → CSV 行順（`order_index`）を優先する。

     これは、期間ラベルや任意ステップ（例：`Q1 2023`, `Stage1` 等）が途中に混在した場合でも、ユーザーの意図した順序を保持するためである。

- **MVP対応方針**:
  - まずは Year / Year-Month / Date の形式に対応する。
  - それ以外の形式（日時ラベル、期間ラベル、任意ステップなど）は `NULL` として扱う。

- entity（任意・最大1列）
  - 系列を識別するカテゴリ（国、地域、センサーなど）

  - 文字列として扱う

  - 存在しない場合は `"default"` を自動補完する

- metric（1列以上必須）
  - 数値データ列

  - 各列が1つの系列（例：anomaly / lower / upper）

  - すべて数値または空であること

## 内部正規形（DB保存形式）

外部CSVはアップロード時に以下の正規形へ変換され、そのままDBへ保存される。

### 正規形スキーマ

```text
time | entity | metric | value
```

例：

```csv
Year,Entity,metric,value
2000,Japan,anomaly,0.12
2000,Japan,lower,0.05
2000,Japan,upper,0.18
2001,Japan,anomaly,0.15
```

### 各フィールド

- time
  - 時系列値

- entity
  - 外部CSVの entity 列

  - 無い場合 `"default"`

- metric
  - 外部CSVのヘッダ名（anomaly / lower / upper など）

- value
  - 数値

## wide形式 と long形式について

本仕様では、外部CSVと内部DBで異なるデータ形式を採用する。

### wide形式（外部CSV）

wide形式とは、1行に複数の metric 列を持つ「横に広い」構造である。

例：

```csv
Year,Entity,anomaly,lower,upper
2000,Japan,0.12,0.05,0.18
2001,Japan,0.15,0.09,0.21
```

特徴：

- metric ごとに列が増える

- Excel等で人間が編集しやすい

- グラフ用CSVとして一般的

本アプリケーションでは、ユーザー入力のしやすさを優先し、
外部CSVは wide形式を採用する。

### long形式（内部DB）

long形式とは、1つの値を1行として保持する「縦に長い」正規化構造である。

例：

```
Year,Entity,metric,value
2000,Japan,anomaly,0.12
2000,Japan,lower,0.05
2000,Japan,upper,0.18
```

特徴：

- metric が増えても列は増えず、行が増えるのみ

- SQLでの集計・フィルタリングが容易

- Entity / Metric の動的追加に強い

- 可視化UIで系列を柔軟に構成できる

本アプリケーションでは、拡張性と検索性を重視し、
内部DBでは long形式を採用する。

---

要約：

- 外部CSV：人間向け → wide形式

- 内部DB：システム向け → long形式

## 変換フロー

1. ユーザーがCSVをアップロード

2. サーバー側でCSVを行単位でパース

3. 各行について metric 列を展開

4. 正規形（time, entity, metric, value）へ変換

5. そのままDBへ bulk insert

※ 中間CSVファイルは生成しない

## 制約・ルール

- metric列は最低1つ必要

- value は数値型であること（空欄は許容）

- entity は1列のみ対応（複数次元はユーザー側で連結）

- DB側では以下を基本インデックスとする：

- (dataset_id, entity, metric, time)

## 設計方針

- 外部CSVは「人間が作りやすい wide 形式」

- 内部DBは「拡張しやすい long 形式」

- Entity / Metric の増加によって schema migration が発生しない設計とする

- 可視化UIでは entity をセレクトボックスで切替可能とする

- metric は同一 entity 内の複数系列として扱う
