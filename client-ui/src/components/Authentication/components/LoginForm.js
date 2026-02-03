import React, { useState } from 'react';
import '../styles/login.css';
import Spinner from '../../Spinner'; // Import Spinner component
import UserRedirect from '../../Pages/userRedirect';
import GoogleSignIn from './GoogleSignIn';  // Import GoogleSignIn component
//import ForgotPasswordForm from './ForgotPasswordForm'; // Import ForgotPassword component

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!formData.username || !formData.password) {
      setErrorMessage('Username and Password are required!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Login failed');
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      const token = responseData.data?.token;
      const userData = responseData.data?.user;

      if (token && userData) {
        onLogin(token, userData);
        setAuthToken(token);
        setIsLoggedIn(true);
      } else {
        setErrorMessage('Login failed: Token or user information is missing in the response.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && <Spinner />}
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Welcome Back</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        
        <div className="form-group">
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder=" "
          />
          <label htmlFor="username">Username</label>
        </div>

        <div className="form-group">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder=" "
          />
          <label htmlFor="password">Password</label>
        </div>

        {/* ADD THIS SECTION - Forgot Password Link */}
        <div className="forgot-password-link">
          <a href="/forgot-password" className="forgot-password-btn">
            Forgot Password?
          </a>
        </div>

        <button type="submit">Login</button>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="google-sign-in">
          <GoogleSignIn onLogin={onLogin} />
        </div>

        <div className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </form>
      {isLoggedIn && authToken && <UserRedirect token={authToken} />}
    </div>
  );
};

export default LoginForm;