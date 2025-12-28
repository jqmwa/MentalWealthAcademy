#!/usr/bin/env node
/**
 * Database Connection Test Script
 * 
 * Run this script to test your database connection:
 * npx tsx scripts/test-db-connection.ts
 * 
 * Or with ts-node:
 * npx ts-node scripts/test-db-connection.ts
 * 
 * Note: Environment variables should be loaded by Next.js automatically,
 * or set them in your shell before running this script.
 */

import { Pool } from 'pg';

function testConnection() {
  console.log('🔍 Testing database connection...\n');

  // Check configuration
  const databaseUrl = process.env.DATABASE_URL;
  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const database = process.env.POSTGRES_DATABASE;

  console.log('Configuration:');
  if (databaseUrl) {
    // Mask password in URL
    const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`  DATABASE_URL: ${maskedUrl}`);
  } else {
    console.log(`  POSTGRES_HOST: ${host || 'NOT SET'}`);
    console.log(`  POSTGRES_USER: ${user || 'NOT SET'}`);
    console.log(`  POSTGRES_DATABASE: ${database || 'NOT SET'}`);
    console.log(`  POSTGRES_PORT: ${process.env.POSTGRES_PORT || '5432 (default)'}`);
  }
  console.log('');

  if (!databaseUrl && (!host || !user || !database)) {
    console.error('❌ Error: Database configuration is missing!');
    console.log('\nPlease set one of the following:');
    console.log('  - DATABASE_URL (recommended)');
    console.log('  - POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE');
    process.exit(1);
  }

  // Create pool
  let pool: Pool;
  try {
    if (databaseUrl) {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 10000,
      });
    } else {
      pool = new Pool({
        host: host!,
        port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
        user: user!,
        password: process.env.POSTGRES_PASSWORD,
        database: database!,
        connectionTimeoutMillis: 10000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });
    }
  } catch (error: any) {
    console.error('❌ Error creating connection pool:', error.message);
    process.exit(1);
  }

  // Test connection
  pool.query('SELECT NOW() as current_time, version() as version')
    .then((result) => {
      console.log('✅ Database connection successful!');
      console.log(`  Current time: ${result.rows[0].current_time}`);
      console.log(`  PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
      console.log('\n🎉 Your database is configured correctly!');
      pool.end();
      process.exit(0);
    })
    .catch((error: any) => {
      console.error('❌ Database connection failed!');
      console.error(`\nError code: ${error.code || 'UNKNOWN'}`);
      console.error(`Error message: ${error.message}\n`);

      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Troubleshooting:');
        console.log('  1. Is the database server running?');
        console.log('  2. Is the port correct? (default: 5432)');
        console.log('  3. Are firewall rules allowing connections?');
        if (error.message?.includes('[') && error.message?.includes(']')) {
          console.log('  4. IPv6 address detected - try using IPv4 address instead');
          console.log('     Example: Replace IPv6 in DATABASE_URL with IPv4');
        }
      } else if (error.code === 'ENOTFOUND') {
        console.log('💡 Troubleshooting:');
        console.log('  1. Is your DATABASE_URL or POSTGRES_HOST correct?');
        console.log('  2. Is your DNS working correctly?');
        console.log('  3. If using a cloud database, verify the connection string');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('💡 Troubleshooting:');
        console.log('  1. Is your network connection stable?');
        console.log('  2. Is the database server accessible from your network?');
        console.log('  3. Are there any network restrictions or VPN requirements?');
      } else if (error.code === '28P01' || error.message?.includes('password')) {
        console.log('💡 Troubleshooting:');
        console.log('  1. Check your database password');
        console.log('  2. Verify the username is correct');
      } else if (error.code === '3D000' || error.message?.includes('database')) {
        console.log('💡 Troubleshooting:');
        console.log('  1. Check that the database name is correct');
        console.log('  2. Verify the database exists on the server');
      }

      pool.end();
      process.exit(1);
    });
}

testConnection();

