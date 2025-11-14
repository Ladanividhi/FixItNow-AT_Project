import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Auth.css';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      console.log('Sending registration data:', form);
      const { data } = await api.post('/auth/register', form); // role default = USER
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      nav('/'); // or go to /services
    } catch (e) {
      console.error('Registration error:', e);
      console.error('Error response:', e?.response?.data);
      setErr(e?.response?.data?.message || e?.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand-title"><span>Fix</span>ItNow</h1>
        <h2 className="auth-heading">Create Account</h2>

        <form onSubmit={onSubmit} className="auth-form">
          <label>Name</label>
          <input name="name" placeholder="Your name" value={form.name} onChange={onChange} required />
          <label>Email</label>
          <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
          <label>Password</label>
          <input type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={onChange} required />
          <label>Phone</label>
          <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} required />
          <label>Address</label>
          <input name="address" placeholder="Address" value={form.address} onChange={onChange} required />

          {err && <div className="auth-error">{err}</div>}

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </button>
        </form>

        <p className="switch">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}
