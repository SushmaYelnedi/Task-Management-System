import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      // Log the token being attached (use debug to avoid noisy logs)
      try { console.debug('api: attaching Authorization Bearer token to request', token); } catch (e) { /* ignore */ }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userData');
      // Also clear localStorage for any legacy data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: (credentials) => 
    api.post(`${import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/auth/login'}`, credentials),
  
  register: (userData) => 
    api.post(`${import.meta.env.VITE_AUTH_REGISTER_ENDPOINT || '/auth/register'}`, userData),
};

export const adminAPI = {
  // Admin profile management
  updateProfile: (admin) => api.put('/admin/update', admin),
  
  // Managers
  addManager: (manager) => api.post('/admin/addmanager', manager),
  listManagers: () => api.get('/admin/managers'),
  updateManager: (manager) => api.put('/admin/updatemanager', manager),
  getManagerById: (id) => api.get(`/admin/manager/${id}`),
  deleteManager: (id) => api.delete(`/admin/deletemanager/${id}`),

  // Employees
  addEmployee: (employee) => api.post('/admin/addemployee', employee),
  listEmployees: () => api.get('/admin/employees'),
  updateEmployee: (employee) => api.put('/admin/updateemployee', employee),
  getEmployeeById: (id) => api.get(`/admin/employee/${id}`),
  deleteEmployee: (id) => api.delete(`/admin/deleteemployee/${id}`),
};

export const employeeAPI = {
  // Employee profile management
  getProfile: (id) => api.get(`/employee/profile/${id}`),
  updateProfile: (employee) => api.put('/employee/update', employee),
  updateImage: (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.put(`/employee/updateimage/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const managerAPI = {
  // Manager profile management
  getProfile: (id) => api.get(`/manager/profile/${id}`),
  updateProfile: (manager) => api.put('/manager/update', manager),
  updateImage: (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.put(`/manager/updateimage/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};


export const apiUtils = {
  handleApiError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.response?.data) {
      return typeof error.response.data === 'string' 
        ? error.response.data 
        : 'An error occurred';
    } else if (error.message) {
      return error.message;
    } else {
      return 'Network error occurred';
    }
  },
  
  isValidationError: (error) => {
    return error.response?.status === 400;
  },
  
  isAuthError: (error) => {
    return error.response?.status === 401;
  },
  
  isServerError: (error) => {
    return error.response?.status >= 500;
  }
};

export default api;