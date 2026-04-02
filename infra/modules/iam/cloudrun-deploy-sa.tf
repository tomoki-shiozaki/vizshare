##########################################################
# GitHub Actions 用 Cloud Run デプロイ Service Account
##########################################################

##########################################################
# 1️⃣ Service Account 作成
##########################################################
resource "google_service_account" "cloudrun_deploy_sa" {
  count        = local.cloudrun_deploy_enabled[var.env] ? 1 : 0
  account_id   = "${var.service_name}-${var.env}-cr-deploy"
  display_name = "${var.service_name}-${var.env} Cloud Run Deploy Service Account"
}

##########################################################
# 2️⃣ Cloud Run 管理権限
##########################################################
resource "google_project_iam_member" "cloudrun_sa_run_admin" {
  count   = local.cloudrun_deploy_enabled[var.env] ? 1 : 0
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloudrun_deploy_sa[0].email}"
}

##########################################################
# 3️⃣ デプロイ先サービスに対する ServiceAccountUser 権限
##########################################################
resource "google_service_account_iam_member" "cloudrun_sa_user_binding" {
  count              = local.cloudrun_deploy_enabled[var.env] ? 1 : 0
  service_account_id = "projects/${var.project_id}/serviceAccounts/${var.service_name}-${local.django_sa[var.env]}@${var.project_id}.iam.gserviceaccount.com"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudrun_deploy_sa[0].email}"
}

##########################################################
# 4️⃣ Workload Identity Pool から GitHub Actions が impersonate できるようにする
##########################################################
resource "google_service_account_iam_member" "cloudrun_wif_binding" {
  count              = local.cloudrun_deploy_enabled[var.env] ? 1 : 0
  service_account_id = google_service_account.cloudrun_deploy_sa[0].name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${var.github_owner}/${var.github_repo}"
}

############################################
# Logging 書き込み権限
############################################
resource "google_project_iam_member" "cloudrun_deploy_log_writer" {
  count   = local.cloudrun_deploy_enabled[var.env] ? 1 : 0
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudrun_deploy_sa[0].email}"
}