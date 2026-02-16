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
  service_account = var.cloudbuild_service_account

  substitutions = {
    _APP_NAME = var.service_name
  }

  depends_on = [
    google_cloudbuildv2_repository.repo
  ]
}
