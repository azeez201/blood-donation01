const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('blood_bank_db', 'root', '', {
  host: '127.0.0.1', // 👈 Changed from 'localhost' to force IPv4
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;