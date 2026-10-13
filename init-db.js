const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    // Connect to MySQL server without selecting a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Change this if your MySQL root user has a password
    });

    // Create the database if it doesn't already exist
    await connection.query('CREATE DATABASE IF NOT EXISTS blood_bank_db;');
    console.log('✅ Database "blood_bank_db" created successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  }
}

createDatabase();