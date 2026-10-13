import React, { useState, useEffect } from 'react';
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
}