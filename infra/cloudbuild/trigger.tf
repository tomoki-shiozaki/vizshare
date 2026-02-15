resource "google_cloudbuild_trigger" "app_trigger" {
  name     = "${var.service_name}-deploy"
  location = var.region

  repository_event_config {
    repository = google_cloudbuildv2_repository.repo.id

    push {
      branch = "^main$"
    }
  }

  filename        = "cloudbuild.yaml"
  service_account = google_service_account.cloudbuild_runner.id

  depends_on = [
    google_cloudbuildv2_repository.repo
  ]
}
