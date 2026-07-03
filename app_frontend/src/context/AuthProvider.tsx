// src/context/AuthProvider.tsx
import React, { useState, useEffect, useCallback, createContext } from 'react';
import {
  ensureLocalStorageUtils,
  getAdminAuth,
  setAdminAuth,
  saveLocalSettings,
  type LocalStorageUtils
} from '../utils/localStorageUtils';

const decodeBase64url = (str: string): string => {
  try{
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((43 - base64.length % 4) % 4), '=');
    return atob(padded);
  }catch{
    return '';
  }
};

const validateAndDecodeJWToken = (token: string | undefined): { user: { id: number; username: string; }; exp: number; } | null => {
  if(!token) return null;

  try{
    const parts = token.split('.');
    if(parts.length !== 3) return null; 

    const payloadStr = decodeBase64url(parts[1]);
    if(!payloadStr) return null; 

    const payload = JSON.parse(payloadStr);

    const currentTime = Math.floor(Date.now() / 1000);
    if(payload.exp < currentTime) return null; 

    const user = payload.user 
      ? { id: payload.user.id, username: payload.user.username }
      : (payload.sub || payload.id || payload.userId) 
        ? { 
            id: payload.sub || payload.id || payload.userId, 
            username: payload.username || payload.username || 'User'
          } 
        : null;

    if (!user?.id || !user?.username) return null; 

    return { user, exp: payload.exp };

  } catch {
    return null;
  }
};

export interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: { id: number; username: string; } | null;
  login: (token: string) => boolean;
  logout: () => void;
  refreshAuthToken: (newToken: string) => boolean;
  registerUser: (userData: Partial<LocalStorageUtils['user']>) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authDetails, setAuthDetails] = useState<{
    user: { id: number; username: string; } | null;
    exp: number | null;
  }>({user: null, exp: null});

  const validateAndSetAuth = useCallback((token: string): boolean => {
    const result = validateAndDecodeJWToken(token);
    
    if (!result) {
      setAdminAuth({
        loggedIn: false,
        token: undefined,
        logoutTime: new Date().toISOString()
      });
      setIsAuthenticated(false);
      setAuthDetails({ user: null, exp: null });
      return false;
    }

    setAdminAuth({ 
      loggedIn: true, 
      token, 
      loginTime: new Date().toISOString() 
    });
    setIsAuthenticated(true);
    setAuthDetails({ user: result.user, exp: result.exp });
    return true;
  }, []);

  const handleLogout = useCallback(() => {
    setAdminAuth({
      loggedIn: false,
      token: undefined,
      logoutTime: new Date().toISOString()
    });
    setIsAuthenticated(false);
    setAuthDetails({ user: null, exp: null });
  }, []);

  useEffect(() => {
    ensureLocalStorageUtils();
    const stored = getAdminAuth();

    if (stored.loggedIn && stored.token) {
      validateAndSetAuth(stored.token);
    }
    setIsInitializing(false);
  }, [validateAndSetAuth]);

  useEffect(() => {
    if (!authDetails.exp || !isAuthenticated) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeoutMs = (authDetails.exp - currentTime) * 1000;

    if (timeoutMs <= 0) {
      handleLogout();
      return;
    }

    const timer = setTimeout(handleLogout, timeoutMs);
    return () => clearTimeout(timer);
  }, [isAuthenticated, authDetails.exp, handleLogout]);

  const loginWithCredentials = useCallback((token: string): boolean => {
    return validateAndSetAuth(token);
  }, [validateAndSetAuth]);

  const refreshAuthToken = useCallback((newToken: string): boolean => {
    return validateAndSetAuth(newToken);
  }, [validateAndSetAuth]);

  const registerUser = useCallback((userData: Partial<LocalStorageUtils['user']>) => {
    try {
      return saveLocalSettings({ user: userData });
    } catch (error) {
      console.error('Error registering user in localStorage:', error);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isInitializing,
      user: authDetails.user, 
      login: loginWithCredentials, 
      logout: handleLogout,
      refreshAuthToken,
      registerUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};