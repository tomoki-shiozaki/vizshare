resource "google_service_account" "django" {
  account_id   = "django-app-sa"
  display_name = "Service Account for Django app"
}

# バケットへの権限付与
resource "google_storage_bucket_iam_member" "django_bucket_access" {
  bucket = var.media_bucket_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.django.email}"
}
