import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as userSchema from '../shared/schema';
import * as adminSchema from '../shared/admin-schema';

// Database connection string - customize based on your environment
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/srichakra';
const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

// Create postgres client with required connection options
const client = postgres(connectionString, {
  // Optional: Add any postgres client options here if needed
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Connection idle timeout in seconds
  ssl: isLocal ? undefined : 'require', // Needed for Supabase/Neon and other managed DBs
});

// Create drizzle database instance with the imported schema
export const db = drizzle(client, { schema: { ...userSchema, ...adminSchema } as any });

// Export prepared query function for better performance when needed
export const query = db.query;
