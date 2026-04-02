locals {
  cloudbuild_enabled = {
    prod    = true
    staging = false
  }

  cloudrun_deploy_enabled = {
    prod    = false    
    staging = true     
  }

  django_sa = {
    prod    = "django-prod-sa"
    staging = "django-staging-sa"
  }
}