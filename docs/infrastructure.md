> ⚠️ **Note**
>
> This document describes infrastructure setup for the author's **personal Google Cloud environment**.
> It is **not required for most contributors** and is mainly intended for reference or reproducibility.

---

## 🛠 Terraform Service Account Import Guide

This project uses Terraform to manage Google Cloud infrastructure.
Existing service accounts must be **imported into Terraform state**
before they can be safely managed.

Specifically, the following service accounts are expected to already exist
(resource names shown below):

- `cloudbuild_runner`
- `terraform_sa`

The examples below use placeholder values.
Replace `<PROJECT_ID>` with your own Google Cloud project ID.

### 1. Import `cloudbuild_runner` Service Account

```bash
terraform import google_service_account.cloudbuild_runner \
cloud-build-runner-tf@<PROJECT_ID>.iam.gserviceaccount.com
```

### 2. Import `terraform_sa` Service Account

```bash
terraform import google_service_account.terraform_sa \
terraform-sa@<PROJECT_ID>.iam.gserviceaccount.com
```

### 3. Import IAM Members (Optional but Recommended)

If you want Terraform to manage IAM bindings as well,
import the following IAM members.

The examples below use **placeholder values**.
Replace them with values from your own Google Cloud project.

```bash
# IAM bindings for Cloud Build Runner

terraform import google_project_iam_member.runner_cloudbuild \
"<PROJECT_ID> roles/cloudbuild.builds.builder serviceAccount:<CLOUDBUILD_RUNNER_SA_EMAIL>"

terraform import google_project_iam_member.runner_artifact_registry \
"<PROJECT_ID> roles/artifactregistry.writer serviceAccount:<CLOUDBUILD_RUNNER_SA_EMAIL>"

terraform import google_project_iam_member.runner_cloudrun \
"<PROJECT_ID> roles/run.admin serviceAccount:<CLOUDBUILD_RUNNER_SA_EMAIL>"

terraform import google_project_iam_member.runner_sa_user \
"<PROJECT_ID> roles/iam.serviceAccountUser serviceAccount:<CLOUDBUILD_RUNNER_SA_EMAIL>"

terraform import google_project_iam_member.runner_log_writer \
"<PROJECT_ID> roles/logging.logWriter serviceAccount:<CLOUDBUILD_RUNNER_SA_EMAIL>"

# IAM bindings for Terraform Service Account

terraform import google_project_iam_member.terraform_sa_viewer \
"<PROJECT_ID> roles/viewer serviceAccount:<TERRAFORM_SA_EMAIL>"

terraform import google_service_account_iam_member.terraform_wif_binding \
"projects/<PROJECT_ID>/serviceAccounts/<TERRAFORM_SA_EMAIL> roles/iam.workloadIdentityUser principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<WIF_POOL_NAME>/attribute.repository_owner/<GITHUB_REPOSITORY_OWNER>"
```

> ⚠️ Importing IAM members is optional, but recommended to keep Terraform state clean
> and avoid unmanaged resources.

## 📂 Bulk Import Using `import_iam.sh`

Instead of running each `terraform import` command manually,
you can use a helper script to import all required resources at once.

This script is intended for the author's personal Google Cloud environment
and is **not required for most contributors**.

### Script Location

- `infra/import_iam.sh`

### Prerequisites

1. Create `infra/.env.terraform` and define the following variables:

```bash
PROJECT_ID=<your-google-cloud-project-id>
PROJECT_NUMBER=<your-google-cloud-project-number>
```

2. Make the script executable:

```bash
chmod +x infra/import_iam.sh
```

### Run the Script

```bash
cd infra
./import_iam.sh
```

All existing service accounts and IAM bindings will be imported
and managed by Terraform.

---
