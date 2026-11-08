#!/bin/bash
set -e

echo "=========================================================="
echo "🧪 Running Smart City DevOps Test Suite"
echo "=========================================================="

cd "$(dirname "$0")/../backend"

# Ensure dependencies or virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo "Running Pytest Unit and Integration Tests..."
pytest tests/ -v

echo "=========================================================="
echo "✅ All tests passed successfully!"
echo "=========================================================="
