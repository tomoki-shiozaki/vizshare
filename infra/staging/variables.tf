variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "project_number" {
  description = "Google Cloud project number"
  type        = number
}

variable "env" {
  description = "Environment (prod / staging)"
  type        = string

  validation {
    condition     = contains(["staging", "prod"], var.env)
    error_message = "env must be staging or prod"
  }
}

variable "region" {
  description = "Google Cloud region"
  type        = string
}

variable "service_name" {
  description = "Service name prefix"
  type        = string
}

variable "github_owner" {
  description = "GitHub owner"
  type        = string
}

variable "github_repo" {
  description = "GitHub repo"
  type        = string
}

variable "terraform_state_bucket_name" {
  description = "Terraform state bucket"
  type        = string
}