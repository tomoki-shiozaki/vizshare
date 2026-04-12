# Cloud Run Job (migration) 用 Service Account

resource "google_service_account" "cloud_run_job_migrate" {
  account_id   = "${var.name_prefix}-migrate-sa"
  display_name = "Cloud Run Job SA for DB migration (${var.name_prefix})"
}