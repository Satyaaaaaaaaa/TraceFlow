import React, { useState } from 'react';
import '../styles/ForgotPassword.css';

const ForgetPasswordForm = ({ onLogin }) => {   
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        otp: '',
        newPassword: '',
        newConfirmPassword: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    
    const HARDCODED_OTP = '123456';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setErrorMessage('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // STEP 1: Submit username
    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (!formData.username) {
            setErrorMessage('Username is required!');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/check-username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: formData.username }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || 'Username not found');
                setLoading(false);
                return;
            }

            setStep(2);
            setErrorMessage('');
        } catch (error) {
            console.error('Error checking username:', error);
            setErrorMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const handleOtpSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.otp) {
            setErrorMessage('OTP is required!');
            return;
        }

        if (formData.otp !== HARDCODED_OTP) {
            setErrorMessage('Invalid OTP. Please try again.');
            return;
        }

        setStep(3);
        setErrorMessage('');
    };

    // STEP 3: Reset password
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.newPassword || !formData.newConfirmPassword) {
            setErrorMessage('Both password fields are required!');
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.newConfirmPassword) {
            setErrorMessage('Passwords do not match!');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters long!');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    otp: formData.otp,
                    newPassword: formData.newPassword,
                    newConfirmPassword: formData.newConfirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || 'Password reset failed');
                setLoading(false);
                return;
            }

            alert('Password reset successful! Please login with your new password.');
            
            // Reset form and go back to step 1
            setFormData({
                username: '',
                otp: '',
                newPassword: '',
                newConfirmPassword: ''
            });
            setStep(1);
            
        } catch (error) {
            console.error('Password reset error:', error);
            setErrorMessage('Password reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgotPassword-container">
            {loading && <div className="spinner">Loading...</div>}
            
            {/* STEP 1: Enter Username */}
            {step === 1 && (
                <form onSubmit={handleUsernameSubmit} className="forgotPassword-form">
                    <h2>Forgot Password</h2>
                    <p>Enter your username to reset your password</p>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className="form-group">
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder=" "
                            aria-label="Enter your username"
                        />
                        <label htmlFor="username">Username</label>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Checking...' : 'Continue'}
                    </button>
                </form>
            )}

            {/* STEP 2: Enter OTP */}
            {step === 2 && (
                <form onSubmit={handleOtpSubmit} className="forgotPassword-form">
                    <h2>Verify OTP</h2>
                    <p>Enter the OTP: <strong>{HARDCODED_OTP}</strong></p>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className="form-group">
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            value={formData.otp}
                            onChange={handleChange}
                            placeholder=" "
                            aria-label="Enter OTP"
                            maxLength="6"
                        />
                        <label htmlFor="otp">Enter OTP</label>
                    </div>

                    <button type="submit">Verify OTP</button>
                    <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="back-button"
                    >
                        Back
                    </button>
                </form>
            )}

            {/* STEP 3: Create New Password */}
            {step === 3 && (
                <form onSubmit={handlePasswordReset} className="forgotPassword-form">
                    <h2>Create New Password</h2>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className="form-group password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}

                            placeholder=" "
                            aria-label="Enter your new password"
                        />
                        <label htmlFor="newPassword">New Password</label>
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
                            id="newConfirmPassword"
                            name="newConfirmPassword"
                            value={formData.newConfirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                            placeholder=" "
                            aria-label="Confirm your new password"
                        />
                        <label htmlFor="newConfirmPassword">Confirm Password</label>
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

                    <button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgetPasswordForm;