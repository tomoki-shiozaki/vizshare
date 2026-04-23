# CHANGELOG

すべての変更はこのファイルに記録されます。  
このフォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) に基づいています。

## [Unreleased]

### Planned

## [v0.4.0] - 2026-04-16

### Added

- 時系列グラフに Entity / Metric 切り替え機能を追加
- ホーム画面に最新データセットカードを追加

### Changed

- Cloud Run 起動時に静的ファイル生成およびマイグレーションを実行しないように改善

## [v0.3.0] - 2026-04-04

### Added

- staging環境を構築
- Datasetの公開・非公開設定の切り替え機能を追加

## [v0.2.0] - 2026-03-24

### Added

- Datasetのリスト、詳細、グラフ機能を追加
- 一般公開用のDatasetリスト、詳細、グラフ機能、CSVダウンロード機能を追加
- これらに対するテストを追加

## [v0.1.0] - 2026-02-16

### Added

- DatasetのCSV解析機能を追加
- 同期処理によるデータ解析基盤を実装
- バックグラウンド処理（Celery）を検討した初期実装を追加
