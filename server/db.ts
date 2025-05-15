import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/admin-schema';

// Database connection string - customize based on your environment
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/srichakra';

// Create postgres client with required connection options
const client = postgres(connectionString, {
  // Optional: Add any postgres client options here if needed
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Connection idle timeout in seconds
});

// Create drizzle database instance with the imported schema
export const db = drizzle(client, { schema });

// Export prepared query function for better performance when needed
export const query = db.query;
