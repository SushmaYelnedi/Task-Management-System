import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { authAPI, apiUtils } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import orbiflowLogo from '../assets/OrbiFlow.png';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [visibleToken, setVisibleToken] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Email or username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await authAPI.login({
        usernameOrEmail: formData.usernameOrEmail.trim(),
        password: formData.password
      });
      
      if (response.data) {
        // Check if response has user object
        if (!response.data.user) {
          setErrors({ general: 'Invalid response from server' });
          return;
        }
        
        // Extract user data from nested structure
        const userData = {
          ...response.data.user, // Extract user fields (name, email, etc.)
          role: response.data.role
        };

        
        // Store authentication data in sessionStorage
        const tokenToStore = response.data.token || 'dummy-token';
        sessionStorage.setItem('authToken', tokenToStore);
        // Log JWT to console for debugging (masking default to full token)
        try {
          console.debug('Received JWT token:', tokenToStore);
        } catch (e) {
          console.log('Received JWT token (unable to debug):', tokenToStore);
        }
        // Also log token plainly for easy inspection
        console.log(tokenToStore);
        sessionStorage.setItem('userRole', response.data.role);
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        // Update AuthContext state
        login(userData);
        
        // Show token visibly for debugging and navigate to dashboard
        const tokenValue = response.data.token || 'dummy-token';
        setVisibleToken(tokenValue);
        // Small delay so user can see token before navigation, or you can dismiss
        setTimeout(() => navigate('/dashboard'), 800);
        
        // Clear form
        setFormData({
          usernameOrEmail: '',
          password: ''
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = apiUtils.handleApiError(error);
      
      if (apiUtils.isAuthError(error)) {
        setErrors({ general: 'Invalid credentials. Please try again.' });
      } else {
        setErrors({ 
          general: apiUtils.isServerError(error) 
            ? 'Server error occurred. Please try again later.' 
            : errorMessage 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Illustration */}
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
        
        {/* Floating task elements */}
        <div className="floating-elements">
          <div className="floating-task task-1">
            <div className="task-dot"></div>
            <span>✓ Welcome back!</span>
          </div>
          <div className="floating-task task-2">
            <div className="task-dot"></div>
            <span>🚀 Ready to work</span>
          </div>
          <div className="floating-task task-3">
            <div className="task-dot"></div>
            <span>📊 Track progress</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="login-header">
        <div className="login-nav">
          <Link to="/">
            <img src={orbiflowLogo} alt="OrbiFlow" className="logo" />
          </Link>
          <Link to="/" className="back-btn">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-container">
          <div className="login-content">
            
            {/* Left Side - Welcome Message */}
            <div className="login-welcome">
              <h1 className="welcome-title">
                Welcome Back to<br />
                <span className="gradient-text">OrbiFlow</span>
              </h1>
              <p className="welcome-subtitle">
                Sign in to access your personalized dashboard, manage tasks, 
                and collaborate with your team.
              </p>
              
              <div className="welcome-features">
                <div className="welcome-feature">
                  <span className="feature-icon">📋</span>
                  <span>Access your tasks</span>
                </div>
                <div className="welcome-feature">
                  <span className="feature-icon">👥</span>
                  <span>Team collaboration</span>
                </div>
                <div className="welcome-feature">
                  <span className="feature-icon">📈</span>
                  <span>Progress tracking</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-container">
              <div className="login-form-wrapper">
                <div className="form-header">
                  <h2>Sign In</h2>
                  <p>Access your OrbiFlow account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                  <div className="form-group">
                    <label htmlFor="usernameOrEmail" className="form-label">Email or Username</label>
                    <input
                      type="text"
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      value={formData.usernameOrEmail}
                      onChange={handleInputChange}
                      className={`form-input ${errors.usernameOrEmail ? 'error' : ''}`}
                      placeholder="Enter your email or username"
                    />
                    {errors.usernameOrEmail && <span className="error-message">{errors.usernameOrEmail}</span>}
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
                      placeholder="Enter your password"
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  {errors.general && (
                    <div className="form-group">
                      <div className="error-message general-error">{errors.general}</div>
                    </div>
                  )}

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                      Remember me
                    </label>
                    <a href="#forgot" className="forgot-link">Forgot password?</a>
                  </div>

                  <button 
                    type="submit" 
                    className="sign-in-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                {/* Visible token panel for debugging */}
                {visibleToken && (
                  <div className="token-panel" style={{marginTop: '12px', padding: '10px', background: '#f3f4f6', borderRadius: '6px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <strong style={{fontSize: '14px'}}>JWT Token (debug)</strong>
                      <div>
                        <button
                          onClick={() => { navigator.clipboard?.writeText(visibleToken); }}
                          style={{marginRight: '8px'}}
                        >Copy</button>
                        <button onClick={() => setVisibleToken(null)}>Dismiss</button>
                      </div>
                    </div>
                    <div style={{marginTop: '8px', wordBreak: 'break-all', fontSize: '12px'}}>{visibleToken}</div>
                  </div>
                )}

                {/* Role Information */}
                <div className="role-info">
                  <h4>Available Roles:</h4>
                  <div className="role-badges">
                    <span className="role-badge admin">👑 Admin</span>
                    <span className="role-badge manager">👨‍💼 Manager</span>
                    <span className="role-badge employee">👨‍💻 Employee</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <div className="signup-link">
                  <p>Don't have an account? <Link to="/signup">Create one here</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;