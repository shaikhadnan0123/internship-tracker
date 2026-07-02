#!/bin/bash
echo "Starting Flask Backend on port 5000..."
python -u api/app.py > /tmp/flask.log 2>&1 &
FLASK_PID=$!

# Wait 3 seconds to check status
sleep 3

if kill -0 $FLASK_PID 2>/dev/null; then
  echo "Flask Backend started successfully (PID: $FLASK_PID)."
else
  echo "ERROR: Flask Backend crashed on startup!"
  cat /tmp/flask.log
fi

# Start the Node.js Express React frontend on the Cloud Run PORT in the foreground
echo "Starting Node.js Express frontend on port $PORT..."
export NODE_ENV=production
cd internAi-main && node dist/server.cjs
