require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ============================================================
// A BLOCK ROOMS
// ============================================================
const A_BLOCK_ROOMS = [
  // GROUND FLOOR — 5 ROOMS (A103–A108 supplied)
  { room_number: 'A103', room_name: 'Not Assigned',      block: 'A Block', floor: 'Ground Floor', department: null,             room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'A104', room_name: 'Not Assigned',      block: 'A Block', floor: 'Ground Floor', department: null,             room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'A106', room_name: 'Faculty Room',      block: 'A Block', floor: 'Ground Floor', department: null,             room_type: 'Staff Room', capacity: 20, status: 'Active' },
  { room_number: 'A107', room_name: 'Not Assigned',      block: 'A Block', floor: 'Ground Floor', department: null,             room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'A108', room_name: 'Political Science', block: 'A Block', floor: 'Ground Floor', department: null,             room_type: 'Classroom',  capacity: 60, status: 'Active' },

  // FIRST FLOOR — 9 ROOMS (A201–A210 supplied)
  { room_number: 'A201', room_name: 'Not Assigned', block: 'A Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0,  status: 'Vacant' },
  { room_number: 'A202', room_name: 'Not Assigned', block: 'A Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0,  status: 'Vacant' },
  { room_number: 'A203', room_name: 'Not Assigned', block: 'A Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0,  status: 'Vacant' },
  { room_number: 'A204', room_name: 'Not Assigned', block: 'A Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0,  status: 'Vacant' },
  { room_number: 'A205', room_name: 'Not Assigned', block: 'A Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0,  status: 'Vacant' },
  { room_number: 'A207', room_name: 'Not Assigned', block: 'A Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0,  status: 'Vacant' },
  { room_number: 'A208', room_name: 'Not Assigned', block: 'A Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0,  status: 'Vacant' },
  { room_number: 'A209', room_name: 'Boys Restroom', block: 'A Block', floor: 'First Floor', department: 'Administrative Office', room_type: 'Store Room', capacity: 0, status: 'Active' },
  { room_number: 'A210', room_name: 'Girls Restroom', block: 'A Block', floor: 'First Floor', department: 'Administrative Office', room_type: 'Store Room', capacity: 0, status: 'Active' },

  // SECOND FLOOR — 6 ROOMS (A301–A308 supplied)
  { room_number: 'A301', room_name: 'Not Assigned', block: 'A Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: 'A302', room_name: 'Not Assigned', block: 'A Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: 'A303', room_name: 'Not Assigned', block: 'A Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: 'A305', room_name: 'Not Assigned', block: 'A Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: 'A307', room_name: 'Not Assigned', block: 'A Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: 'A308', room_name: 'Not Assigned', block: 'A Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
];

// ============================================================
// N BLOCK ROOMS
// ============================================================
const N_BLOCK_ROOMS = [
  // GROUND FLOOR — 9 ROOMS (N101–N109)
  { room_number: 'N101', room_name: 'HOD EEE',              block: 'N Block', floor: 'Ground Floor', department: 'Electrical & Electronics',  room_type: 'Office',     capacity: 10, status: 'Active' },
  { room_number: 'N102', room_name: 'Not Assigned',          block: 'N Block', floor: 'Ground Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N103', room_name: 'Not Assigned',          block: 'N Block', floor: 'Ground Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N104', room_name: 'Not Assigned',          block: 'N Block', floor: 'Ground Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N105', room_name: 'Chemistry Lab',         block: 'N Block', floor: 'Ground Floor', department: null,                        room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N106', room_name: 'Physics Lab',           block: 'N Block', floor: 'Ground Floor', department: null,                        room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N107', room_name: 'HOD Mechanical',        block: 'N Block', floor: 'Ground Floor', department: 'Mechanical Engineering',    room_type: 'Office',     capacity: 10, status: 'Active' },
  { room_number: 'N108', room_name: 'Electrical M/C Lab',    block: 'N Block', floor: 'Ground Floor', department: 'Electrical & Electronics',  room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N109', room_name: 'Enga Practice Lab',     block: 'N Block', floor: 'Ground Floor', department: null,                        room_type: 'Laboratory', capacity: 50, status: 'Active' },

  // FIRST FLOOR — 16 ROOMS (N201–N216)
  { room_number: 'N201', room_name: 'Computing Lab',               block: 'N Block', floor: 'First Floor', department: null,                        room_type: 'Laboratory', capacity: 60, status: 'Active' },
  { room_number: 'N202', room_name: 'Embedded System Design Lab',  block: 'N Block', floor: 'First Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N203', room_name: 'Not Assigned',                block: 'N Block', floor: 'First Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N204', room_name: 'Not Assigned',                block: 'N Block', floor: 'First Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N205', room_name: 'Chemistry Lab',               block: 'N Block', floor: 'First Floor', department: null,                        room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N206', room_name: 'Physics Lab',                 block: 'N Block', floor: 'First Floor', department: null,                        room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N207', room_name: 'HOD Mechanical',              block: 'N Block', floor: 'First Floor', department: 'Mechanical Engineering',    room_type: 'Office',     capacity: 10, status: 'Active' },
  { room_number: 'N208', room_name: 'Electrical M/C Lab',          block: 'N Block', floor: 'First Floor', department: 'Electrical & Electronics',  room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N209', room_name: 'Micro Lab',                   block: 'N Block', floor: 'First Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N210', room_name: 'Digital / LIC Lab',           block: 'N Block', floor: 'First Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N211', room_name: 'DSP / VLSI Lab',              block: 'N Block', floor: 'First Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N212', room_name: 'Principal Room',              block: 'N Block', floor: 'First Floor', department: 'Administrative Office',     room_type: 'Office',     capacity: 10, status: 'Active' },
  { room_number: 'N213', room_name: 'IOAC',                        block: 'N Block', floor: 'First Floor', department: null,                        room_type: 'Office',     capacity: 10, status: 'Active' },
  { room_number: 'N214', room_name: 'CAD Lab',                     block: 'N Block', floor: 'First Floor', department: 'Mechanical Engineering',    room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N215', room_name: 'EC / SIM Lab',                block: 'N Block', floor: 'First Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N216', room_name: 'Embedded Lab',                block: 'N Block', floor: 'First Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },

  // SECOND FLOOR — 12 ROOMS (N301–N316 supplied)
  { room_number: 'N301', room_name: 'Not Assigned',                    block: 'N Block', floor: 'Second Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N302', room_name: 'Not Assigned',                    block: 'N Block', floor: 'Second Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N303', room_name: 'Not Assigned',                    block: 'N Block', floor: 'Second Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
  { room_number: 'N308', room_name: 'VLSI Design Lab',                 block: 'N Block', floor: 'Second Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N309', room_name: 'Research and Development Cell',   block: 'N Block', floor: 'Second Floor', department: null,                        room_type: 'Office',     capacity: 20, status: 'Active' },
  { room_number: 'N310', room_name: 'Power Electronics Lab',           block: 'N Block', floor: 'Second Floor', department: 'Electrical & Electronics',  room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N311', room_name: 'Measurement and Instruments Lab', block: 'N Block', floor: 'Second Floor', department: 'Electrical & Electronics',  room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N312', room_name: 'HOD ECE',                        block: 'N Block', floor: 'Second Floor', department: 'Electronics & Communication', room_type: 'Office',     capacity: 10, status: 'Active' },
  { room_number: 'N313', room_name: 'Seminar Hall',                   block: 'N Block', floor: 'Second Floor', department: null,                        room_type: 'Seminar Hall', capacity: 200, status: 'Active' },
  { room_number: 'N314', room_name: 'Seminar Hall',                   block: 'N Block', floor: 'Second Floor', department: null,                        room_type: 'Seminar Hall', capacity: 200, status: 'Active' },
  { room_number: 'N315', room_name: 'M.E. Applied Electronics Lab',   block: 'N Block', floor: 'Second Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: 'N316', room_name: 'Not Assigned',                   block: 'N Block', floor: 'Second Floor', department: null,                        room_type: 'Classroom',  capacity: 0,  status: 'Vacant' },
];

async function seed() {
  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;
  let blockInserted = 0;
  let blockUpdated = 0;

  try {
    await client.query('BEGIN');

    // ── Ensure A Block exists in blocks table ──
    const aBlockResult = await client.query(
      `INSERT INTO blocks (id, name, code, description, last_updated)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         last_updated = NOW()
       RETURNING (xmax = 0) AS inserted`,
      ['BLK-A', 'A Block', 'A-BLK', 'Academic Block — Classrooms, Faculty Rooms & Departments']
    );
    if (aBlockResult.rows[0].inserted) blockInserted++; else blockUpdated++;

    // ── Ensure N Block exists in blocks table ──
    const nBlockResult = await client.query(
      `INSERT INTO blocks (id, name, code, description, last_updated)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (name) DO UPDATE SET
         description = EXCLUDED.description,
         last_updated = NOW()
       RETURNING (xmax = 0) AS inserted`,
      ['BLK-N', 'N Block', 'N-BLK', 'Engineering Block — Laboratories, HOD Offices & Research Cells']
    );
    if (nBlockResult.rows[0].inserted) blockInserted++; else blockUpdated++;

    // ── Seed A Block Rooms ──
    for (const room of A_BLOCK_ROOMS) {
      const result = await client.query(
        `INSERT INTO rooms (room_number, room_name, block, floor, department, room_type, capacity, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (room_number, block) DO UPDATE SET
           room_name = EXCLUDED.room_name,
           floor = EXCLUDED.floor,
           department = EXCLUDED.department,
           room_type = EXCLUDED.room_type,
           capacity = EXCLUDED.capacity,
           status = EXCLUDED.status,
           updated_at = NOW()
         RETURNING (xmax = 0) AS inserted`,
        [room.room_number, room.room_name, room.block, room.floor, room.department, room.room_type, room.capacity, room.status]
      );
      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    // ── Seed N Block Rooms ──
    for (const room of N_BLOCK_ROOMS) {
      const result = await client.query(
        `INSERT INTO rooms (room_number, room_name, block, floor, department, room_type, capacity, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (room_number, block) DO UPDATE SET
           room_name = EXCLUDED.room_name,
           floor = EXCLUDED.floor,
           department = EXCLUDED.department,
           room_type = EXCLUDED.room_type,
           capacity = EXCLUDED.capacity,
           status = EXCLUDED.status,
           updated_at = NOW()
         RETURNING (xmax = 0) AS inserted`,
        [room.room_number, room.room_name, room.block, room.floor, room.department, room.room_type, room.capacity, room.status]
      );
      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    await client.query('COMMIT');

    console.log('\n=== SEED REPORT ===');
    console.log(`Blocks:  Inserted: ${blockInserted}, Updated: ${blockUpdated}`);
    console.log(`A Block: ${A_BLOCK_ROOMS.length} rooms processed`);
    console.log(`N Block: ${N_BLOCK_ROOMS.length} rooms processed`);
    console.log(`Rooms:   Inserted: ${inserted}, Updated: ${updated}`);
    console.log(`Total:   ${inserted + updated} room records`);
    console.log('===================\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
