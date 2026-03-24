resource "google_storage_bucket" "media" {
  name     = "${var.project_id}-${var.service_name}-media"
  location = var.bucket_location

  force_destroy               = false
  uniform_bucket_level_access = true
  public_access_prevention     = "enforced"
}
