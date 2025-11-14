import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="homepage">
      <div className="hero">
        <h1>Welcome to <span className="brand">FixItNow</span></h1>
        <p>Your one-stop solution for all local home services!</p>
        <div className="cta-buttons">
          <button className="btn primary" onClick={() => navigate('/login')}>
            Book a Service
          </button>
          <button className="btn secondary" onClick={() => navigate('/provider-login')}>
            Become a Provider
          </button>
        </div>
      </div>

      <div className="about">
        <h2>About FixItNow</h2>
        <p>
          FixItNow connects users with reliable local service professionals including electricians, plumbers, carpenters, beauticians, and many more. 
          Whether you need a quick fix or a full service, we’ve got you covered.
        </p>
        <p>
          All our service providers are verified and rated by real customers so you always know you're in good hands.
        </p>
      </div>
    </div>
  );
};

export default Home;
