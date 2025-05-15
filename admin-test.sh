#!/bin/bash
# Admin System Test Script
# This script helps test the admin login functionality

echo "🚀 Starting Srichakra Admin Test Environment"
echo "--------------------------------------------"

# Check if server is running on port 5000
if nc -z localhost 5000 2>/dev/null; then
  echo "✅ Server is already running on port 5000"
else
  echo "⚙️  Starting server..."
  echo "  Opening new terminal window for server"
  osascript -e 'tell application "Terminal" to do script "cd '$PWD' && npm run server"'
  echo "  Waiting for server to start..."
  until nc -z localhost 5000 2>/dev/null; do
    sleep 1
  done
  echo "✅ Server started!"
fi

# Check if client is running on port 5173 (Vite dev server)
if nc -z localhost 5173 2>/dev/null; then
  echo "✅ Client is already running on port 5173"
else
  echo "⚙️  Starting client..."
  echo "  Opening new terminal window for client"
  osascript -e 'tell application "Terminal" to do script "cd '$PWD' && npm run client"'
  echo "  Waiting for client to start..."
  until nc -z localhost 5173 2>/dev/null; do
    sleep 1
  done
  echo "✅ Client started!"
fi

echo ""
echo "🎯 Testing URLs:"
echo "--------------------------------------------"
echo "📋 Admin Test Tool:  http://localhost:5173/admin-test-tool.html"
echo "🔒 Admin Login:      http://localhost:5173/admin/login"
echo "📊 Admin Dashboard:  http://localhost:5173/admin/dashboard"
echo ""
echo "🔑 Default Admin Credentials:"
echo "--------------------------------------------"
echo "Email:    admin@srichakra.com"
echo "Password: admin123"
echo ""

# Open browser to the test tool
echo "🌐 Opening Admin Test Tool in browser..."
open "http://localhost:5173/admin-test-tool.html"

echo ""
echo "✨ All systems are ready for testing!"
