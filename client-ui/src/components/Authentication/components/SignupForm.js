import React, { useState } from 'react';
import '../styles/Signup.css';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
// import ReCAPTCHA from 'react-google-recaptcha';

// const RECAPTCHA_SITE_KEY = '6LdFmiwqAAAAACToIxlwk54wTzQyJ6usbTPZrH7w'; // Replace with your reCAPTCHA site key

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    firstName: '',
    lastName: '',
  });
  //const [recaptchaToken, setRecaptchaToken] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // const handleRecaptcha = (token) => {
  //   setRecaptchaToken(token);
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.age || !formData.firstName || !formData.lastName) {
      setMessage({ text: 'All fields are required!', type: 'error' });
      return;
    }

    if (!validator.isEmail(formData.email)) {
      setMessage({ text: 'Invalid email format!', type: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }

    // if (!recaptchaToken) {
    //   setMessage({ text: 'Please complete the CAPTCHA!', type: 'error' });
    //   return;
    // }

    try {
      const response = await fetch("/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'user', // Default role set to 'user'
          //recaptchaToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ text: errorData.error, type: 'error' });
        return;
      }

      setMessage({ text: 'Signup successful! Please login.', type: 'success' });
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        firstName: '',
        lastName: '',
      });
      //setRecaptchaToken('');

      navigate('/login', { state: { message: 'Signup successful! Please login.' } });

    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ text: 'Signup failed. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Signup</h2>
        {message.text && (
          <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </p>
        )}
        
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
          aria-label="Enter your username"
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          aria-label="Enter your email"
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          aria-label="Enter your password"
        />

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          aria-label="Confirm your password"
        />

        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          aria-label="Enter your first name"
        />

        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          aria-label="Enter your last name"
        />

        <label htmlFor="age">Age:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          aria-label="Enter your age"
        />

        {/* <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleRecaptcha}
        /> */}

        <button type="submit">Signup</button>

        <div className="login-link">
          Already registered? <a href="/login">Login instead</a>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
