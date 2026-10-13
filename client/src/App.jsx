import React, { useState, useEffect } from 'react';
import { Droplet, Building2, Users, AlertTriangle, Activity, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [stockUnits, setStockUnits] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stockRes = await fetch('http://localhost:5000/api/stock-units');
      if (!stockRes.ok) throw new Error('Failed to fetch stock units from server.');
      const stockData = await stockRes.json();
      setStockUnits(stockData);

      const reqRes = await fetch('http://localhost:5000/api/hospital-requests');
      if (!reqRes.ok) throw new Error('Failed to fetch hospital requests from server.');
      const reqData = await reqRes.json();
      setRequests(reqData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif', color: '#1e293b' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#dc2626', color: '#fff', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Droplet size={32} fill="#fff" />
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Blood Bank & Donor Match Tracker</h1>
        </div>
        <button 
          onClick={fetchData} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#b91c1c', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} />
            <span><strong>Connection Error:</strong> {error} (Make sure your backend server is running on port 5000!)</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontSize: '18px', color: '#64748b' }}>Loading tracker data from server...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* 1:M Relationship Section */}
            <section style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #dc2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Building2 color="#dc2626" size={24} />
                <h2 style={{ margin: 0, fontSize: '20px' }}>Stock Units (1 : M Relationship)</h2>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Blood Banks managing multiple blood inventory batches.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stockUnits.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No stock units found. Did you run `node seed.js`?</p>
                ) : (
                  stockUnits.map(unit => (
                    <div key={unit.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{unit.bloodGroup}</span>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                          Bank: <strong>{unit.bloodBank?.name || 'Unknown Bank'}</strong> ({unit.bloodBank?.location})
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                          {unit.unitsAvailable} Units
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Exp: {unit.expirationDate}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* M:N Relationship Section */}
            <section style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #9333ea' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Users color="#9333ea" size={24} />
                <h2 style={{ margin: '0', fontSize: '20px' }}>Hospital Requests (M : N Relationship)</h2>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Hospital blood requests matched with Donors via Compatibility Logs.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No hospital requests found.</p>
                ) : (
                  requests.map(req => (
                    <div key={req.id} style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #9333ea' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{req.hospitalName}</h4>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            Required: <strong>{req.unitsNeeded} units of {req.bloodGroupRequired}</strong>
                          </span>
                        </div>
                        <span style={{ 
                          backgroundColor: req.urgencyLevel === 'Critical' ? '#fee2e2' : '#fef3c7', 
                          color: req.urgencyLevel === 'Critical' ? '#991b1b' : '#92400e', 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' 
                        }}>
                          {req.urgencyLevel}
                        </span>
                      </div>

                      {/* Matched Donors (M:N) */}
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '13px' }}>
                        <span style={{ fontWeight: '600', color: '#475569' }}>Matched Donors: </span>
                        {req.donors && req.donors.length > 0 ? (
                          req.donors.map(donor => (
                            <span key={donor.id} style={{ display: 'inline-block', backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '6px', marginRight: '6px', marginTop: '4px' }}>
                              {donor.fullName} ({donor.bloodGroup})
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending compatibility match</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}