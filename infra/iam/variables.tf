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