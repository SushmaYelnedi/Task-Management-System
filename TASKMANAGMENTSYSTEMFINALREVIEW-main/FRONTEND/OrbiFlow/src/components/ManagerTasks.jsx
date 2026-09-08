import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import './ManagerTasks.css';

const ManagerTasks = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    startDate: '',
    endDate: '',
    remarks: ''
  });

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'manager') {
      fetchAssignedTasks();
    }
  }, [user]);

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.manager.getAssignedByTasks(user.id);
      setAssignedTasks(response.data);
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.manager.deleteTask(taskId);
      setAssignedTasks(prev => prev.filter(task => task.id !== taskId));
      setShowDeleteModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    // Prevent editing a completed task
    if ((task.status || '').toUpperCase() === 'COMPLETED') {
      alert('Completed tasks cannot be edited.');
      return;
    }

    setEditForm({
      id: task.id,
      name: task.name,
      description: task.description,
      category: task.category,
      subcategory: task.subcategory,
      startDate: task.startDate,
      endDate: task.endDate,
      remarks: task.remarks || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating task with data:', editForm);
      console.log('API endpoint:', '/manager/updatetask');
      const response = await taskAPI.manager.updateTask(editForm);
      console.log('Update response:', response);
      // Refresh tasks
      fetchAssignedTasks();
      setShowEditModal(false);
      setEditForm({
        id: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        startDate: '',
        endDate: '',
        remarks: ''
      });
      alert('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      alert('Error updating task. Please try again.');
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

  if (user?.role?.toLowerCase() !== 'manager') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only managers can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="manager-tasks-loading">
        <div className="loading-spinner"></div>
        <p>Loading assigned tasks...</p>
      </div>
    );
  }

  return (
    <div className="manager-tasks-container">
      <div className="manager-tasks-header">
        <h2>Tasks I've Assigned</h2>
        <div className="tasks-summary">
          <div className="summary-item">
            <span className="summary-number">{assignedTasks.length}</span>
            <span className="summary-label">Total Tasks</span>
          </div>
          <div className="summary-item">
            <span className="summary-number">
              {assignedTasks.filter(t => t.status === 'COMPLETED').length}
            </span>
            <span className="summary-label">Completed</span>
          </div>
          <div className="summary-item">
            <span className="summary-number">
              {assignedTasks.filter(t => t.status === 'IN_PROGRESS').length}
            </span>
            <span className="summary-label">In Progress</span>
          </div>
          <div className="summary-item">
            <span className="summary-number">
              {assignedTasks.filter(t => isOverdue(t.endDate) && t.status !== 'COMPLETED').length}
            </span>
            <span className="summary-label">Overdue</span>
          </div>
        </div>
      </div>

      <div className="manager-tasks-content">
        {assignedTasks.length === 0 ? (
          <div className="no-tasks">
            <div className="no-tasks-icon">📋</div>
            <h3>No Tasks Assigned</h3>
            <p>You haven't assigned any tasks yet. Create a new task to get started.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {assignedTasks.map(task => (
              <div key={task.id} className="manager-task-card">
                <div className="task-header">
                  <div className="task-category">
                    <span className="category-badge">{task.category}</span>
                    <span className="subcategory-text">{task.subcategory}</span>
                  </div>
                  <div className="task-actions-header">
                    <div 
                      className="task-status"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </div>
                    <div className="task-buttons">
                      {(() => {
                        const isCompleted = (task.status || '').toUpperCase() === 'COMPLETED';
                        return (
                          <>
                            <button 
                              className="edit-btn"
                              onClick={() => { if (!isCompleted) handleEditTask(task); }}
                              title={isCompleted ? 'Cannot edit completed task' : 'Edit Task'}
                              disabled={isCompleted}
                            >
                              ✏️
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowDeleteModal(true);
                              }}
                              title="Delete Task"
                            >
                              🗑️
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="task-body">
                  <h3 className="task-name">{task.name}</h3>
                  <p className="task-description">{task.description}</p>
                  
                  <div className="assignee-info">
                    <span className="assignee-label">Assigned to:</span>
                    <span className="assignee-id">User ID: {task.assignedTo}</span>
                  </div>

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
                        {isOverdue(task.endDate) && task.status !== 'COMPLETED' && (
                          <span className="overdue-badge">Overdue</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="task-timing">
                    <span className="timing-label">Assigned:</span>
                    <span className="timing-value">
                      {new Date(task.taskAssignedTime).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {task.remarks && (
                    <div className="task-remarks">
                      <strong>Remarks:</strong> {task.remarks}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Task</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="delete-warning">
                <div className="warning-icon">⚠️</div>
                <p>
                  Are you sure you want to delete the task "<strong>{selectedTask.name}</strong>"?
                </p>
                <p className="warning-text">
                  This action cannot be undone. All progress and related data will be permanently deleted.
                </p>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="task-form">
              <div className="form-group">
                <label htmlFor="edit-name">Task Name *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description *</label>
                <textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-category">Category *</label>
                  <input
                    type="text"
                    id="edit-category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-subcategory">Subcategory</label>
                  <input
                    type="text"
                    id="edit-subcategory"
                    value={editForm.subcategory}
                    onChange={(e) => setEditForm({...editForm, subcategory: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-startDate">Start Date *</label>
                  <input
                    type="date"
                    id="edit-startDate"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-endDate">End Date *</label>
                  <input
                    type="date"
                    id="edit-endDate"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-remarks">Remarks</label>
                <textarea
                  id="edit-remarks"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
                  rows="3"
                />
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

export default ManagerTasks;