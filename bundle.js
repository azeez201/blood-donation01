const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Define all project files
const files = {
  'config/database.js': `const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('blood_bank_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});
module.exports = sequelize;`,

  'models/BloodBank.js': `module.exports = (sequelize, DataTypes) => {
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
};`,

  'models/StockUnit.js': `module.exports = (sequelize, DataTypes) => {
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
};`,

  'models/Donor.js': `module.exports = (sequelize, DataTypes) => {
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
};`,

  'models/HospitalRequest.js': `module.exports = (sequelize, DataTypes) => {
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
};`,

  'models/CompatibilityLog.js': `module.exports = (sequelize, DataTypes) => {
  const CompatibilityLog = sequelize.define('CompatibilityLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    donorId: { type: DataTypes.INTEGER, allowNull: false },
    requestId: { type: DataTypes.INTEGER, allowNull: false },
    compatibilityStatus: { type: DataTypes.ENUM('Compatible', 'Incompatible', 'Pending Review'), defaultValue: 'Pending Review' },
    matchedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'compatibility_logs', timestamps: true });
  return CompatibilityLog;
};`,

  'models/index.js': `const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const db = {};
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) db[modelName].associate(db);
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;`,

  'frontend/TrackerDashboard.jsx': `import React, { useState, useEffect } from 'react';
export default function TrackerDashboard() {
  const [stockUnits, setStockUnits] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const stockRes = await fetch('http://localhost:5000/api/stock-units');
        const stockData = await stockRes.json();
        setStockUnits(stockData);

        const reqRes = await fetch('http://localhost:5000/api/hospital-requests');
        const reqData = await reqRes.json();
        setRequests(reqData);
      } catch (err) {
        console.error('Error fetching tracker data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div style={{padding: '20px'}}>Loading tracker dashboard...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🩸 Blood Bank & Donor Match Tracker</h2>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
          <h3>Stock Units (1:M)</h3>
          <ul>
            {stockUnits.map(item => (
              <li key={item.id}><strong>{item.bloodGroup}</strong>: {item.unitsAvailable} units ({item.bloodBank?.name})</li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
          <h3>Hospital Requests (M:N)</h3>
          <ul>
            {requests.map(req => (
              <li key={req.id}><strong>{req.hospitalName}</strong> needs {req.unitsNeeded} units of {req.bloodGroupRequired} [{req.urgencyLevel}]</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}`,

  'server.js': `const express = require('express');
const cors = require('cors');
const db = require('./models');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/api/stock-units', async (req, res) => {
  try {
    const units = await db.StockUnit.findAll({ include: [{ model: db.BloodBank, as: 'bloodBank' }] });
    res.json(units);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/hospital-requests', async (req, res) => {
  try {
    const reqs = await db.HospitalRequest.findAll({ include: [{ model: db.Donor, as: 'donors' }] });
    res.json(reqs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

db.sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(\`🚀 Server running on http://localhost:\${PORT}\`));
});`,

  'seed.js': `const db = require('./models');
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
seed();`
};

// 2. Create directories and write files
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('📁 All project files generated successfully!');

// 3. Clean zip creation via PowerShell (zipping specific folders/files safely)
try {
  const zipName = 'blood-bank-tracker.zip';
  const zipPath = path.join(__dirname, zipName);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  // Use PowerShell to archive only config, models, frontend, server.js, and seed.js
  const command = `powershell Add-Type -AssemblyName System.IO.Compression.Filesystem; [IO.Compression.ZipFile]::CreateFromDirectory((Get-Location).Path, '${zipName}', [IO.Compression.CompressionLevel]::Optimal, $false)`;
  
  // Alternatively, let's create a clean staging directory to zip
  const staging = path.join(__dirname, 'temp_blood_bank');
  if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging);

  // Copy necessary folders/files to staging
  ['config', 'models', 'frontend'].forEach(folder => {
    if (fs.existsSync(path.join(__dirname, folder))) {
      fs.cpSync(path.join(__dirname, folder), path.join(staging, folder), { recursive: true });
    }
  });
  ['server.js', 'seed.js', 'package.json'].forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      fs.copyFileSync(path.join(__dirname, file), path.join(staging, file));
    }
  });

  // Zip the staging folder
  execSync(`powershell Compress-Archive -Path '${staging}/*' -DestinationPath '${zipName}' -Force`, { stdio: 'inherit' });
  
  // Cleanup staging folder
  fs.rmSync(staging, { recursive: true, force: true });

  console.log(`🎉 Successfully created clean archive: ${zipName}`);
} catch (err) {
  console.error('Zip creation error:', err.message);
}