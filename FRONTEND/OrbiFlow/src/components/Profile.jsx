import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI, managerAPI, adminAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    gender: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        gender: user.gender || '',
        password: '' // Don't pre-fill password for security
      });
    }
  }, [user]);

  // Helper functions for role styling
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#dc2626';
      case 'manager': return '#7c3aed';
      case 'employee': return '#059669';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '👑';
      case 'manager': return '👨‍💼';
      case 'employee': return '👤';
      default: return '👤';
    }
  };

  const formatRole = (role) => {
    return role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase();
  };

  // Check if user is admin to show different profile view
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  
  // Admin can also edit their profile
  const canEdit = user?.role?.toLowerCase() === 'employee' || user?.role?.toLowerCase() === 'manager' || isAdmin;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        gender: user.gender || '',
        password: ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validation
      if (!formData.name.trim()) {
        setError('Name is required');
        return;
      }
      
      // Additional validation for non-admin users
      if (user.role?.toLowerCase() !== 'admin') {
        if (!formData.department.trim()) {
          setError('Department is required');
          return;
        }
        if (!formData.gender) {
          setError('Gender is required');
          return;
        }
      }

      // Prepare update data (excluding email and contact)
      const updateData = {
        id: user.id,
        name: formData.name.trim(),
        department: formData.department.trim(),
        gender: formData.gender,
        // Keep existing email and contact - they cannot be changed by user
        email: user.email,
        contact: user.contact
      };

      // Only include password if it was changed
      if (formData.password.trim()) {
        updateData.password = formData.password.trim();
      } else {
        updateData.password = user.password; // Keep existing password
      }

      // Call appropriate API based on user role
      let response;
      if (user.role?.toLowerCase() === 'employee') {
        response = await employeeAPI.updateProfile(updateData);
      } else if (user.role?.toLowerCase() === 'manager') {
        response = await managerAPI.updateProfile(updateData);
      } else if (user.role?.toLowerCase() === 'admin') {
        // Admin only updates username and password
        const adminUpdateData = {
          username: formData.name.trim(),
          password: formData.password.trim() || user.password
        };
        response = await adminAPI.updateProfile(adminUpdateData);
      } else {
        setError('Profile editing not available for your role');
        return;
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Update user context with new data
      if (user.role?.toLowerCase() === 'admin') {
        const updatedUser = {
          ...user,
          name: formData.name.trim()
        };
        updateUser(updatedUser);
      } else {
        const updatedUser = {
          ...user,
          name: updateData.name,
          department: updateData.department,
          gender: updateData.gender
        };
        updateUser(updatedUser);
      }

      // Clear password field
      setFormData(prev => ({ ...prev, password: '' }));

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Admin profile view - show only username and password
  if (isAdmin) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <div className="header-content">
            <h2>Admin Profile</h2>
            <p>{isEditing ? 'Edit your administrator credentials' : 'Administrative account information'}</p>
          </div>
          <div className="header-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEdit}>
                <span className="btn-icon">✏️</span>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave} disabled={loading}>
                  <span className="btn-icon">💾</span>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
                  <span className="btn-icon">❌</span>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="profile-status">
              <span 
                className="profile-role-badge"
                style={{ backgroundColor: getRoleColor(user.role) }}
              >
                👑 Administrator
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-section">
              <h3>Administrator Credentials</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="profile-input"
                      placeholder="Enter username"
                      required
                    />
                  ) : (
                    <div className="profile-value">
                      <span className="field-icon">👤</span>
                      {user.name || 'admin'}
                    </div>
                  )}
                </div>

                <div className="profile-field">
                  <label>Password</label>
                  {isEditing ? (
                    <>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="profile-input"
                        placeholder="Enter new password"
                      />
                      <small className="field-help">Leave blank to keep current password</small>
                    </>
                  ) : (
                    <div className="profile-value">
                      <span className="field-icon">🔒</span>
                      {user.password ? '••••••••' : '••••••••'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Account Type</label>
                  <div className="profile-value">
                    <span className="field-icon">👑</span>
                    Administrator Account
                  </div>
                </div>

                <div className="profile-field">
                  <label>Access Level</label>
                  <div className="profile-value">
                    <span className="field-icon">🔐</span>
                    Full System Access
                  </div>
                </div>

                <div className="profile-field">
                  <label>Account Status</label>
                  <div className="profile-value">
                    <span className="field-icon">✅</span>
                    Active
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-note">
              <div className="note-icon">ℹ️</div>
              <div className="note-content">
                <strong>Note:</strong> You can edit your username and password. 
                Changes will be saved to your administrator account.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h3>Profile not found</h3>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-content">
          <h2>My Profile</h2>
          <p>{isEditing ? 'Edit your account information' : 'View and manage your account information'}</p>
        </div>
        {canEdit && (
          <div className="header-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEdit}>
                <span className="btn-icon">✏️</span>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave} disabled={loading}>
                  <span className="btn-icon">💾</span>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
                  <span className="btn-icon">❌</span>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {success}
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="profile-status">
            <span 
              className="profile-role-badge"
              style={{ backgroundColor: getRoleColor(user.role) }}
            >
              {getRoleIcon(user.role)} {formatRole(user.role)}
            </span>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="profile-input"
                    placeholder="Enter your full name"
                    required
                  />
                ) : (
                  <div className="profile-value">
                    <span className="field-icon">👤</span>
                    {user.name || 'Not specified'}
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <div className="profile-value readonly">
                  <span className="field-icon">📧</span>
                  {user.email || 'Not specified'}
                  <span className="readonly-label">Read-only</span>
                </div>
              </div>

              <div className="profile-field">
                <label>Contact Number</label>
                <div className="profile-value readonly">
                  <span className="field-icon">📞</span>
                  {user.contact || 'Not specified'}
                  <span className="readonly-label">Read-only</span>
                </div>
              </div>

              <div className="profile-field">
                <label>Department</label>
                {isEditing ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="profile-input"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="IT">Information Technology</option>
                    <option value="HR">Human Resources</option>
                    <option value="Sales">Sales</option>
                  </select>
                ) : (
                  <div className="profile-value">
                    <span className="field-icon">🏢</span>
                    {user.department || 'Not specified'}
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="profile-input"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="profile-value">
                    <span className="field-icon">⚧</span>
                    {user.gender || 'Not specified'}
                  </div>
                )}
              </div>

              <div className="profile-field">
                <label>{user.role === 'Employee' ? 'Employee ID' : 'Manager ID'}</label>
                <div className="profile-value readonly">
                  <span className="field-icon">🆔</span>
                  {user.id || 'Not assigned'}
                  <span className="readonly-label">Read-only</span>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="profile-section">
              <h3>Security</h3>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="profile-input"
                    placeholder="Leave blank to keep current password"
                  />
                  <small className="field-help">Leave blank if you don't want to change your password</small>
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h3>Account Information</h3>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Account Type</label>
                <div className="profile-value">
                  <span className="field-icon">{getRoleIcon(user.role)}</span>
                  {formatRole(user.role)} Account
                </div>
              </div>

              <div className="profile-field">
                <label>Account Status</label>
                <div className="profile-value">
                  <span className="field-icon">✅</span>
                  Active
                </div>
              </div>
            </div>
          </div>

          <div className="profile-note">
            <div className="note-icon">ℹ️</div>
            <div className="note-content">
              {canEdit ? (
                <>
                  <strong>Note:</strong> You can edit your name, department, gender, and password. 
                  Email and contact information are read-only and can only be changed by an administrator.
                </>
              ) : (
                <>
                  <strong>Note:</strong> Profile information is read-only. Contact your administrator to update your details.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;