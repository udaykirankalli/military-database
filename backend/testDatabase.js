

require('dotenv').config();
const { Pool } = require('pg');

// Create database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Test database connection and data integrity
 */
async function testDatabaseConnection() {
  console.log('\n' + '='.repeat(70));
  console.log('  Military Asset Management System - Database Test');
  console.log('='.repeat(70) + '\n');

  try {
    // Test 1: Basic connection
    console.log(' Test 1: Testing database connection...');
    const client = await pool.connect();
    console.log(' Successfully connected to PostgreSQL database');
    console.log(`   Database: ${process.env.DATABASE_URL.split('/').pop().split('?')[0]}`);
    console.log();

    // Test 2: Check tables
    console.log(' Test 2: Verifying database tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      throw new Error('No tables found! Please run schema.sql first.');
    }

    console.log(` Found ${tablesResult.rows.length} tables:`);
    const expectedTables = [
      'assets', 'assignments', 'audit_logs', 'bases', 'equipment_types',
      'expenditures', 'personnel', 'purchases', 'transfers', 'users'
    ];

    tablesResult.rows.forEach(row => {
      const isExpected = expectedTables.includes(row.table_name);
      console.log(`   ${isExpected ? '✓' : '•'} ${row.table_name}`);
    });
    console.log();

    // Test 3: Check sample data counts
    console.log(' Test 3: Verifying sample data...');

    const dataChecks = [
      { table: 'bases', expected: 4 },
      { table: 'users', expected: 4 },
      { table: 'equipment_types', expected: 10 },
      { table: 'personnel', expected: 5 },
      { table: 'purchases', expected: 4 },
      { table: 'transfers', expected: 3 },
      { table: 'assignments', expected: 4 }
    ];

    let allDataValid = true;

    for (const check of dataChecks) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${check.table}`);
      const count = parseInt(result.rows[0].count);
      const status = count >= check.expected ? '✅' : '⚠️';
      
      if (count < check.expected) allDataValid = false;
      
      console.log(`   ${status} ${check.table}: ${count} records (expected: ${check.expected})`);
    }
    console.log();

    if (!allDataValid) {
      console.log('  Warning: Some tables have less data than expected.');
      console.log('   This might be okay if you modified the schema.');
    }

    // Test 4: Verify users and their roles
    console.log('👥 Test 4: Listing system users...');
    const usersResult = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        b.name as base_name
      FROM users u
      LEFT JOIN bases b ON u.base_id = b.id
      ORDER BY u.id
    `);

    if (usersResult.rows.length === 0) {
      throw new Error('No users found! Please run generateHashes.js and update the database.');
    }

    console.log(`Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach(user => {
      const baseName = user.base_name || 'All Bases';
      console.log(`   • ${user.email}`);
      console.log(`     Name: ${user.name} | Role: ${user.role} | Base: ${baseName}`);
    });
    console.log();

    // Test 5: Test a complex query (dashboard-like)
    console.log('🔍 Test 5: Testing complex query (dashboard simulation)...');
    const dashboardQuery = await client.query(`
      SELECT 
        (SELECT COALESCE(SUM(quantity), 0) FROM assets) as total_assets,
        (SELECT COALESCE(SUM(quantity), 0) FROM purchases) as total_purchases,
        (SELECT COUNT(*) FROM transfers WHERE status = 'completed') as completed_transfers,
        (SELECT COUNT(*) FROM assignments WHERE status = 'active') as active_assignments
    `);

    const stats = dashboardQuery.rows[0];
    console.log(' Dashboard query executed successfully:');
    console.log(`   Total Assets: ${stats.total_assets}`);
    console.log(`   Total Purchases: ${stats.total_purchases}`);
    console.log(`   Completed Transfers: ${stats.completed_transfers}`);
    console.log(`   Active Assignments: ${stats.active_assignments}`);
    console.log();

    // Test 6: Test authentication query
    console.log(' Test 6: Testing authentication query...');
    const authTest = await client.query(`
      SELECT email, role FROM users WHERE email = 'admin@military.gov'
    `);

    if (authTest.rows.length > 0) {
      console.log(' Authentication query works:');
      console.log(`   Found user: ${authTest.rows[0].email}`);
      console.log(`   Role: ${authTest.rows[0].role}`);
    } else {
      console.log('  Admin user not found. Run generateHashes.js to create users.');
    }
    console.log();

    // Release client
    client.release();

    console.log();
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error();

  } finally {
    await pool.end();
  }
}

// Run the test
testDatabaseConnection();