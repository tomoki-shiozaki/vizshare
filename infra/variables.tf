variable "project_id" {
  description = "Google Cloudの プロジェクト ID（文字列）"
  type        = string
}

variable "project_number" {
  description = "Google Cloudの プロジェクト番号（数字）"
  type        = number
}

variable "region" {
  description = "Google Cloud リージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "service_name" {
  description = "サービス名 / プロジェクト内リソースのプレフィックス"
  type        = string
  default     = "vizshare"
}

variable "github_owner" {
  description = "GitHub リポジトリオーナー"
  type        = string
  default     = "tomoki-shiozaki"
}

variable "github_repo" {
  description = "GitHub リポジトリ名"
  type        = string
  default     = "vizshare"
}
