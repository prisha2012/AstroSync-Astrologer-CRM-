import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const CONSULTATION_TYPES = ['Birth Chart Reading','Compatibility','Career','Health','Finance','Relationship','Annual Forecast','General','Vastu','Numerology','Tarot'];
const MODES = ['In-Person','Video Call','Phone','Chat'];

function ConsultationModal({ consultation, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(consultation ? {
    ...consultation,
    client: consultation.client?._id || consultation.client,
    date: consultation.date ? new Date(consultation.date).toISOString().slice(0,16) : '',
    followUpDate: consultation.followUpDate ? consultation.followUpDate.split('T')[0] : '',
    remedies: consultation.remedies || []
  } : {
    client: '', date: '', type: 'General', mode: 'In-Person', status: 'Scheduled',
    duration: 60, fee: '', paymentStatus: 'Pending', notes: '', predictions: '',
    remedies: [], followUpRequired: false, followUpDate: ''
  });
  const [remedyInput, setRemedyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/clients', { params: { limit: 100 } })
      .then(res => setClients(res.data.clients))
      .catch(console.error);
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const addRemedy = e => {
    if (e.key === 'Enter' && remedyInput.trim()) {
      e.preventDefault();
      setForm(f => ({ ...f, remedies: [...f.remedies, remedyInput.trim()] }));
      setRemedyInput('');
    }
  };
  const removeRemedy = r => setForm(f => ({ ...f, remedies: f.remedies.filter(x => x !== r) }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.client) { setError('Please select a client'); return; }
    if (!form.date) { setError('Please select a date and time'); return; }
    setLoading(true);
    try {
      const payload = { ...form, fee: parseFloat(form.fee) || 0 };
      if (consultation) {
        const res = await axios.put(`/api/consultations/${consultation._id}`, payload);
        onSave(res.data);
      } else {
        const res = await axios.post('/api/consultations', payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 620 }}>
        <div className="modal-header">
          <span className="modal-title">{consultation ? 'Edit Consultation' : 'Log Consultation'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Client *</label>
                <select className="form-select" name="client" value={form.client} onChange={handleChange} required>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} {c.phone ? `— ${c.phone}` : ''}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input className="form-input" type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" name="duration" value={form.duration} onChange={handleChange} min="15" step="15" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  {CONSULTATION_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mode</label>
                <select className="form-select" name="mode" value={form.mode} onChange={handleChange}>
                  {MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  {['Scheduled','Completed','Cancelled','No-Show'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fee (₹)</label>
                <input className="form-input" type="number" name="fee" value={form.fee} onChange={handleChange} placeholder="500" min="0" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select className="form-select" name="paymentStatus" value={form.paymentStatus} onChange={handleChange}>
                {['Pending','Paid','Refunded'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Session Notes</label>
              <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="What was discussed in this session..." rows={3} />
            </div>

            <div className="form-group">
              <label className="form-label">Predictions / Insights</label>
              <textarea className="form-textarea" name="predictions" value={form.predictions} onChange={handleChange} placeholder="Astrological insights and predictions..." rows={3} />
            </div>

            <div className="form-group">
              <label className="form-label">Remedies (press Enter to add)</label>
              <input className="form-input" value={remedyInput} onChange={e => setRemedyInput(e.target.value)} onKeyDown={addRemedy} placeholder="e.g. Wear blue sapphire, Chant Shani mantra..." />
              {form.remedies.length > 0 && (
                <div className="tags-wrap">
                  {form.remedies.map(r => (
                    <span key={r} className="tag">{r} <span className="tag-remove" onClick={() => removeRemedy(r)}>✕</span></span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" name="followUpRequired" checked={form.followUpRequired} onChange={handleChange} />
                <span className="form-label" style={{ margin: 0 }}>Follow-up required</span>
              </label>
            </div>

            {form.followUpRequired && (
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input className="form-input" type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : consultation ? 'Save Changes' : 'Log Consultation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get('/api/consultations', { params });
      setConsultations(res.data.consultations);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = (saved) => {
    setConsultations(prev => {
      const exists = prev.find(c => c._id === saved._id);
      return exists ? prev.map(c => c._id === saved._id ? saved : c) : [saved, ...prev];
    });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this consultation?')) return;
    await axios.delete(`/api/consultations/${id}`);
    setConsultations(prev => prev.filter(c => c._id !== id));
    setTotal(t => t - 1);
  };

  const statusBadge = s => {
    const map = { Completed: 'badge-success', Scheduled: 'badge-info', Cancelled: 'badge-danger', 'No-Show': 'badge-warning' };
    return <span className={`badge ${map[s] || 'badge-info'}`}>{s}</span>;
  };

  const payBadge = s => {
    const map = { Paid: 'badge-success', Pending: 'badge-warning', Refunded: 'badge-danger' };
    return <span className={`badge ${map[s] || 'badge-warning'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="top-bar">
        <div className="top-bar-title">Consultations</div>
        <div className="top-bar-actions">
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{total} total</span>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowModal(true); }}>
            + Log Session
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="toolbar">
          <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option>Scheduled</option><option>Completed</option><option>Cancelled</option><option>No-Show</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" /></div>
          ) : consultations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">☽</div>
              <h3>No consultations yet</h3>
              <p>Log your first session to get started.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Client</th><th>Date & Time</th><th>Type</th><th>Mode</th><th>Duration</th><th>Fee</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {consultations.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.client?.name || 'Unknown'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.client?.phone}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        <div>{format(new Date(c.date), 'dd MMM yyyy')}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{format(new Date(c.date), 'h:mm a')}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{c.type}</td>
                      <td style={{ fontSize: 13 }}>{c.mode}</td>
                      <td style={{ fontSize: 13 }}>{c.duration} min</td>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>₹{(c.fee || 0).toLocaleString('en-IN')}</td>
                      <td>{payBadge(c.paymentStatus)}</td>
                      <td>{statusBadge(c.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => { setEditItem(c); setShowModal(true); }}>✎</button>
                          <button className="btn-icon" onClick={() => handleDelete(c._id)} style={{ color: 'var(--danger)' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ padding: '6px 12px', color: 'var(--text-secondary)', fontSize: 13 }}>Page {page} of {pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {showModal && (
        <ConsultationModal
          consultation={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
