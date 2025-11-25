const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Не удалось подключиться к базе данных:', err.stack);
  } else {
    console.log('Подключение к PostgreSQL установлено');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
