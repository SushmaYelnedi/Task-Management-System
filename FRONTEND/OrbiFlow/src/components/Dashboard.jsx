import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TaskList from './TaskList';
import ManagerTasks from './ManagerTasks';
import './Dashboard.css';
import orbiflowLogo from '../assets/OrbiFlow.png';

const Dashboard = ({ children, title, actions = [] }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('my-tasks');

  const handleLogout = () => {
    logout();
    window.location.href = '/'; // Redirect to home
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'purple';
      case 'Manager': return 'blue';
      case 'Employee': return 'green';
      default: return 'gray';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { icon: '📊', label: 'Dashboard', path: '/dashboard' },
      { icon: '👤', label: 'Profile', path: '/profile' }
    ];

    switch (user?.role) {
      case 'Admin':
        return [
          ...baseItems,
          { icon: '👨‍💼', label: 'Managers', path: '/admin/managers' },
          { icon: '👨‍💻', label: 'Employees', path: '/admin/employees' },
          { icon: '📋', label: 'All Tasks', path: '/admin/tasks' },
          { icon: '⚙️', label: 'Settings', path: '/admin/settings' }
        ];
      case 'Manager':
        return [
          ...baseItems,
          { icon: '👨‍💻', label: 'My Team', path: '/manager/team' },
          { icon: '📋', label: 'Tasks', path: '/manager/tasks' },
          { icon: '➕', label: 'Create Task', path: '/manager/create-task' },
          { icon: '📈', label: 'Reports', path: '/manager/reports' }
        ];
      case 'Employee':
        return [
          ...baseItems,
          { icon: '📋', label: 'My Tasks', path: '/employee/tasks' },
          { icon: '✅', label: 'Completed', path: '/employee/completed' },
          { icon: '⏰', label: 'Deadlines', path: '/employee/deadlines' }
        ];
      default:
        return baseItems;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src={orbiflowLogo} alt="OrbiFlow" className="sidebar-logo" />
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className={`user-details ${!sidebarOpen ? 'hidden' : ''}`}>
            <p className="user-name">{user?.name || 'Deleted User'}</p>
            <span className={`user-role role-${getRoleColor(user?.role)}`}>
              {user?.role || 'User'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {getNavigationItems().map((item, index) => (
            <a 
              key={index} 
              href={item.path} 
              className="nav-item"
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className={`nav-label ${!sidebarOpen ? 'hidden' : ''}`}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <span className="nav-icon">🚪</span>
            <span className={`nav-label ${!sidebarOpen ? 'hidden' : ''}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <h1 className="page-title">{title}</h1>
          </div>
          <div className="top-bar-right">
            <div className="action-buttons">
              {actions.map((action, index) => (
                <button 
                  key={index}
                  className={`action-btn ${action.variant || 'primary'}`}
                  onClick={action.onClick}
                >
                  {action.icon && <span className="btn-icon">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
            <div className="user-menu">
              <div className="user-avatar small">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {children || (
            <div className="default-dashboard-content">
              {user?.role === 'Manager' ? (
                <div className="dashboard-tabs">
                  <div className="tab-navigation">
                    <button 
                      className={`tab-btn ${activeTab === 'my-tasks' ? 'active' : ''}`}
                      onClick={() => setActiveTab('my-tasks')}
                    >
                      My Tasks
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'assigned-tasks' ? 'active' : ''}`}
                      onClick={() => setActiveTab('assigned-tasks')}
                    >
                      Tasks I've Assigned
                    </button>
                  </div>
                  <div className="tab-content">
                    {activeTab === 'my-tasks' ? <TaskList /> : <ManagerTasks />}
                  </div>
                </div>
              ) : (
                <TaskList />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;