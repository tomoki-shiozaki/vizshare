############################################
# Cloud Build 用 runner サービスアカウント
############################################
resource "google_service_account" "cloudbuild_runner" {
  account_id   = "cloud-build-runner-tf"
  display_name = "Cloud Build Runner Service Account"
}

############################################
# Cloud Build を実行する権限
############################################
resource "google_project_iam_member" "runner_cloudbuild" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner.email}"
}

############################################
# Artifact Registry へ push する権限
############################################
resource "google_project_iam_member" "runner_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner.email}"
}

############################################
# Cloud Run をデプロイ・管理する権限
############################################
resource "google_project_iam_member" "runner_cloudrun" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner.email}"
}

resource "google_project_iam_member" "runner_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner.email}"
}

resource "google_project_iam_member" "runner_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudbuild_runner.email}"
}