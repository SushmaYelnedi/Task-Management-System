import api from './api';

export const taskAPI = {
  // Employee Task APIs
  employee: {
    // Get tasks assigned to employee
    getAssignedTasks: (employeeId) => 
      api.get(`/employee/tasks/assignedto/${employeeId}`),
    
    // Get self-tasks by employee
    getSelfTasks: (employeeId) => 
      api.get(`/employee/selftasks/${employeeId}`),
    
    // Add self-task
    addSelfTask: (taskData) => 
      api.post('/employee/addselftask', taskData),
    
    // Update task progress
    updateTaskProgress: (progressData) => 
      api.post('/employee/updatetaskprogress', progressData),
    
    // Get task progress history
    getTaskProgress: (taskId) => 
      api.get(`/employee/taskprogress/${taskId}`),
    
    // Update self-task status
    updateSelfTask: (taskData) => 
      api.put('/employee/updateselftask', taskData),
    
    // Update self-task details (full editing)
    updateSelfTaskDetails: (taskData) => 
      api.put('/employee/updateselftaskdetails', taskData),
    
    // Delete self-task
    deleteSelfTask: (taskId) => 
      api.delete(`/employee/deleteselftask/${taskId}`),
  },

  // Manager Task APIs
  manager: {
    // Get tasks assigned by manager
    getAssignedByTasks: (managerId) => 
      api.get(`/manager/tasks/assignedby/${managerId}`),
    
    // Get tasks assigned to manager
    getAssignedToTasks: (managerId) => 
      api.get(`/manager/tasks/assignedto/${managerId}`),
    
    // Get self-tasks by manager
    getSelfTasks: (managerId) => 
      api.get(`/manager/selftasks/${managerId}`),
    
    // Add new task
    addTask: (taskData) => 
      api.post('/manager/addtask', taskData),
    // Add multiple tasks in bulk to a list of employees
    addTasksBulk: (bulkData) =>
      api.post('/manager/addtasks-bulk', bulkData),
    
    // Update task details (non-progress)
    updateTask: (taskData) => {
      console.log('TaskAPI: Sending update request for task:', taskData);
      return api.put('/manager/updatetask', taskData);
    },
    
    // Add self-task
    addSelfTask: (taskData) => 
      api.post('/manager/addselftask', taskData),
    
    // Delete task
    deleteTask: (taskId) => 
      api.delete(`/manager/deletetask/${taskId}`),
    
    // Update task progress
    updateTaskProgress: (progressData) => 
      api.post('/manager/updatetaskprogress', progressData),
    
    // Get task progress history
    getTaskProgress: (taskId) => 
      api.get(`/manager/taskprogress/${taskId}`),
    
    // Update self-task status
    updateSelfTask: (taskData) => 
      api.put('/manager/updateselftask', taskData),
      
    // Update self-task details (full editing)
    updateSelfTaskDetails: (taskData) => 
      api.put('/manager/updateselftaskdetails', taskData),
      
    // Delete self-task
    deleteSelfTask: (taskId) => 
      api.delete(`/manager/deleteselftask/${taskId}`),
  }
};