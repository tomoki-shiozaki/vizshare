resource "google_artifact_registry_repository" "vizshare_repo" {
  repository_id = var.service_name
  location      = var.region
  format        = "DOCKER"
  description   = "Docker repo for vizshare"

  cleanup_policy_dry_run = false

  # 最新2個を残すKEEPポリシー
  cleanup_policies {
    id     = "keep-latest-2"
    action = "KEEP"
    most_recent_versions {
      keep_count = 2
    }
  }

  # 古いものを削除するDELETEポリシー
  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition {
      tag_state  = "ANY"
      older_than = "0s"  # KEEPで残った最新2つ以外を削除
    }
  }
}
