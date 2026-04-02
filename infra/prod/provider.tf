terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.15"
    }
  }

  backend "gcs" {
    bucket = "terraform-state-vizshare"
    prefix = "prod/terraform"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}