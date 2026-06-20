const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function clearDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Connecting to Neon PostgreSQL database...');
    
    // Query actual tables that exist in the public schema
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const existingTables = new Set(tableRes.rows.map(row => row.table_name));
    console.log('📋 Existing database tables:', Array.from(existingTables));

    await client.query('BEGIN');
    
    const tablesToDrop = [
      'tracking',
      'order_items',
      'orders',
      'reviews',
      'notifications',
      'returns',
      'users',
      'products',
      'addresses'
    ];

    for (const tableName of tablesToDrop) {
      if (existingTables.has(tableName)) {
        console.log(`🗑️ Dropping ${tableName} table...`);
        await client.query(`DROP TABLE ${tableName} CASCADE`);
        console.log(`✅ Dropped ${tableName}`);
      } else {
        console.log(`⚠️  Table "${tableName}" does not exist, skipping.`);
      }
    }
    
    await client.query('COMMIT');
    console.log('✨ Database schemas dropped successfully!');
    console.log('💡 The backend will automatically recreate and seed the tables on the next startup.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Transaction rolled back due to error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

clearDatabase();
