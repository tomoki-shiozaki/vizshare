# Timeseries API v2（Draft）

## 目的

時系列データを柔軟に可視化・比較できるようにする

---

## 基本データ構造（Core）

- time
- entity
- metric
- value

---

## クエリ

- entities: string[]
- metrics: string[]

---

## 方針

- modeは使わない
- フロントの表示方法に依存しすぎない
- 小規模では一括取得、大規模では分割取得を想定
