# Start both services for development

Write-Host "🚀 Starting RailBooker Microservices..." -ForegroundColor Green
Write-Host ""

# Check if .env files exist
if (-not (Test-Path "email-service\.env")) {
    Write-Host "⚠️  Email service .env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item "email-service\.env.example" "email-service\.env"
    Write-Host "   ✓ Please edit email-service\.env with your SMTP credentials" -ForegroundColor Cyan
    Write-Host ""
}

# Start Email Service
Write-Host "📧 Starting Email Microservice on port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd email-service; Write-Host '📧 Email Service' -ForegroundColor Blue; npm start"

# Wait a bit for email service to start
Start-Sleep -Seconds 3

# Start Main Application
Write-Host "🚂 Starting Main Application on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🚂 Main Application' -ForegroundColor Blue; npm start"

Write-Host ""
Write-Host "✅ Both services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor White
Write-Host "   Main App:      http://localhost:3000" -ForegroundColor Gray
Write-Host "   Email Service: http://localhost:3001" -ForegroundColor Gray
Write-Host "   Email Health:  http://localhost:3001/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the services" -ForegroundColor Yellow
