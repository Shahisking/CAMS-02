// backend/db.js
const { getDB } = require('./config/db');

module.exports = {
  query: (text, params) => getDB().query(text, params),
  getClient: () => getDB().connect()
};
