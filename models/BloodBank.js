module.exports = (sequelize, DataTypes) => {
  const BloodBank = sequelize.define('BloodBank', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    contactNumber: { type: DataTypes.STRING, allowNull: false }
  }, { tableName: 'blood_banks', timestamps: true });
  BloodBank.associate = (models) => {
    BloodBank.hasMany(models.StockUnit, { foreignKey: 'bloodBankId', as: 'stockUnits' });
  };
  return BloodBank;
};