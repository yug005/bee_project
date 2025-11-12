#!/bin/bash

echo "🚀 Starting RailBooker Microservices..."
echo ""

# Check if .env files exist
if [ ! -f "email-service/.env" ]; then
    echo "⚠️  Email service .env file not found!"
    echo "   Creating from .env.example..."
    cp email-service/.env.example email-service/.env
    echo "   ✓ Please edit email-service/.env with your SMTP credentials"
    echo ""
fi

# Start Email Service in background
echo "📧 Starting Email Microservice on port 3001..."
cd email-service
npm start &
EMAIL_PID=$!
cd ..

# Wait a bit for email service to start
sleep 3

# Start Main Application
echo "🚂 Starting Main Application on port 3000..."
npm start &
APP_PID=$!

echo ""
echo "✅ Both services are running..."
echo ""
echo "📍 URLs:"
echo "   Main App:      http://localhost:3000"
echo "   Email Service: http://localhost:3001"
echo "   Email Health:  http://localhost:3001/health"
echo ""
echo "PIDs: Email=$EMAIL_PID, App=$APP_PID"
echo ""
echo "To stop services:"
echo "   kill $EMAIL_PID $APP_PID"
echo ""

# Wait for user input
read -p "Press Enter to stop all services..."

# Kill processes
kill $EMAIL_PID $APP_PID
echo "Services stopped."
