import os
import pandas as pd
from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPIError

PROJECT_ID = "project-32e06b00-613b-416f-a3a"
DATASET_ID = "internship_tracker"
TABLE_ID = "scored_applications"
FULL_TABLE_REF = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"

def get_bigquery_client():
    """
    Initializes and returns a BigQuery client if credentials are set,
    otherwise returns None.
    """
    # If the user specified a credentials path or environment project
    if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") and not os.environ.get("GCLOUD_PROJECT"):
        # We still try to initialize with default credentials
        # If it fails, we catch it.
        pass
    try:
        # Pass project explicitly to client
        client = bigquery.Client(project=PROJECT_ID)
        return client
    except Exception as e:
        print(f"[BQ Client] Could not initialize BigQuery client: {e}")
        print("[BQ Client] Falling back to local CSV storage.")
        return None

def create_dataset_if_not_exists(client):
    """Creates the BigQuery dataset if it does not exist."""
    dataset_ref = bigquery.DatasetReference(PROJECT_ID, DATASET_ID)
    try:
        client.get_dataset(dataset_ref)
        print(f"Dataset '{DATASET_ID}' already exists.")
    except Exception:
        # Not found, create it
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = "US"  # Default location
        try:
            client.create_dataset(dataset)
            print(f"Created dataset '{DATASET_ID}'.")
        except GoogleAPIError as e:
            print(f"Failed to create dataset in BigQuery: {e}")
            return False
    return True

def upload_to_bigquery(csv_path="data/scored_applications.csv", user_id=None):
    """
    Uploads the scored applications from CSV to BigQuery for a specific user.
    """
    client = get_bigquery_client()
    if not client:
        return False

    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found. Run pipeline first.")
        return False

    if not user_id:
        user_id = "local_dev"

    try:
        # Create dataset if needed
        if not create_dataset_if_not_exists(client):
            return False

        # Load CSV into a pandas dataframe
        df = pd.read_csv(csv_path)
        
        # Add user_id column
        df['user_id'] = user_id

        # Convert date_applied column to string date format for BigQuery DATE type compatibility
        if 'date_applied' in df.columns:
            df['date_applied'] = pd.to_datetime(df['date_applied']).dt.date

        # Clear previous records for this user first (prevents duplication during WRITE_APPEND)
        try:
            delete_query = f"DELETE FROM `{FULL_TABLE_REF}` WHERE user_id = '{user_id}'"
            client.query(delete_query).result()
            print(f"[BQ Upload] Cleared prior BQ records for user {user_id}.")
        except Exception as e:
            print(f"[BQ Upload] Note: Could not clear prior BQ records (this is expected if table is empty): {e}")

        # Define schema for the BigQuery table
        job_config = bigquery.LoadJobConfig(
            schema=[
                bigquery.SchemaField("user_id", "STRING"),
                bigquery.SchemaField("application_id", "STRING"),
                bigquery.SchemaField("company", "STRING"),
                bigquery.SchemaField("role", "STRING"),
                bigquery.SchemaField("date_applied", "DATE"),
                bigquery.SchemaField("platform", "STRING"),
                bigquery.SchemaField("status", "STRING"),
                bigquery.SchemaField("job_description", "STRING"),
                bigquery.SchemaField("days_since_applied", "INTEGER"),
                bigquery.SchemaField("urgency_score", "INTEGER"),
                bigquery.SchemaField("platform_score", "INTEGER"),
                bigquery.SchemaField("role_match_score", "INTEGER"),
                bigquery.SchemaField("status_bonus", "INTEGER"),
                bigquery.SchemaField("priority_score", "INTEGER"),
            ],
            write_disposition="WRITE_APPEND",  # Append new rows to table
        )

        print(f"Uploading data to BigQuery table: {FULL_TABLE_REF} for user {user_id} ...")
        job = client.load_table_from_dataframe(df, FULL_TABLE_REF, job_config=job_config)
        job.result()  # Wait for the load job to complete
        print(f"[BQ Upload] Data successfully uploaded for user {user_id}!")
        return True

    except Exception as e:
        print(f"[BQ Upload] Failed to upload to BigQuery: {e}")
        return False

def get_applications_from_bq(user_id=None):
    """Queries scored applications from BigQuery for a specific user."""
    client = get_bigquery_client()
    if not client:
        return None
    if not user_id:
        user_id = "local_dev"
    try:
        query = f"SELECT * FROM `{FULL_TABLE_REF}` WHERE user_id = '{user_id}' ORDER BY priority_score DESC"
        query_job = client.query(query)
        df = query_job.to_dataframe()
        if 'user_id' in df.columns:
            df = df.drop(columns=['user_id'])
        return df
    except Exception as e:
        print(f"[BQ Query] Failed to query applications from BigQuery: {e}")
        return None

def get_top_n_from_bq(n=5, user_id=None):
    """Queries top N applications from BigQuery for a specific user."""
    client = get_bigquery_client()
    if not client:
        return None
    if not user_id:
        user_id = "local_dev"
    try:
        query = f"SELECT * FROM `{FULL_TABLE_REF}` WHERE user_id = '{user_id}' ORDER BY priority_score DESC LIMIT {int(n)}"
        query_job = client.query(query)
        df = query_job.to_dataframe()
        if 'user_id' in df.columns:
            df = df.drop(columns=['user_id'])
        return df
    except Exception as e:
        print(f"[BQ Query] Failed to query top N from BigQuery: {e}")
        return None

def get_stats_from_bq(user_id=None):
    """Queries summary statistics from BigQuery for a specific user."""
    client = get_bigquery_client()
    if not client:
        return None
    if not user_id:
        user_id = "local_dev"
    try:
        query = f"""
        SELECT 
            COUNT(*) as total_applications,
            SUM(CASE WHEN LOWER(status) LIKE '%interview%' THEN 1 ELSE 0 END) as interviewing_count,
            SUM(CASE WHEN LOWER(status) LIKE '%reject%' THEN 1 ELSE 0 END) as rejected_count,
            ROUND(AVG(priority_score), 1) as avg_priority_score
        FROM `{FULL_TABLE_REF}`
        WHERE user_id = '{user_id}'
        """
        query_job = client.query(query)
        stats_df = query_job.to_dataframe()

        # Let's get platform breakdown for user
        platform_query = f"""
        SELECT platform, COUNT(*) as count 
        FROM `{FULL_TABLE_REF}` 
        WHERE user_id = '{user_id}'
        GROUP BY platform
        ORDER BY count DESC
        """
        platform_job = client.query(platform_query)
        platform_df = platform_job.to_dataframe()

        if stats_df.empty or stats_df.iloc[0].get("total_applications", 0) == 0:
            return None

        row = stats_df.iloc[0]
        stats = {
            "total_applications": int(row.get("total_applications", 0)),
            "interviewing_count": int(row.get("interviewing_count", 0)) if not pd.isna(row.get("interviewing_count")) else 0,
            "rejected_count": int(row.get("rejected_count", 0)) if not pd.isna(row.get("rejected_count")) else 0,
            "avg_priority_score": float(row.get("avg_priority_score", 0.0)) if not pd.isna(row.get("avg_priority_score")) else 0.0,
            "platform_breakdown": platform_df.set_index("platform")["count"].to_dict() if not platform_df.empty else {}
        }
        return stats
    except Exception as e:
        print(f"[BQ Query] Failed to query stats from BigQuery: {e}")
        return None

if __name__ == "__main__":
    # Test uploading standard CSV
    upload_to_bigquery()
