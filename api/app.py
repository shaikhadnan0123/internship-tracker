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

# File paths
CSV_RAW = "data/applications.csv"
CSV_SCORED = "data/scored_applications.csv"
CSV_BENCHMARK = "data/benchmark_results.csv"

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
    # Attempt to query from BigQuery first
    df = get_applications_from_bq()
    
    if df is not None:
        print("Serving applications data from Google Cloud BigQuery.")
        records = df.to_dict(orient="records")
        # Format dates to string
        for r in records:
            if hasattr(r.get('date_applied'), 'strftime'):
                r['date_applied'] = r['date_applied'].strftime('%Y-%m-%d')
        return jsonify(records), 200

    # Fallback to local scored CSV
    print("BigQuery unavailable. Serving applications data from local CSV.")
    if not os.path.exists(CSV_SCORED):
        # Run pipeline to generate scored CSV if it doesn't exist
        run_pipeline(CSV_RAW, CSV_SCORED)
        
    try:
        import pandas as pd
        df = pd.read_csv(CSV_SCORED)
        records = df.to_dict(orient="records")
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve applications: {str(e)}"}), 500

@app.route("/api/top", methods=["GET"])
def get_top_applications():
    n = request.args.get("n", default=5, type=int)
    
    # Attempt to query from BigQuery first
    df = get_top_n_from_bq(n)
    
    if df is not None:
        print(f"Serving top {n} applications from Google Cloud BigQuery.")
        records = df.to_dict(orient="records")
        for r in records:
            if hasattr(r.get('date_applied'), 'strftime'):
                r['date_applied'] = r['date_applied'].strftime('%Y-%m-%d')
        return jsonify(records), 200

    # Fallback to local CSV
    print(f"BigQuery unavailable. Serving top {n} applications from local CSV.")
    if not os.path.exists(CSV_SCORED):
        run_pipeline(CSV_RAW, CSV_SCORED)
        
    try:
        import pandas as pd
        df = pd.read_csv(CSV_SCORED)
        records = df.head(n).to_dict(orient="records")
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve top applications: {str(e)}"}), 500

@app.route("/api/stats", methods=["GET"])
def get_stats():
    # Attempt to query from BigQuery first
    stats = get_stats_from_bq()
    if stats is not None:
        print("Serving dashboard statistics from Google Cloud BigQuery.")
        return jsonify(stats), 200

    # Fallback to local CSV computation
    print("BigQuery unavailable. Calculating statistics from local CSV.")
    if not os.path.exists(CSV_SCORED):
        run_pipeline(CSV_RAW, CSV_SCORED)

    try:
        import pandas as pd
        df = pd.read_csv(CSV_SCORED)
        
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
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    company = data.get("company")
    role = data.get("role")
    platform = data.get("platform")
    
    if not company or not role or not platform:
        return jsonify({"error": "Missing required fields: company, role, platform"}), 400

    status = data.get("status", "Applied")
    date_applied = data.get("date_applied")
    if not date_applied:
        date_applied = datetime.date.today().strftime("%Y-%m-%d")
    job_description = data.get("job_description", "")

    # Generate new application ID
    import pandas as pd
    
    if os.path.exists(CSV_RAW):
        df_raw = pd.read_csv(CSV_RAW)
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
    os.makedirs(os.path.dirname(CSV_RAW), exist_ok=True)
    df_raw.to_csv(CSV_RAW, index=False)

    print(f"Added new application {next_id} to raw log. Re-running scoring pipeline...")
    
    # Re-run standard pipeline to generate new scores
    pipeline_success = run_pipeline(CSV_RAW, CSV_SCORED)
    if not pipeline_success:
        return jsonify({"error": "Failed to re-run pipeline after adding application"}), 500

    # Sync to BigQuery asynchronously (or just upload synchronously here)
    bq_success = upload_to_bigquery(CSV_SCORED)
    
    # Get the added application's score from the scored CSV
    df_scored = pd.read_csv(CSV_SCORED)
    scored_app = df_scored[df_scored['application_id'] == next_id].to_dict(orient="records")
    result_app = scored_app[0] if scored_app else new_row

    return jsonify({
        "message": "Application added successfully!",
        "application": result_app,
        "bigquery_synced": bq_success
    }), 201

@app.route("/api/benchmark", methods=["GET"])
def get_benchmark():
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
    try:
        import subprocess
        import json
        python_exe = sys.executable
        print("Running benchmark from Flask API...")
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
            print("Failed to find JSON_RESULT in stdout, falling back to CSV file...")
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
    # Listening on 0.0.0.0 to enable access from docker/host
    app.run(host="0.0.0.0", port=5000, debug=False)
