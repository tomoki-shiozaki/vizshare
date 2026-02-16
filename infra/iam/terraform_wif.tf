##########################################################
# GitHub Actions 用 Terraform Service Account (WIF)
##########################################################

# 1️⃣ Service Account 作成
resource "google_service_account" "terraform_sa" {
  account_id   = "terraform-sa"
  display_name = "Terraform CI/CD Service Account"
}

# 2️⃣ Service Account に必要な権限を付与
# Terraform Plan のみ実行する最小権限
resource "google_project_iam_member" "terraform_sa_viewer" {
  project = var.project_id
  role    = "roles/viewer"
  member  = "serviceAccount:${google_service_account.terraform_sa.email}"
}

# 3️⃣ Workload Identity Pool からのアクセスを許可
resource "google_service_account_iam_member" "terraform_wif_binding" {
  service_account_id = google_service_account.terraform_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/github-pool/attribute.repository_owner/tomoki-shiozaki"
}
