require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const client = await pool.connect();
  try {
    const blocks = await client.query('SELECT id, name, code, description FROM blocks ORDER BY name');
    console.log('=== BLOCKS ===');
    blocks.rows.forEach(r => console.log('  ' + r.id + ' | ' + r.name + ' | ' + r.code + ' | ' + r.description));

    const aRooms = await client.query("SELECT room_number, room_name, floor, department, room_type, status FROM rooms WHERE block = 'A Block' ORDER BY floor, room_number");
    console.log('\n=== A BLOCK ROOMS (' + aRooms.rows.length + ') ===');
    aRooms.rows.forEach(r => console.log('  ' + r.room_number + ' | ' + r.room_name + ' | ' + r.floor + ' | ' + (r.department || 'null') + ' | ' + r.room_type + ' | ' + r.status));

    const nRooms = await client.query("SELECT room_number, room_name, floor, department, room_type, status FROM rooms WHERE block = 'N Block' ORDER BY floor, room_number");
    console.log('\n=== N BLOCK ROOMS (' + nRooms.rows.length + ') ===');
    nRooms.rows.forEach(r => console.log('  ' + r.room_number + ' | ' + r.room_name + ' | ' + r.floor + ' | ' + (r.department || 'null') + ' | ' + r.room_type + ' | ' + r.status));

    const sRooms = await client.query("SELECT COUNT(*) as count FROM rooms WHERE block = 'S Block'");
    console.log('\n=== S BLOCK ROOMS: ' + sRooms.rows[0].count + ' ===');

    const dupes = await client.query('SELECT room_number, block, COUNT(*) as cnt FROM rooms GROUP BY room_number, block HAVING COUNT(*) > 1');
    console.log('\n=== DUPLICATES: ' + dupes.rows.length + ' ===');
    dupes.rows.forEach(r => console.log('  ' + r.room_number + ' in ' + r.block + ': ' + r.cnt + ' copies'));

    const total = await client.query('SELECT COUNT(*) as count FROM rooms');
    console.log('\n=== TOTAL ROOMS: ' + total.rows[0].count + ' ===');

  } finally {
    client.release();
    await pool.end();
  }
}
check();
