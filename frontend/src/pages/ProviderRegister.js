import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './Auth.css';

export default function ProviderRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    experience: '',
    services: [{ category: '', subservices: [] }]
  });
  const [serviceList, setServiceList] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch services on component mount
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await api.get('/services');
        setServiceList(response.data || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    }
    fetchServices();
  }, []);

  // Handle main service selection
  const handleServiceChange = (index, value) => {
    const updated = [...form.services];
    updated[index].category = value;
    updated[index].subservices = []; // reset subservices
    setForm({ ...form, services: updated });
  };

  // Handle subservice selection
  const handleSubserviceChange = (index, value) => {
    const updated = [...form.services];
    const selectedService = serviceList.find(s => s.name === updated[index].category);
    const selectedSub = selectedService?.subservices.find(sub => sub.name === value);
    updated[index].subservices = selectedSub ? [{ name: selectedSub.name, price: selectedSub.basePrice }] : [];
    setForm({ ...form, services: updated });
  };

  // Add another service field
  const addServiceField = () => {
    setForm({ ...form, services: [...form.services, { category: '', subservices: [] }] });
  };

  // Handle input changes
  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit form
  const onSubmit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const response = await api.post('/provider/register', form);
      if (response.status === 201 && response.data?.provider) {
        alert('Provider registered successfully!');
      }
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page scrollable" style={{ maxHeight: '100vh', overflowY: 'auto', position: 'relative' }}>
      <div className="auth-card">
        <h1 className="brand-title"><span>Fix</span>ItNow</h1>
        <h2 className="auth-heading">Become a Provider</h2>

        <form onSubmit={onSubmit} className="auth-form">
          <label>Name</label>
          <input name="name" value={form.name} onChange={onChange} required />

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} required />

          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={onChange} required />

          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} />

          <label>Address</label>
          <input name="address" value={form.address} onChange={onChange} />

          <label>Experience</label>
          <input name="experience" value={form.experience} onChange={onChange} />

          <h3>Services</h3>
          {form.services.map((srv, idx) => {
            const selectedService = serviceList.find(s => s.name === srv.category);
            return (
              <div key={srv.category || idx} style={{ marginBottom: '10px' }}>
                <select
                  value={srv.category}
                  onChange={e => handleServiceChange(idx, e.target.value)}
                  required
                >
                  <option value="">Select Service</option>
                  {serviceList.map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>

                {selectedService && selectedService.subservices && (
                  <select
                    value={srv.subservices[0]?.name || ''}
                    onChange={e => handleSubserviceChange(idx, e.target.value)}
                    required
                  >
                    <option value="">Select Subservice</option>
                    {selectedService.subservices.map(sub => (
                      <option key={sub._id} value={sub.name}>{sub.name} - ₹{sub.basePrice}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}

          <button type="button" onClick={addServiceField} className="add-service-btn">
            + Add More Service
          </button>

          {err && <div className="auth-error">{err}</div>}

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Submitting…' : 'Register as Provider'}
          </button>
        </form>
      </div>

      {/* Provider Login link */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/provider-login" className="link" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
          Provider Login
        </Link>
      </div>
    </div>
  );
}
