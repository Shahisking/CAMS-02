const axios = require('axios');
axios.post('http://localhost:5000/api/auth/login', { email: 'admin@ait.edu.in', password: 'Admin@123' })
  .then(res => console.log('SUCCESS:', res.data))
  .catch(err => console.error('ERROR:', err.response ? err.response.data : err.message));
