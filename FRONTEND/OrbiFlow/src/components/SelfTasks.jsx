import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import './SelfTasks.css';

const SelfTasks = () => {
  const { user } = useAuth();
  const [selfTasks, setSelfTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'NOT_STARTED'
  });

  useEffect(() => {
    if (user?.id) {
      fetchSelfTasks();
    } else {
      setSelfTasks([]);
      setLoading(false);
    }
  }, [user?.id]);

  const fetchSelfTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simple validation
      if (!user?.id || user.id <= 0) {
        setError('Invalid user session. Please log in again.');
        setSelfTasks([]);
        setLoading(false);
        return;
      }
      

      
      const endpoint = user?.role === 'Manager' 
        ? taskAPI.manager.getSelfTasks 
        : taskAPI.employee.getSelfTasks;
      
      const response = await endpoint(user.id);
      const tasks = response.data || [];
      

      
      // Just set the tasks - no complex filtering needed
      setSelfTasks(tasks);
    } catch (err) {
      console.error('Error fetching self tasks:', err);
      setError('Failed to load your self-assigned tasks');
      setSelfTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.startDate || !taskForm.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(taskForm.endDate) < new Date(taskForm.startDate)) {
      setError('End date must be after start date');
      return;
    }

    // Extra validation for user ID
    if (!user?.id || user.id <= 0) {
      setError('Invalid user session. Please log in again.');
      return;
    }

    try {
      setError('');
      
      const taskData = {
        ...taskForm,
        assignedBy: user.id, // Ensure assignedBy is set to current user
        status: 'ASSIGNED'
      };



      const endpoint = user?.role === 'Manager' 
        ? taskAPI.manager.addSelfTask 
        : taskAPI.employee.addSelfTask;

      await endpoint(taskData);
      
      // Reset form and close modal
      setTaskForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'NOT_STARTED'
      });
      setShowCreateModal(false);
      
      // Refresh tasks
      fetchSelfTasks();
    } catch (err) {
      console.error('Error creating self task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setError('');
      
      const updateData = {
        id: taskId,
        status: newStatus
      };

      const endpoint = user?.role === 'Manager' 
        ? taskAPI.manager.updateSelfTask 
        : taskAPI.employee.updateSelfTask;

      await endpoint(updateData);
      
      // Refresh tasks
      fetchSelfTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      
      const endpoint = user?.role === 'Manager' 
        ? taskAPI.manager.deleteSelfTask 
        : taskAPI.employee.deleteSelfTask;

      await endpoint(taskId);
      
      // Refresh tasks
      fetchSelfTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    // Prevent editing a completed task
    if ((task.status || '').toUpperCase() === 'COMPLETED') {
      setError('Completed tasks cannot be edited.');
      return;
    }

    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.startDate || !taskForm.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(taskForm.endDate) < new Date(taskForm.startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setError('');
      // Block updating a task that is already completed
      if ((editingTask?.status || '').toUpperCase() === 'COMPLETED') {
        setError('Completed tasks cannot be updated.');
        return;
      }
      
      const updateData = {
        id: editingTask.id,
        title: taskForm.title,
        description: taskForm.description,
        startDate: taskForm.startDate,
        endDate: taskForm.endDate,
        status: taskForm.status
      };

      // Use the new updateSelfTaskDetails API for full editing
      const endpoint = user?.role === 'Manager' 
        ? taskAPI.manager.updateSelfTaskDetails 
        : taskAPI.employee.updateSelfTaskDetails;

      await endpoint(updateData);
      
      // Reset form and close modal
      setTaskForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'NOT_STARTED'
      });
      setEditingTask(null);
      
      // Refresh tasks
      fetchSelfTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'ASSIGNED': return '#3b82f6';
      case 'NOT_STARTED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return '✅';
      case 'IN_PROGRESS': return '🔄';
      case 'ASSIGNED': return '📋';
      case 'NOT_STARTED': return '⏸️';
      default: return '📋';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (endDate, status) => {
    if (status === 'COMPLETED') return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="self-tasks-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your self-assigned tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="self-tasks-container">
      <div className="self-tasks-header">
        <div className="header-content">
          <h2>My Self-Assigned Tasks</h2>
          <p>Tasks you've created for yourself</p>
        </div>
        <button 
          className="create-task-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="btn-icon">➕</span>
          Create New Task
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {selfTasks.length === 0 ? (
        <div className="no-tasks-state">
          <div className="no-tasks-icon">📝</div>
          <h3>No Self-Assigned Tasks Yet</h3>
          <p>Create your first self-assigned task to get started with personal task management.</p>
          <button 
            className="create-first-task-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="tasks-grid">
          {selfTasks.map((task) => (
            <div key={task.id} className={`task-card ${isOverdue(task.endDate, task.status) ? 'overdue' : ''}`}>
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <div 
                  className="task-status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {getStatusIcon(task.status)} {task.status.replace('_', ' ')}
                </div>
              </div>

              <p className="task-description">{task.description}</p>

              <div className="task-dates">
                <div className="date-item">
                  <span className="date-label">Start:</span>
                  <span className="date-value">{formatDate(task.startDate)}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Due:</span>
                  <span className={`date-value ${isOverdue(task.endDate, task.status) ? 'overdue' : ''}`}>
                    {formatDate(task.endDate)}
                    {isOverdue(task.endDate, task.status) && <span className="overdue-indicator">⚠️</span>}
                  </span>
                </div>
              </div>

              <div className="task-actions">
                {(() => {
                  const isCompleted = (task.status || '').toUpperCase() === 'COMPLETED';
                  return (
                    <>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className="status-select"
                        disabled={isCompleted}
                        title={isCompleted ? 'Completed tasks cannot change status' : 'Change status'}
                      >
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>

                      <button 
                        className="task-action-btn edit"
                        onClick={() => handleEditTask(task)}
                        title={isCompleted ? 'Cannot edit completed task' : 'Edit Task'}
                        disabled={isCompleted}
                      >
                        ✏️
                      </button>

                      <button 
                        className="task-action-btn delete"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        title={isCompleted ? 'Cannot delete completed task' : 'Delete Task'}
                        disabled={isCompleted}
                      >
                        🗑️
                      </button>
                    </>
                  );
                })()}
              </div>

              {task.taskAssignedTime && (
                <div className="task-meta">
                  <span className="created-date">
                    Created: {new Date(task.taskAssignedTime).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Self-Assigned Task</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="task-form">
              <div className="form-group">
                <label htmlFor="title">Task Title *</label>
                <input
                  type="text"
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="Describe your task"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    value={taskForm.endDate}
                    onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Self-Assigned Task</h3>
              <button 
                className="modal-close"
                onClick={() => setEditingTask(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="task-form">
              <div className="form-group">
                <label htmlFor="edit-title">Task Title *</label>
                <input
                  type="text"
                  id="edit-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description *</label>
                <textarea
                  id="edit-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="Describe your task"
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-startDate">Start Date *</label>
                  <input
                    type="date"
                    id="edit-startDate"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-endDate">End Date *</label>
                  <input
                    type="date"
                    id="edit-endDate"
                    value={taskForm.endDate}
                    onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                  className="status-select"
                >
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfTasks;