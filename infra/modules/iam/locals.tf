locals {
  cloudbuild_enabled = {
    prod    = true
    staging = false
  }

  django_sa = {
    prod    = "django-prod-sa"
    staging = "django-staging-sa"
  }
}