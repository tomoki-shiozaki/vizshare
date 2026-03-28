variable "project_id" {
  type = string
}

variable "service_name" {
  type = string
}

variable "bucket_location" {
  type    = string
  default = "us-west1"
}

variable "service_name" {
  description = "サービス名 / リソースのプレフィックス用"
  type        = string
}

variable "env" {
  description = "Environment (prod / staging)"
  type        = string
}