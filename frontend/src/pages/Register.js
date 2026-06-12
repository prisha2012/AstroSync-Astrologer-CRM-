import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SPECIALIZATIONS = ['Vedic Astrology', 'Western Astrology', 'Numerology', 'Tarot', 'Vastu', 'KP Astrology', 'Nadi Astrology', 'Chinese Astrology'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', specializations: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toggleSpec = spec => setForm(f => ({
    ...f,
    specializations: f.specializations.includes(spec)
      ? f.specializations.filter(s => s !== spec)
      : [...f.specializations, spec]
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <h1>☽ AstroSync</h1>
          <p>Your celestial practice, organized</p>
        </div>

        <h2 className="auth-title">Create account</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="Ananya Sharma" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Specializations (optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec} type="button"
                  onClick={() => toggleSpec(spec)}
                  style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    border: '1px solid',
                    borderColor: form.specializations.includes(spec) ? 'var(--accent-gold)' : 'var(--border)',
                    background: form.specializations.includes(spec) ? 'rgba(201,168,76,0.15)' : 'transparent',
                    color: form.specializations.includes(spec) ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
