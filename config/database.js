const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('blood_bank_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});
module.exports = sequelize;