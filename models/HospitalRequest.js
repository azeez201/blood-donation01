module.exports = (sequelize, DataTypes) => {
  const HospitalRequest = sequelize.define('HospitalRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hospitalName: { type: DataTypes.STRING, allowNull: false },
    bloodGroupRequired: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'), allowNull: false },
    unitsNeeded: { type: DataTypes.INTEGER, allowNull: false },
    urgencyLevel: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Medium' },
    status: { type: DataTypes.ENUM('Pending', 'Matched', 'Fulfilled'), defaultValue: 'Pending' }
  }, { tableName: 'hospital_requests', timestamps: true });
  HospitalRequest.associate = (models) => {
    HospitalRequest.belongsToMany(models.Donor, { through: models.CompatibilityLog, foreignKey: 'requestId', as: 'donors' });
  };
  return HospitalRequest;
};