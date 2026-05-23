// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host:     'localhost',
  port:     3306,
  database: 'BeautyShop',
  user:     'root',
  password: 'root18',
});

const db = pool.promise();

db.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    conn.release();
  })
  .catch(err => console.error('❌ Error de conexión:', err.message));

module.exports = db;
