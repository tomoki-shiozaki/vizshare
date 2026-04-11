resource "google_cloud_run_v2_job" "migrate" {
  name     = var.job_name
  location = var.region

  template {
    template {
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