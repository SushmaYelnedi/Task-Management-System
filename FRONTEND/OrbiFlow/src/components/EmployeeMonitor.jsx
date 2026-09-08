import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import './EmployeeMonitor.css';

const EmployeeMonitor = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployeeData();
  }, [user]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Fetch tasks assigned by this manager
      const tasksResponse = await taskAPI.manager.getAssignedByTasks(user.id);
      const allTasks = tasksResponse.data || [];
      setTasks(allTasks);

      // Group tasks by employee and calculate statistics
      const employeeStats = {};
      
      allTasks.forEach(task => {
        const empId = task.assignedTo;
        if (!employeeStats[empId]) {
          employeeStats[empId] = {
            id: empId,
            name: task.assignedToName || `Employee ${empId}`,
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            averageProgress: 0,
            tasks: []
          };
        }
        
        const emp = employeeStats[empId];
        emp.totalTasks++;
        emp.tasks.push(task);
        
        if (task.status === 'COMPLETED') {
          emp.completedTasks++;
        } else if (task.status === 'IN_PROGRESS') {
          emp.inProgressTasks++;
        } else {
          emp.pendingTasks++;
        }
        
        // Check if task is overdue
        if (new Date(task.endDate) < new Date() && task.status !== 'COMPLETED') {
          emp.overdueTasks++;
        }
      });

      // Calculate average progress for each employee
      Object.values(employeeStats).forEach(emp => {
        if (emp.totalTasks > 0) {
          const totalProgress = emp.tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
          emp.averageProgress = Math.round(totalProgress / emp.totalTasks);
        }
      });

      setEmployees(Object.values(employeeStats));
      
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (completionRate) => {
    if (completionRate >= 80) return '#10b981';
    if (completionRate >= 60) return '#f59e0b';
    if (completionRate >= 40) return '#ef4444';
    return '#6b7280';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'ASSIGNED': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (endDate, status) => {
    if (status === 'COMPLETED') return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="employee-monitor-loading">
        <div className="loading-spinner"></div>
        <p>Loading employee data...</p>
      </div>
    );
  }

  return (
    <div className="employee-monitor">
      <div className="monitor-header">
        <h2>Employee Performance Monitor</h2>
        <p>Track your team's task completion and performance metrics</p>
      </div>

      {employees.length === 0 ? (
        <div className="no-employees">
          <div className="no-employees-icon">👥</div>
          <h3>No Employee Data</h3>
          <p>Start assigning tasks to employees to see their performance metrics here.</p>
        </div>
      ) : (
        <div className="employees-grid">
          {employees.map(employee => {
            const completionRate = employee.totalTasks > 0 
              ? Math.round((employee.completedTasks / employee.totalTasks) * 100) 
              : 0;
            
            return (
              <div 
                key={employee.id} 
                className="employee-card"
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="employee-header">
                  <div className="employee-avatar">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <h3>{employee.name}</h3>
                    <p>{employee.totalTasks} tasks assigned</p>
                  </div>
                </div>

                <div className="performance-metrics">
                  <div className="metric">
                    <span className="metric-label">Completion Rate</span>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${completionRate}%`,
                          backgroundColor: getPerformanceColor(completionRate)
                        }}
                      ></div>
                    </div>
                    <span 
                      className="metric-value"
                      style={{ color: getPerformanceColor(completionRate) }}
                    >
                      {completionRate}%
                    </span>
                  </div>

                  <div className="task-breakdown">
                    <div className="breakdown-item completed">
                      <span className="count">{employee.completedTasks}</span>
                      <span className="label">Completed</span>
                    </div>
                    <div className="breakdown-item progress">
                      <span className="count">{employee.inProgressTasks}</span>
                      <span className="label">In Progress</span>
                    </div>
                    <div className="breakdown-item pending">
                      <span className="count">{employee.pendingTasks}</span>
                      <span className="label">Pending</span>
                    </div>
                    {employee.overdueTasks > 0 && (
                      <div className="breakdown-item overdue">
                        <span className="count">{employee.overdueTasks}</span>
                        <span className="label">Overdue</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="employee-detail-modal">
          <div className="modal-overlay" onClick={() => setSelectedEmployee(null)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <div className="employee-detail-header">
                <div className="employee-avatar large">
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{selectedEmployee.name}</h2>
                  <p>{selectedEmployee.totalTasks} tasks assigned</p>
                </div>
              </div>
              <button 
                className="close-btn"
                onClick={() => setSelectedEmployee(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="employee-stats">
                <div className="stat-item">
                  <span className="stat-number">{selectedEmployee.completedTasks}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{selectedEmployee.inProgressTasks}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{selectedEmployee.pendingTasks}</span>
                  <span className="stat-label">Pending</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{selectedEmployee.averageProgress}%</span>
                  <span className="stat-label">Avg Progress</span>
                </div>
              </div>

              <div className="employee-tasks">
                <h3>Task Details</h3>
                <div className="tasks-list">
                  {selectedEmployee.tasks.map(task => (
                    <div key={task.id} className="task-detail-item">
                      <div className="task-detail-header">
                        <h4>{task.name}</h4>
                        <div 
                          className="task-status-badge"
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        >
                          {task.status}
                        </div>
                      </div>
                      
                      <p className="task-description">{task.description}</p>
                      
                      <div className="task-dates">
                        <span className="date-item">
                          Start: {formatDate(task.startDate)}
                        </span>
                        <span 
                          className={`date-item ${isOverdue(task.endDate, task.status) ? 'overdue' : ''}`}
                        >
                          Due: {formatDate(task.endDate)}
                          {isOverdue(task.endDate, task.status) && ' ⚠️'}
                        </span>
                      </div>
                      
                      {task.progress !== undefined && (
                        <div className="task-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">{task.progress}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMonitor;