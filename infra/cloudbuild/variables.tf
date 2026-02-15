variable "project_id" {}
variable "service_name" {}
variable "region" {}
variable "github_repo" {}
variable "github_owner" {}

variable "cloudbuild_service_account" {
  description = "Cloud Build service account id"
  type        = string
}