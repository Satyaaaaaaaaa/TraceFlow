import React, { useState } from 'react';
import '../styles/Signup.css';
import validator from 'validator';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

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
    //-----------NEW FIELDS--------------------
    phoneNumber: '',
    role: '',
  });

  //const [recaptchaToken, setRecaptchaToken] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // PASSWORD VISIBILITY TOGGLE STATES
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  
  //PRINTING SIZE OF DATA BEING SENT TO THE SERVER
  /*const payload = JSON.stringify(formData);

  // size in bytes
  const sizeInBytes = new Blob([payload]).size;
  
  // optional: KB
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  
  console.log("Signup payload size:", sizeInBytes, "bytes");
  console.log("Signup payload size:", sizeInKB, "KB");*/

  // const handleRecaptcha = (token) => {
  //   setRecaptchaToken(token);
  // };

  const handleRoleSelect = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole,
    });
  };

  //FUNCTION FOR PASSWORD VISIBILITY TOGGLE
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.age || !formData.firstName || !formData.lastName || !formData.role || !formData.phoneNumber) {
      setMessage({ text: 'All fields are required!', type: 'error' });
      return;
    }

    if (!validator.isEmail(formData.email)) {
      setMessage({ text: 'Invalid email format!', type: 'error' });
      return;
    }

    // ADDED PASSWORD LENGTH VALIDATION
    if (formData.password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long!', type: 'error' });
      return;
    }

    // if (formData.age < ) AGE VALIDATION CAN BE ADDED HERE

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }

    // if (!recaptchaToken) {
    //   setMessage({ text: 'Please complete the CAPTCHA!', type: 'error' });
    //   return;
    // }

    try {

      const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ text: errorData.error, type: 'error' });
        return;
      }

      setMessage({ text: 'Signup successful!', type: 'success' });
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: ''
      });
      //setRecaptchaToken('');

      //navigate(`/login`, { state: { message: 'Signup successful! Please login.' } });
      navigate (`/home`, { state: { message: 'Welcome to TraceFlow!' } });
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ text: 'Signup failed. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Create Account</h2>
        
        {message.text && (
          <p className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </p>
        )}

        {/*--------------------------------Role Selection-----------------------------*/}
        <div className="role-selection">
          <label>I Want To Be A :</label>
          <div className="role-options">
            <div 
              className={`role-card ${formData.role === 'BUYER' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('BUYER')}
            >
              <input
                type="radio"
                name="role"
                value="BUYER"
                checked={formData.role === 'BUYER'}
                onChange={() => {}}
              />
              <div className="role-icon">🛒</div>
              <div className="role-title">Buyer</div>
              <div className="role-description">Buy products</div>
            </div>
            
            <div 
              className={`role-card ${formData.role === 'SELLER' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('SELLER')}
            >
              <input
                type="radio"
                name="role"
                value="SELLER"
                checked={formData.role === 'SELLER'}
                onChange={() => {}}
              />
              <div className="role-icon">🏪</div>
              <div className="role-title">Seller</div>
              <div className="role-description">Sell products</div>
            </div>
          </div>
        </div>

        {/*------------------------------------Name Fields-------------------------------- */}
        <div className="name-row">
          <div className="form-group">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              
              //ONLY ALPHABETS ARE ALLOWED
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowRight" ||
                  e.key === "Tab"
                ) {
                return;
                }
                if (!/^[a-zA-Z ]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}

              placeholder=" "
              aria-label="Enter your first name"
            />
            <label htmlFor="firstName">First Name</label>
          </div>

          <div className="form-group">
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}

              //ONLY ALPHABETS ARE ALLOWED
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowRight" ||
                  e.key === "Tab"
                ) {
                return;
                }

                if (!/^[a-zA-Z ]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder=" "
              aria-label="Enter your last name"
            />
            <label htmlFor="lastName">Last Name</label>
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onKeyDown={(e) => {
                if (
                  e.key === "Backspace" ||
                  e.key === "Delete" ||
                  e.key === "ArrowLeft" ||
                  e.key === "ArrowRight" ||
                  e.key === "Tab"
                ) {
                return;
                }

                if (!/^[a-zA-Z ]$/.test(e.key)) {
                  e.preventDefault();
                }
            }}
            autoComplete="username"
            placeholder=" "
            aria-label="Enter your username"
          />
          <label htmlFor="username">Username</label>
        </div>

        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder=" "
            aria-label="Enter your email"
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="form-group">
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            //ONLY NUMBERS ARE ALLOWED
            onKeyDown={(e) => {
              
              if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "Tab"
              ) {
                return;
              }
            
              // allow numbers
              if (/^[0-9]$/.test(e.key)) {
                return;
              }
            
              // block everything else
              e.preventDefault();
            }}
            placeholder=" "
            aria-label="Enter your phone number"
          />
          <label htmlFor="phoneNumber">Phone Number</label>
        </div>

        <div className="form-group">
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder=" "
            aria-label="Enter your age"
          />
          <label htmlFor="age">Age</label>
        </div>

        <div className="form-group password-field">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
            placeholder=" "
            aria-label="Enter your password"
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

        <div className="form-group password-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
            placeholder=" "
            aria-label="Confirm your password"
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <button
            type="button"
            className="password-toggle"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? "👁️" : "⌣"}
          </button>
        </div>
        
        {capsLockOn && (
          <p className="caps-warning">Caps Lock is ON</p>
        )}

        {/* <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleRecaptcha}
        /> */}

        <button type="submit">Sign Up</button>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;