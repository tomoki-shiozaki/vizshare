resource "google_cloudbuildv2_repository" "repo" {
  location = "asia-northeast1"
  name     = var.github_repo

  parent_connection = "projects/${var.project_id}/locations/asia-northeast1/connections/github-connection"

  remote_uri = "https://github.com/${var.github_owner}/${var.github_repo}.git"
}
