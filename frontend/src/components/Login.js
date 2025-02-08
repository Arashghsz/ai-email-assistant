import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error;

  const handleLogin = async (provider) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/login?provider=${provider}`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Clear any existing error state before redirecting
        navigate('/', { replace: true, state: {} });
        window.location.href = data.authUrl;
      } else {
        console.error('Auth URL not received');
      }
    } catch (error) {
      console.error('Error initiating login:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>AI Email Assistant</h1>
        <p className="app-description">
          AI Email Assistant helps you manage your emails efficiently with the power of AI. 
          Automatically categorize, prioritize, and respond to emails with ease.
        </p>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <button onClick={() => handleLogin('google')} className="google-btn">
          <span className="google-icon">G</span>
          Sign in with Google
        </button>
        <button className="disabled-btn" disabled>
        📧 Sign in with Outlook (Under Development)
        </button>
        <button className="disabled-btn" disabled>
        🌐 Sign in with Other Providers (Under Development)
        </button>
      </div>
    </div>
  );
}

export default Login;
