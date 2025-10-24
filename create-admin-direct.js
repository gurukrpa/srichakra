import postgres from 'postgres';

// Use the same connection string that worked before
const databaseUrl = "postgresql://postgres.ugbnpszftpqxrpxabpyh:%23Vanakamnanba2020%23@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";

console.log("Connecting to Supabase database...");

const sql = postgres(databaseUrl, {
  max: 1,
  ssl: 'require'
});

async function createAdminTables() {
  try {
    console.log("Creating admin role enum...");
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
          CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'teacher', 'staff');
        END IF;
      END$$;
    `;

    console.log("Creating admin_users table...");
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
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
      )
    `;

    console.log("Creating admin_sessions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admin_users(id),
        token TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        logout_time TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN NOT NULL DEFAULT true
      )
    `;

    console.log("Creating initial super admin user...");
    await sql`
      INSERT INTO admin_users (name, email, password, role)
      SELECT 'Super Admin', 'admin@srichakra.com', 'admin123', 'super_admin'
      WHERE NOT EXISTS (
        SELECT 1 FROM admin_users WHERE email = 'admin@srichakra.com'
      )
    `;

    console.log("✅ All admin tables created successfully!");
    console.log("✅ Initial admin user created:");
    console.log("   Email: admin@srichakra.com");
    console.log("   Password: admin123");

  } catch (error) {
    console.error("❌ Error creating admin tables:", error);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

createAdminTables();
