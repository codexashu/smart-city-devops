#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================================="
echo "🚀 Starting Smart City Management System (DevOps Local)"
echo "=========================================================="

# Check if Docker is available and running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "🐳 Docker daemon detected. Launching full stack with Docker Compose..."
    docker compose up -d --build
    echo ""
    echo "🎉 Platform is up and running!"
    echo "🌐 Frontend Portal:   http://localhost:3000"
    echo "🔌 Backend REST API:  http://localhost:8000"
    echo "📊 Prometheus:        http://localhost:9090"
    echo "📈 Grafana Dashboard: http://localhost:3001 (admin/admin)"
    echo "=========================================================="
    docker compose ps
else
    echo "⚡ Docker not running. Starting standalone local instances..."
    echo "1. Starting Backend on http://localhost:8000..."
    cd "$PROJECT_ROOT/backend"
    python3 -m venv venv || true
    source venv/bin/activate
    pip install -r requirements.txt || true
    nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend running with PID $BACKEND_PID"

    echo "2. Starting Frontend on http://localhost:3000..."
    cd "$PROJECT_ROOT/frontend"
    npm install || true
    npm start &
    FRONTEND_PID=$!
    echo "Frontend running with PID $FRONTEND_PID"

    echo "=========================================================="
    echo "Press Ctrl+C to stop services."
    wait $FRONTEND_PID $BACKEND_PID
fi
