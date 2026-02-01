## 🧱 開発環境のセットアップ（Docker）

このプロジェクトでは Docker Compose を使用しています。
コンテナ内ユーザーをホストユーザーと一致させるため、ビルド前に `.env` ファイルを作成してください。

### 1. `.env` ファイルの作成

プロジェクトルート（`docker-compose.yml` と同じ階層）で次を実行します：

```bash
echo "UID=$(id -u)" > .env
echo "GID=$(id -g)" >> .env
```

## 🛠 Terraform Service Account インポート手順

このプロジェクトでは、既存の cloudbuild_runner および terraform_sa サービスアカウントを Terraform 管理下に置く必要があります。

### 1. cloudbuild_runner SA のインポート

```bash
terraform import google_service_account.cloudbuild_runner \
cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com
```

### 2. terraform_sa SA のインポート

```bash
terraform import google_service_account.terraform_sa \
terraform-sa@apps-portfolio-469805.iam.gserviceaccount.com
```

### 3. IAM メンバー（オプション）

Terraform で IAM 権限も管理したい場合は、以下を順番に import します：

```bash
# Cloud Build Runner 用 IAM
terraform import google_project_iam_member.runner_cloudbuild \
"apps-portfolio-469805 roles/cloudbuild.builds.builder serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_artifact_registry \
"apps-portfolio-469805 roles/artifactregistry.writer serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_cloudrun \
"apps-portfolio-469805 roles/run.admin serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_sa_user \
"apps-portfolio-469805 roles/iam.serviceAccountUser serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_log_writer \
"apps-portfolio-469805 roles/logging.logWriter serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

# Terraform Service Account 用 IAM
terraform import google_project_iam_member.terraform_sa_viewer \
"apps-portfolio-469805 roles/viewer serviceAccount:terraform-sa@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_service_account_iam_member.terraform_wif_binding \
"projects/apps-portfolio-469805/serviceAccounts/terraform-sa@apps-portfolio-469805.iam.gserviceaccount.com roles/iam.workloadIdentityUser principalSet://iam.googleapis.com/projects/1066453624488/locations/global/workloadIdentityPools/github-pool/attribute.repository_owner/tomoki-shiozaki"


```

⚠️ IAM メンバーの import はオプションですが、Terraform 管理下で状態をクリーンに保つため推奨です。

## 📦 データ仕様：ISO A3（ISO 3166-1 alpha-3）と OWID 独自コード

本プロジェクトでは、国別データ（CO₂ 排出量など）を扱うために、  
以下のデータソースを利用しています：

- Natural Earth の国境 GeoJSON（`ISO_A3`）
- Our World in Data（OWID）の CO₂ データ（`Code` / `code`）

これらを正しくマージするために、国コードの扱いを以下のように統一しています。

---

### 🔷 1. ISO A3 とは？

ISO が定める **3 文字の国コード**です。  
例：`JPN`, `USA`, `FRA`, `AFG`

Natural Earth の GeoJSON に含まれる `ISO_A3` プロパティは  
**ISO 3166-1 alpha-3（ISO A3）** に準拠しています。

---

### 🔷 2. OWID の `Code` の取り扱い

OWID の CO₂ データにおける `Code`（または `code`）列は、

- **基本的に ISO A3 と一致する**
- ただし、国ではない地域には **ISO が存在しないため OWID 独自コード** が使われる

例：

- `OWID_WRL`（World）
- `OWID_EUR`（Europe）
- `OWID_ASI`（Asia）
- `OWID_NAM`（North America）
- など

これらは GeoJSON に存在しないため、  
**国境データとのマージ対象には含めないでください。**

> 注: OWID の Code の定義・ルールの詳細は公式 ETL ドキュメントで確認できます：
> [OWID Regions Documentation](https://docs.owid.io/projects/etl/data/regions/)

---

### 🔷 3. OWID 独自コードのルール（OWID ガイドラインより）

OWID 独自コードには厳密な仕様はありませんが、以下が推奨されています：

1. `OWID_` の後につくコードは、既存の ISO A3 と重複させない
   - （例外：`OWID_NAM` は Namibia の `NAM` と衝突している）

2. 国の下位地域を表す場合は、  
   `OWID_<国コード>_<地域コード>` の形式を用いることがある
   - 例：`OWID_ESP_MAD`（Spain / Madrid）

---

### 🔷 4. 実装上の注意

- 国ごとの可視化では **ISO A3 のみを対象とする**
- `OWID_XXX` の行は **非国データとして除外** する
- データマージ時は `country.properties.ISO_A3 === co2Data[code]` を基本とする

---

このルールにより、GeoJSON の国境データと OWID の統計データを  
安全かつ一貫した方法で結合できます。

### 🔷 5. データ取得・変換手順

- 使用データ：Natural Earth – Admin 0 – Countries, 258 countries, 781.78 KB, version 5.1.1
- ダウンロード先：[Natural Earth – Admin 0 – Countries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/)
- SHP 形式から GeoJSON 形式に変換：[mygeodata.cloud](https://mygeodata.cloud/converter/shp-to-geojson) を使用
- アプリでは、生成した GeoJSON を `src/data` に配置し、import で JSON として扱う
- 注意点：
  - グリーンランドはデンマークと分離
  - 境界は de facto を基準
