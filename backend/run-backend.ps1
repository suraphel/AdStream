# PowerShell script to run the ASP.NET Core backend
Write-Host "Starting EthioMarket ASP.NET Core Backend..." -ForegroundColor Green

# Navigate to API project directory
Set-Location "src/EthioMarket.API"

# Restore packages
Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
dotnet build

# Run the application
Write-Host "Starting application..." -ForegroundColor Yellow
dotnet run

Write-Host "Backend started successfully!" -ForegroundColor Green