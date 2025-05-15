#!/usr/bin/env node
// This script sets up the admin system for Srichakra

import { exec } from 'child_process';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('===== Srichakra Admin System Setup =====');
console.log('This script will set up the admin database tables and create an initial super admin user.');

rl.question('Do you want to proceed? (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\nSetting up admin tables...');
    
    // Execute the TypeScript file using ts-node
    exec('npx ts-node -r tsconfig-paths/register db/migrations/admin_tables.ts', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(stderr);
        rl.close();
        return;
      }
      
      console.log(stdout);
      console.log('\n✅ Admin system setup complete!');
      console.log('\nYou can now log in with the following credentials:');
      console.log('Email: admin@srichakra.edu.in');
      console.log('Password: admin123');
      console.log('\n⚠️ Important: Please change the default password immediately after first login.');
      
      rl.close();
    });
  } else {
    console.log('Setup canceled.');
    rl.close();
  }
});
