#!/bin/bash
echo "Starting TenderFloatingBinding Frontend..."
echo "Frontend will be available at: http://localhost:5173"
echo ""

cd "$(dirname "$0")"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    echo "Please install Node.js and npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting frontend server..."
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev