import os
import sys
import datetime
import pandas as pd

def run_pipeline(input_csv="data/applications.csv", output_csv="data/scored_applications.csv"):
    print("--- Starting Pipeline ---")
    
    # Check if running with GPU acceleration via cudf.pandas
    # When running with 'python -m cudf.pandas', pandas is wrapped/intercepted.
    is_gpu = False
    if 'cudf' in sys.modules or 'cudf.pandas' in sys.modules:
        is_gpu = True
        print("[GPU] GPU Acceleration active via cudf.pandas")
    else:
        print("[CPU] Running on standard CPU Pandas")

    if not os.path.exists(input_csv):
        print(f"Error: Input file {input_csv} does not exist.")
        return False

    # 1. Ingest
    df = pd.read_csv(input_csv)
    print(f"Ingested {len(df)} records from {input_csv}")

    # 2. Clean
    df['company'] = df['company'].fillna('Unknown').astype(str).str.strip()
    df['role'] = df['role'].fillna('Unknown').astype(str).str.strip()
    df['platform'] = df['platform'].fillna('Other').astype(str).str.strip()
    df['status'] = df['status'].fillna('Applied').astype(str).str.strip()
    df['job_description'] = df['job_description'].fillna('').astype(str).str.strip()
    df['date_applied'] = pd.to_datetime(df['date_applied'], errors='coerce')
    
    # Fill invalid dates with today's date
    today = pd.to_datetime(datetime.date.today())
    df['date_applied'] = df['date_applied'].fillna(today)

    # 3. Score
    # A. Urgency Score (40pts)
    # Days since applied = today - date_applied
    df['days_since_applied'] = (today - df['date_applied']).dt.days
    
    def calculate_urgency(days):
        if 5 <= days <= 14:
            return 40  # Prime window
        elif 0 <= days < 5:
            return 30  # Freshly applied
        elif 15 <= days <= 30:
            return 20  # Getting stale
        else:
            return 5   # Very stale or in the past
            
    df['urgency_score'] = df['days_since_applied'].apply(calculate_urgency)

    # B. Platform Score (25pts)
    def calculate_platform(platform):
        p_lower = platform.lower()
        if 'referral' in p_lower or 'email' in p_lower:
            return 25
        elif 'wellfound' in p_lower or 'angel' in p_lower:
            return 20
        elif 'linkedin' in p_lower:
            return 15
        elif 'internshala' in p_lower:
            return 10
        else:
            return 5

    df['platform_score'] = df['platform'].apply(calculate_platform)

    # C. Role Match Score (25pts)
    skills = ["python", "flask", "bigquery", "sql", "pandas", "machine learning", "data", "gcp", "cloud", "developer", "software"]
    
    def calculate_role_match(jd):
        jd_lower = jd.lower()
        match_count = sum(1 for kw in skills if kw in jd_lower)
        return min(25, match_count * 5)

    df['role_match_score'] = df['job_description'].apply(calculate_role_match)

    # D. Status Bonus (10pts)
    def calculate_status_bonus(status):
        s_lower = status.lower()
        if 'interview' in s_lower:
            return 10
        elif 'reject' in s_lower:
            return -5
        else:
            return 0

    df['status_bonus'] = df['status'].apply(calculate_status_bonus)

    # Calculate Total Priority Score (0-100)
    df['priority_score'] = df['urgency_score'] + df['platform_score'] + df['role_match_score'] + df['status_bonus']
    df['priority_score'] = df['priority_score'].clip(0, 100)

    # 4. Rank
    df = df.sort_values(by='priority_score', ascending=False).reset_index(drop=True)

    # Save to CSV
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df.to_csv(output_csv, index=False)
    print(f"Scored & Ranked output saved to {output_csv}")
    print("--- Pipeline Completed ---")
    return True

if __name__ == "__main__":
    run_pipeline()
