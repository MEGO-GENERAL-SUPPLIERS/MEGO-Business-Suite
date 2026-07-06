// src/utils/localStorageUtils.ts
export const STORAGE_KEY = 'mego-business-suite';
export const USER_STORAGE_KEY = 'mego-user';
import { type ICompany } from '../types/ICompanyInfo';
import type { IUser } from '../types/IUser';

export interface LocalStorageUtils {
  theme: {
    name: 'light' | 'dark';
    ui?: string;
  };
  user: IUser | null;
  auth: Record<string, unknown> | null;
  layout: {
    sidebar: Record<string, unknown> | null;
    navbar: NavbarSettings | null;
    footer: Record<string, unknown> | null;
  };
  api: IApiConfig;
}

export interface UserAuth {
  loggedIn: boolean;
  loginTime?: string;
  logoutTime?: string;
  token?: string;
}

export interface NavbarSettings {
  sticky: boolean;
}

export interface IApiConfig{
  protocol: 'http' | 'https',
  host: string;
  port: string;
  baseUrl?: string;
  timeout?: number; 
  withCredentials?: boolean;
}

export const defaultSettings: LocalStorageUtils = {
  theme: { name: 'dark', ui: 'cyan' },
  user: null,
  auth: null,
  layout: { 
    sidebar: { expanded: false, submenuAsColumn: true }, 
    navbar: { sticky: true }, 
    footer: { sticky: true }
  },
  api: {
    protocol: 'http',
    host: 'localhost',
    port: '3002',
    baseUrl: '/api/v1',
    timeout: 30000,
    withCredentials: false
  }
};

const defaultUserAuth: UserAuth = {
  loggedIn: false,
};

// ====== SSR-SAFE STORAGE ACCESS ======
export const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const ensureLocalStorageUtils = (): void => {
  if (!isBrowser()) return; // ✅ Added SSR check
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(USER_STORAGE_KEY)) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUserAuth));
    }
  } catch (e) {
    console.error('Failed to initialize localStorage', e);
  }
};

export const getLocalSettings = (): LocalStorageUtils => {
  if(!isBrowser()) return defaultSettings; // ✅ Added () to invoke the function

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if(!stored) return defaultSettings; 

    const parsed = JSON.parse(stored);
    if (
      parsed.theme &&
      (parsed.theme.name === 'light' || parsed.theme.name === 'dark')
    ) {
      return {
        ...defaultSettings,
        ...parsed,
        api: { ...defaultSettings.api, ...parsed.api },
        theme: { ...defaultSettings.theme, ...parsed.theme },
        layout: { 
          ...defaultSettings.layout, 
          ...parsed.layout,
          navbar: parsed.layout?.navbar 
            ? { ...defaultSettings.layout.navbar, ...parsed.layout.navbar } 
            : defaultSettings.layout.navbar
        },
      };
    }
    
  } catch (e) {
    console.warn('[localStorage] Failed to parse localStorage. Defaults Settings adopted', e);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
};

export const saveLocalSettings = (settings: Partial<LocalStorageUtils>): boolean => {
  if(!isBrowser()) return false; // ✅ Added () to invoke the function

  try {
    const current = getLocalSettings();
    const updated = { ...current, ...settings };

    if(!['light', 'dark'].includes(updated.theme.name)){
      throw new Error('Invalid theme value');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('[localStorage] Failed to save local settings', e);
    return false;
  }
};

export const updateApiConfig = (updates: Partial<IApiConfig>): boolean => {
  if (!isBrowser()) return false; // ✅ Added SSR check
  try {
    const current = getApiConfig();
    const normalized: IApiConfig = {
      ...current,
      ...updates,
      baseUrl: updates.baseUrl 
        ? updates.baseUrl
            .replace(/\/+$/, '')
            .replace(/^([^/])/, '/$1')
        : current.baseUrl
    };
    
    if (updates.port && !/^\d{1,5}$/.test(normalized.port)) {
      console.error('[API Config] Invalid port format');
      return false;
    }
    
    if (updates.protocol && !['http', 'https'].includes(normalized.protocol)) {
      console.error('[API Config] Invalid protocol');
      return false;
    }
    
    return saveLocalSettings({ api: normalized });
  } catch (e) {
    console.error('[API Config] Update failed', e);
    return false;
  }
};

export const getApiConfig = (): IApiConfig => getLocalSettings().api;

export const setTheme = (name: 'light' | 'dark'): void => {
  saveLocalSettings({ theme: { name } });
};

export const getUserAuth = (): UserAuth => {
  if (!isBrowser()) return defaultUserAuth; // ✅ Added SSR safety check
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.loggedIn === 'boolean') {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to parse user auth:', error);
  }
  return defaultUserAuth;
};

export const setUserAuth = (auth: Partial<UserAuth>) => {
  if (!isBrowser()) return; // ✅ Added SSR safety check
  try {
    const current = getUserAuth();
    const updated = { ...current, ...auth };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save admin auth:', error);
  }
};

export const setUITheme = (ui: string): void => {
  const current = getLocalSettings();
  saveLocalSettings({ theme: { ...current.theme, ui } });
};