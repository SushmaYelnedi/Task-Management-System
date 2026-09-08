import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import TaskProgressModal from './TaskProgressModal';
import './TaskList.css';

const TaskList = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for force refresh

  useEffect(() => {
    fetchTasks();
  }, [user, refreshKey]); // Include refreshKey in dependencies

  // Add a way to refresh tasks when component becomes active
  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log('No user ID found, skipping task fetch');
        setLoading(false);
        return;
      }
      
      console.log('Fetching tasks for user:', user.id, 'role:', user.role);
      
      const role = (user?.role || '').toString().toLowerCase();
      if (role === 'employee') {        
        const assignedResponse = await taskAPI.employee.getAssignedTasks(user.id);
        const assignedTasks = assignedResponse.data || [];
        
        console.log('Fetched assigned tasks for employee:', assignedTasks.length);
        setAssignedTasks(assignedTasks);
        
      } else if (role === 'manager') {
        const assignedToResponse = await taskAPI.manager.getAssignedToTasks(user.id);
        const assignedTasks = assignedToResponse.data || [];
        
        console.log('Fetched assigned tasks for manager:', assignedTasks.length);
        setAssignedTasks(assignedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error details:', error.response?.data);
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

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#10b981';
    if (progress >= 70) return '#84cc16';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const handleUpdateProgress = (task) => {
    setSelectedTask(task);
    setShowProgressModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (endDate) => {
    return new Date(endDate) < new Date() && new Date(endDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>My Tasks</h2>
        <div className="task-tabs">
          <button 
            className={`tab-btn active`}
          >
            Tasks Assigned by Manager ({assignedTasks.length})
          </button>
        </div>
      </div>

      <div className="task-list-content">
        <div className="tasks-grid">
          <div className="tasks-grid">
            {assignedTasks.length === 0 ? (
              <div className="no-tasks">
                <div className="no-tasks-icon">
                  {user?.role === 'Employee' ? '�‍💼' : '�📋'}
                </div>
                <h3>
                  {user?.role === 'Employee' 
                    ? 'No Tasks Assigned Yet' 
                    : 'No Assigned Tasks'}
                </h3>
                <p>
                  {user?.role === 'Employee' 
                    ? 'Your manager will assign tasks to you soon. Once assigned, they will appear here and you can track your progress.'
                    : 'You don\'t have any assigned tasks at the moment.'}
                </p>
                {user?.role === 'Employee' && (
                  <div className="employee-help-tips">
                    <h4>💡 What you can do while waiting:</h4>
                    <ul>
                      <li>✅ Update your profile information</li>
                      <li>📚 Familiarize yourself with the dashboard</li>
                      <li>🔔 Enable notifications for new task assignments</li>
                      <li>💬 Contact your manager if you need clarification</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              assignedTasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <div className="task-category">
                      <span className="category-badge">{task.category}</span>
                      <span className="subcategory-text">{task.subcategory}</span>
                    </div>
                    <div 
                      className="task-status"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </div>
                  </div>

                  <div className="task-body">
                    <h3 className="task-name">{task.name}</h3>
                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-progress">
                      <div className="progress-header">
                        <span>Progress</span>
                        <span className="progress-percentage">{task.progress || 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${task.progress || 0}%`,
                            backgroundColor: getProgressColor(task.progress || 0)
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="task-dates">
                      <div className="date-item">
                        <span className="date-label">Start:</span>
                        <span className="date-value">{formatDate(task.startDate)}</span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Due:</span>
                        <span className={`date-value ${isOverdue(task.endDate) ? 'overdue' : ''}`}>
                          {formatDate(task.endDate)}
                          {isOverdue(task.endDate) && <span className="overdue-badge">Overdue</span>}
                        </span>
                      </div>
                    </div>

                    {task.remarks && (
                      <div className="task-remarks">
                        <strong>Remarks:</strong> {task.remarks}
                      </div>
                    )}
                  </div>

                  <div className="task-actions">
                    <button 
                      className="btn-update-progress"
                      onClick={() => handleUpdateProgress(task)}
                      disabled={task.progress >= 100}
                    >
                      {task.progress >= 100 ? 'Completed' : 'Update Progress'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showProgressModal && (
        <TaskProgressModal
          task={selectedTask}
          onClose={(wasUpdated) => {
            setShowProgressModal(false);
            setSelectedTask(null);
            // Only refresh if update was successful
            if (wasUpdated) {
              console.log('Task was updated, refreshing task list...');
              setRefreshKey(prev => prev + 1); // Force refresh with key change
              fetchTasks(); // Also call fetchTasks directly
            }
          }}
        />
      )}
    </div>
  );
};

export default TaskList;