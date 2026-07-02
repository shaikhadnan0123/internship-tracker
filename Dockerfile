# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies, curl, and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy package lock and install npm packages
COPY internAi-main/package*.json ./internAi-main/
RUN cd internAi-main && npm install

# Copy all application source code
COPY . .

# Build frontend and Express production bundle
RUN cd internAi-main && npm run build

# Make the start script executable
RUN chmod +x start_run.sh

# Set default port and python unbuffered mode
ENV PORT=8080
ENV PYTHONUNBUFFERED=True

# Expose port
EXPOSE 8080

# Start Flask and Node servers concurrently
CMD ["./start_run.sh"]
