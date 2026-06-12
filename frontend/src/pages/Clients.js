import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const ZODIAC_MAP = {'Aries':'♈','Taurus':'♉','Gemini':'♊','Cancer':'♋','Leo':'♌','Virgo':'♍','Libra':'♎','Scorpio':'♏','Sagittarius':'♐','Capricorn':'♑','Aquarius':'♒','Pisces':'♓'};

const emptyForm = {
  name: '', email: '', phone: '', dateOfBirth: '', timeOfBirth: '',
  placeOfBirth: '', gender: '', zodiacSign: '', risingSign: '', moonSign: '',
  address: '', notes: '', status: 'New', source: 'Other', tags: []
};

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState(client ? {
    ...client,
    dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split('T')[0] : '',
    tags: client.tags || []
  } : emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addTag = e => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };
  const removeTag = tag => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    try {
      if (client) {
        const res = await axios.put(`/api/clients/${client._id}`, form);
        onSave(res.data);
      } else {
        const res = await axios.post('/api/clients', form);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{client ? 'Edit Client' : 'Add New Client'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Mehta" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="arjun@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Time of Birth</label>
                <input className="form-input" type="time" name="timeOfBirth" value={form.timeOfBirth} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Place of Birth</label>
              <input className="form-input" name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} placeholder="Mumbai, Maharashtra, India" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sun Sign</label>
                <select className="form-select" name="zodiacSign" value={form.zodiacSign} onChange={handleChange}>
                  <option value="">Select</option>
                  {ZODIAC_SIGNS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Moon Sign</label>
                <select className="form-select" name="moonSign" value={form.moonSign} onChange={handleChange}>
                  <option value="">Select</option>
                  {ZODIAC_SIGNS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rising Sign</label>
                <select className="form-select" name="risingSign" value={form.risingSign} onChange={handleChange}>
                  <option value="">Select</option>
                  {ZODIAC_SIGNS.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-select" name="source" value={form.source} onChange={handleChange}>
                  {['Referral','Website','Social Media','Walk-in','Other'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                  {['New','Active','Inactive'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (press Enter to add)</label>
              <input
                className="form-input" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="e.g. VIP, Marriage, Career..."
              />
              {form.tags.length > 0 && (
                <div className="tags-wrap">
                  {form.tags.map(t => (
                    <span key={t} className="tag">{t} <span className="tag-remove" onClick={() => removeTag(t)}>✕</span></span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Personal notes about this client..." />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : client ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get('/api/clients', { params });
      setClients(res.data.clients);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleSave = (saved) => {
    setClients(prev => {
      const exists = prev.find(c => c._id === saved._id);
      return exists ? prev.map(c => c._id === saved._id ? saved : c) : [saved, ...prev];
    });
    setTotal(t => editClient ? t : t + 1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/clients/${id}`);
      setClients(prev => prev.filter(c => c._id !== id));
      setTotal(t => t - 1);
    } catch (err) {
      alert('Failed to delete client');
    }
  };

  const statusBadge = s => {
    const map = { Active: 'badge-success', New: 'badge-info', Inactive: 'badge-warning' };
    return <span className={`badge ${map[s] || 'badge-info'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="top-bar">
        <div className="top-bar-title">Clients</div>
        <div className="top-bar-actions">
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{total} total</span>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditClient(null); setShowModal(true); }}>
            + Add Client
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="form-input" placeholder="Search by name, email, phone..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option>New</option><option>Active</option><option>Inactive</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" /></div>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">♃</div>
              <h3>No clients yet</h3>
              <p>Add your first client to get started.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Contact</th>
                    <th>Birth Details</th>
                    <th>Signs</th>
                    <th>Sessions</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="zodiac-avatar">{ZODIAC_MAP[c.zodiacSign] || c.name[0].toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.source}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{c.phone || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email || '—'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString('en-IN') : '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.placeOfBirth || '—'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>
                          {c.zodiacSign ? `${ZODIAC_MAP[c.zodiacSign]} ${c.zodiacSign}` : '—'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {c.moonSign ? `☽ ${c.moonSign}` : ''}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{c.totalConsultations}</td>
                      <td>{statusBadge(c.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" title="View" onClick={() => navigate(`/clients/${c._id}`)}>⊙</button>
                          <button className="btn-icon" title="Edit" onClick={() => { setEditClient(c); setShowModal(true); }}>✎</button>
                          <button className="btn-icon" title="Delete" onClick={() => handleDelete(c._id)} style={{ color: 'var(--danger)' }}>✕</button>
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
        <ClientModal
          client={editClient}
          onClose={() => { setShowModal(false); setEditClient(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
