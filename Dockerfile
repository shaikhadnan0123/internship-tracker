# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies if any are needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Set default port and python unbuffered mode
ENV PORT=5000
ENV PYTHONUNBUFFERED=True

# Expose the application port
EXPOSE 5000

# Start Gunicorn server binding to $PORT
CMD gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 api.app:app
