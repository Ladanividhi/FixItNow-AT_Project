import React, { useEffect, useState } from 'react';
import { api } from '../api';
import './Dashboard.css';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [provider, setProvider] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', experience: '' });

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setProvider(u || null);
    if (u?._id) {
  loadProvider(u._id);
      loadRequests(u._id);
  loadRatings(u._id);
    }
  }, []);

  const loadRequests = async (providerId) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/requests', { params: { providerId } });
      setRequests(Array.isArray(data) ? data : data.requests || []);
    } catch (e) {
      setError('Failed to load requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const actOnRequest = async (id, action) => {
    try {
      setLoading(true);
      setError('');
      if (action === 'accept') {
        await api.patch(`/requests/${id}/accept`);
      } else if (action === 'decline') {
        await api.patch(`/requests/${id}/decline`, { reason: 'provider_declined' });
      }
      if (provider?._id) await loadRequests(provider._id);
    } catch (e) {
      setError('Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const loadProvider = async (id) => {
    try {
      const { data } = await api.get(`/provider/${id}`);
      if (data) {
        setProvider(data);
        setEditForm({ name: data.name || '', phone: data.phone || '', address: data.address || '', experience: data.experience || '' });
      }
    } catch (e) {
      // keep localStorage fallback
    }
  };

  const loadRatings = async (providerId) => {
    try {
      setRatingsLoading(true);
      const { data } = await api.get('/feedback', { params: { providerId } });
      setRatings(Array.isArray(data) ? data : (data.feedback || []));
    } catch (e) {
      setRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, <span className="brand">{provider?.name || 'Service Provider'}</span></h1>
          <button className="btn secondary logout-btn" onClick={() => {/* logout logic */}}>
            Logout
          </button>
        </div>
      </div>
      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <div className="sidebar-profile">
            <div className="profile-image small">
              <div className="profile-placeholder">{(provider?.name || 'P').charAt(0)}</div>
            </div>
            <div className="sidebar-info">
              <div className="sidebar-name">{provider?.name || 'Service Provider'}</div>
              <div className="sidebar-role">{provider?.role || 'provider'}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Service Requests</button>
            <button className={`nav-btn ${activeTab === 'ratings' ? 'active' : ''}`} onClick={() => setActiveTab('ratings')}>My Ratings</button>
          </nav>

          <div className="sidebar-logout">
            <button className="btn secondary logout-sm" onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}>Logout</button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content">
            {activeTab === 'profile' && (
              <div className="dashboard-section">
                <h2>Profile</h2>
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-image">
                      <div className="profile-placeholder">{(provider?.name || 'P').charAt(0)}</div>
                    </div>
                    <div className="profile-info">
                      <h3>{provider?.name || '—'}</h3>
                      <p className="service-type">Role: {provider?.role || 'provider'}</p>
                      <p className="service-type">Email: {provider?.email || '—'}</p>
                    </div>
                  </div>
                  <div className="profile-details">
                    <div className="detail-item"><label>Phone:</label><span>{provider?.phone || '—'}</span></div>
                    <div className="detail-item"><label>Address:</label><span>{provider?.address || '—'}</span></div>
                    <div className="detail-item"><label>Experience:</label><span>{provider?.experience || '—'}</span></div>
                    <div className="detail-item"><label>Rating:</label><span>{provider?.rating ?? '—'}</span></div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'requests' && (
              <div className="dashboard-section">
                <h2>Service Requests</h2>
                {loading ? (
                  <div className="loading-message">Loading requests…</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : requests.length === 0 ? (
                  <div className="empty-message">No requests yet.</div>
                ) : (
                  <div className="requests-list">
                    {requests.map(r => (
                      <div key={r._id} className="request-card">
                        <div className="request-header">
                          <h4>{r.service}{r.subservice ? ` - ${r.subservice}` : ''}</h4>
                          <span className={`status ${r.status?.toLowerCase()}`}>{r.status}</span>
                        </div>
                        <div className="request-body">
                          <p><strong>User:</strong> {r.userName || '—'}</p>
                          <p><strong>Scheduled For:</strong> {r.scheduledFor ? new Date(r.scheduledFor).toLocaleString() : '—'}</p>
                          <p><strong>Address:</strong> {r.address}</p>
                          <p><strong>Notes:</strong> {r.description}</p>
                          {r.status?.toLowerCase() === 'pending' && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                              <button className="btn primary" onClick={() => actOnRequest(r._id, 'accept')}>Accept</button>
                              <button className="btn secondary" onClick={() => actOnRequest(r._id, 'decline')}>Decline</button>
                            </div>
                          )}
                          {r.status?.toLowerCase() === 'cancelled' && r.cancelReason === 'provider_declined' && (
                            <div className="error-message" style={{ marginTop: '0.5rem' }}>You declined this request.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'ratings' && (
              <div className="dashboard-section">
                <h2>My Ratings</h2>
                {ratingsLoading ? (
                  <div className="loading-message">Loading ratings…</div>
                ) : ratings.length === 0 ? (
                  <div className="empty-message">No ratings yet.</div>
                ) : (
                  <div className="services-grid">
                    {ratings.map((f) => (
                      <div key={f._id} className="service-card">
                        <div className="service-header">
                          <h4>From: {f.userName || 'User'}</h4>
                          <div className="rating-stars">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
                        </div>
                        <div className="service-details">
                          {f.comment && <p><strong>Comment:</strong> {f.comment}</p>}
                          <p className="review-date">{new Date(f.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
