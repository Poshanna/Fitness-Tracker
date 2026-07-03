import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login state on boot
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user profile details from server to keep it in sync
          const response = await api.get('/api/user/profile');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Failed to verify token on boot:', err);
          // Don't auto logout on temporary server issues unless it was a 401 (handled by interceptor)
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken, user: loggedUser } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch full profile (which contains calculated health metrics)
      const profileResponse = await api.get('/api/user/profile');
      const fullUser = profileResponse.data;
      
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', { email, password, name });
      const { accessToken, refreshToken, user: registeredUser } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch full profile (which contains calculated health metrics)
      const profileResponse = await api.get('/api/user/profile');
      const fullUser = profileResponse.data;

      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { 
        success: false, 
        message: err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.' 
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Backend logout call failed, cleaning up locally anyway:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (formData) => {
    try {
      // Form data could be multipart for profilePic
      const response = await api.put('/api/user/profile', formData, {
        headers: {
          'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      });
      
      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
