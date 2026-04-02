resource "google_service_account" "django" {
  account_id   = "${var.service_name}-${local.django_sa[var.env]}"
  display_name = "Service Account for ${var.service_name} app (${var.env})"
}

# バケットへの権限付与
resource "google_storage_bucket_iam_member" "django_bucket_access" {
  bucket = var.media_bucket_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.django.email}"
}

resource "google_service_account_iam_member" "django_sign_blob" {
  service_account_id = google_service_account.django.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:${google_service_account.django.email}"
}