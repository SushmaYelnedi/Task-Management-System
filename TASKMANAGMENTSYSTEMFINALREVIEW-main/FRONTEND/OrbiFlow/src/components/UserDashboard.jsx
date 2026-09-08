import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import TaskList from './TaskList';
import ManagerTasks from './ManagerTasks';
import TaskAssignment from './TaskAssignment';
import Profile from './Profile';
import SelfTasks from './SelfTasks';
import './UserDashboard.css';
import orbiflowLogo from '../assets/OrbiFlow.png';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTaskAssignment, setShowTaskAssignment] = useState(false);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
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

  const refreshTasks = () => {
    setTaskRefreshTrigger(prev => prev + 1);
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    // Refresh tasks when switching to my-tasks
    if (menuId === 'my-tasks') {
      refreshTasks();
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return '#dc2626';
      case 'manager': return '#7c3aed';
      case 'employee': return '#059669';
      default: return '#6b7280';
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', icon: '🏠', label: 'Dashboard', path: '/dashboard' },
      { id: 'my-tasks', icon: '📋', label: 'My Tasks', path: '/tasks' },
      { id: 'self-tasks', icon: '📝', label: 'Self-Assigned', path: '/self-tasks' },
      { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
    ];

    const managerItems = [
      { id: 'create-task', icon: '➕', label: 'Assign Task', path: '/create-task' },
      { id: 'assigned-tasks', icon: '📊', label: 'Assigned Tasks', path: '/assigned-tasks' },
      { id: 'team', icon: '👥', label: 'Team', path: '/team' },
      { id: 'reports', icon: '📈', label: 'Reports', path: '/reports' },
    ];

    return user?.role === 'Manager' ? [...commonItems, ...managerItems] : commonItems;
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardHome onCreateTask={() => setShowTaskAssignment(true)} />;
      case 'my-tasks':
        return <TaskList key={taskRefreshTrigger} />;
      case 'self-tasks':
        return <SelfTasks />;
      case 'create-task':
        setShowTaskAssignment(true);
        setActiveMenu('dashboard');
        return <DashboardHome onCreateTask={() => setShowTaskAssignment(true)} />;
      case 'assigned-tasks':
        return user?.role === 'Manager' ? <ManagerTasks /> : <TaskList />;
      case 'profile':
        return <Profile />;
      default:
        return <DashboardHome onCreateTask={() => setShowTaskAssignment(true)} />;
    }
  };

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
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'Unknown User'}</p>
              <span 
                className="user-role-badge"
                style={{ backgroundColor: getRoleColor(user?.role) }}
              >
                {user?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-navigation">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Navigation Bar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <h1 className="page-title">
              {getMenuItems().find(item => item.id === activeMenu)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="navbar-right">
            {/* Notifications */}
            <button className="notification-btn">
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">3</span>
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
                  {user?.name?.charAt(0) || 'U'}
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
                      {user?.name?.charAt(0) || 'U'}
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
                    <button className="dropdown-item" onClick={() => handleMenuClick('profile')}>
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
          {renderContent()}
        </div>
      </main>



      {/* Task Assignment Modal */}
      {showTaskAssignment && user?.role === 'Manager' && (
        <TaskAssignment
          onClose={() => setShowTaskAssignment(false)}
          onTaskCreated={() => {
            setShowTaskAssignment(false);
            // You can add refresh logic here if needed
          }}
        />
      )}
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ onCreateTask }) => {
  const { user } = useAuth();
  const [taskStats, setTaskStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskStats();
  }, [user]);

  const fetchTaskStats = async () => {
    try {
      setLoading(true);
      let tasks = [];
      
      if (user?.role === 'Employee') {
        const assignedResponse = await taskAPI.employee.getAssignedTasks(user.id);
        const selfResponse = await taskAPI.employee.getSelfTasks(user.id);
        
        // Validate self-tasks belong to current user
        const validSelfTasks = (selfResponse.data || []).filter(task => task.assignedBy === user.id);
        if (selfResponse.data && selfResponse.data.length !== validSelfTasks.length) {

        }
        
        tasks = [...assignedResponse.data, ...validSelfTasks];
      } else if (user?.role === 'Manager') {
        const assignedToResponse = await taskAPI.manager.getAssignedToTasks(user.id);
        const selfResponse = await taskAPI.manager.getSelfTasks(user.id);
        
        // Validate self-tasks belong to current user
        const validSelfTasks = (selfResponse.data || []).filter(task => task.assignedBy === user.id);
        if (selfResponse.data && selfResponse.data.length !== validSelfTasks.length) {

        }
        
        tasks = [...assignedToResponse.data, ...validSelfTasks];
      }

      // Calculate real statistics
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const overdue = tasks.filter(t => {
        const endDate = new Date(t.endDate);
        return endDate < new Date() && t.status !== 'COMPLETED';
      }).length;

      setTaskStats({ total, inProgress, completed, overdue });
      setRecentTasks(tasks.slice(0, 3)); // Show 3 most recent tasks
      
    } catch (error) {
      console.error('Error fetching task stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    if (taskStats.total === 0) {
      return user?.role === 'Employee' 
        ? "You don't have any tasks assigned yet. Your manager will assign tasks soon!"
        : "You don't have any tasks yet. Start by creating your first task!";
    }
    return "Here's what's happening with your tasks today.";
  };

  return (
    <div className="dashboard-home">
      <div className="welcome-section">
        <div className="welcome-header">
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p>{getWelcomeMessage()}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-stats">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>{taskStats.total}</h3>
                <p>Total Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{taskStats.inProgress}</h3>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{taskStats.completed}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>{taskStats.overdue}</h3>
                <p>Overdue</p>
              </div>
            </div>
          </div>

          {taskStats.total === 0 ? (
            <div className="no-tasks-dashboard">
              <div className="no-tasks-illustration">
                {user?.role === 'Employee' ? '👨‍💼' : '📊'}
              </div>
              <h3>
                {user?.role === 'Employee' 
                  ? 'Waiting for Task Assignment' 
                  : 'Ready to Get Started'}
              </h3>
              <p>
                {user?.role === 'Employee' 
                  ? 'Your manager will assign tasks to you soon. In the meantime, you can explore your profile and familiarize yourself with the dashboard.'
                  : 'Start by creating your first task or assigning tasks to your team members.'}
              </p>
              {user?.role === 'Manager' && (
                <button className="action-btn primary" onClick={onCreateTask}>
                  <span className="btn-icon">➕</span>
                  Create Your First Task
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  {user?.role === 'Manager' && (
                    <button className="action-btn primary" onClick={onCreateTask}>
                      <span className="btn-icon">➕</span>
                      Assign Task
                    </button>
                  )}
                  <button className="action-btn secondary">
                    <span className="btn-icon">📊</span>
                    View Reports
                  </button>
                  <button className="action-btn secondary">
                    <span className="btn-icon">👥</span>
                    {user?.role === 'Manager' ? 'Team Overview' : 'My Progress'}
                  </button>
                </div>
              </div>

              {/* Recent Tasks Preview */}
              <div className="recent-tasks">
                <div className="recent-tasks-header">
                  <h3>Recent Tasks</h3>
                  <span className="task-count">{recentTasks.length} of {taskStats.total}</span>
                </div>
                <TaskList />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserDashboard;