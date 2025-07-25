#!/bin/bash

echo "Starting EthioMarket ASP.NET Core Backend..."

# Navigate to API project directory
cd src/EthioMarket.API

# Restore packages
echo "Restoring NuGet packages..."
dotnet restore

# Build the project
echo "Building project..."
dotnet build

# Run the application
echo "Starting application..."
dotnet run

echo "Backend started successfully!"