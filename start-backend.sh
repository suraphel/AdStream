#!/bin/bash
cd backend/TenderFloatingBindingApi
echo "Starting .NET backend on port 5001..."
export ASPNETCORE_URLS="http://0.0.0.0:5001"
export ASPNETCORE_ENVIRONMENT="Development"
dotnet run