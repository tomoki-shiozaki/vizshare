> ⚠️ **Note**
>
> This document describes infrastructure setup for the author's **personal Google Cloud environment**.
> It is **not required for most contributors** and is mainly intended for reference or reproducibility.

---

## 🛠 Terraform Service Account Import Guide

This project uses Terraform to manage Google Cloud infrastructure.
Existing service accounts must be **imported into Terraform state**
before they can be safely managed.

Specifically, the following service accounts are expected to already exist:

- `cloudbuild_runner`
- `terraform_sa`

### 1. Import `cloudbuild_runner` Service Account

```bash
terraform import google_service_account.cloudbuild_runner \
cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com
```

### 2. Import terraform_sa Service Account

```bash
terraform import google_service_account.terraform_sa \
terraform-sa@apps-portfolio-469805.iam.gserviceaccount.com
```

### 3. Import IAM Members (Optional but Recommended)

```bash
If you want Terraform to manage IAM bindings as well,
import the following IAM members in order.
```

```bash
# IAM bindings for Cloud Build Runner

terraform import google_project_iam_member.runner_cloudbuild \
"apps-portfolio-469805 roles/cloudbuild.builds.builder serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_artifact_registry \
"apps-portfolio-469805 roles/artifactregistry.writer serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_cloudrun \
"apps-portfolio-469805 roles/run.admin serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_sa_user \
"apps-portfolio-469805 roles/iam.serviceAccountUser serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_project_iam_member.runner_log_writer \
"apps-portfolio-469805 roles/logging.logWriter serviceAccount:cloud-build-runner-tf@apps-portfolio-469805.iam.gserviceaccount.com"

# IAM bindings for Terraform Service Account

terraform import google_project_iam_member.terraform_sa_viewer \
"apps-portfolio-469805 roles/viewer serviceAccount:terraform-sa@apps-portfolio-469805.iam.gserviceaccount.com"

terraform import google_service_account_iam_member.terraform_wif_binding \
"projects/apps-portfolio-469805/serviceAccounts/terraform-sa@apps-portfolio-469805.iam.gserviceaccount.com roles/iam.workloadIdentityUser principalSet://iam.googleapis.com/projects/1066453624488/locations/global/workloadIdentityPools/github-pool/attribute.repository_owner/tomoki-shiozaki"

```

> ⚠️ Importing IAM members is optional, but recommended to keep Terraform state clean
> and avoid unmanaged resources.

## 📂 Bulk Import Using `import_iam.sh`

Instead of running each `terraform import` command manually,
you can use a helper script to perform all imports at once.

### 1. Create the Script

Create `infra/import_iam.sh` with the following contents:

```bash
#!/bin/bash
set -euo pipefail

ENV_FILE=".env.terraform"

if [ ! -f "$ENV_FILE" ]; then
echo "❌ $ENV_FILE not found. Please create it first."
exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

CLOUDRUNNER_SA="cloud-build-runner-tf@$PROJECT_ID.iam.gserviceaccount.com"
TERRAFORM_SA="terraform-sa@$PROJECT_ID.iam.gserviceaccount.com"

terraform import google_service_account.cloudbuild_runner "$CLOUDRUNNER_SA"
terraform import google_service_account.terraform_sa "$TERRAFORM_SA"

terraform import google_project_iam_member.runner_cloudbuild \
 "$PROJECT_ID roles/cloudbuild.builds.builder serviceAccount:$CLOUDRUNNER_SA"
terraform import google_project_iam_member.runner_artifact_registry \
 "$PROJECT_ID roles/artifactregistry.writer serviceAccount:$CLOUDRUNNER_SA"
terraform import google_project_iam_member.runner_cloudrun \
 "$PROJECT_ID roles/run.admin serviceAccount:$CLOUDRUNNER_SA"
terraform import google_project_iam_member.runner_sa_user \
 "$PROJECT_ID roles/iam.serviceAccountUser serviceAccount:$CLOUDRUNNER_SA"
terraform import google_project_iam_member.runner_log_writer \
 "$PROJECT_ID roles/logging.logWriter serviceAccount:$CLOUDRUNNER_SA"

terraform import google_project_iam_member.terraform_sa_viewer \
 "$PROJECT_ID roles/viewer serviceAccount:$TERRAFORM_SA"

terraform import google_service_account_iam_member.terraform_wif_binding \
 "projects/$PROJECT_ID/serviceAccounts/$TERRAFORM_SA roles/iam.workloadIdentityUser:principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository_owner/tomoki-shiozaki"

echo "✅ Import complete!" 2. Prepare Environment Variables
```

Create `infra/.env.terraform` and define the following variables:

```bash
PROJECT_ID=**\*\*\***
PROJECT_NUMBER=**\*\*\***
```

### 3. Make the Script Executable

```bash
chmod +x infra/import_iam.sh
```

### 4. Run the Script

```bash
cd infra
./import_iam.sh
```

All existing service accounts and IAM bindings will now be imported
and managed by Terraform.
