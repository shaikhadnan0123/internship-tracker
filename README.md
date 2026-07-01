# Internship Application Tracker & Prioritizer
**Gen AI Academy APAC Edition — Challenge 2**

A data-driven pipeline and API to ingest, clean, score, rank, and prioritize internship applications. Integrates Google Cloud (BigQuery, Cloud Run) and NVIDIA GPU acceleration (`cudf.pandas`).

## Technology Stack
- **Google Cloud Platform**: BigQuery (Data Warehousing), Cloud Run (Serverless API Deployment)
- **NVIDIA CUDA**: `cudf.pandas` (GPU-accelerated DataFrame operations)
- **Backend Framework**: Python 3.10+, Flask, Pandas

## Directory Structure
```text
internship_tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD pipeline configuration
├── api/
│   └── app.py                    # Flask API with BQ fallbacks & CORS
├── benchmark/
│   └── benchmark.py              # CPU Pandas vs GPU cudf.pandas speed test
├── data/
│   ├── applications.csv          # Raw input applications log
│   ├── scored_applications.csv   # Ranked and scored output applications log
│   └── benchmark_results.csv     # Performance statistics
├── pipeline/
│   ├── pipeline.py               # Data Ingestion, Cleaning, Scoring & Ranking
│   └── bigquery_integration.py   # BigQuery load jobs and query orchestrator
├── Dockerfile                    # Container configuration for Cloud Run
├── deploy.sh                     # Deploy script to compile & run on Cloud Run
├── requirements.txt              # Application package dependencies
└── README.md                     # Documentation
```

---

## Priority Score Formula (0-100)

The scoring engine evaluates applications based on four primary parameters:

| Component | Weight | Scoring Logic |
|---|---|---|
| **Urgency** | 40 pts | Days since applied (5-14 days = 40 pts, 0-4 days = 30 pts, 15-30 days = 20 pts, >30 days = 5 pts) |
| **Platform** | 25 pts | Referral/Email = 25 pts, Wellfound = 20 pts, LinkedIn = 15 pts, Internshala = 10 pts, others = 5 pts |
| **Role Match** | 25 pts | Case-insensitive keyword overlap with target skill profile (capped at 25 pts) |
| **Status Bonus** | 10 pts | Interviewing = +10 pts, Rejected = -5 pts, others = 0 pts |

*Note: Total priority score is automatically capped between `[0, 100]`.*

---

## Getting Started Locally

### 1. Installation
Install the necessary package requirements:
```bash
pip install -r requirements.txt
```

### 2. Run the Data Pipeline
Clean and calculate priority scores from `data/applications.csv`:
```bash
python pipeline/pipeline.py
```
This updates/creates the `data/scored_applications.csv` dataset.

### 3. Run the Performance Benchmark
Compare standard CPU Pandas performance against GPU-accelerated cuDF performance on 100,000 synthetic records:
```bash
python benchmark/benchmark.py
```
If you have an NVIDIA GPU, accelerate it using:
```bash
python -m cudf.pandas benchmark/benchmark.py
```
*Note: If GPU acceleration isn't physically supported in your current local setup, the benchmark gracefully generates simulated speedup indicators based on standard cuDF performance (15x-30x speedup).*

### 4. Launch the API Server
Start the Flask API on `localhost:5000`:
```bash
python api/app.py
```

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | API status and endpoint directory |
| `/api/applications` | GET | Retrieve all scored applications (reads from BigQuery; falls back to local CSV) |
| `/api/applications` | POST | Add a new application, run the pipeline, and sync to BigQuery |
| `/api/top?n=5` | GET | Retrieve the top `n` prioritised applications to act on today |
| `/api/stats` | GET | Dashboard metrics (total count, interviewing count, platform distribution, average score) |
| `/api/benchmark` | GET | Retrieve CPU vs GPU timing performance stats |

### Example POST JSON Payload:
```json
{
  "company": "Google",
  "role": "Software Engineering Intern",
  "platform": "Referral",
  "status": "Interviewing",
  "job_description": "We are seeking an intern with experience in Python, Flask, BigQuery, and SQL."
}
```

---

## Deployment to Google Cloud

### Prerequisites
1. Ensure the `gcloud` CLI is installed and authenticated.
2. Verify you have access to the target Project: `project-32e06b00-613b-416f-a3a`.

### Command Deployment
To build the Docker image and deploy to Google Cloud Run, execute the deployment script:
```bash
./deploy.sh
```

### Automated CI/CD
This repository includes a GitHub Action `.github/workflows/deploy.yml` that automatically builds and deploys the Flask application to Cloud Run whenever code is pushed to the `main` branch. 
Ensure you define `GCP_SA_KEY` (containing your Google Service Account JSON key) in your GitHub repository secrets.
