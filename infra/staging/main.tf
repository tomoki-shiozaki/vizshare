module "iam" {
  source = "../modules/iam"
  project_id     = var.project_id
  project_number = var.project_number
  media_bucket_name = module.storage.media_bucket_name
  terraform_state_bucket_name = var.terraform_state_bucket_name
}

module "storage" {
  source = "../modules/storage"
  project_id   = var.project_id
  service_name = var.service_name
}