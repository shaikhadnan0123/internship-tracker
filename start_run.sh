#!/bin/bash
# Start Flask Backend in the background, streaming output directly to stdout/stderr
echo "Starting Flask Backend on port 5000..."
python -u api/app.py &

# Wait 18 seconds to let Flask bind
sleep 18

# Start the Node.js Express React frontend on the Cloud Run PORT in the foreground
echo "Starting Node.js Express frontend on port $PORT..."
export NODE_ENV=production
cd internAi-main && node dist/server.cjs
