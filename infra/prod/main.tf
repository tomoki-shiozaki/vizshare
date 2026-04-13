module "cloudbuild" {
  source = "../modules/cloudbuild"   
  project_id   = var.project_id
  service_name = var.service_name
  region       = var.region
  github_repo  = var.github_repo
  github_owner = var.github_owner
  cloudbuild_service_account = module.iam.cloudbuild_runner_sa_email
  env = var.env   
}

module "iam" {
  source = "../modules/iam"
  project_id     = var.project_id
  project_number = var.project_number
  service_name   = var.service_name       
  media_bucket_name = module.storage.media_bucket_name
  terraform_state_bucket_name = var.terraform_state_bucket_name
  env = var.env   
  github_owner = var.github_owner      
  github_repo  = var.github_repo       
  name_prefix = local.name_prefix
}

module "storage" {
  source = "../modules/storage"
  project_id   = var.project_id
  service_name = var.service_name
  env = var.env   
}

module "cloudrun" {
  source = "../modules/cloudrun"

  region      = var.region
  name_prefix = local.name_prefix

  image = "dummy"

  service_account = module.iam.cloud_run_job_migrate_sa_email
}