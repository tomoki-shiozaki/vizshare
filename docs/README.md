# 気候変動データ可視化アプリ開発プロジェクト

## 1. プロジェクト概要

- **プロジェクト名：** 気候変動データ可視化アプリ開発プロジェクト
- **前提：**
  - 気候変動関連のオープンデータ（気温、CO₂ 排出量など）は [Our World in Data (OWID) ](https://ourworldindata.org/)の API や CSV として整備されている。
  - GitHub Actions を用いて OWID のデータを定期的に取得し、Neon PostgreSQL に蓄積する構成を採用。
  - バックエンドは Cloud Run（Django REST Framework + PostgreSQL）、フロントエンドは Render（React）で運用。
- **データ例：**
  - 世界平均気温の変化（年次）
  - 国別・年別 CO₂ 排出量
- **開発目的：**
  - フロントエンド（React）とバックエンド（DRF）をクラウド環境で運用するフルスタック開発の実践。
  - CI/CD、インフラ（Google Cloud / Cloud Run、Render）、バッチ処理（GitHub Actions）など、実務レベルの構成を経験する。
  - バッチ処理や API 連携を通して、データ処理・API 設計の経験を積む
  - ユーザーが直感的に気候データを理解できるインタラクティブな可視化体験を提供する。
- **現在の実装状況（MVP 実装内容）**
  - GitHub Actions による定期バッチで OWID データを取得し Neon DB に保存
  - DRF による API（気温・CO₂ 排出データ）を Cloud Run 上で提供
  - React（Render）で気温変化のグラフ表示・CO₂ 排出量マップなどの UI を提供
  - エラーハンドリング・ローディング UI、簡易的な説明文・出典表示を実装

---

## 2. システム構成図（アーキテクチャ）

本プロジェクトの全体構成は以下の通りです。  
フロントエンド、バックエンド、データベース、定期バッチ処理の関係を示しています。

![System Architecture](system_architecture/system_architecture/system_architecture.svg)

### 説明

- **フロントエンド**：React + Render
- **バックエンド**：Django REST Framework + Cloud Run
- **データベース**：Neon PostgreSQL
- **定期バッチ**：GitHub Actions が OWID API からデータを取得し DB に保存
- **CI/CD**：Cloud Build → Artifact Registry → Cloud Run、フロントは Render に自動デプロイ
- **ログ**：Cloud Logging を利用

---

## 2.1 ER図

![ER Diagram](er/er/er.svg)

- Region / Indicator / ClimateData を中心とした時系列データモデル
- IndicatorGroup による指標分類
- User は現在は認証専用

---

## 3. ターゲットユーザー

- 気候変動に関心のある一般ユーザー・学生・学習者
- 各国のデータを比較・観察したい人
- 環境問題を「データから」理解したい層

---

## 4. 利用シーンの想定

- 世界全体または特定地域（北半球・南半球）の気温変化をグラフで確認
- CO₂ 排出量の推移を年単位で可視化

---

## 5. 機能定義

### 🔹 基本機能（MVP）

#### 1. データ取得（バックエンド）

- Our World in Data の CSV/API から定期的にデータを取得
- GitHub Actions から Django 管理コマンドを実行して自動更新
- データ正規化・欠損補完などの前処理を実施

#### 2. データ保存・API 提供

- Django モデルを定義し、PostgreSQL に保存
- 指標・地域・年をキーとする構造化データ設計
- Django REST Framework で API を構築
  - `/api/temperature/`
  - `/api/co2/`

#### 3. データ可視化（フロントエンド）

- React + Recharts による折れ線グラフ表示
- 気温グラフ：セレクトボックスで地域を切り替え
- CO₂ 排出量マップ：年スライダーで排出量推移を可視化
- 年次推移をインタラクティブに表示

#### 4. 解説セクション

- 簡易な説明と出典（Our World in Data）へのリンクを設置

---

## 6. 使用技術スタック

| 分類           | 技術                                                     |
| -------------- | -------------------------------------------------------- |
| フロントエンド | React, TypeScript, Recharts, React Leaflet, Tailwind CSS |
| バックエンド   | Django, Django REST Framework                            |
| データベース   | PostgreSQL                                               |
| インフラ       | Docker, docker-compose                                   |
| デプロイ       | Google Cloud / Render                                    |
| テスト         | pytest, Vitest                                           |
| バージョン管理 | Git, GitHub                                              |

## 補足

本プロジェクトは [v1 の可視化アプリ](https://github.com/tomoki-shiozaki/climate-change-app)を基にしています。  
v2 では Next.js を採用し、フロント・バックエンド構成を刷新するとともに、  
将来的にはユーザー CSV アップロード型の汎用可視化機能を開発中です。
