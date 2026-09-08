import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './components/Home';

const DashboardRouter = () => {
  const { user } = useAuth();
  const role = (user?.role || '').toString().toLowerCase();
  
  if (role === 'admin') return <AdminDashboard />;
  if (role === 'manager') return <ManagerDashboard />;
  return <UserDashboard />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/signin" element={
        isAuthenticated() ? 
        <Navigate to="/dashboard" replace /> : 
        <Login />
      } />
      <Route path="/signup" element={
        isAuthenticated() ? 
        <Navigate to="/dashboard" replace /> : 
        <SignUp />
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardRouter />
        </ProtectedRoute>
      } />
      
      {/* Legacy route redirects for better UX */}
      <Route path="/tasks" element={<Navigate to="/dashboard" replace />} />
      <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
      <Route path="/self-tasks" element={<Navigate to="/dashboard" replace />} />
      <Route path="/create-task" element={<Navigate to="/dashboard" replace />} />
      <Route path="/assigned-tasks" element={<Navigate to="/dashboard" replace />} />
      <Route path="/team" element={<Navigate to="/dashboard" replace />} />
      <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
      
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;