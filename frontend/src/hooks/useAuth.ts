// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import {
  ensureLocalStorageUtils,
  getAdminAuth,
  setAdminAuth,
  saveLocalSettings,
  type LocalStorageUtils
} from '../utils/localStorageUtils';

// Helper to decode base64url JWT payload safely
const decodeBase64url = (str: string): string => {
  try{
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((43 - base64.length % 4) % 4), '=');
    return atob(padded);
  }catch{
    return '';
  }
};

// Helper - validate JWT and extract payload
const validateAndDecodeJWToken = (token: string | undefined): { user: { id: number; username: string; }; exp: number; } | null => {
  if(!token) return null;

  try{
    const parts = token.split('.');
    if(parts.length !== 3) return null; 

    const payloadStr = decodeBase64url(parts[1]);
    if(!payloadStr) return null; 

    const payload = JSON.parse(payloadStr);

    // check exp in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    if(payload.exp < currentTime) return null; 

    // extract payload with fallback to top level fields if nested user doesnt exist
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

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authDetails, setAuthDetails] = useState<{
    user: { id: number; username: string; } | null;
    exp: number | null;
  }>({user: null, exp: null});

  // ✅ NEW: Centralized token validation & state update
  const validateAndSetAuth = useCallback((token: string): boolean => {
    const result = validateAndDecodeJWToken(token);
    
    if (!result) {
      // Always clean up invalid tokens
      setAdminAuth({
        loggedIn: false,
        token: undefined,
        logoutTime: new Date().toISOString()
      });
      setIsAuthenticated(false);
      setAuthDetails({ user: null, exp: null });
      return false;
    }

    // Valid token - update state
    setAdminAuth({ 
      loggedIn: true, 
      token, 
      loginTime: new Date().toISOString() 
    });
    setIsAuthenticated(true);
    setAuthDetails({ user: result.user, exp: result.exp });
    return true;
  }, []);


  // ✅ LOGOUT: Clear all auth state
  const handleLogout = useCallback(() => {
    setAdminAuth({
      loggedIn: false,
      token: undefined,
      logoutTime: new Date().toISOString()
    });
    setIsAuthenticated(false);
    setAuthDetails({ user: null, exp: null });
  }, []);

  // ✅ AUTO-LOGIN: Silent validation on app load (no user feedback)
  useEffect(() => {
    ensureLocalStorageUtils();
    const stored = getAdminAuth();

    if (stored.loggedIn && stored.token) {
      // Silent validation - no toast feedback
      validateAndSetAuth(stored.token);
      // Note: If invalid, validateAndSetAuth already cleaned up state
    }
  }, [validateAndSetAuth]);

  // ✅ AUTO-LOGOUT: Token expiration handling
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

  // ✅ CREDENTIALS LOGIN: Explicit success/failure for UI feedback
  const loginWithCredentials = useCallback((token: string): boolean => {
    // Explicit validation with return value for UI feedback
    return validateAndSetAuth(token);
  }, [validateAndSetAuth]);

  // ✅ TOKEN REFRESH: For silent token renewal (future use)
  const refreshAuthToken = useCallback((newToken: string): boolean => {
    return validateAndSetAuth(newToken);
  }, [validateAndSetAuth]);

  // ✅ USER REGISTRATION: Save user data to localStorage
  const registerUser = useCallback((userData: Partial<LocalStorageUtils['user']>) => {
    try {
      return saveLocalSettings({ user: userData });
    } catch (error) {
      console.error('Error registering user in localStorage:', error);
      return false;
    }
  }, []);

  return { 
    isAuthenticated, 
    user: authDetails.user, 
    login: loginWithCredentials, // ✅ Renamed for clarity (still works as before)
    logout: handleLogout,
    refreshAuthToken,
    registerUser
  };
};