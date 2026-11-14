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
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          setUser(null);
        }
      } else {
        // Default to Citizen for immediate public interactive preview
        const defaultUser = {
          id: 4,
          email: 'citizen@smartcity.gov',
          full_name: 'Ashutosh Pandey (Citizen)',
          role: 'CITIZEN'
        };
        setUser(defaultUser);
        setToken('demo-token-CITIZEN');
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('smartcity_token', access_token);
      localStorage.setItem('smartcity_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      // Fallback for demo accounts during static preview when backend is not running
      const roleKey = Object.keys(DEMO_ACCOUNTS).find(
        (k) => DEMO_ACCOUNTS[k].email.toLowerCase() === email.toLowerCase()
      );
      if (roleKey) {
        const role = roleKey === 'ADMIN' ? 'ADMIN' : (roleKey === 'DEPARTMENT' ? 'DEPARTMENT_OFFICER' : 'CITIZEN');
        const fallbackUser = {
          id: roleKey === 'ADMIN' ? 1 : (roleKey === 'DEPARTMENT' ? 2 : 4),
          email: email,
          full_name: DEMO_ACCOUNTS[roleKey].label,
          role: role,
          department_id: roleKey === 'DEPARTMENT' ? 1 : null
        };
        localStorage.setItem('smartcity_token', 'demo-token-' + roleKey);
        localStorage.setItem('smartcity_user', JSON.stringify(fallbackUser));
        setToken('demo-token-' + roleKey);
        setUser(fallbackUser);
        return fallbackUser;
      }
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      return res.data;
    } catch (err) {
      // Local registration fallback
      return { id: Date.now(), ...formData };
    }
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
