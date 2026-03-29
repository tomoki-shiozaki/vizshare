##########################################################
# GitHub Actions 用 Cloud Run デプロイ Service Account
##########################################################

# 1️⃣ Service Account 作成
resource "google_service_account" "cloudrun_deploy_sa" {
  account_id   = "${var.service_name}-${var.env}-cloudrun-deploy-sa"
  display_name = "${var.service_name}-${var.env} Cloud Run Deploy Service Account"
}

# 2️⃣ Cloud Run 管理権限を付与
resource "google_project_iam_member" "cloudrun_sa_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloudrun_deploy_sa.email}"
}

# 3️⃣ デプロイ先サービスに対して ServiceAccountUser 権限を付与
resource "google_service_account_iam_member" "cloudrun_sa_user_binding" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/vizshare-django-staging-sa@${var.project_id}.iam.gserviceaccount.com"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudrun_deploy_sa.email}"
}

# 4️⃣ Workload Identity Pool から GitHub Actions が impersonate できるようにする
resource "google_service_account_iam_member" "cloudrun_wif_binding" {
  service_account_id = google_service_account.cloudrun_deploy_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${var.github_owner}/${var.github_repo}"
}