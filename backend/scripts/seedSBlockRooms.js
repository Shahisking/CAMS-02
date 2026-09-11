require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const S_BLOCK_ROOMS = [
  // GROUND FLOOR — 10 ROOMS
  { room_number: '101', room_name: 'Library', block: 'S Block', floor: 'Ground Floor', department: 'Central Library', room_type: 'Library', capacity: 100, status: 'Active' },
  { room_number: '102', room_name: 'Library', block: 'S Block', floor: 'Ground Floor', department: 'Central Library', room_type: 'Library', capacity: 100, status: 'Active' },
  { room_number: '103', room_name: 'AI & DS Department', block: 'S Block', floor: 'Ground Floor', department: 'Artificial Intelligence & Data Science', room_type: 'Office', capacity: 40, status: 'Active' },
  { room_number: '104', room_name: 'Communication Lab', block: 'S Block', floor: 'Ground Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: '105', room_name: 'Seminar Hall', block: 'S Block', floor: 'Ground Floor', department: 'General', room_type: 'Seminar Hall', capacity: 200, status: 'Active' },
  { room_number: '106', room_name: 'NSS Program Office', block: 'S Block', floor: 'Ground Floor', department: 'Administrative Office', room_type: 'Office', capacity: 20, status: 'Active' },
  { room_number: '107', room_name: 'Printers', block: 'S Block', floor: 'Ground Floor', department: 'General', room_type: 'Store Room', capacity: 10, status: 'Active' },
  { room_number: '108', room_name: '2nd Year AI & DS', block: 'S Block', floor: 'Ground Floor', department: 'Artificial Intelligence & Data Science', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '109', room_name: 'Wipro Lab', block: 'S Block', floor: 'Ground Floor', department: 'Information Technology', room_type: 'Laboratory', capacity: 60, status: 'Active' },
  { room_number: '110', room_name: '3rd Year AI & DS', block: 'S Block', floor: 'Ground Floor', department: 'Artificial Intelligence & Data Science', room_type: 'Classroom', capacity: 60, status: 'Active' },

  // FIRST FLOOR — 16 ROOMS
  { room_number: '201', room_name: 'Computer Lab 4', block: 'S Block', floor: 'First Floor', department: 'Computer Science & Engineering', room_type: 'Laboratory', capacity: 60, status: 'Active' },
  { room_number: '202', room_name: 'Not Assigned', block: 'S Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: '203', room_name: 'Computer Lab 3', block: 'S Block', floor: 'First Floor', department: 'Computer Science & Engineering', room_type: 'Laboratory', capacity: 60, status: 'Active' },
  { room_number: '204', room_name: 'Not Assigned', block: 'S Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: '205', room_name: 'CSE Department', block: 'S Block', floor: 'First Floor', department: 'Computer Science & Engineering', room_type: 'Office', capacity: 30, status: 'Active' },
  { room_number: '206', room_name: 'Communication Lab 2', block: 'S Block', floor: 'First Floor', department: 'Electronics & Communication', room_type: 'Laboratory', capacity: 50, status: 'Active' },
  { room_number: '207', room_name: 'Not Assigned', block: 'S Block', floor: 'First Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: '208', room_name: 'Server Room', block: 'S Block', floor: 'First Floor', department: 'Information Technology', room_type: 'Server Room', capacity: 5, status: 'Active' },
  { room_number: '209', room_name: '4th Year AI & DS', block: 'S Block', floor: 'First Floor', department: 'Artificial Intelligence & Data Science', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '210', room_name: 'Boys Restroom', block: 'S Block', floor: 'First Floor', department: 'Administrative Office', room_type: 'Store Room', capacity: 0, status: 'Active' },
  { room_number: '211', room_name: 'E-Waste Room', block: 'S Block', floor: 'First Floor', department: 'Administrative Office', room_type: 'Store Room', capacity: 0, status: 'Active' },
  { room_number: '212', room_name: 'Girls Restroom', block: 'S Block', floor: 'First Floor', department: 'Administrative Office', room_type: 'Store Room', capacity: 0, status: 'Active' },
  { room_number: '213', room_name: '2nd Year CSE A', block: 'S Block', floor: 'First Floor', department: 'Computer Science & Engineering', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '214', room_name: '2nd Year CSE B', block: 'S Block', floor: 'First Floor', department: 'Computer Science & Engineering', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '215', room_name: '3rd Year CSE', block: 'S Block', floor: 'First Floor', department: 'Computer Science & Engineering', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '216', room_name: '4th Year CSE', block: 'S Block', floor: 'First Floor', department: 'Computer Science & Engineering', room_type: 'Classroom', capacity: 60, status: 'Active' },

  // SECOND FLOOR — 15 ROOMS
  { room_number: '301', room_name: 'CP7', block: 'S Block', floor: 'Second Floor', department: 'Computer Science & Engineering', room_type: 'Laboratory', capacity: 60, status: 'Active' },
  { room_number: '302', room_name: 'Computer Lab 7', block: 'S Block', floor: 'Second Floor', department: 'Computer Science & Engineering', room_type: 'Laboratory', capacity: 60, status: 'Active' },
  { room_number: '303', room_name: 'Computer Lab 6', block: 'S Block', floor: 'Second Floor', department: 'Computer Science & Engineering', room_type: 'Laboratory', capacity: 60, status: 'Active' },
  { room_number: '304', room_name: 'Not Assigned', block: 'S Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: '305', room_name: 'IT Department', block: 'S Block', floor: 'Second Floor', department: 'Information Technology', room_type: 'Office', capacity: 30, status: 'Active' },
  { room_number: '306', room_name: 'Classroom 1', block: 'S Block', floor: 'Second Floor', department: 'Information Technology', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '307', room_name: 'Classroom 2', block: 'S Block', floor: 'Second Floor', department: 'Information Technology', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '308', room_name: 'Drawing Hall', block: 'S Block', floor: 'Second Floor', department: 'Civil Engineering', room_type: 'Classroom', capacity: 80, status: 'Active' },
  { room_number: '309', room_name: 'Drawing Hall', block: 'S Block', floor: 'Second Floor', department: 'Civil Engineering', room_type: 'Classroom', capacity: 80, status: 'Active' },
  { room_number: '310', room_name: 'Boys Restroom', block: 'S Block', floor: 'Second Floor', department: 'Administrative Office', room_type: 'Store Room', capacity: 0, status: 'Active' },
  { room_number: '311', room_name: 'Girls Restroom', block: 'S Block', floor: 'Second Floor', department: 'Administrative Office', room_type: 'Store Room', capacity: 0, status: 'Active' },
  { room_number: '312', room_name: 'Not Assigned', block: 'S Block', floor: 'Second Floor', department: null, room_type: 'Classroom', capacity: 0, status: 'Vacant' },
  { room_number: '313', room_name: '2nd Year IT', block: 'S Block', floor: 'Second Floor', department: 'Information Technology', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '314', room_name: '3rd Year IT', block: 'S Block', floor: 'Second Floor', department: 'Information Technology', room_type: 'Classroom', capacity: 60, status: 'Active' },
  { room_number: '315', room_name: '4th Year IT', block: 'S Block', floor: 'Second Floor', department: 'Information Technology', room_type: 'Classroom', capacity: 60, status: 'Active' },
];

async function seed() {
  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  try {
    await client.query('BEGIN');

    for (const room of S_BLOCK_ROOMS) {
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
    console.log(`Done. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);
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
