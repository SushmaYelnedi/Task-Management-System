import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (token) {
          console.debug('AuthContext: loaded JWT from sessionStorage:', token);
        }
        const userRole = sessionStorage.getItem('userRole');
        const userData = sessionStorage.getItem('userData');

        if (token && userRole && userData) {
          const parsedUserData = JSON.parse(userData);
          
          const userObj = {
            ...parsedUserData,
            token,
            role: userRole
          };
          setUser(userObj);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData) => {
    const userWithToken = {
      ...userData,
      token: sessionStorage.getItem('authToken'),
      role: userData.role
    };
    setUser(userWithToken);
  };

  const updateUser = (updatedData) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updatedData
      };
      setUser(updatedUser);
      
      // Update sessionStorage with new data
      sessionStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    // Clear all auth-related data from sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userData');
    
    // Clear any other application data that might be cached
    sessionStorage.removeItem('cachedTasks');
    sessionStorage.removeItem('cachedSelfTasks');
    sessionStorage.removeItem('dashboardData');
    
    // Also clear localStorage for any legacy data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('cachedTasks');
    localStorage.removeItem('cachedSelfTasks');
    localStorage.removeItem('dashboardData');
    
    // Clear user state
    setUser(null);
    

  };

  const isAuthenticated = () => {
    return !!user && !!user.token;
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;