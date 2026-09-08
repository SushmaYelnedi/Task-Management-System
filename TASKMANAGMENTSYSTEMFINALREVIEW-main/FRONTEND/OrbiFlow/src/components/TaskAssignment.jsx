import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import './TaskAssignment.css';

const TaskAssignment = ({ onClose, onTaskCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    remarks: ''
  });
  const [assignmentType, setAssignmentType] = useState('individual'); // 'individual' or 'group'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock users data (since we don't have a backend endpoint for users list)
  const mockUsers = [
    { id: 1, name: 'John Smith', email: 'john@company.com', role: 'Employee', department: 'Development' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Employee', department: 'Design' },
    { id: 3, name: 'Mike Wilson', email: 'mike@company.com', role: 'Employee', department: 'QA' },
    { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'Employee', department: 'Development' },
    { id: 5, name: 'Alex Brown', email: 'alex@company.com', role: 'Manager', department: 'Marketing' },
    { id: 6, name: 'Lisa Chen', email: 'lisa@company.com', role: 'Employee', department: 'HR' },
    { id: 7, name: 'David Garcia', email: 'david@company.com', role: 'Employee', department: 'Development' },
    { id: 8, name: 'Jennifer Lee', email: 'jennifer@company.com', role: 'Employee', department: 'Design' }
  ];

  useEffect(() => {
    // Filter out current user and set available users
    const filtered = mockUsers.filter(u => u.id !== user?.id);
    setAvailableUsers(filtered);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUserSelection = (userId) => {
    if (assignmentType === 'individual') {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.subcategory.trim()) newErrors.subcategory = 'Subcategory is required';
    if (!formData.name.trim()) newErrors.name = 'Task name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (selectedUsers.length === 0) newErrors.assignees = 'Please select at least one user';
    
    if (formData.startDate && formData.endDate && 
        new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Create individual tasks for each selected user
      const taskPromises = selectedUsers.map(async (userId) => {
        const taskData = {
          ...formData,
          assignedTo: userId,
          assignedBy: user.id,
          status: 'ASSIGNED',
          progress: 0
        };
        
        return await taskAPI.manager.addTask(taskData);
      });

      await Promise.all(taskPromises);
      
      // Show success message
      const assignedCount = selectedUsers.length;
      const successMessage = assignmentType === 'individual' 
        ? `Task assigned successfully to ${availableUsers.find(u => u.id === selectedUsers[0])?.name}!`
        : `Task assigned successfully to ${assignedCount} users!`;
      
      alert(successMessage);
      
      // Call callback to refresh parent component
      if (onTaskCreated) onTaskCreated();
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUsersText = () => {
    if (selectedUsers.length === 0) return 'No users selected';
    if (selectedUsers.length === 1) {
      const user = availableUsers.find(u => u.id === selectedUsers[0]);
      return user?.name || 'Unknown user';
    }
    return `${selectedUsers.length} users selected`;
  };

  const categories = [
    'Development', 'Design', 'Testing', 'Documentation', 
    'Research', 'Marketing', 'Sales', 'Support', 'Admin'
  ];

  const subcategories = {
    'Development': ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile'],
    'Design': ['UI Design', 'UX Research', 'Graphics', 'Prototyping'],
    'Testing': ['Unit Testing', 'Integration Testing', 'QA', 'Performance'],
    'Documentation': ['Technical Docs', 'User Guides', 'API Docs'],
    'Research': ['Market Research', 'Technical Research', 'Competitor Analysis'],
    'Marketing': ['Content Creation', 'Social Media', 'Campaigns', 'SEO'],
    'Sales': ['Lead Generation', 'Client Meetings', 'Proposals'],
    'Support': ['Customer Support', 'Bug Fixes', 'Maintenance'],
    'Admin': ['Planning', 'Meetings', 'Reports', 'Management']
  };

  return (
    <div className="task-assignment-overlay" onClick={onClose}>
      <div className="task-assignment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✨ Assign New Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-assignment-form">
          {/* Assignment Type Selection */}
          <div className="assignment-type-section">
            <h3>Assignment Type</h3>
            <div className="assignment-type-options">
              <label className={`assignment-option ${assignmentType === 'individual' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="assignmentType"
                  value="individual"
                  checked={assignmentType === 'individual'}
                  onChange={(e) => {
                    setAssignmentType(e.target.value);
                    setSelectedUsers([]);
                  }}
                />
                <div className="option-content">
                  <span className="option-icon">👤</span>
                  <span className="option-text">Individual Assignment</span>
                  <span className="option-desc">Assign to one person</span>
                </div>
              </label>
              
              <label className={`assignment-option ${assignmentType === 'group' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="assignmentType"
                  value="group"
                  checked={assignmentType === 'group'}
                  onChange={(e) => {
                    setAssignmentType(e.target.value);
                    setSelectedUsers([]);
                  }}
                />
                <div className="option-content">
                  <span className="option-icon">👥</span>
                  <span className="option-text">Group Assignment</span>
                  <span className="option-desc">Assign to multiple people</span>
                </div>
              </label>
            </div>
          </div>

          {/* User Selection */}
          <div className="user-selection-section">
            <h3>
              Select {assignmentType === 'individual' ? 'User' : 'Users'}
              <span className="selection-count">({getSelectedUsersText()})</span>
            </h3>
            {errors.assignees && <div className="error-message">{errors.assignees}</div>}
            
            <div className="users-grid">
              {availableUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-card ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                  onClick={() => handleUserSelection(user.id)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0)}
                  </div>
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p className="user-email">{user.email}</p>
                    <div className="user-meta">
                      <span className="user-role">{user.role}</span>
                      <span className="user-department">{user.department}</span>
                    </div>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <div className="selection-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Task Details */}
          <div className="task-details-section">
            <h3>Task Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <div className="error-message">{errors.category}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="subcategory">Subcategory *</label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className={errors.subcategory ? 'error' : ''}
                  disabled={!formData.category}
                >
                  <option value="">Select Subcategory</option>
                  {formData.category && subcategories[formData.category]?.map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
                {errors.subcategory && <div className="error-message">{errors.subcategory}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Task Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter task name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the task in detail..."
                rows="4"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={errors.startDate ? 'error' : ''}
                />
                {errors.startDate && <div className="error-message">{errors.startDate}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={errors.endDate ? 'error' : ''}
                />
                {errors.endDate && <div className="error-message">{errors.endDate}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="remarks">Additional Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Any additional instructions or notes..."
                rows="3"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Task{selectedUsers.length > 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  🚀 Assign Task{selectedUsers.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskAssignment;