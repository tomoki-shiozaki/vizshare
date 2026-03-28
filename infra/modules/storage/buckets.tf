resource "google_storage_bucket" "media" {
  name     = var.env == "prod" ? "${var.project_id}-${var.service_name}-media" : "${var.service_name}-${var.env}-media"
  location = var.bucket_location

  force_destroy               = false
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
}