import { sql } from "drizzle-orm";
import { db } from "../index";
import { adminUsers, adminSessions, adminRoleEnum } from "../../shared/admin-schema";

export async function createAdminTables() {
  try {
    console.log("Creating admin tables if they don't exist...");
    
    // First create the enum type
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
          CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'teacher', 'staff');
        END IF;
      END$$;
    `);

    // Create adminUsers table
    await db.execute(sql`
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
    `);

    // Create adminSessions table
    await db.execute(sql`
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
    `);

    // Create an initial super admin user
    const existingSuperAdmin = await db.execute(sql`
      SELECT COUNT(*) FROM admin_users WHERE role = 'super_admin'
    `);

    if (parseInt(existingSuperAdmin.rows[0].count) === 0) {
      console.log("Creating default super admin user...");
      
      // Import bcrypt for password hashing
      const bcrypt = await import('bcrypt');
      // Hash the default password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.execute(sql`
        INSERT INTO admin_users (name, email, password, role)
        VALUES ('Super Admin', 'admin@srichakra.edu.in', ${hashedPassword}, 'super_admin')
      `);
    }

    console.log("Admin tables created/verified successfully!");
  } catch (error) {
    console.error("Error creating admin tables:", error);
    throw error;
  }
}
