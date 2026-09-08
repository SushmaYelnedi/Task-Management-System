import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import { authAPI, apiUtils } from '../services/api';
import orbiflowLogo from '../assets/OrbiFlow.png';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    gender: '',
    department: '',
    role: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Contact validation (optional but should be valid if provided)
    if (formData.contact && formData.contact.trim()) {
      const contactRegex = /^[0-9]{10}$/;
      if (!contactRegex.test(formData.contact.trim())) {
        newErrors.contact = 'Please enter a valid 10-digit contact number';
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Prepare registration data
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        contact: formData.contact.trim() || null,
        gender: formData.gender,
        department: formData.department,
        role: formData.role
      };

      console.log('Sending registration data:', registrationData);

      // Validate all required fields are present
      const requiredFields = ['name', 'email', 'password', 'gender', 'department', 'role'];
      const missingFields = requiredFields.filter(field => !registrationData[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setErrors({ general: `Missing required fields: ${missingFields.join(', ')}` });
        return;
      }

      // Call registration API
      const response = await authAPI.register(registrationData);
      
      console.log('Registration response:', response.data);
      
      if (response.data && response.data.success) {
        setShowSuccessMessage(true);
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          contact: '',
          gender: '',
          department: '',
          role: ''
        });

        // Show success message for 3 seconds then redirect
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Redirect to login page
          navigate('/signin');
        }, 3000);
        
      } else {
        const errorMessage = response.data?.message || 'Registration failed';
        setErrors({ general: errorMessage });
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error types
      if (error.response?.status === 400) {
        // Handle validation errors
        if (errorMessage.toLowerCase().includes('email')) {
          setErrors({ email: errorMessage });
        } else if (errorMessage.toLowerCase().includes('contact')) {
          setErrors({ contact: errorMessage });
        } else {
          setErrors({ general: errorMessage });
        }
      } else if (error.response?.status === 500) {
        setErrors({ 
          general: 'Server error occurred. Please check if all required fields are filled correctly and try again.' 
        });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} login will be implemented Soon`);
  };

  return (
    <div className="signup-page">
      {/* Background Illustration */}
      <div className="signup-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        <div className="bg-shape shape-4"></div>
        
        {/* Floating task elements */}
        <div className="floating-elements">
          <div className="floating-task task-1">
            <div className="task-dot"></div>
            <span>✓ Welcome aboard!</span>
          </div>
          <div className="floating-task task-2">
            <div className="task-dot"></div>
            <span>📋 Organize tasks</span>
          </div>
          <div className="floating-task task-3">
            <div className="task-dot"></div>
            <span>🎯 Achieve goals</span>
          </div>
          <div className="floating-task task-4">
            <div className="task-dot"></div>
            <span>🚀 Boost productivity</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="signup-header">
        <div className="signup-nav">
          <Link to="/">
            <img src={orbiflowLogo} alt="OrbiFlow" className="logo" />
          </Link>
          <Link to="/" className="back-btn">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="signup-main">
        <div className="signup-container">
          <div className="signup-content">
            
            {/* Left Side - Welcome Message */}
            <div className="signup-welcome">
              <h1 className="welcome-title">
                Join the<br />
                <span className="gradient-text">OrbiFlow Community</span>
              </h1>
              <p className="welcome-subtitle">
                Start your journey to better productivity. Join as an Employee or Manager 
                to organize tasks, collaborate with teams, and achieve more every day.
              </p>
              
              <div className="welcome-features">
                <div className="welcome-feature">
                  <span className="feature-icon">🎯</span>
                  <span>Smart task prioritization</span>
                </div>
                <div className="welcome-feature">
                  <span className="feature-icon">👥</span>
                  <span>Seamless team collaboration</span>
                </div>
                <div className="welcome-feature">
                  <span className="feature-icon">📊</span>
                  <span>Detailed progress analytics</span>
                </div>
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="signup-form-container">
              <div className="signup-form-wrapper">
                <div className="form-header">
                  <h2>Create Your Account</h2>
                  <p>Join as an Employee or Manager - Get started with your free account</p>
                </div>

                {/* Social Login Buttons */}
                <div className="social-login">
                  <button 
                    type="button" 
                    className="social-btn google-btn"
                    onClick={() => handleSocialLogin('Google')}
                  >
                    <svg className="social-icon" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                  
                  <button 
                    type="button" 
                    className="social-btn microsoft-btn"
                    onClick={() => handleSocialLogin('Microsoft')}
                  >
                    <svg className="social-icon" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M1 1h10v10H1z"/>
                      <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                      <path fill="#7fba00" d="M1 13h10v10H1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13z"/>
                    </svg>
                    Continue with Microsoft
                  </button>
                </div>

                <div className="divider">
                  <span>or sign up with email</span>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="signup-form">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Create a strong password"
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact" className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className={`form-input ${errors.contact ? 'error' : ''}`}
                      placeholder="Enter your contact number"
                    />
                    {errors.contact && <span className="error-message">{errors.contact}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`form-input ${errors.gender ? 'error' : ''}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <span className="error-message">{errors.gender}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="department" className="form-label">Department</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`form-input ${errors.department ? 'error' : ''}`}
                    >
                      <option value="">Select Department</option>
                      <option value="IT">Information Technology</option>
                      <option value="HR">Human Resources</option>
                      <option value="Sales">Sales</option>
                    </select>
                    {errors.department && <span className="error-message">{errors.department}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`form-input ${errors.role ? 'error' : ''}`}
                    >
                      <option value="">Select Role</option>
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                    </select>
                    {errors.role && <span className="error-message">{errors.role}</span>}
                    <small className="form-help">Note: Admin accounts can only be created by existing admins</small>
                  </div>

                  {errors.general && (
                    <div className="form-group">
                      <div className="error-message general-error">{errors.general}</div>
                    </div>
                  )}

                  {showSuccessMessage && (
                    <div className="form-group">
                      <div className="success-message">
                        🎉 Account created successfully! Welcome to {import.meta.env.VITE_APP_NAME || 'OrbiFlow'}!
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="create-account-btn"
                    disabled={isLoading || showSuccessMessage}
                  >
                    {isLoading 
                      ? 'Creating Account...' 
                      : showSuccessMessage 
                        ? 'Account Created!' 
                        : 'Create Account'
                    }
                  </button>
                </form>

                {/* Login Link */}
                <div className="login-link">
                  <p>Already have an account? <Link to="/signin">Sign in here</Link></p>
                </div>

                {/* Terms and Privacy */}
                <div className="terms-privacy">
                  <p>
                    By creating an account, you agree to our{' '}
                    <a href="#terms">Terms of Service</a> and{' '}
                    <a href="#privacy">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;