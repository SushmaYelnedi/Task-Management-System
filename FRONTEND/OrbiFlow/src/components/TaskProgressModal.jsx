import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import './TaskProgressModal.css';

const TaskProgressModal = ({ task, onClose }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(task?.progress || 0);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressHistory, setProgressHistory] = useState([]);

  console.log('TaskProgressModal rendered with:', { task, user });

  useEffect(() => {
    if (task?.id) {
      console.log('Task ID found, fetching progress history for task:', task.id);
      fetchProgressHistory();
    }
  }, [task]);

  const fetchProgressHistory = async () => {
    try {
      console.log('Fetching progress history for task:', task.id, 'user role:', user?.role);
      const userRole = user?.role?.toLowerCase(); // Make role comparison case-insensitive
      
      const response = userRole === 'employee' 
        ? await taskAPI.employee.getTaskProgress(task.id)
        : await taskAPI.manager.getTaskProgress(task.id);
      
      console.log('Progress history response:', response.data);
      setProgressHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching progress history:', error);
      console.error('Error details:', error.response?.data);
      setProgressHistory([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!task?.id) {
        alert('Error: Task ID is missing');
        return;
      }
      
      if (!user?.id) {
        alert('Error: User ID is missing');
        return;
      }
      
      if (!remarks.trim()) {
        alert('Please provide remarks for this progress update');
        return;
      }
      
      const progressData = {
        taskid: task.id,
        updatedBy: user.id,
        progress: parseFloat(progress),
        remarks: remarks.trim(), // Fixed: backend expects 'remarks' not 'remarks1'
        reviewstatus: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
      };

      console.log('Sending progress update:', progressData);
      console.log('User role:', user.role);

      let response;
      const userRole = user?.role?.toLowerCase(); // Make role comparison case-insensitive
      
      if (userRole === 'employee') {
        response = await taskAPI.employee.updateTaskProgress(progressData);
      } else if (userRole === 'manager') {
        response = await taskAPI.manager.updateTaskProgress(progressData);
      } else {
        alert('Error: Invalid user role: ' + user?.role);
        return;
      }

      console.log('Progress update response:', response.data);

      // Show success message and trigger parent refresh
      alert('Task progress updated successfully!');
      
      // Small delay to ensure backend processing is complete
      setTimeout(() => {
        // Call onClose with a flag to indicate successful update
        if (onClose) {
          onClose(true); // Pass true to indicate successful update
        }
      }, 500); // 500ms delay
    } catch (error) {
      console.error('Error updating progress:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Error updating progress. Please try again.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#10b981';
    if (progress >= 70) return '#84cc16';
    if (progress >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="progress-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Task Progress</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="task-info">
            <h4>{task?.name}</h4>
            <p className="task-description">{task?.description}</p>
            <div className="current-progress">
              <span>Current Progress: </span>
              <span className="progress-value" style={{ color: getProgressColor(task?.progress || 0) }}>
                {task?.progress || 0}%
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="progress-form">
            <div className="form-group">
              <label htmlFor="progress">New Progress (%)</label>
              <div className="progress-input-container">
                <input
                  type="number"
                  id="progress"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="progress-input"
                  required
                />
                <div className="progress-visual">
                  <div 
                    className="progress-bar-small"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: getProgressColor(progress)
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="remarks">Progress Remarks</label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Describe what you've accomplished..."
                className="remarks-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Progress'}
              </button>
            </div>
          </form>

          {progressHistory.length > 0 && (
            <div className="progress-history">
              <h4>Progress History</h4>
              <div className="history-list">
                {progressHistory.map((entry, index) => (
                  <div key={index} className="history-item">
                    <div className="history-header">
                      <div className="history-progress">
                        <span className="progress-circle" style={{ backgroundColor: getProgressColor(entry.progress) }}>
                          {entry.progress}%
                        </span>
                      </div>
                      <div className="history-meta">
                        <span className="history-time">{formatDateTime(entry.progressUpdatedTime)}</span>
                        <span className="history-status">{entry.reviewstatus}</span>
                      </div>
                    </div>
                    {entry.remarks1 && (
                      <div className="history-remarks">
                        {entry.remarks1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskProgressModal;