# Vizshare Documentation

## Overview

This directory contains design notes, specifications, and development documentation for Vizshare.

## Documentation Index

- **Specifications & design**
  - This document (overall project design)
  - [Time Series CSV Specification (v1)](./csv-timeseries-spec.md)
- **Development setup**
  - [Local development setup](./development.md)
- **Infrastructure & Terraform**
  - (internal / personal notes)

---

## 1. Project Overview

- **Project name:** Vizshare
- **Background:** The developer previously created [Climate Change App](https://github.com/tomoki-shiozaki/climate-change-app-v2), which visualizes temperature anomalies and CO2 emissions using graphs and maps. The temperature data used in the Climate Change App was prepared by the developer. One of the motivations for developing Vizshare is to allow users to upload their own data, visualize it in graphs, and share it with others.
- **Purpose:** The purposes of this app are:
  1. To allow users to share their data in visualized forms.
  2. To enable users to communicate through comments.
- **MVP Implementation:**
  - Uploading, parsing, and visualizing data.
  - Sharing data with others.

## 2. Requirements

| ID  | Requirement    | Description                                                     | Priority | Notes                     |
| --- | -------------- | --------------------------------------------------------------- | -------- | ------------------------- |
| R1  | Upload CSV     | Users can upload CSV files containing their own data            | High     | MVP                       |
| R2  | Parse Data     | System parses CSV and extracts time, entity, and metric columns | High     | MVP: only numeric metrics |
| R3  | Visualize Data | Display data in graphs (line, bar, etc.)                        | High     | MVP: basic line chart     |
| R4  | Share Data     | Users can share visualizations with others                      | Medium   | Planned feature           |
| R5  | Comment        | Users can comment on shared visualizations                      | Medium   | Future feature            |

## 2.1 Use Case Diagram

The following diagram illustrates the main user interactions in Vizshare,
including both MVP functionality and planned features.

![Use Case Diagram](./usecase/usecase/vizshare_use.svg)

---

## 3. ER Diagram

The following diagram shows the main data models and their relationships in Vizshare. It illustrates the user, dataset, and data point models, along with key fields and constraints.

![ER Diagram](./er/er/er.svg)

- **User:** Custom user model with an additional `name` field.
- **Dataset:** Stores uploaded CSV datasets, parsing status, schema, and parse results.
- **DataPoint:** Stores individual metric values for each dataset, along with time and entity information. Each combination of dataset, entity, metric, and raw_time is unique.
- **Dataset Status:** UPLOADED / PROCESSING / PARSED / FAILED
- **JSON Fields:** `schema` and `parse_result` are stored as JSONFields.

## 4. System Architecture

The following diagram shows the overall system architecture of Vizshare,
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
3. The backend parses uploaded CSV files.
4. Parsed data is stored in PostgreSQL.
5. Uploaded CSV files are stored in Cloud Storage.

## 5. Screen Flow Diagram

The following diagram shows the main screen transitions in the Vizshare MVP.

![Screen Flow Diagram](./screen_flow/screen_flow_diagram/screen_flow_vizshare.svg)
