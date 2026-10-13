module.exports = (sequelize, DataTypes) => {
  const Donor = sequelize.define('Donor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    bloodGroup: { type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'), allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    lastDonationDate: { type: DataTypes.DATEONLY, allowNull: true }
  }, { tableName: 'donors', timestamps: true });
  Donor.associate = (models) => {
    Donor.belongsToMany(models.HospitalRequest, { through: models.CompatibilityLog, foreignKey: 'donorId', as: 'hospitalRequests' });
  };
  return Donor;
};