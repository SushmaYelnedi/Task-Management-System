import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import Profile from './Profile';
import './UserDashboard.css';  // Use the proper dashboard CSS
import orbiflowLogo from '../assets/OrbiFlow.png';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    gender: '',
    department: ''
  });
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#dc2626';
      case 'manager': return '#7c3aed';
      case 'employee': return '#059669';
      default: return '#6b7280';
    }
  };

  // Initial load on component mount
  useEffect(() => {
    loadManagers();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (activeView === 'dashboard') {
      // Dashboard already has data from initial load
      return;
    } else if (activeView === 'managers') {
      loadManagers();
    } else if (activeView === 'employees') {
      loadEmployees();
    }
  }, [activeView]);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listManagers();
      setManagers(res.data || []);
    } catch (e) {
      console.error('Failed to load managers', e);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listEmployees();
      setEmployees(res.data || []);
    } catch (e) {
      console.error('Failed to load employees', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async (id) => {
    if (!window.confirm('Delete this manager?')) return;
    await adminAPI.deleteManager(id);
    loadManagers();
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await adminAPI.deleteEmployee(id);
    loadEmployees();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      contact: '',
      password: '',
      gender: '',
      department: ''
    });
  };

  const handleAddUser = (type) => {
    resetForm();
    setEditingUser(null);
    setShowAddModal(type);
  };

  const handleEditUser = (user, type) => {
    setFormData({
      ...user,
      password: '' // Don't pre-fill password for security
    });
    setEditingUser({ ...user, type });
    setShowEditModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      if (showAddModal === 'manager') {
        await adminAPI.addManager(formData);
        loadManagers();
      } else {
        await adminAPI.addEmployee(formData);
        loadEmployees();
      }
      setShowAddModal(false);
      resetForm();
      alert(`${showAddModal} added successfully!`);
    } catch (error) {
      alert(`Failed to add ${showAddModal}: ${error.response?.data || error.message}`);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        updateData.password = editingUser.password; // Keep existing password if not changed
      }
      
      if (editingUser.type === 'manager') {
        await adminAPI.updateManager(updateData);
        loadManagers();
      } else {
        await adminAPI.updateEmployee(updateData);
        loadEmployees();
      }
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      alert(`${editingUser.type} updated successfully!`);
    } catch (error) {
      alert(`Failed to update ${editingUser.type}: ${error.response?.data || error.message}`);
    }
  };

  const SimpleTable = ({ rows, columns, onDelete, onEdit, type }) => (
    <div className="admin-table-container">
      <div className="admin-table-header">
        <div>
          <h3>{type === 'managers' ? 'Managers List' : 'Employees List'}</h3>
          <p>Manage your organization's {type}</p>
        </div>
        <button 
          className="action-btn primary"
          onClick={() => handleAddUser(type === 'managers' ? 'manager' : 'employee')}
        >
          <span className="btn-icon">➕</span>
          Add {type === 'managers' ? 'Manager' : 'Employee'}
        </button>
      </div>
      {loading ? (
        <div className="loading-stats">
          <div className="loading-spinner"></div>
          <p>Loading {type}...</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map(c => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="no-data">
                    <div className="no-data-content">
                      <span className="no-data-icon">{type === 'managers' ? '👨‍💼' : '👩‍💻'}</span>
                      <p>No {type} found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id}>
                    {columns.map(c => (
                      <td key={c.key}>{r[c.key]}</td>
                    ))}
                    <td>
                      <button 
                        className="edit-btn" 
                        onClick={() => onEdit(r, type === 'managers' ? 'manager' : 'employee')}
                        title={`Edit ${r.name}`}
                        style={{ marginRight: '0.5rem' }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => onDelete(r.id)}
                        title={`Delete ${r.name}`}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="user-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={orbiflowLogo} alt="OrbiFlow" className="dashboard-logo" />
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-section">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'Admin User'}</p>
              <span 
                className="user-role-badge"
                style={{ backgroundColor: getRoleColor(user?.role) }}
              >
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <button className={`nav-item ${activeView==='dashboard'?'active':''}`} onClick={()=>setActiveView('dashboard')}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button className={`nav-item ${activeView==='managers'?'active':''}`} onClick={()=>setActiveView('managers')}>
            <span className="nav-icon">👨‍💼</span>
            <span className="nav-label">Managers</span>
          </button>
          <button className={`nav-item ${activeView==='employees'?'active':''}`} onClick={()=>setActiveView('employees')}>
            <span className="nav-icon">👩‍💻</span>
            <span className="nav-label">Employees</span>
          </button>
          <button className={`nav-item ${activeView==='profile'?'active':''}`} onClick={()=>setActiveView('profile')}>
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </button>
        </nav>
      </aside>

      <main className="dashboard-main">
        {/* Top Navigation Bar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <h1 className="page-title">
              {activeView === 'dashboard' ? 'Admin Dashboard' : 
               activeView === 'managers' ? 'Managers' : 
               activeView === 'employees' ? 'Employees' : 'Profile'}
            </h1>
          </div>

          <div className="navbar-right">
            {/* Notifications */}
            <button className="notification-btn">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">2</span>
            </button>

            {/* Search */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            {/* User Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar small">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="user-details">
                  <span className="user-name-nav">{user?.name}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
                <span className="dropdown-arrow">⌄</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="user-info">
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-email">{user?.email}</p>
                      <span 
                        className="dropdown-role"
                        style={{ backgroundColor: getRoleColor(user?.role) }}
                      >
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => setActiveView('profile')}>
                      <span className="dropdown-icon">👤</span>
                      View Profile
                    </button>
                    <button className="dropdown-item">
                      <span className="dropdown-icon">⚙️</span>
                      Settings
                    </button>
                    <button className="dropdown-item">
                      <span className="dropdown-icon">❓</span>
                      Help & Support
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Content Area */}
        <div className="dashboard-content">
          {activeView === 'dashboard' && (
            <div className="dashboard-home">
              <div className="welcome-section">
                <div className="welcome-header">
                  <h2>Welcome to Admin Dashboard! 👑</h2>
                  <p>Manage your organization's users, monitor system activities, and oversee all operations from this central hub.</p>
                </div>
              </div>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👨‍💼</div>
                  <div className="stat-content">
                    <h3>{managers.length}</h3>
                    <p>Total Managers</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👩‍💻</div>
                  <div className="stat-content">
                    <h3>{employees.length}</h3>
                    <p>Total Employees</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>{managers.length + employees.length}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⚙️</div>
                  <div className="stat-content">
                    <h3>Active</h3>
                    <p>System Status</p>
                  </div>
                </div>
              </div>
              
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-btn primary" onClick={() => setActiveView('managers')}>
                    <span className="btn-icon">👨‍💼</span>
                    View Managers
                  </button>
                  <button className="action-btn secondary" onClick={() => setActiveView('employees')}>
                    <span className="btn-icon">👩‍💻</span>
                    View Employees
                  </button>
                  <button className="action-btn secondary">
                    <span className="btn-icon">📈</span>
                    System Reports
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeView === 'managers' && (
            <div style={{padding: '1.5rem'}}>
              <SimpleTable
                rows={managers}
                columns={[{key:'id',label:'ID'},{key:'name',label:'Name'},{key:'email',label:'Email'},{key:'contact',label:'Contact'},{key:'department',label:'Department'},{key:'gender',label:'Gender'}]}
                onDelete={handleDeleteManager}
                onEdit={handleEditUser}
                type="managers"
              />
            </div>
          )}
          {activeView === 'employees' && (
            <div style={{padding: '1.5rem'}}>
              <SimpleTable
                rows={employees}
                columns={[{key:'id',label:'ID'},{key:'name',label:'Name'},{key:'email',label:'Email'},{key:'contact',label:'Contact'},{key:'department',label:'Department'},{key:'gender',label:'Gender'}]}
                onDelete={handleDeleteEmployee}
                onEdit={handleEditUser}
                type="employees"
              />
            </div>
          )}
          {activeView === 'profile' && (
            <Profile />
          )}
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New {showAddModal === 'manager' ? 'Manager' : 'Employee'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="task-form">
              <div className="form-group">
                <label htmlFor="add-name">Full Name *</label>
                <input
                  type="text"
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-email">Email Address *</label>
                <input
                  type="email"
                  id="add-email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-contact">Contact Number *</label>
                <input
                  type="tel"
                  id="add-contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-password">Password *</label>
                <input
                  type="password"
                  id="add-password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-gender">Gender *</label>
                  <select
                    id="add-gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="add-department">Department *</label>
                  <select
                    id="add-department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="IT">Information Technology</option>
                    <option value="HR">Human Resources</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add {showAddModal === 'manager' ? 'Manager' : 'Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {editingUser.type === 'manager' ? 'Manager' : 'Employee'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="task-form">
              <div className="form-group">
                <label htmlFor="edit-id">ID</label>
                <input
                  type="text"
                  id="edit-id"
                  value={formData.id || ''}
                  disabled
                  style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small>ID cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="edit-name">Full Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-email">Email Address *</label>
                <input
                  type="email"
                  id="edit-email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-contact">Contact Number *</label>
                <input
                  type="tel"
                  id="edit-contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-password">New Password</label>
                <input
                  type="password"
                  id="edit-password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Leave blank to keep current password"
                />
                <small>Leave blank if you don't want to change the password</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-gender">Gender *</label>
                  <select
                    id="edit-gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-department">Department *</label>
                  <select
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="IT">Information Technology</option>
                    <option value="HR">Human Resources</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update {editingUser.type === 'manager' ? 'Manager' : 'Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


