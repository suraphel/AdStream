#!/bin/bash
echo "Starting .NET backend..."
cd backend/TenderFloatingBindingApi
dotnet run --urls "http://0.0.0.0:5001" &
BACKEND_PID=$!

echo "Backend started with PID: $BACKEND_PID"
echo "Waiting for backend to be ready..."
sleep 5

echo "Starting frontend..."
cd ../../frontend
npm run dev &
FRONTEND_PID=$!

echo "Frontend started with PID: $FRONTEND_PID"
echo "Application is starting up..."
echo "Backend API: http://localhost:5001"
echo "Frontend: Check the terminal for the frontend URL"

wait