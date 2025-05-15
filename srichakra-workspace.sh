#!/bin/bash

# Srichakra Project Workspace Script
# Usage: ./srichakra-workspace.sh [command]

PROJECT_DIR="/Users/gurukrpasharma/Desktop/srichakra"
cd $PROJECT_DIR

case "$1" in
  start)
    echo "Starting development server..."
    npm run dev
    ;;
  build)
    echo "Building project..."
    npm run build
    ;;
  db:push)
    echo "Pushing database schema..."
    npm run db:push
    ;;
  db:seed)
    echo "Seeding database..."
    npm run db:seed
    ;;
  install)
    echo "Installing dependencies..."
    npm install
    ;;
  status)
    echo "Project Status:"
    echo "------------------------------"
    echo "Git status:"
    git status --short
    echo "------------------------------"
    echo "Node version: $(node -v)"
    echo "NPM version: $(npm -v)"
    echo "------------------------------"
    echo "Installed packages:"
    npm list --depth=0
    ;;
  *)
    echo "Srichakra Project Workspace"
    echo "Usage: ./srichakra-workspace.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  start     - Start development server"
    echo "  build     - Build the project"
    echo "  db:push   - Push database schema changes"
    echo "  db:seed   - Seed the database"
    echo "  install   - Install dependencies"
    echo "  status    - Show project status"
    ;;
esac
