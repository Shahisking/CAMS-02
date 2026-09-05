// backend/scripts/verifyEndpoints.js
const http = require('http');

const endpoints = [
  '/api/health',
  '/api/assets',
  '/api/allocations',
  '/api/history',
  '/api/notifications',
  '/api/users',
  '/api/blocks',
  '/api/vendors'
];

function checkEndpoint(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ [${res.statusCode}] ${path} - valid JSON`);
          resolve(true);
        } catch (e) {
          console.log(`❌ [${res.statusCode}] ${path} - invalid JSON: ${data.substring(0, 100)}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`❌ ${path} - Connection error: ${err.message}`);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Verifying backend endpoints...');
  for (const ep of endpoints) {
    await checkEndpoint(ep);
  }
}

run();
