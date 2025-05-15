#!/bin/bash

# Database Management Script for Srichakra Project
# Usage: ./db-manager.sh [command]

PROJECT_DIR="/Users/gurukrpasharma/Desktop/srichakra"
cd $PROJECT_DIR

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | sed 's/\r$//' | xargs)
fi

case "$1" in
  status)
    echo "Database Status:"
    echo "Database URL: $DATABASE_URL"
    echo ""
    echo "To connect to the database:"
    echo "psql $DATABASE_URL"
    ;;
  push)
    echo "Pushing schema changes to database..."
    npm run db:push
    ;;
  seed)
    echo "Seeding database..."
    npm run db:seed
    ;;
  backup)
    echo "Creating database backup..."
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_DIR="$PROJECT_DIR/db/backups"
    mkdir -p $BACKUP_DIR
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
    
    # Extract database details from URL
    DB_USER=$(echo $DATABASE_URL | sed -n 's/postgres:\/\/\([^:]*\):.*/\1/p')
    DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/postgres:\/\/[^:]*:\([^@]*\).*/\1/p')
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/postgres:\/\/[^:]*:[^@]*@\([^:]*\).*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/postgres:\/\/[^:]*:[^@]*@[^:]*:\([^/]*\).*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/postgres:\/\/[^:]*:[^@]*@[^:]*:[^/]*\/\(.*\)/\1/p')
    
    PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
      echo "Backup created successfully: $BACKUP_FILE"
    else
      echo "Backup failed"
    fi
    ;;
  *)
    echo "Database Manager for Srichakra Project"
    echo "Usage: ./db-manager.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  status    - Show database status"
    echo "  push      - Push schema changes to database"
    echo "  seed      - Seed the database"
    echo "  backup    - Create a database backup"
    ;;
esac
