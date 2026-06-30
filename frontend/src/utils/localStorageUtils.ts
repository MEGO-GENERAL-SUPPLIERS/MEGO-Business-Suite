// src/utils/localStorageUtils.ts
export const STORAGE_KEY = 'mego-admin-pro';
export const ADMIN_STORAGE_KEY = 'mego-admin';

export interface LocalStorageUtils {
  theme: {
    name: 'light' | 'dark';
    ui?: string;
  };
  user: Record<string, unknown> | null;
  auth: Record<string, unknown> | null;
  layout: {
    sidebar: Record<string, unknown> | null;
    navbar: NavbarSettings | null;
    footer: Record<string, unknown> | null;
  };
  api: IApiConfig;
}

export interface AdminAuth {
  loggedIn: boolean;
  loginTime?: string;
  logoutTime?: string;
  token?: string; // e.g., JWT
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
  user: { id: 1, name: 'Admin' },
  auth: null,
  layout: { 
    sidebar: { expanded: false, submenuAsColumn: true }, 
    navbar: { sticky: true }, 
    footer: { sticky: true }
  },
  api: {
    protocol: 'http',
    host: 'localhost',
    port: '3000',
    baseUrl: '/api/v1',
    timeout: 30000,
    withCredentials: false
  }
};

const defaultAdminAuth: AdminAuth = {
  loggedIn: false,
};

// ====== SSR-SAFE STORAGE ACCESS ======
export const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Ensure localStorage is initialized with defaults if missing
export const ensureLocalStorageUtils = (): void => {
  try {
    // Initialize main settings
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    }
    // Initialize admin auth
    if (!localStorage.getItem(ADMIN_STORAGE_KEY)) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(defaultAdminAuth));
    }
  } catch (e) {
    console.error('Failed to initialize localStorage', e);
  }
};

// Get settings from localStorage or return defaults
export const getLocalSettings = (): LocalStorageUtils => {
  if(!isBrowser) return defaultSettings; 

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
        // user: { ...defaultSettings.user, ...parsed.user },
        // auth: { ...defaultSettings.auth, ...parsed.auth }
      };
    }
    
  } catch (e) {
    console.warn('[localStorage] Failed to parse localStorage. Defaults Settings adopted', e);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
};

// Save settings to localStorage
export const saveLocalSettings = (settings: Partial<LocalStorageUtils>): boolean => {
  if(!isBrowser) return false;

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

// Update Api Config
export const updateApiConfig = (updates: Partial<IApiConfig>): boolean => {
  try {
    const current = getApiConfig();
    const normalized: IApiConfig = {
      ...current,
      ...updates,
      // Auto-normalize baseUrl (ensure leading slash, no trailing slash)
      baseUrl: updates.baseUrl 
        ? updates.baseUrl
            .replace(/\/+$/, '')        // Remove trailing slashes
            .replace(/^([^/])/, '/$1')  // Ensure leading slash
        : current.baseUrl
    };
    
    // Port validation
    if (updates.port && !/^\d{1,5}$/.test(normalized.port)) {
      console.error('[API Config] Invalid port format');
      return false;
    }
    
    // Protocol validation
    if (updates.protocol && !['http', 'https'].includes(normalized.protocol)) {
      console.error('[API Config] Invalid protocol');
      return false;
    }
    
    // Save to localStorage
    return saveLocalSettings({ api: normalized });
  } catch (e) {
    console.error('[API Config] Update failed', e);
    return false;
  }
};

// Api Config
export const getApiConfig = (): IApiConfig => getLocalSettings().api;

// Update only the theme
export const setTheme = (name: 'light' | 'dark'): void => {
  saveLocalSettings({ theme: { name } });
};

// Admin Auth utilities
export const getAdminAuth = (): AdminAuth => {
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.loggedIn === 'boolean') {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to parse admin auth:', error);
  }
  return defaultAdminAuth;
};

export const setAdminAuth = (auth: Partial<AdminAuth>) => {
  try {
    const current = getAdminAuth();
    const updated = { ...current, ...auth };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save admin auth:', error);
  }
};

export const setUITheme = (ui: string): void => {
  const current = getLocalSettings();
  saveLocalSettings({ theme: { ...current.theme, ui } });
};