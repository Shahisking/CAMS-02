// backend/scripts/verifyLogin.js
// Verifies all 7 seeded accounts can log in via the REST API.
// Requires: server must be running on PORT (default 5000).
// Run: node scripts/verifyLogin.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

const accounts = [
  { email: 'admin@ait.edu.in',     password: 'Admin@123',     role: 'Administrator' },
  { email: 'principal@ait.edu.in', password: 'Principal@123', role: 'Principal'     },
  { email: 'dean@ait.edu.in',      password: 'Dean@123',      role: 'Dean'          },
  { email: 'hod@ait.edu.in',       password: 'Hod@123',       role: 'HOD'           },
  { email: 'staff@ait.edu.in',     password: 'Staff@123',     role: 'Staff'         },
  { email: 'labtech@ait.edu.in',   password: 'LabTech@123',   role: 'LabTechnician' },
  { email: 'monitor@ait.edu.in',   password: 'Monitor@123',   role: 'Monitor'       }
];

async function verifyLogin() {
  console.log(`\n🔍 Verifying logins against ${BASE_URL}/api/auth/login\n`);
  console.log('─'.repeat(68));

  let passed = 0;
  let failed = 0;

  for (const account of accounts) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: account.password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        console.log(`  ✅ PASS  ${account.role.padEnd(15)} ${account.email}`);
        passed++;
      } else {
        console.log(`  ❌ FAIL  ${account.role.padEnd(15)} ${account.email} → ${data.message || 'No token returned'}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ❌ ERROR ${account.role.padEnd(15)} ${account.email} → ${err.message}`);
      failed++;
    }
  }

  console.log('─'.repeat(68));
  console.log(`\n  Results: ${passed} passed, ${failed} failed out of ${accounts.length} accounts.\n`);

  if (failed > 0) {
    console.error('Some accounts failed — check server logs.');
    process.exit(1);
  } else {
    console.log('🎉 All accounts verified successfully!\n');
  }
}

verifyLogin();
