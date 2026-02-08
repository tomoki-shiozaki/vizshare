# VizShare

[![Build Status](https://github.com/tomoki-shiozaki/vizshare/actions/workflows/ci.yml/badge.svg)](https://github.com/tomoki-shiozaki/vizshare/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/tomoki-shiozaki/vizshare/graph/badge.svg?token=I2xQkzVOsv)](https://codecov.io/gh/tomoki-shiozaki/vizshare)
[![Terraform Plan](https://github.com/tomoki-shiozaki/vizshare/actions/workflows/terraform-plan.yml/badge.svg)](https://github.com/tomoki-shiozaki/vizshare/actions/workflows/terraform-plan.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

VizShare app enables you to upload, visualize, and share data with others.

---

## 使用技術

- Django REST Framework, Next.js（App Router）, PostgreSQL
- Vercel / Render（デプロイ環境）
- GitHub Actions（定期バッチ処理）
- Terraform（バックエンドインフラ管理）

---

## 主な変更点（v1 → v2）

- フロントエンドを Next.js に置き換え、Vercel でデプロイ
- バックエンドのインフラを Terraform で管理

---

## 機能

- 気温データの時系列グラフ表示
- 国別 CO₂ 排出量の色分けマップ表示（年度スライダー対応）
- JWT による認証・ログイン/ログアウト
- [Our World in Data（OWID）](https://ourworldindata.org/) の気候データを定期取得

## 開発中の機能

- CSV アップロードによるユーザーデータの可視化
  - 時系列データに対応
  - アップロード・整形後にグラフ表示

---

## デプロイ URL

1. **推奨環境**  
   [Vercel フロント / Google Cloud バック](https://vizshare.vercel.app/)  
   ※バックエンドはスリープ復帰に時間がかかる場合があります（目安：最大約 20~25 秒）。

2. **代替環境（Render のみ）**  
   [Render フロント＆バック](https://vizshare.onrender.com/)  
   ※フロントは最大 40 秒、バックエンドは最大 50~60 秒かかる場合があります。

---

## デモ用アカウント（ポートフォリオ閲覧用）

※ 本アプリはログインが前提です。動作確認には以下アカウントをご利用ください。

| ユーザー名  | メールアドレス   | パスワード       |
| ----------- | ---------------- | ---------------- |
| demo_user   | demo@example.com | climate-demo-123 |

---

## 気温変化グラフ

![Temperature Chart](docs/screenshots/temperature-chart-v2.png)

---

## CO₂ 排出量マップ（年度スライダー）

年度スライダーを動かすと各国の色分けが変化します。（自動再生機能あり）

![CO₂ Map Demo](./docs/images/co2-map-demo.gif)

---

## ドキュメント

詳細なシステム構成や設計案は [docs/README.md](docs/README.md) を参照してください。  
※設計案は開発構想を含むため、実装と完全には一致しない場合があります。
