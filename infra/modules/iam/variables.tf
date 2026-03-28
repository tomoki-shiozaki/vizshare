variable "project_id" {
  type = string
}

variable "project_number" {
  type = string
}

variable "media_bucket_name" {
  description = "Django が使用する GCS バケット名"
  type        = string
}

variable "terraform_state_bucket_name" {
  type = string
}

variable "service_name" {
  description = "サービス名 / リソースのプレフィックス用"
  type        = string
}

variable "env" {
  description = "Environment (prod / staging)"
  type        = string
}

variable "github_owner" {
  description = "GitHub リポジトリのオーナー名"
  type        = string
}

variable "github_repo" {
  description = "GitHub リポジトリ名"
  type        = string
}