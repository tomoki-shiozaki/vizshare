output "cloudbuild_runner_sa_id" {
  value = google_service_account.cloudbuild_runner.id
}

output "cloudbuild_runner_sa_email" {
  value = google_service_account.cloudbuild_runner.email
}
