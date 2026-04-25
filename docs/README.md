# VizShare Documentation

## Overview

This directory contains design notes, specifications, and development documentation for VizShare.

## Documentation Index

- **Specifications & design**
  - This document (overall project design)
  - [Time Series CSV Specification (v1)](./csv-timeseries-spec.md)
- **Development setup**
  - [Local development setup](./development.md)

---

## 1. Project Overview

- **Project name:** VizShare
- **Background:** VizShare was inspired by a previous project that visualized climate data using charts and maps. It extends this concept by enabling users to upload and visualize their own datasets in a flexible and shareable format.
- **Purpose:** The purposes of this application are:
  1. To allow users to upload datasets and visualize them as charts.
  2. To enable users to share datasets and visualizations with others.
  3. To support exploration and discussion around shared data.

## 2. Requirements

| ID  | Requirement    | Description                                                         | Priority | Notes                |
| --- | -------------- | ------------------------------------------------------------------- | -------- | -------------------- |
| R1  | Upload CSV     | Users can upload CSV files containing their own data                | High     |                      |
| R2  | Parse Data     | System parses CSV and extracts time, entity, and metric columns     | High     | Only numeric metrics |
| R3  | Visualize Data | Display data in graphs (line, bar, etc.)                            | High     | Basic line charts    |
| R4  | Share Data     | Users can publish datasets and visualizations to the public gallery | High     |                      |
| R5  | Comment        | Users can comment on shared visualizations                          | Medium   | Future feature       |

---

## 2.1 Use Case Diagram

The following diagram illustrates the main user interactions in VizShare,
including dataset upload, visualization, and sharing.

![Use Case Diagram](./usecase/usecase/vizshare_use.svg)

---

## 3. ER Diagram

The following diagram shows the main data models and their relationships in VizShare. It illustrates the user, dataset, and data point models, along with key fields and constraints.

![ER Diagram](./er/er/er.svg)

- **User:** Custom user model with an additional `name` field.
- **Dataset:** Stores uploaded CSV datasets, parsing status, schema, and parse results.
- **DataPoint:** Stores individual metric values for each dataset, along with time and entity information. Each combination of dataset, entity, metric, and raw_time is unique.
- **Dataset Status:** UPLOADED / PROCESSING / PARSED / FAILED
- **JSON Fields:** `schema` and `parse_result` are stored as JSONFields.

---

## 4. System Architecture

The following diagram shows the overall system architecture of VizShare,
including the frontend, backend, database, storage, and deployment flow.

![System Architecture](./system_architecture/system_architecture/system_architecture.svg)

### Overview

- **Frontend:** Next.js app deployed on Vercel.
- **Backend:** Django REST Framework API deployed on Google Cloud Run.
- **Database:** Neon PostgreSQL for application data and parsed CSV data.
- **Storage:** Google Cloud Storage for uploaded CSV file storage.
- **CI/CD:** GitHub triggers Google Cloud Build for backend deployment.
- **Logging:** Google Cloud Logging collects backend logs.

### Data Flow

1. Users interact with the frontend.
2. The frontend sends API requests to the backend.
3. Users upload CSV files through the frontend.
4. The backend parses and validates the uploaded datasets.
5. Parsed data is stored in PostgreSQL.
6. Uploaded CSV files are stored in Cloud Storage.

---

## 5. Screen Flow Diagram

The following diagram shows the main screen transitions in VizShare.

![Screen Flow Diagram](./screen_flow/screen_flow_diagram/screen_flow_vizshare.svg)
