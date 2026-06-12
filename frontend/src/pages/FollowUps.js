import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, isPast } from 'date-fns';

function FollowUpModal({ followUp, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(followUp ? {
    ...followUp,
    client: followUp.client?._id || followUp.client,
    dueDate: followUp.dueDate ? followUp.dueDate.split('T')[0] : ''
  } : {
    client: '', dueDate: '', type: 'Call', priority: 'Medium', notes: '', status: 'Pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/clients', { params: { limit: 100 } })
      .then(res => setClients(res.data.clients)).catch(console.error);
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.client || !form.dueDate) { setError('Client and due date are required'); return; }
    setLoading(true);
    try {
      if (followUp) {
        const res = await axios.put(`/api/followups/${followUp._id}`, form);
        onSave(res.data);
      } else {
        const res = await axios.post('/api/followups', form);
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
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{followUp ? 'Edit Follow-up' : 'Add Follow-up'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Client *</label>
              <select className="form-select" name="client" value={form.client} onChange={handleChange} required>
                <option value="">Select client...</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input className="form-input" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                  {['Call','Message','Email','Meeting'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                  {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  {['Pending','Completed','Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="What to discuss or check on..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : followUp ? 'Save Changes' : 'Add Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await axios.get('/api/followups', { params });
      setFollowUps(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = (saved) => {
    setFollowUps(prev => {
      const exists = prev.find(f => f._id === saved._id);
      return exists ? prev.map(f => f._id === saved._id ? saved : f) : [saved, ...prev];
    });
  };

  const markComplete = async id => {
    const res = await axios.put(`/api/followups/${id}`, { status: 'Completed' });
    setFollowUps(prev => prev.map(f => f._id === id ? res.data : f));
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this follow-up?')) return;
    await axios.delete(`/api/followups/${id}`);
    setFollowUps(prev => prev.filter(f => f._id !== id));
  };

  const priorityBadge = p => {
    const map = { High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-info' };
    return <span className={`badge ${map[p] || 'badge-info'}`}>{p}</span>;
  };

  const statusBadge = s => {
    const map = { Completed: 'badge-success', Pending: 'badge-info', Overdue: 'badge-danger', Cancelled: 'badge-warning' };
    return <span className={`badge ${map[s] || 'badge-info'}`}>{s}</span>;
  };

  const pending = followUps.filter(f => f.status === 'Pending').length;
  const overdue = followUps.filter(f => f.status === 'Overdue').length;
  const completed = followUps.filter(f => f.status === 'Completed').length;

  return (
    <div>
      <div className="top-bar">
        <div className="top-bar-title">Follow-ups</div>
        <div className="top-bar-actions">
          <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowModal(true); }}>
            + Add Follow-up
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          <div className="stat-card violet">
            <div className="stat-label">Pending</div>
            <div className="stat-value" style={{ fontSize: 28 }}>{pending}</div>
          </div>
          <div className="stat-card rose">
            <div className="stat-label">Overdue</div>
            <div className="stat-value" style={{ fontSize: 28, color: 'var(--danger)' }}>{overdue}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ fontSize: 28 }}>{completed}</div>
          </div>
        </div>

        <div className="toolbar">
          <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option>Pending</option><option>Overdue</option><option>Completed</option><option>Cancelled</option>
          </select>
          <select className="form-select" style={{ width: 150 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" /></div>
          ) : followUps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              <h3>No follow-ups</h3>
              <p>All caught up! Add a follow-up to track your client outreach.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Client</th><th>Due Date</th><th>Type</th><th>Priority</th><th>Notes</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {followUps.map(f => (
                    <tr key={f._id} style={{ opacity: f.status === 'Completed' ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 500 }}>{f.client?.name || 'Unknown'}</td>
                      <td>
                        <div style={{ fontSize: 13, color: f.status === 'Overdue' ? 'var(--danger)' : 'inherit' }}>
                          {format(new Date(f.dueDate), 'dd MMM yyyy')}
                          {f.status === 'Overdue' && <span style={{ marginLeft: 4 }}>⚠</span>}
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{f.type}</td>
                      <td>{priorityBadge(f.priority)}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.notes || '—'}
                      </td>
                      <td>{statusBadge(f.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {f.status !== 'Completed' && (
                            <button className="btn-icon" title="Mark complete" style={{ color: 'var(--success)' }} onClick={() => markComplete(f._id)}>✓</button>
                          )}
                          <button className="btn-icon" title="Edit" onClick={() => { setEditItem(f); setShowModal(true); }}>✎</button>
                          <button className="btn-icon" title="Delete" onClick={() => handleDelete(f._id)} style={{ color: 'var(--danger)' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <FollowUpModal
          followUp={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
