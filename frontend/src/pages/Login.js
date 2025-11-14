import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Auth.css';

export default function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [err, setErr] = useState('');
	const [loading, setLoading] = useState(false);

	const onSubmit = async e => {
		e.preventDefault();
		setErr('');
		setLoading(true);
		try {
			const response = await api.post('/auth/login', { email, password });
			if (response.data?.token) {
				localStorage.setItem('token', response.data.token);
				localStorage.setItem('user', JSON.stringify(response.data.user));
				navigate('/user-dashboard');
			}
		} catch (error) {
			setErr(error?.response?.data?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h1 className="brand-title"><span>Fix</span>ItNow</h1>
				<h2 className="auth-heading">User Login</h2>

				<form onSubmit={onSubmit} className="auth-form">
					<label>Email</label>
					<input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

					<label>Password</label>
					<input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

					{err && <div className="auth-error">{err}</div>}

					<button type="submit" className="btn primary" disabled={loading}>
						{loading ? 'Logging in…' : 'Login'}
					</button>
				</form>

				<div style={{ marginTop: '12px' }}>
					<span>New here? </span>
					<Link to="/register" className="link">Create an account</Link>
				</div>
			</div>
		</div>
	);
}


