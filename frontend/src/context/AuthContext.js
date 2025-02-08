import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedTokens = localStorage.getItem('email_tokens');
      const savedUser = localStorage.getItem('email_user');
      if (savedTokens) {
        setTokens(JSON.parse(savedTokens));
      }
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Failed to parse saved data:', error);
      localStorage.removeItem('email_tokens');
      localStorage.removeItem('email_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (tokenData, userData) => {
    try {
      setTokens(tokenData);
      setUser(userData);
      localStorage.setItem('email_tokens', JSON.stringify(tokenData));
      localStorage.setItem('email_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Failed to save auth data:', error);
      return false;
    }
  };

  const logout = () => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem('email_tokens');
    localStorage.removeItem('email_user');
  };

  return (
    <AuthContext.Provider value={{ tokens, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
