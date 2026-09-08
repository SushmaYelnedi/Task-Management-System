import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import api from '../services/api';
import ManagerTasks from './ManagerTasks';
import SelfTasks from './SelfTasks';
import Profile from './Profile';
import './UserDashboard.css';  // Use the modern dashboard CSS
import orbiflowLogo from '../assets/OrbiFlow.png';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const multiSelectRef = useRef(null);
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

  const syncMultiSelectToState = (nextSelected) => {
    if (!multiSelectRef.current) return;
    const values = new Set((nextSelected || []).map(v => String(v)));
    Array.from(multiSelectRef.current.options).forEach(opt => {
      opt.selected = values.has(String(opt.value));
    });
  };

  useEffect(() => {
    syncMultiSelectToState(selectedEmployees);
  }, [selectedEmployees]);

  const addEmployeeToMulti = (empId) => {
    const idStr = String(empId);
    setSelectedEmployees(prev => {
      const next = prev.includes(idStr) ? prev : [...prev, idStr];
      return next;
    });
    setSelectedEmployee('');
  };

  const removeEmployeeFromMulti = (empId) => {
    const idStr = String(empId);
    setSelectedEmployees(prev => {
      const next = prev.filter(id => id !== idStr);
      // Force sync after state update with setTimeout
      setTimeout(() => {
        if (multiSelectRef.current) {
          Array.from(multiSelectRef.current.options).forEach(opt => {
            opt.selected = next.includes(String(opt.value));
          });
        }
      }, 0);
      return next;
    });
    setSelectedEmployee(prev => (String(prev) === idStr ? '' : prev));
  };
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    startDate: '',
    endDate: '',
    remarks: ''
  });



  // Initial load on component mount
  useEffect(() => {
    fetchEmployees();
    fetchAssignedTasks();
  }, []);
  const filteredEmployees = employees.filter(emp => {
    const q = employeeSearch.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (String(emp.id).includes(q))
    );
  });


  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees');
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const response = await taskAPI.manager.getAssignedByTasks(user.id);
      setAssignedTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if ((!selectedEmployee && selectedEmployees.length === 0) || !taskForm.name || !taskForm.description || !taskForm.startDate || !taskForm.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const isBulk = selectedEmployees.length > 0;
      if (isBulk) {
        const bulkData = {
          ...taskForm,
          assignedBy: user.id,
          employeeIds: selectedEmployees.map(id => parseInt(id))
        };
        await taskAPI.manager.addTasksBulk(bulkData);
      } else {
        const taskData = {
          ...taskForm,
          assignedBy: user.id,
          assignedTo: parseInt(selectedEmployee),
          status: 'ASSIGNED',
          progress: 0
        };
        await taskAPI.manager.addTask(taskData);
      }
      
      // Reset form
      setTaskForm({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        startDate: '',
        endDate: '',
        remarks: ''
      });
      setSelectedEmployee('');
      setSelectedEmployees([]);
      
      // Refresh tasks
      fetchAssignedTasks();
      alert('Task assigned successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'assigned': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderDashboard = () => (
    <div className="dashboard-home">
      <div className="welcome-section">
        <div className="welcome-header">
          <h2>Welcome back, {user?.name || 'Manager'}! 👨‍💼</h2>
          <p>Manage your team, assign tasks, and track progress from your comprehensive management hub.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{assignedTasks.length}</h3>
            <p>Total Tasks Assigned</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{assignedTasks.filter(t => t.status === 'COMPLETED').length}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{assignedTasks.filter(t => t.status === 'IN_PROGRESS').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{employees.length}</h3>
            <p>Team Members</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => setActiveView('assign')}
          >
            <span className="btn-icon">➕</span>
            Assign New Task
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={() => setActiveView('tasks')}
          >
            <span className="btn-icon">📊</span>
            View All Tasks
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={() => setActiveView('self')}
          >
            <span className="btn-icon">📝</span>
            Self Tasks
          </button>
        </div>
      </div>
    </div>
  );

  const renderAssignTask = () => (
    <div className="task-form">
      <div className="section-header">
        <h2>Assign New Task</h2>
        <p>Create and assign tasks to your team members individually or in bulk</p>
      </div>

      <form onSubmit={handleCreateTask}>
        <div className="form-row" style={{position:'relative'}}>
          <div className="form-group" style={{marginBottom: 0}}>
            <label>Search Users</label>
            <input
              type="text"
              placeholder="Type name, email, or ID to filter employees"
              value={employeeSearch}
              onChange={(e) => { setEmployeeSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredEmployees.length > 0) {
                    const pick = filteredEmployees[0];
                    addEmployeeToMulti(pick.id);
                    setEmployeeSearch('');
                    setShowSuggestions(false);
                  }
                }
              }}
            />
            {showSuggestions && employeeSearch && (
              <div style={{
                position:'absolute',
                zIndex: 10,
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                maxHeight: '220px',
                overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
              }}>
                {filteredEmployees.length === 0 ? (
                  <div style={{padding:'0.75rem', color:'#6b7280'}}>No matches found</div>
                ) : (
                  filteredEmployees.slice(0, 8).map(emp => (
                    <div
                      key={emp.id}
                      onMouseDown={() => {
                        addEmployeeToMulti(emp.id);
                        setEmployeeSearch('');
                        setShowSuggestions(false);
                      }}
                      style={{padding:'0.75rem', cursor:'pointer', borderBottom: '1px solid #f3f4f6'}}
                      onMouseEnter={(e)=> e.currentTarget.style.background='#f3f4f6'}
                      onMouseLeave={(e)=> e.currentTarget.style.background='transparent'}
                    >
                      <div style={{fontWeight:600, color: '#1f2937'}}>{emp.name}</div>
                      <div style={{fontSize:'0.875rem', color:'#6b7280'}}>{emp.email}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Assign To (Single Employee)</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select an employee</option>
              {filteredEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Assign To (Multiple Employees)</label>
            <select
              ref={multiSelectRef}
              key={selectedEmployees.join(',')}
              multiple
              value={selectedEmployees}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions).map(o => o.value);
                setSelectedEmployees(options);
                if (options.length > 0) {
                  setSelectedEmployee('');
                }
              }}
              style={{minHeight: '120px'}}
            >
              {filteredEmployees.map(emp => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
            <small style={{color:'#64748b', fontSize: '0.75rem'}}>Hold Ctrl/Cmd to select multiple employees for bulk assignment</small>
          </div>
        </div>

        {selectedEmployees.length > 0 && (
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{fontWeight:600, color:'#374151', marginBottom:'0.5rem', display:'block'}}>Selected Employees:</label>
            <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
              {selectedEmployees.map(id => {
                const emp = employees.find(e => String(e.id) === String(id));
                const label = emp ? `${emp.name}` : `ID ${id}`;
                return (
                  <span key={id} style={{
                    display:'inline-flex',
                    alignItems:'center',
                    gap:'0.5rem',
                    padding:'0.5rem 0.75rem',
                    border:'1px solid #e5e7eb',
                    borderRadius:'9999px',
                    background:'linear-gradient(135deg, #6366f1, #7c3aed)',
                    color: 'white',
                    fontSize:'0.875rem',
                    fontWeight: '500'
                  }}>
                    {label}
                    <button type="button" onClick={() => removeEmployeeFromMulti(id)} style={{
                      border:'none', background:'rgba(255,255,255,0.2)', cursor:'pointer', 
                      color:'white', padding:'0.125rem 0.25rem', borderRadius: '50%', width: '20px', height: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>×</button>
                  </span>
                );
              })}
              <button type="button" onClick={() => {
                setSelectedEmployees([]);
                // Force sync after state update with setTimeout
                setTimeout(() => {
                  if (multiSelectRef.current) {
                    Array.from(multiSelectRef.current.options).forEach(opt => {
                      opt.selected = false;
                    });
                  }
                }, 0);
              }} style={{
                border:'1px solid #ef4444', background:'transparent', color:'#ef4444', cursor:'pointer',
                fontSize:'0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem'
              }}>Clear All</button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Task Name *</label>
          <input
            type="text"
            value={taskForm.name}
            onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
            placeholder="Enter a descriptive task name"
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={taskForm.description}
            onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
            placeholder="Provide detailed instructions and requirements for this task"
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={taskForm.category}
              onChange={(e) => setTaskForm({...taskForm, category: e.target.value})}
              placeholder="e.g., Development, Design, Testing, Marketing"
            />
          </div>
          
          <div className="form-group">
            <label>Subcategory</label>
            <input
              type="text"
              value={taskForm.subcategory}
              onChange={(e) => setTaskForm({...taskForm, subcategory: e.target.value})}
              placeholder="e.g., Frontend, Backend, UI/UX, Analytics"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              value={taskForm.startDate}
              onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>End Date *</label>
            <input
              type="date"
              value={taskForm.endDate}
              onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Additional Remarks</label>
          <textarea
            value={taskForm.remarks}
            onChange={(e) => setTaskForm({...taskForm, remarks: e.target.value})}
            placeholder="Any additional notes, context, or special instructions"
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="loading-spinner" style={{width: '16px', height: '16px', margin: 0}}></div>
                Assigning...
              </>
            ) : (
              <>
                <span>✨</span>
                {selectedEmployees.length > 0 ? `Assign to ${selectedEmployees.length} Employees` : 'Assign Task'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="user-dashboard">
      {/* Left Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={orbiflowLogo} alt="OrbiFlow" className="dashboard-logo" />
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar-section">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'M'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'Manager User'}</p>
              <span 
                className="user-role-badge"
                style={{ backgroundColor: getRoleColor(user?.role) }}
              >
                {user?.role || 'Manager'}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <button
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
            title="Dashboard"
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeView === 'assign' ? 'active' : ''}`}
            onClick={() => setActiveView('assign')}
            title="Assign Tasks"
          >
            <span className="nav-icon">➕</span>
            <span className="nav-label">Assign Tasks</span>
          </button>

          <button
            className={`nav-item ${activeView === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveView('tasks')}
            title="View Tasks"
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">View Tasks</span>
          </button>

          <button
            className={`nav-item ${activeView === 'self' ? 'active' : ''}`}
            onClick={() => setActiveView('self')}
            title="Self-Assigned"
          >
            <span className="nav-icon">📝</span>
            <span className="nav-label">Self Tasks</span>
          </button>

          <button
            className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveView('profile')}
            title="Profile"
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Navigation Bar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <h1 className="page-title">
              {activeView === 'dashboard' ? 'Manager Dashboard' : 
               activeView === 'assign' ? 'Assign Tasks' :
               activeView === 'tasks' ? 'View Tasks' :
               activeView === 'self' ? 'Self Tasks' : 'Profile'}
            </h1>
          </div>

          <div className="navbar-right">
            {/* Notifications */}
            <button className="notification-btn">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">5</span>
            </button>

            {/* Search */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search tasks..." 
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
                  {user?.name?.charAt(0) || 'M'}
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
                      {user?.name?.charAt(0) || 'M'}
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
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'assign' && (
            <div style={{padding: '1.5rem'}}>
              {renderAssignTask()}
            </div>
          )}
          {activeView === 'tasks' && (
            <ManagerTasks />
          )}
          {activeView === 'self' && (
            <div style={{padding: '1.5rem'}}>
              <SelfTasks />
            </div>
          )}
          {activeView === 'profile' && (
            <Profile />
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;