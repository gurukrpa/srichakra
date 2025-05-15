#!/usr/bin/env node
// This script sets up the admin system for Srichakra

import { exec } from 'child_process';
import path from 'path';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to check if .env file exists and contains DATABASE_URL
function checkDatabaseConfig() {
  try {
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      if (envContent.includes('DATABASE_URL=')) {
        const match = envContent.match(/DATABASE_URL=(.+)/);
        if (match && match[1] && !match[1].includes('localhost:5432')) {
          return {
            exists: true,
            isValid: true,
            url: match[1]
          };
        }
        return { exists: true, isValid: false };
      }
    }
    return { exists: false, isValid: false };
  } catch (error) {
    console.error('Error checking database configuration:', error);
    return { exists: false, isValid: false };
  }
}

console.log('===== Srichakra Admin System Setup =====');
console.log('This script will set up the admin database tables and create an initial super admin user.');

// Check database configuration
const dbConfig = checkDatabaseConfig();

// Function to set up the database with the user's database URL
function promptForDatabaseUrl() {
  console.log('\n⚠️ No valid DATABASE_URL found in your .env file.');
  console.log('You need a valid PostgreSQL database connection to set up the admin system.');
  console.log('Examples:');
  console.log('  - For local PostgreSQL: postgresql://username:password@localhost:5432/srichakra');
  console.log('  - For Neon: postgres://user:password@ep-something.pooler.region.postgres.vercel-storage.com/database');
  
  rl.question('Enter your DATABASE_URL: ', (dbUrl) => {
    if (!dbUrl.trim()) {
      console.log('❌ No DATABASE_URL provided. Setup canceled.');
      rl.close();
      return;
    }
    
    // Update .env file
    try {
      const envContent = fs.existsSync('.env') 
        ? fs.readFileSync('.env', 'utf8')
        : '';
      
      if (envContent.includes('DATABASE_URL=')) {
        const updatedContent = envContent.replace(/DATABASE_URL=.+/, `DATABASE_URL=${dbUrl}`);
        fs.writeFileSync('.env', updatedContent);
      } else {
        fs.writeFileSync('.env', `${envContent}\nDATABASE_URL=${dbUrl}\n`);
      }
      
      console.log('✅ DATABASE_URL saved to .env file');
      process.env.DATABASE_URL = dbUrl;
      setupDatabase();
    } catch (error) {
      console.error('❌ Error updating .env file:', error);
      rl.close();
    }
  });
}

function setupDatabase() {
  console.log('\nSetting up admin tables...');
  
  // Use environment variables from the current process 
  const env = { ...process.env };
  
  // Execute the migration script using tsx
  exec('npx tsx db/migrate-admin.ts', { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        if (stderr) console.error(stderr);
        
        if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
          console.log('\n❌ Database connection failed. Please check:');
          console.log('1. The DATABASE_URL in your .env file is correct');
          console.log('2. Your database server is running');
          console.log('3. Network/firewall settings allow the connection');
          console.log('\nTry running the setup again with a valid database connection.');
        }
        
        rl.close();
        return;
      }
      
      if (stdout) console.log(stdout);
      console.log('\n✅ Admin system setup complete!');
      console.log('\nYou can now log in with the following credentials:');
      console.log('Email: admin@srichakra.edu.in');
      console.log('Password: admin123');
      console.log('\n⚠️ Important: Please change the default password immediately after first login.');
      
      rl.close();
    });
}

// Start the setup process
if (!dbConfig.isValid) {
  promptForDatabaseUrl();
} else {
  rl.question('Do you want to proceed? (y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupDatabase();
    } else {
      console.log('Setup canceled.');
      rl.close();
    }
  });
}
