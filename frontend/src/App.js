import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProviderLogin from './pages/ProviderLogin';
import ProviderRegister from './pages/ProviderRegister';
import UserDashboard from './pages/UserDashboard';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/provider-login" element={<ProviderLogin />} />
        <Route path="/provider-registration" element={<ProviderRegister />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
