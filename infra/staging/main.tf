module "iam" {
  source = "../modules/iam"
  project_id     = var.project_id
  project_number = var.project_number
  media_bucket_name = module.storage.media_bucket_name
  terraform_state_bucket_name = var.terraform_state_bucket_name

  service_name = var.service_name
  env          = var.env
  github_owner = var.github_owner
  github_repo  = var.github_repo
}

module "storage" {
  source = "../modules/storage"
  project_id   = var.project_id
  service_name = var.service_name
  env          = var.env
}

module "cloudrun" {
  source = "../modules/cloudrun"

  service_name = var.service_name
  job_name     = "vizshare-staging-migrate"
  region       = "asia-northeast1"
  image        = "docker.io/shiozaki1/vizshare:staging"
  env          = var.env
}