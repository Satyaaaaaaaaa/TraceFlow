import React, { useState } from 'react';
import '../styles/login.css';
import Spinner from '../../Spinner'; // Import Spinner component
import UserRedirect from '../../Pages/userRedirect';
import GoogleSignIn from './GoogleSignIn';  // Import GoogleSignIn component
//import ForgotPasswordForm from './ForgotPasswordForm'; // Import ForgotPassword component
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  
  // PASSWORD VISIBILITY TOGGLE STATE
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });
  

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // PASSWORD VISIBILITY TOGGLE FUNCTION
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
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
        setMessage({ text: 'Login successful!', type: 'success' });
        setFormData({ 
          username: '',
          password: '' 
        });
        navigate (`/home`, { state: { message: 'Welcome to TraceFlow!' } });
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

        <div className="form-group password-field">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
            autoComplete="current-password"
            placeholder=" "
          />
          <label htmlFor="password">Password</label>
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "👁️" : "⌣"}
          </button>
        </div>
        
        {capsLockOn && (
          <p className="caps-warning">Caps Lock is ON</p>
        )}


        {/* Forgot Password Link */}
        <div className="forgot-password-link">
          <Link to="/forgot-password" className="forgot-password-btn">
            Forgot Password?
          </Link>
        </div>

        <button type="submit">Login</button>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="google-sign-in">
          <GoogleSignIn onLogin={onLogin} />
        </div>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </form>
      {isLoggedIn && authToken && <UserRedirect token={authToken} />}
    </div>
  );
};

export default LoginForm;