// src/hooks/useNavbarSettings.ts
import { useState } from 'react';
import { getLocalSettings, saveLocalSettings } from '../utils/localStorageUtils';

export const useNavbar = () => {
  const [sticky, setSticky] = useState<boolean>(() => {
    const settings = getLocalSettings();
    return settings.layout.navbar?.sticky ?? true;
  });

  const toggleSticky = () => {
    const newValue = !sticky;
    setSticky(newValue);
    saveLocalSettings({
      layout: {
        ...getLocalSettings().layout,
        navbar: { sticky: newValue }
      }
    });
  };

  return { sticky, toggleSticky };
};