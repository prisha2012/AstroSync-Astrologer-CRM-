import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const ZODIAC_MAP = {'Aries':'♈','Taurus':'♉','Gemini':'♊','Cancer':'♋','Leo':'♌','Virgo':'♍','Libra':'♎','Scorpio':'♏','Sagittarius':'♐','Capricorn':'♑','Aquarius':'♒','Pisces':'♓'};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/clients/${id}`),
      axios.get('/api/consultations', { params: { client: id, limit: 50 } })
    ]).then(([clientRes, consRes]) => {
      setClient(clientRes.data);
      setConsultations(consRes.data.consultations);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><div className="loading-spinner" /></div>;
  if (!client) return <div style={{ padding: 24 }}>Client not found.</div>;

  const zodiacSymbol = ZODIAC_MAP[client.zodiacSign] || '✦';

  const statusBadge = s => {
    const map = { Active: 'badge-success', New: 'badge-info', Inactive: 'badge-warning' };
    return <span className={`badge ${map[s] || 'badge-info'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/clients')}>←</button>
          <div className="top-bar-title">Client Profile</div>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>

          {/* Profile Card */}
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
                  background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-gold))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32
                }}>{zodiacSymbol}</div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{client.name}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {client.zodiacSign ? `${zodiacSymbol} ${client.zodiacSign}` : 'Unknown Sign'}
                </div>
                <div style={{ marginTop: 8 }}>{statusBadge(client.status)}</div>
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Phone', value: client.phone, icon: '☎' },
                  { label: 'Email', value: client.email, icon: '✉' },
                  { label: 'Date of Birth', value: client.dateOfBirth ? format(new Date(client.dateOfBirth), 'dd MMM yyyy') : null, icon: '☽' },
                  { label: 'Time of Birth', value: client.timeOfBirth, icon: '⧗' },
                  { label: 'Place of Birth', value: client.placeOfBirth, icon: '⊕' },
                  { label: 'Gender', value: client.gender, icon: '⚬' },
                  { label: 'Source', value: client.source, icon: '✦' },
                ].filter(i => i.value).map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                    <span style={{ color: 'var(--accent-gold)', width: 16 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                      <div>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {(client.moonSign || client.risingSign) && (
                <>
                  <div className="divider" />
                  <div style={{ fontSize: 13 }}>
                    {client.moonSign && <div style={{ marginBottom: 4 }}>☽ Moon: <strong>{client.moonSign}</strong></div>}
                    {client.risingSign && <div>↑ Rising: <strong>{client.risingSign}</strong></div>}
                  </div>
                </>
              )}

              {client.tags?.length > 0 && (
                <>
                  <div className="divider" />
                  <div className="tags-wrap">
                    {client.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </>
              )}
            </div>

            {client.notes && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}>Notes</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{client.notes}</p>
              </div>
            )}
          </div>

          {/* Consultations */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
              <div className="stat-card gold">
                <div className="stat-label">Total Sessions</div>
                <div className="stat-value" style={{ fontSize: 28 }}>{client.totalConsultations}</div>
              </div>
              <div className="stat-card violet">
                <div className="stat-label">Last Session</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>
                  {client.lastConsultationDate ? format(new Date(client.lastConsultationDate), 'MMM d, yyyy') : '—'}
                </div>
              </div>
              <div className="stat-card success">
                <div className="stat-label">Revenue</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
                  ₹{consultations.filter(c => c.paymentStatus === 'Paid').reduce((s, c) => s + (c.fee || 0), 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="card-title">Consultation History</div>
              </div>
              {consultations.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">☽</div><p>No sessions yet.</p></div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Mode</th><th>Duration</th><th>Fee</th><th>Payment</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {consultations.map(c => (
                        <tr key={c._id}>
                          <td style={{ fontSize: 13 }}>{format(new Date(c.date), 'dd MMM yyyy, h:mm a')}</td>
                          <td style={{ fontSize: 13 }}>{c.type}</td>
                          <td style={{ fontSize: 13 }}>{c.mode}</td>
                          <td style={{ fontSize: 13 }}>{c.duration} min</td>
                          <td style={{ fontSize: 13 }}>₹{c.fee?.toLocaleString('en-IN') || 0}</td>
                          <td><span className={`badge ${c.paymentStatus === 'Paid' ? 'badge-success' : c.paymentStatus === 'Refunded' ? 'badge-danger' : 'badge-warning'}`}>{c.paymentStatus}</span></td>
                          <td><span className={`badge ${c.status === 'Completed' ? 'badge-success' : c.status === 'Scheduled' ? 'badge-info' : c.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>{c.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
