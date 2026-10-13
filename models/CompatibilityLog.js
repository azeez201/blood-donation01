module.exports = (sequelize, DataTypes) => {
  const CompatibilityLog = sequelize.define('CompatibilityLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    donorId: { type: DataTypes.INTEGER, allowNull: false },
    requestId: { type: DataTypes.INTEGER, allowNull: false },
    compatibilityStatus: { type: DataTypes.ENUM('Compatible', 'Incompatible', 'Pending Review'), defaultValue: 'Pending Review' },
    matchedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'compatibility_logs', timestamps: true });
  return CompatibilityLog;
};