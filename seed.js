const db = require('./models');
async function seed() {
  try {
    await db.sequelize.sync({ force: true });
    const bank = await db.BloodBank.create({ name: 'Central Blood Bank', location: 'Downtown', contactNumber: '555-0192' });
    await db.StockUnit.create({ bloodGroup: 'O+', unitsAvailable: 15, expirationDate: '2026-08-15', bloodBankId: bank.id });
    const donor = await db.Donor.create({ fullName: 'John Doe', bloodGroup: 'O+', phone: '555-1234' });
    const req = await db.HospitalRequest.create({ hospitalName: 'General Hospital', bloodGroupRequired: 'O+', unitsNeeded: 3, urgencyLevel: 'Critical' });
    await db.CompatibilityLog.create({ donorId: donor.id, requestId: req.id, compatibilityStatus: 'Compatible' });
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}
seed();