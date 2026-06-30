// src/hooks/useAppTheme.ts
import { useState, useEffect } from 'react';
import {
  ensureLocalStorageUtils,
  getLocalSettings,
  setTheme as saveAppearanceTheme,
  saveLocalSettings,
  setUITheme as saveUITheme,
} from '../utils/localStorageUtils';

export type UITheme = 'blue' | 'cyan' | 'emerald' | 'purple' | 'slate' | 'rose' | 'amber' | 'teal' | 'violet' | 'lime';

export const useAppTheme = () => {
  ensureLocalStorageUtils();

  const initial = getLocalSettings().theme;
  const [appearance, setAppearance] = useState<'light' | 'dark'>(initial.name);
  const [uiTheme, setUiTheme] = useState<UITheme>(initial.ui as UITheme || 'blue');

  // Sync appearance to <html class="dark">
  useEffect(() => {
    if (appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appearance]);

  const setAppearanceTheme = (name: 'light' | 'dark') => {
    setAppearance(name);
    saveAppearanceTheme(name);
    saveLocalSettings({ theme: { name, ui: uiTheme }});
  };

  const setUIThemeWrapper = (ui: UITheme) => {
    setUiTheme(ui);
    saveUITheme(ui);
    saveLocalSettings({ theme: { name: appearance, ui}});
  };

  return {
    appearance,
    uiTheme,
    setAppearanceTheme,
    setUITheme: setUIThemeWrapper,
  };
};