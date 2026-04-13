output "cloudbuild_runner_sa_id" {
  value = length(google_service_account.cloudbuild_runner) > 0 ? google_service_account.cloudbuild_runner[0].id : ""
}

output "cloudbuild_runner_sa_email" {
  value = length(google_service_account.cloudbuild_runner) > 0 ? google_service_account.cloudbuild_runner[0].email : ""
}

output "cloud_run_job_migrate_sa_email" {
  value = google_service_account.cloud_run_job_migrate.email
}