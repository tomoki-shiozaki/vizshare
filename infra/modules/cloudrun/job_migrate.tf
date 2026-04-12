locals {
  job_name = "${var.name_prefix}-migrate"
}

resource "google_cloud_run_v2_job" "migrate" {
  name     = local.job_name
  location = var.region

  template {
    template {
      service_account = var.service_account

      containers {
        image = var.image

        command = ["python"]
        args    = ["manage.py", "migrate", "--noinput"]
      }

      max_retries = 3
      timeout     = "300s"
    }
  }
}