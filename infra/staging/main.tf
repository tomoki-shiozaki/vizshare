module "storage" {
  source = "../modules/storage"

  project_id   = var.project_id
  service_name = var.service_name
  env          = var.env
}

module "iam" {
  source = "../modules/iam"

  project_id                  = var.project_id
  project_number              = var.project_number
  media_bucket_name           = module.storage.media_bucket_name
  terraform_state_bucket_name = var.terraform_state_bucket_name

  service_name = var.service_name
  env          = var.env
  github_owner = var.github_owner
  github_repo  = var.github_repo

  name_prefix = local.name_prefix
}

module "cloudrun" {
  source = "../modules/cloudrun"

  project_id = var.project_id
  region     = var.region

  name_prefix = local.name_prefix

  image    = "docker.io/shiozaki1/${var.service_name}:${var.env}"

  service_account = module.iam.cloud_run_job_migrate_sa_email
}