const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Root route so http://localhost:5000/ works!
app.get('/', (req, res) => {
  res.json({ message: "🩸 Welcome to the Blood Bank & Donor Match Tracker API!" });
});

app.get('/api/stock-units', async (req, res) => {
  try {
    const units = await db.StockUnit.findAll({ include: [{ model: db.BloodBank, as: 'bloodBank' }] });
    res.json(units);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

app.get('/api/hospital-requests', async (req, res) => {
  try {
    const reqs = await db.HospitalRequest.findAll({ include: [{ model: db.Donor, as: 'donors' }] });
    res.json(reqs);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

db.sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running successfully at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });