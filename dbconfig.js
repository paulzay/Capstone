const { Pool } = require('pg');


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'timwerk',
  password: 'groot',
  port: 5432,
});

module.exports = { pool };
