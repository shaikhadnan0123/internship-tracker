#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

PROJECT_ID="project-32e06b00-613b-416f-a3a"
SERVICE_NAME="internship-tracker"
REGION="us-central1"

echo "=================================================="
echo "Starting deployment process to Google Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "=================================================="

# Set the active GCP project
echo "Setting GCP project config..."
gcloud config set project "$PROJECT_ID"

# Submit build to Cloud Build
echo "Building and pushing container image to GCR via Cloud Build..."
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
gcloud builds submit --tag "$IMAGE_TAG"

# Deploy container image to Cloud Run
echo "Deploying image to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_TAG" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated

echo "=================================================="
echo "✅ Deployment complete!"
echo "Your application has been deployed successfully to Cloud Run."
echo "=================================================="
