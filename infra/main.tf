module "cloudbuild" {
  source = "./cloudbuild"

  project_id   = var.project_id
  service_name = var.service_name
  region       = var.region
  github_repo  = var.github_repo
  github_owner = var.github_owner

  cloudbuild_service_account = google_service_account.cloudbuild_runner.id
}

module "iam" {
  source = "./iam"

  project_id     = var.project_id
  project_number = var.project_number
}
