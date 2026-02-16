# TERRAFORM_BACKEND.md

## Terraform GCSバックエンド運用ガイド

このドキュメントは、Terraformの状態管理をGoogle Cloud Storage (GCS) バケットで行う際の注意点と運用ルールをまとめたものです。

---

## 1. バックエンド設定

Terraform設定ファイル (`*.tf`) 内で、以下のようにGCSバックエンドを指定します：

```hcl
terraform {
  backend "gcs" {
    bucket = "terraform-state-vizshare"
    prefix = "terraform/state"  # バケット内のパス
  }
}
```

- **bucket**: 使用するGCSバケット名

- **prefix**: 状態ファイルを格納するバケット内のパス

- チーム全員で同じ設定を使用すること

## 2. 認証情報（Credentials）

TerraformがGCSに状態ファイルを保存・読み書きするには、Google Cloudの認証情報が必要です。  
認証方法はいくつかあります。

### 方法1: ターミナルログイン（個人環境向け）

- ターミナルで以下を実行してGoogleアカウントにログインしている場合：

```bash
gcloud auth login
```

- Terraformはこのログイン情報を自動的に使用してGCSにアクセスできます

- 個人環境やローカル開発であれば、これだけで十分です

### 方法2: サービスアカウントのJSONキー（チーム・自動化向け）

- CI/CDやチーム環境で安定してTerraformを使いたい場合は、サービスアカウントを作成してJSONキーを使うのが推奨です

- サービスアカウントには以下の権限が必要：
  - Storage Object Admin（状態ファイルの読み書き・削除が可能）

- JSONキーを環境変数で指定します：

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

ポイント：

- 個人環境ならターミナルログインだけでもOK

- チームや自動化環境ではサービスアカウントの方が安全・安定

例：

```bash
terraform plan
terraform apply
terraform state list
terraform state rm <リソース名>
```

誤操作防止のため、バージョニングを有効にしておくと復元可能

## 4. バックエンド変更時

- バックエンド設定を変更した場合は、必ず以下を実行：

```bash
terraform init -migrate-state
```

- 既存ローカル状態をGCSに移行するか確認画面が表示されるので、通常は yes を選択

## 5. チーム作業時の注意点

- TerraformはGCS上で自動的に state lock を行う

- ただし、terraform apply 実行中に別の人が同じ環境で操作しないこと

- バックエンド設定と認証情報を統一することで競合や誤操作を防ぐ

## 6. バックアップと履歴管理

- GCSバケットの **バージョニング**を有効 にしておく

- 誤操作時や状態ファイル破損時に復元可能

- バージョニングの有無や復元手順をチームで共有すること

## 7. 推奨運用フロー（例）

1.  初回セットアップ

```bash
terraform init -migrate-state
```

2.  設定変更前に terraform plan で差分を確認

3.  安全なタイミングで terraform apply

4.  状態ファイルは常にGCSを参照
