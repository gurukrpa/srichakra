import { createAdminTables } from './migrations/admin_tables';

async function runMigration() {
  try {
    console.log('Starting admin tables migration...');
    await createAdminTables();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration().then(() => process.exit(0));
