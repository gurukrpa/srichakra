# Srichakra Admin System

This document provides guidance on setting up and using the Srichakra admin system.

## Overview

The admin system allows management of:
- School teachers and staff members
- User permissions and roles
- Tracking who is logged in
- Managing admin accounts

## Admin Roles

1. **Super Admin**
   - Can create, edit, and delete all types of users
   - Has full access to all features
   - Can promote regular admins

2. **Admin**
   - Can create, edit, and delete teachers and staff
   - Cannot modify other admins or super admins
   - Has access to most features

3. **Teacher**
   - Can view student records
   - Limited administrative capabilities
   - Cannot manage other users

4. **Staff**
   - Basic access to the admin portal
   - Limited to assigned functions

## Setup Instructions

### Initial Setup

1. Make sure you have a PostgreSQL database available. You can use:
   - A local PostgreSQL installation
   - A cloud database service like Neon, Supabase, or Railway

2. Run the setup script:
   ```
   npm run setup-admin
   ```

3. The script will:
   - Check if you have a valid DATABASE_URL in your `.env` file
   - Prompt you to enter one if needed
   - Set up the admin tables and create a default super admin user

4. If you encounter database connection errors:
   - Verify your DATABASE_URL is correct
   - Ensure your database server is running
   - Check if network/firewall settings permit the connection

### Database URL Formats

Examples of valid DATABASE_URL formats:

- Local PostgreSQL:
  ```
  postgresql://username:password@localhost:5432/srichakra
  ```

- Neon:
  ```
  postgres://user:password@ep-something.pooler.region.postgres.vercel-storage.com/database
  ```

- Supabase:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
  ```
   - This script will guide you through the setup process
   - If no DATABASE_URL is found, it will prompt you to enter one

4. Or alternatively, you can run the migration directly:
   ```
   npm run db:admin-setup
   ```

5. The default super admin credentials are:
   - Email: admin@srichakra.edu.in
   - Password: admin123

6. **Important:** Change the default password immediately after first login

### Adding Team Members

1. Log in as a super admin or admin
2. Navigate to Team Members page
3. Click "Add Member"
4. Fill in the required information
5. Assign appropriate role

## Security Features

- Session tracking for all admin users
- Online status monitoring
- Role-based access control
- Activity logging

## Development Notes

The admin system uses:
- JWT for authentication
- PostgreSQL for data storage
- Secure password hashing (in production)

### API Endpoints

- `/api/admin/login` - Admin login
- `/api/admin/logout` - Admin logout
- `/api/admin/team-members` - CRUD operations for team members
- `/api/admin/change-password` - Change admin password
- `/api/admin/online-users` - Track who is currently logged in

## Production Deployment

Before deploying to production:

1. Enable password hashing by uncommenting the relevant code in admin-routes.ts
2. Set up proper environment variables
3. Change the default admin password
4. Consider adding rate limiting to prevent brute force attacks
