module.exports = (sequelize, DataTypes) => {
  const StockUnit = sequelize.define('StockUnit', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bloodGroup: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'), allowNull: false },
    unitsAvailable: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    expirationDate: { type: DataTypes.DATEONLY, allowNull: false },
    bloodBankId: { type: DataTypes.INTEGER, allowNull: false }
  }, { tableName: 'stock_units', timestamps: true });
  StockUnit.associate = (models) => {
    StockUnit.belongsTo(models.BloodBank, { foreignKey: 'bloodBankId', as: 'bloodBank' });
  };
  return StockUnit;
};