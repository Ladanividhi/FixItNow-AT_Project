import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import './Auth.css';

export default function ProviderLogin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/provider-login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/provider-dashboard');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand-title"><span>Fix</span>ItNow</h1>
        <h2 className="auth-heading">Welcome, Service Provider!</h2>
        <form onSubmit={onSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email" name="email" placeholder="you@example.com"
            value={form.email} onChange={onChange} required
          />
          <label>Password</label>
          <input
            type="password" name="password" placeholder="••••••••"
            value={form.password} onChange={onChange} required
          />
          {err && <div className="auth-error">{err}</div>}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ color: '#ccc', marginRight: 8 }}>New provider?</span>
          <Link className="link" to="/provider-registration">Register here</Link>
        </div>
      </div>
    </div>
  );
}
