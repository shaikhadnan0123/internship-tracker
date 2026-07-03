import os
import sys
import datetime
from flask import Flask, jsonify, request

# Add project root to path to import pipeline and bigquery integrations
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from pipeline.pipeline import run_pipeline
from pipeline.bigquery_integration import (
    upload_to_bigquery,
    get_applications_from_bq,
    get_top_n_from_bq,
    get_stats_from_bq
)

app = Flask(__name__)

# Structured Logging Config
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("internship_tracker_api")

INTERNAL_AUTH_TOKEN = os.environ.get("INTERNAL_AUTH_TOKEN")

@app.before_request
def verify_internal_request():
    if request.path in ("/", "/health"):
        return
    token = request.headers.get("X-Internal-Token")
    if INTERNAL_AUTH_TOKEN:
        if token != INTERNAL_AUTH_TOKEN:
            logger.warning(f"[Security Violation] Unauthorized internal token check from IP {request.remote_addr}")
            return jsonify({"error": "Unauthorized: Invalid internal auth token"}), 401
    else:
        if request.remote_addr != "127.0.0.1":
            logger.warning(f"[Security Warning] Blocked public request to loopback backend from IP {request.remote_addr}")
            return jsonify({"error": "Unauthorized: Access restricted to localhost loopback"}), 401

# File paths
CSV_BENCHMARK = "data/benchmark_results.csv"

import html
import re

def get_user_id():
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        if request.remote_addr == "127.0.0.1":
            return "local_dev"
        return None
    if not re.match(r"^[a-zA-Z0-9_\-]+$", user_id):
        return None
    return user_id

def get_user_csv_paths(user_id):
    suffix = f"_{user_id}" if user_id else ""
    return (
        f"data/applications{suffix}.csv",
        f"data/scored_applications{suffix}.csv"
    )

def sanitize_input(text, max_len=200):
    if not isinstance(text, str):
        return ""
    text = text.strip()
    # CSV formula injection prevention: escape leading (=, +, -, @) with a single quote
    if text and text[0] in ('=', '+', '-', '@'):
        text = "'" + text
    escaped = html.escape(text)
    return escaped[:max_len]

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "message": "Internship Application Tracker API is running.",
        "endpoints": {
            "/api/applications": "GET (all scored apps), POST (add new app)",
            "/api/top?n=5": "GET (top N priority apps)",
            "/api/stats": "GET (dashboard analytics)",
            "/api/benchmark": "GET (CPU vs GPU benchmarking data)"
        }
    }), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat()
    }), 200

@app.route("/api/applications", methods=["GET"])
def get_applications():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized: Invalid or missing user credentials"}), 401
        
    # Attempt to query from BigQuery first
    df = get_applications_from_bq(user_id)
    
    if df is not None:
        logger.info(f"Serving applications data from Google Cloud BigQuery for user: {user_id}")
        records = df.to_dict(orient="records")
        # Format dates to string
        for r in records:
            if hasattr(r.get('date_applied'), 'strftime'):
                r['date_applied'] = r['date_applied'].strftime('%Y-%m-%d')
        return jsonify(records), 200

    # Fallback to local scored CSV
    csv_raw, csv_scored = get_user_csv_paths(user_id)
    logger.info(f"BigQuery unavailable. Serving applications data from local CSV for user: {user_id}")
    if not os.path.exists(csv_scored):
        if not os.path.exists(csv_raw):
            return jsonify([]), 200
        run_pipeline(csv_raw, csv_scored)
        
    try:
        import pandas as pd
        df = pd.read_csv(csv_scored)
        records = df.to_dict(orient="records")
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve applications: {str(e)}"}), 500

@app.route("/api/top", methods=["GET"])
def get_top_applications():
    n = request.args.get("n", default=5, type=int)
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized: Invalid or missing user credentials"}), 401
    
    # Validate top parameter limit
    if n <= 0 or n > 100:
        n = 5
        
    # Attempt to query from BigQuery first
    df = get_top_n_from_bq(n, user_id)
    
    if df is not None:
        logger.info(f"Serving top {n} applications from Google Cloud BigQuery for user: {user_id}")
        records = df.to_dict(orient="records")
        for r in records:
            if hasattr(r.get('date_applied'), 'strftime'):
                r['date_applied'] = r['date_applied'].strftime('%Y-%m-%d')
        return jsonify(records), 200

    # Fallback to local CSV
    csv_raw, csv_scored = get_user_csv_paths(user_id)
    logger.info(f"BigQuery unavailable. Serving top {n} applications from local CSV for user: {user_id}")
    if not os.path.exists(csv_scored):
        if not os.path.exists(csv_raw):
            return jsonify([]), 200
        run_pipeline(csv_raw, csv_scored)
        
    try:
        import pandas as pd
        df = pd.read_csv(csv_scored)
        if df.empty:
            return jsonify([]), 200
        df_sorted = df.sort_values(by="priority_score", ascending=False).head(n)
        records = df_sorted.to_dict(orient="records")
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve top applications: {str(e)}"}), 500

@app.route("/api/stats", methods=["GET"])
def get_stats():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized: Invalid or missing user credentials"}), 401
        
    # Attempt to query from BigQuery first
    stats = get_stats_from_bq(user_id)
    if stats is not None:
        logger.info(f"Serving dashboard statistics from Google Cloud BigQuery for user: {user_id}")
        return jsonify(stats), 200

    # Fallback to local CSV computation
    csv_raw, csv_scored = get_user_csv_paths(user_id)
    logger.info(f"BigQuery unavailable. Calculating statistics from local CSV for user: {user_id}")
    if not os.path.exists(csv_scored):
        if not os.path.exists(csv_raw):
            return jsonify({
                "total_applications": 0,
                "interviewing_count": 0,
                "rejected_count": 0,
                "avg_priority_score": 0.0,
                "platform_breakdown": {}
            }), 200
        run_pipeline(csv_raw, csv_scored)

    try:
        import pandas as pd
        df = pd.read_csv(csv_scored)
        
        if df.empty:
            return jsonify({
                "total_applications": 0,
                "interviewing_count": 0,
                "rejected_count": 0,
                "avg_priority_score": 0.0,
                "platform_breakdown": {}
            }), 200

        total_applications = len(df)
        interviewing_count = int(df['status'].str.lower().str.contains('interview').sum())
        rejected_count = int(df['status'].str.lower().str.contains('reject').sum())
        avg_priority_score = float(df['priority_score'].mean())
        platform_breakdown = df['platform'].value_counts().to_dict()

        return jsonify({
            "total_applications": total_applications,
            "interviewing_count": interviewing_count,
            "rejected_count": rejected_count,
            "avg_priority_score": round(avg_priority_score, 1),
            "platform_breakdown": platform_breakdown
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to calculate statistics: {str(e)}"}), 500

@app.route("/api/applications", methods=["POST"])
def add_application():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized: Invalid or missing user credentials"}), 401
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # Sanitize and validate inputs
    company = sanitize_input(data.get("company"), max_len=100)
    role = sanitize_input(data.get("role"), max_len=100)
    platform = sanitize_input(data.get("platform"), max_len=100)
    
    if not company or not role or not platform:
        return jsonify({"error": "Missing required fields: company, role, platform"}), 400

    status = sanitize_input(data.get("status", "Applied"), max_len=50)
    date_applied = sanitize_input(data.get("date_applied", ""), max_len=20)
    job_description = sanitize_input(data.get("job_description", ""), max_len=5000)

    # Validate status choice
    allowed_statuses = ["Applied", "Interviewing", "Rejected", "Offer"]
    if status not in allowed_statuses:
        status = "Applied"

    if not date_applied or not re.match(r"^\d{4}-\d{2}-\d{2}$", date_applied):
        date_applied = datetime.date.today().strftime("%Y-%m-%d")

    csv_raw, csv_scored = get_user_csv_paths(user_id)

    # Generate new application ID
    import pandas as pd
    
    if os.path.exists(csv_raw):
        df_raw = pd.read_csv(csv_raw)
        # Find next ID
        try:
            ids = df_raw['application_id'].str.extract(r'APP(\d+)').dropna().astype(int)
            if not ids.empty:
                next_id = f"APP{ids.max().iloc[0] + 1:03d}"
            else:
                next_id = f"APP{len(df_raw) + 1:03d}"
        except Exception:
            next_id = f"APP{len(df_raw) + 1:03d}"
    else:
        df_raw = pd.DataFrame(columns=["application_id", "company", "role", "date_applied", "platform", "status", "job_description"])
        next_id = "APP001"

    # Append new row
    new_row = {
        "application_id": next_id,
        "company": company,
        "role": role,
        "date_applied": date_applied,
        "platform": platform,
        "status": status,
        "job_description": job_description
    }
    
    # Save back to raw CSV
    df_new = pd.DataFrame([new_row])
    df_raw = pd.concat([df_raw, df_new], ignore_index=True)
    os.makedirs(os.path.dirname(csv_raw), exist_ok=True)
    df_raw.to_csv(csv_raw, index=False)

    logger.info(f"Added new application {next_id} for user {user_id}. Re-running scoring pipeline...")
    
    # Re-run standard pipeline to generate new scores
    pipeline_success = run_pipeline(csv_raw, csv_scored)
    if not pipeline_success:
        return jsonify({"error": "Failed to re-run pipeline after adding application"}), 500

    # Sync to BigQuery
    bq_success = upload_to_bigquery(csv_scored, user_id=user_id)
    
    # Get the added application's score from the scored CSV
    df_scored = pd.read_csv(csv_scored)
    scored_app = df_scored[df_scored['application_id'] == next_id].to_dict(orient="records")
    result_app = scored_app[0] if scored_app else new_row

    return jsonify({
        "message": "Application added successfully!",
        "application": result_app,
        "bigquery_synced": bq_success
    }), 201

@app.route("/api/benchmark", methods=["GET"])
def get_benchmark():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    if not os.path.exists(CSV_BENCHMARK):
        return jsonify({
            "error": "Benchmark data not found. Run the benchmark script first.",
            "instructions": "python benchmark/benchmark.py"
        }), 404
        
    try:
        import pandas as pd
        df = pd.read_csv(CSV_BENCHMARK)
        records = df.to_dict(orient="records")
        return jsonify(records[0] if records else {}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve benchmark results: {str(e)}"}), 500

@app.route("/api/benchmark/run", methods=["POST"])
def run_benchmark():
    user_id = get_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        import subprocess
        import json
        python_exe = sys.executable
        logger.info("Running benchmark from Flask API...")
        process = subprocess.run([python_exe, "benchmark/benchmark.py"], capture_output=True, text=True)
        
        # Parse stdout for JSON_RESULT:
        result_data = None
        for line in process.stdout.split("\n"):
            if line.startswith("JSON_RESULT:"):
                json_str = line.split("JSON_RESULT:")[1]
                result_data = json.loads(json_str)
                break
                
        if result_data:
            return jsonify({
                "status": "success",
                "message": "Benchmark completed successfully!",
                "results": result_data
            }), 200
        else:
            # Fallback to file reading if JSON print is missing
            logger.warning("Failed to find JSON_RESULT in stdout, falling back to CSV file...")
            if os.path.exists(CSV_BENCHMARK):
                import pandas as pd
                df = pd.read_csv(CSV_BENCHMARK)
                records = df.to_dict(orient="records")
                return jsonify({
                    "status": "success",
                    "message": "Benchmark completed successfully! (CSV Fallback)",
                    "results": records[0] if records else {}
                }), 200
            else:
                return jsonify({"error": "Failed to parse benchmark results from script output."}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to run benchmark: {str(e)}"}), 500

if __name__ == "__main__":
    # Start flask application
    # Listening strictly on 127.0.0.1 for local/proxy communication security
    app.run(host="127.0.0.1", port=5000, debug=False)
