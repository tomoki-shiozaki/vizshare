############################################
# Cloud Build 用 runner サービスアカウント
############################################
resource "google_service_account" "cloudbuild_runner" {
  count        = local.cloudbuild_enabled[var.env] ? 1 : 0
  account_id   = "${var.service_name}-${var.env}-cbr"
  display_name = "Cloud Build Runner Service Account (${var.env})"
}

############################################
# Cloud Build を実行する権限
############################################
resource "google_project_iam_member" "runner_cloudbuild" {
  count   = local.cloudbuild_enabled[var.env] ? 1 : 0
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner[0].email}"
}

############################################
# Artifact Registry へ push する権限
############################################
resource "google_project_iam_member" "runner_artifact_registry" {
  count   = local.cloudbuild_enabled[var.env] ? 1 : 0
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner[0].email}"
}

############################################
# Cloud Run をデプロイ・管理する権限
############################################
resource "google_project_iam_member" "runner_cloudrun" {
  count   = local.cloudbuild_enabled[var.env] ? 1 : 0
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner[0].email}"
}

############################################
# Service Account User 権限
############################################
resource "google_service_account_iam_member" "cloudrun_sa_user_binding" {
  count              = local.cloudbuild_enabled[var.env] ? 1 : 0
  service_account_id = google_service_account.django.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudbuild_runner[0].email}"
}

resource "google_service_account_iam_member" "runner_impersonate_runtime_sa" {
  count   = local.cloudbuild_enabled[var.env] ? 1 : 0
  service_account_id = google_service_account.cloud_run_job_migrate.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cloudbuild_runner[0].email}"
}

############################################
# Logging 書き込み権限
############################################
resource "google_project_iam_member" "runner_log_writer" {
  count   = local.cloudbuild_enabled[var.env] ? 1 : 0
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner[0].email}"
}