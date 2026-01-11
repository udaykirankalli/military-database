const bcrypt = require('bcryptjs');

// Configuration
const DEMO_PASSWORD = 'demo123';
const SALT_ROUNDS = 10;

// Demo users configuration
const users = [
  { 
    id: 1,
    email: 'admin@military.gov', 
    name: 'Admin User', 
    role: 'admin',
    base_id: null,
    description: 'Full system access'
  },
  { 
    id: 2,
    email: 'commander.alpha@military.gov', 
    name: 'James Mitchell', 
    role: 'commander',
    base_id: 1,
    description: 'Base Alpha Commander'
  },
  { 
    id: 3,
    email: 'commander.beta@military.gov', 
    name: 'Sarah Johnson', 
    role: 'commander',
    base_id: 2,
    description: 'Base Beta Commander'
  },
  { 
    id: 4,
    email: 'logistics@military.gov', 
    name: 'David Williams', 
    role: 'logistics',
    base_id: 4,
    description: 'Logistics Officer - Central Depot'
  }
];

async function generatePasswordHashes() {
  console.log('='.repeat(70));
  console.log('  Military Asset Management System - Password Hash Generator');
  console.log('='.repeat(70));
  console.log();
  console.log(`  Default Password: ${DEMO_PASSWORD}`);
  console.log(`  Salt Rounds: ${SALT_ROUNDS}`);
  console.log();
  console.log('='.repeat(70));
  console.log();

  const sqlValues = [];

  for (const user of users) {
    console.log(`Processing User #${user.id}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Description: ${user.description}`);

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    console.log(`  Password Hash: ${passwordHash}`);
    console.log('-'.repeat(70));

    const baseIdValue = user.base_id === null ? 'NULL' : user.base_id;
    sqlValues.push(
      `('${user.email}', '${passwordHash}', '${user.name}', '${user.role}', ${baseIdValue})`
    );
  }

  console.log();
  console.log('='.repeat(70));
  console.log('  COPY THE SQL BELOW AND RUN IN YOUR DATABASE');
  console.log('='.repeat(70));
  console.log();
  console.log('-- Step 1: Delete existing users');
  console.log('DELETE FROM users;');
  console.log();
  console.log('-- Step 2: Insert users with correct password hashes');
  console.log('INSERT INTO users (email, password_hash, name, role, base_id) VALUES');
  console.log(sqlValues.join(',\n') + ';');
  console.log();
  console.log('='.repeat(70));
}

generatePasswordHashes()
  .then(() => {
    console.log('✅ Hash generation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error generating hashes:', error);
    process.exit(1);
  });