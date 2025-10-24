import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ugbnpszftpqxrpxabpyh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYm5wc3pmdHBxeHJweGFicHloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ0Njg4OSwiZXhwIjoyMDc2MDIyODg5fQ.JDSf1W-AkjDbwuJU1-gt3haDFFrVYsXmxqPccM8EyqM';

console.log("Creating Supabase client...");
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTablesWithSupabase() {
  try {
    console.log("Creating admin_users table...");
    
    // Create admin_users table using Supabase RPC
    const { data: createTable, error: createError } = await supabase.rpc('create_admin_tables');
    
    if (createError) {
      console.log("Table creation via RPC failed, trying direct SQL...");
      
      // Try using raw SQL query
      const { data, error } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);
        
      if (error && error.code === 'PGRST106') {
        console.log("admin_users table doesn't exist, it needs to be created manually in Supabase dashboard");
        console.log("\nPlease do the following:");
        console.log("1. Go to your Supabase dashboard: https://supabase.com/dashboard");
        console.log("2. Open your project: ugbnpszftpqxrpxabpyh");
        console.log("3. Go to SQL Editor");
        console.log("4. Run the following SQL:");
        console.log(`
-- Create admin role enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'teacher', 'staff');

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'staff',
  phone TEXT,
  designation TEXT,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER REFERENCES admin_users(id),
  last_login TIMESTAMP WITH TIME ZONE,
  currently_logged_in BOOLEAN DEFAULT false
);

-- Create admin_sessions table
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id),
  token TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Insert initial super admin user
INSERT INTO admin_users (name, email, password, role)
VALUES ('Super Admin', 'admin@srichakra.com', 'admin123', 'super_admin');
        `);
      } else {
        console.log("✅ admin_users table exists or other error:", error);
      }
    } else {
      console.log("✅ Tables created successfully via RPC");
    }

    // Test if we can insert an admin user
    console.log("Testing admin user insertion...");
    const { data: insertData, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        name: 'Super Admin',
        email: 'admin@srichakra.com',
        password: 'admin123',
        role: 'super_admin'
      })
      .select();

    if (insertError) {
      if (insertError.code === '23505') {
        console.log("✅ Admin user already exists");
      } else {
        console.log("❌ Error inserting admin user:", insertError);
      }
    } else {
      console.log("✅ Admin user created:", insertData);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createTablesWithSupabase();
