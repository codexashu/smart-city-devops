import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  CITIZEN: { email: 'citizen@smartcity.gov', password: 'Citizen@12345', label: 'Citizen (Ashutosh)' },
  ADMIN: { email: 'admin@smartcity.gov', password: 'Admin@12345', label: 'Municipal Admin' },
  DEPARTMENT: { email: 'officer.roads@smartcity.gov', password: 'Officer@12345', label: 'Roads Officer' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartcity_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smartcity_token');
      const storedUser = localStorage.getItem('smartcity_user');
      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('smartcity_token', access_token);
    localStorage.setItem('smartcity_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('smartcity_token');
    localStorage.removeItem('smartcity_user');
    setUser(null);
    setToken(null);
  };

  const switchDemoAccount = async (roleKey) => {
    const account = DEMO_ACCOUNTS[roleKey];
    if (account) {
      return await login(account.email, account.password);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
