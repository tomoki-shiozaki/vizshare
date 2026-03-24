#!/bin/bash
set -euo pipefail

# =====================================================
# Terraform サービスアカウント / IAM import スクリプト
# =====================================================
# infra/.env.terraform から環境変数を読み込み
#   PROJECT_ID=<GCP プロジェクトID>
#   PROJECT_NUMBER=<GCP プロジェクト番号>
# =====================================================

ENV_FILE=".env.terraform"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE が見つかりません。作成してください。"
  exit 1
fi

# コメント行を除外して読み込み
export $(grep -v '^#' "$ENV_FILE" | xargs)

if [ -z "${PROJECT_ID:-}" ] || [ -z "${PROJECT_NUMBER:-}" ]; then
  echo "❌ PROJECT_ID または PROJECT_NUMBER が .env.terraform に定義されていません。"
  exit 1
fi

# サービスアカウント
CLOUDRUNNER_SA="cloud-build-runner-tf@$PROJECT_ID.iam.gserviceaccount.com"
TERRAFORM_SA="terraform-sa@$PROJECT_ID.iam.gserviceaccount.com"

echo "=== Importing service accounts ==="
terraform import google_service_account.cloudbuild_runner "$CLOUDRUNNER_SA"
terraform import google_service_account.terraform_sa "$TERRAFORM_SA"

echo "=== Importing project IAM members for Cloud Build Runner ==="
terraform import google_project_iam_member.runner_cloudbuild \
  "$PROJECT_ID roles/cloudbuild.builds.builder serviceAccount:$CLOUDRUNNER_SA"

terraform import google_project_iam_member.runner_artifact_registry \
  "$PROJECT_ID roles/artifactregistry.writer serviceAccount:$CLOUDRUNNER_SA"

terraform import google_project_iam_member.runner_cloudrun \
  "$PROJECT_ID roles/run.admin serviceAccount:$CLOUDRUNNER_SA"

terraform import google_project_iam_member.runner_sa_user \
  "$PROJECT_ID roles/iam.serviceAccountUser serviceAccount:$CLOUDRUNNER_SA"

terraform import google_project_iam_member.runner_log_writer \
  "$PROJECT_ID roles/logging.logWriter serviceAccount:$CLOUDRUNNER_SA"

echo "=== Importing project IAM member for Terraform SA ==="
terraform import google_project_iam_member.terraform_sa_viewer \
  "$PROJECT_ID roles/viewer serviceAccount:$TERRAFORM_SA"

echo "=== Importing Workload Identity binding for Terraform SA ==="
terraform import google_service_account_iam_member.terraform_wif_binding \
  "projects/$PROJECT_ID/serviceAccounts/$TERRAFORM_SA roles/iam.workloadIdentityUser:principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository_owner/tomoki-shiozaki"

echo "✅ Import complete!"
