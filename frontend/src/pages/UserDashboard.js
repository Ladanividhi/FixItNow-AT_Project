import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);

  // Book Service State
  const [services, setServices] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    service: '',
    subservice: '',
    providerId: '',
    address: '',
    description: '',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [providerMessage, setProviderMessage] = useState('');
  // Ongoing services state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [ongoingSubtab, setOngoingSubtab] = useState('pending'); // 'pending' or 'accepted'
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState('');
  // Ratings given by this user
  const [myRatings, setMyRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState('');
  // Complete & rate state
  const [completeForId, setCompleteForId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Fetch on component mount
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(u || null);
    fetchServices();
    fetchRequests();
    fetchMyRatings();
    fetchNotifications();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Fetch notifications for current user
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      setNotifError('');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?._id) { setNotifications([]); return; }
      const res = await api.get('/requests/notifications', { params: { userId: user._id } });
      setNotifications(res.data?.notifications || []);
    } catch (e) {
      console.error('Error fetching notifications:', e);
      setNotifError('Could not load notifications.');
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch service providers when service/subservice changes
  const fetchServiceProviders = async (service, subservice = '') => {
    try {
      setLoading(true);
      setProviderMessage('');
      
      console.log('Fetching providers for service:', service, 'subservice:', subservice);
      
      const params = { service };
      if (subservice) params.subservice = subservice;
      
      console.log('API call params:', params);
      const response = await api.get('/services/providers', { params });
      console.log('API response:', response.data);
      
      if (response.data.providers && response.data.providers.length > 0) {
        setAvailableProviders(response.data.providers);
        setProviderMessage('');
      } else {
        setAvailableProviders([]);
        setProviderMessage(response.data.message || 'No service providers are currently available for this service');
      }
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setAvailableProviders([]);
      setProviderMessage(`Error loading service providers: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests (ongoing services) from API
  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError('');
      const user = JSON.parse(localStorage.getItem('user'));
      const params = {};
      if (user?._id) params.userId = user._id;
      const res = await api.get('/requests', { params });
      // Expecting res.data to be an array of request objects with status
      setRequests(Array.isArray(res.data) ? res.data : res.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequestsError('Could not load ongoing services.');
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch ratings this user has provided
  const fetchMyRatings = async () => {
    try {
      setRatingsLoading(true);
      setRatingsError('');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?._id) { setMyRatings([]); return; }
      const res = await api.get('/feedback', { params: { userId: user._id } });
  const data = res.data;
  const list = Array.isArray(data) ? data : (data.feedback || []);
  setMyRatings(list);
    } catch (e) {
      console.error('Error fetching ratings:', e);
      setRatingsError('Could not load your ratings.');
      setMyRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  // Handle form input changes
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Fetch providers when service changes
    if (name === 'service' && value) {
      setBookingForm(prev => ({ ...prev, subservice: '', providerId: '' }));
      setAvailableProviders([]);
      fetchServiceProviders(value);
    }

    // Fetch providers when subservice changes
    if (name === 'subservice' && value && bookingForm.service) {
      setBookingForm(prev => ({ ...prev, providerId: '' }));
      fetchServiceProviders(bookingForm.service, value);
    }
  };

  // Submit booking form
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBookingMessage('');

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setBookingMessage('Please log in to book a service');
        return;
      }

      const scheduledFor = new Date(`${bookingForm.scheduledDate}T${bookingForm.scheduledTime}`);
      
      const bookingData = {
        userId: user._id,
        providerId: bookingForm.providerId,
        service: bookingForm.service,
        subservice: bookingForm.subservice,
        address: bookingForm.address,
        description: bookingForm.description,
        scheduledFor: scheduledFor.toISOString()
      };

  await api.post('/services/book', bookingData);
      
      setBookingMessage('Service booked successfully! You will be contacted by the service provider soon.');
      
      // Reset form
      setBookingForm({
        service: '',
        subservice: '',
        providerId: '',
        address: '',
        description: '',
        scheduledDate: '',
        scheduledTime: ''
      });
      setAvailableProviders([]);
      setProviderMessage('');
      
    } catch (error) {
      console.error('Error booking service:', error);
      setBookingMessage(error.response?.data?.message || 'Failed to book service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'star filled' : 'star'}>
        ★
      </span>
    ));
  };

  const [editingUser, setEditingUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ name: '', phone: '', address: '' });

  const startEditUser = () => {
    setEditUserForm({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || ''
    });
    setEditingUser(true);
  };
  const cancelEditUser = () => setEditingUser(false);
  const saveEditUser = async () => {
    try {
      const id = currentUser?._id;
      if (!id) return;
      const { data } = await api.patch(`/auth/user/${id}`, editUserForm);
      const updated = { ...(currentUser || {}), ...data };
      setCurrentUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditingUser(false);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update profile');
    }
  };

  const renderProfile = () => (
    <div className="dashboard-section">
      <h2>Profile Information</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image">
            <div className="profile-placeholder">
              {(currentUser?.name || 'U').charAt(0)}
            </div>
          </div>
          <div className="profile-info">
            <h3>{currentUser?.name || 'User'}</h3>
            <p className="service-type">Role: {currentUser?.role || 'user'}</p>
          </div>
        </div>
        {!editingUser ? (
          <>
            <div className="profile-details">
              <div className="detail-item"><label>Email:</label><span>{currentUser?.email || '\u2014'}</span></div>
              <div className="detail-item"><label>Phone:</label><span>{currentUser?.phone || '\u2014'}</span></div>
              <div className="detail-item"><label>Address:</label><span>{currentUser?.address || '\u2014'}</span></div>
              <div className="detail-item"><label>Member Since:</label><span>{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '\u2014'}</span></div>
            </div>
            <button className="btn secondary" onClick={startEditUser}>Edit Profile</button>
          </>
        ) : (
          <div className="profile-details">
            <div className="detail-item" style={{ display: 'block' }}>
              <label>Name</label>
              <input value={editUserForm.name} onChange={e => setEditUserForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="detail-item" style={{ display: 'block' }}>
              <label>Phone</label>
              <input value={editUserForm.phone} onChange={e => setEditUserForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="detail-item" style={{ display: 'block' }}>
              <label>Address</label>
              <input value={editUserForm.address} onChange={e => setEditUserForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={cancelEditUser}>Cancel</button>
              <button className="btn primary" onClick={saveEditUser}>Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPastServices = () => {
    const completed = requests.filter(r => (r.status || '').toLowerCase() === 'completed');
    return (
      <div className="dashboard-section">
        <h2>Service History</h2>
        {requestsLoading ? (
          <div className="loading-message">Loading service history…</div>
        ) : completed.length === 0 ? (
          <div className="empty-message">No completed services yet.</div>
        ) : (
          <div className="services-grid">
            {completed.map((service) => (
              <div key={service._id} className="service-card">
                <div className="service-header">
                  <h4>{service.service}{service.subservice ? ` - ${service.subservice}` : ''}</h4>
                  <span className={`status ${service.status?.toLowerCase()}`}>
                    {service.status}
                  </span>
                </div>
                <div className="service-details">
                  <p><strong>Provider:</strong> {service.providerName || '—'}</p>
                  <p><strong>Date:</strong> {service.scheduledFor ? new Date(service.scheduledFor).toLocaleString() : '—'}</p>
                  <p><strong>Address:</strong> {service.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRatings = () => (
    <div className="dashboard-section">
      <h2>Your Ratings</h2>
      {ratingsLoading ? (
        <div className="loading-message">Loading ratings…</div>
      ) : ratingsError ? (
        <div className="error-message">{ratingsError}</div>
      ) : myRatings.length === 0 ? (
        <div className="empty-message">You haven't rated any providers yet.</div>
      ) : (
        <div className="services-grid">
          {myRatings.map((f) => (
            <div key={f._id} className="service-card">
              <div className="service-header">
                <h4>Provider: {f.providerName || '—'}</h4>
                <div className="rating-stars">{renderStars(f.rating)}</div>
              </div>
              <div className="service-details">
                <p><strong>Rating:</strong> {f.rating}/5</p>
                {f.comment && <p><strong>Comment:</strong> {f.comment}</p>}
                <p className="review-date">{new Date(f.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Removed static Service Providers section as per requirement

  const filterRequests = () => {
    const term = searchTerm.trim().toLowerCase();
    const byStatus = ongoingSubtab === 'pending'
      ? r => (r.status || '').toLowerCase() === 'pending'
      : r => (r.status || '').toLowerCase() === 'accepted';

    return requests
      .filter(byStatus)
      .filter(r => {
        if (!term) return true;
        return [r._id, r.service, r.subservice, r.providerName, r.userName]
          .join(' ').toLowerCase().includes(term);
      });
  };

  const renderOngoingServices = () => {
    const items = filterRequests();
    return (
      <div className="dashboard-section">
        <h2>Ongoing Services</h2>

        <div className="ongoing-controls">
          <input
            type="search"
            placeholder="Search ongoing services by id, service, provider or user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="subtabs">
            <button className={`subtab-btn ${ongoingSubtab === 'pending' ? 'active' : ''}`} onClick={() => setOngoingSubtab('pending')}>Pending Requests</button>
            <button className={`subtab-btn ${ongoingSubtab === 'accepted' ? 'active' : ''}`} onClick={() => setOngoingSubtab('accepted')}>Accepted Requests</button>
          </div>
        </div>

        {requestsLoading ? (
          <div className="loading-message">Loading ongoing services…</div>
        ) : requestsError ? (
          <div className="error-message">{requestsError}</div>
        ) : items.length === 0 ? (
          <div className="empty-message">No {ongoingSubtab === 'pending' ? 'pending' : 'accepted'} requests found.</div>
        ) : (
          <div className="requests-list">
            {items.map(r => (
              <div key={r._id || r.id} className="request-card">
                <div className="request-header">
                  <h4>{r.service} {r.subservice ? `- ${r.subservice}` : ''}</h4>
                  <span className={`status ${r.status?.toLowerCase()}`}>{r.status}</span>
                </div>
                <div className="request-body">
                  {ongoingSubtab === 'accepted' && (
                    <p><strong>Request ID:</strong> {r._id || r.id}</p>
                  )}
                  <p><strong>Provider:</strong> {r.providerName || r.provider?.name || '—'}</p>
                  <p><strong>User:</strong> {r.userName || r.user?.name || '—'}</p>
                  <p><strong>Scheduled For:</strong> {r.scheduledFor ? new Date(r.scheduledFor).toLocaleString() : '—'}</p>
                  <p><strong>Address:</strong> {r.address}</p>
                  <p><strong>Notes:</strong> {r.description}</p>
                  {ongoingSubtab === 'accepted' && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {completeForId !== r._id ? (
                        <button className="btn secondary" onClick={() => { setCompleteForId(r._id); setRatingValue(5); setRatingComment(''); }}>Mark as Complete</button>
                      ) : (
                        <div style={{ borderTop: '1px solid #222', paddingTop: 10 }}>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Rating</label>
                              <select value={ratingValue} onChange={e => setRatingValue(Number(e.target.value))}>
                                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n>1?'s':''}</option>)}
                              </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                              <label>Comment (optional)</label>
                              <textarea value={ratingComment} onChange={e => setRatingComment(e.target.value)} placeholder="Share your experience..." />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn" onClick={() => setCompleteForId(null)}>Cancel</button>
                            <button className="btn primary" onClick={async () => {
                              try {
                                const user = JSON.parse(localStorage.getItem('user'));
                                await api.patch(`/requests/${r._id}/complete`, {
                                  userId: user?._id,
                                  rating: ratingValue,
                                  comment: ratingComment
                                });
                                setCompleteForId(null);
                                await fetchRequests();
                                await fetchMyRatings();
                              } catch (e) {
                                alert(e?.response?.data?.message || 'Failed to complete and rate');
                              }
                            }}>Submit</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {r.status?.toLowerCase() === 'cancelled' && r.cancelReason === 'provider_declined' && (
                    <div className="error-message" style={{ marginTop: '0.5rem' }}>
                      Provider declined your request. Please find a new provider for this service.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBookService = () => {
    const selectedService = services.find(s => s.name === bookingForm.service);
    
    return (
      <div className="dashboard-section">
        <h2>Book a Service</h2>
        <form className="book-service-form" onSubmit={handleBookingSubmit}>
          <div className="form-group">
            <label>Service Type *</label>
            <select 
              name="service" 
              value={bookingForm.service} 
              onChange={handleBookingFormChange}
              required
            >
              <option value="">Select Service</option>
              {services.map(service => (
                <option key={service._id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {selectedService && selectedService.subservices && selectedService.subservices.length > 0 && (
            <div className="form-group">
              <label>Sub-Service</label>
              <select 
                name="subservice" 
                value={bookingForm.subservice} 
                onChange={handleBookingFormChange}
              >
                <option value="">Select Sub-Service (Optional)</option>
                {selectedService.subservices.map((subservice, index) => (
                  <option key={index} value={subservice.name}>
                    {subservice.name} {subservice.basePrice && `- $${subservice.basePrice}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {bookingForm.service && (
            <div className="form-group">
              <label>Service Provider *</label>
              {loading ? (
                <div className="loading-message">Loading service providers...</div>
              ) : availableProviders.length > 0 ? (
                <select 
                  name="providerId" 
                  value={bookingForm.providerId} 
                  onChange={handleBookingFormChange}
                  required
                >
                  <option value="">Select Service Provider</option>
                  {availableProviders.map(provider => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name} - {provider.experience} (Rating: {provider.rating}/5)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="no-providers-message">
                  {providerMessage}
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Service Address *</label>
            <textarea 
              name="address"
              value={bookingForm.address}
              onChange={handleBookingFormChange}
              placeholder="Enter the address where service is needed..."
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description"
              value={bookingForm.description}
              onChange={handleBookingFormChange}
              placeholder="Describe the service you need in detail..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Preferred Date *</label>
              <input 
                type="date" 
                name="scheduledDate"
                value={bookingForm.scheduledDate}
                onChange={handleBookingFormChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Preferred Time *</label>
              <input 
                type="time" 
                name="scheduledTime"
                value={bookingForm.scheduledTime}
                onChange={handleBookingFormChange}
                required
              />
            </div>
          </div>

          {bookingMessage && (
            <div className={`booking-message ${bookingMessage.includes('successfully') ? 'success' : 'error'}`}>
              {bookingMessage}
            </div>
          )}

          <button 
            type="submit" 
            className="btn primary book-btn" 
            disabled={loading || !bookingForm.service || !bookingForm.providerId}
          >
            {loading ? 'Booking Service...' : 'Book Service'}
          </button>
        </form>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="dashboard-section">
      <h2>Notifications</h2>
      {notifLoading ? (
        <div className="loading-message">Loading notifications…</div>
      ) : notifError ? (
        <div className="error-message">{notifError}</div>
      ) : notifications.length === 0 ? (
        <div className="empty-message">No notifications yet.</div>
      ) : (
        <div className="requests-list">
          {notifications.map((n) => (
            <div key={n.requestId + String(n.at)} className="request-card">
              <div className="request-header">
                <h4>{n.service}{n.subservice ? ` - ${n.subservice}` : ''}</h4>
                <span className={`status ${n.status?.toLowerCase()}`}>{n.status}</span>
              </div>
              <div className="request-body">
                <p><strong>Provider:</strong> {n.providerName}</p>
                {n.status === 'Declined' && n.reason && (
                  <p><strong>Reason:</strong> {n.reason}</p>
                )}
                <p><strong>When:</strong> {n.at ? new Date(n.at).toLocaleString() : '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, <span className="brand">{currentUser?.name || 'User'}</span></h1>
          <button className="btn secondary logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <div className="sidebar-profile">
            <div className="profile-image small">
              <div className="profile-placeholder">{(currentUser?.name || 'U').charAt(0)}</div>
            </div>
            <div className="sidebar-info">
              <div className="sidebar-name">{currentUser?.name || 'User'}</div>
              <div className="sidebar-role">{currentUser?.role || 'user'}</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Past Services</button>
            <button className={`nav-btn ${activeTab === 'ratings' ? 'active' : ''}`} onClick={() => setActiveTab('ratings')}>Your Ratings</button>
            <button className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
            <button className={`nav-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>Book Service</button>
            <button className={`nav-btn ${activeTab === 'ongoing' ? 'active' : ''}`} onClick={() => setActiveTab('ongoing')}>Ongoing Services</button>
          </nav>

          <div className="sidebar-logout">
            <button className="btn secondary logout-sm" onClick={handleLogout}>Logout</button>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'services' && renderPastServices()}
            {activeTab === 'ratings' && renderRatings()}
            {activeTab === 'book' && renderBookService()}
            {activeTab === 'ongoing' && renderOngoingServices()}
            {activeTab === 'notifications' && renderNotifications()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
