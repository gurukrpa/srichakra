#!/bin/bash

echo "=== Srichakra Real Database Setup Script ==="
echo ""
echo "This script will help you set up your application with a real Supabase database."
echo ""

# Check if DATABASE_URL is set
if grep -q "YOUR_DB_PASSWORD" .env; then
    echo "❌ DATABASE_URL still contains placeholder password"
    echo ""
    echo "STEP 1: Get your Supabase database password"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select project: ugbnpszftpqxrpxabpyh"
    echo "3. Go to Settings → Database"
    echo "4. Copy your database password"
    echo ""
    echo "STEP 2: Update .env file"
    echo "Replace 'YOUR_DB_PASSWORD' with your actual password in .env file"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL appears to be configured"
echo ""

# Test database connection
echo "Testing database connection..."
if npm run db:push; then
    echo "✅ Database connection successful!"
    echo "✅ All tables created/updated in Supabase"
    echo ""
else
    echo "❌ Database connection failed"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Create initial admin user
echo "Setting up initial admin user..."
if npm run setup-admin; then
    echo "✅ Admin user created"
else
    echo "⚠️  Admin user setup failed or already exists"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Your application now has:"
echo "✅ Real Supabase database connection"
echo "✅ All necessary tables:"
echo "   - users (for user signups)"
echo "   - admin_users (for admin login)"
echo "   - admin_sessions (for admin sessions)"
echo "   - schools (for school management)"
echo "   - school_students (for student management)"
echo "   - user_sessions (for user tracking)"
echo ""
echo "✅ Initial admin user:"
echo "   Email: admin@srichakra.com"
echo "   Password: admin123"
echo "   (Please change this password after first login)"
echo ""
echo "Now you can:"
echo "1. npm run dev (start the server)"
echo "2. Go to /admin/login"
echo "3. Login with admin credentials"
echo "4. Create schools and manage students"
echo "5. All data will be saved permanently in Supabase!"
echo ""
