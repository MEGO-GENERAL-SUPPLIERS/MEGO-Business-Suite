export interface ColorScheme {
  navbar: string;
  sidebar: string;
  sidebarHover: string;
  submenuBg: string;
  submenuHover: string;
  text: string;
  textSecondary: string;
  border: string;
  footer: string;
  footerPopup: string;
}

export type ThemeKey = 'blue' | 'cyan' | 'emerald' | 'purple' | 'slate' | 'rose' | 'amber' | 'teal' | 'violet' | 'lime';

export const defaultTheme = {
  light: {
    navbar: 'bg-white/40',
    sidebar: 'bg-white/40',
    sidebarHover: 'hover:bg-blue-100/50',
    submenuBg: 'bg-blue-50/60',
    submenuHover: 'hover:bg-blue-100/70',
    menuItemBgColor: 'bg-slate-400/10 dark:bg-slate-400/90',
    menuItemBgColorHover: 'hover:bg-slate-400/60',
    notificationsBg: 'bg-slate-200/90',
    text: 'text-gray-800',
    textSecondary: 'text-gray-600',
    border: 'border-blue-200/50',
    footer: 'bg-white/60',
    footerPopup: 'bg-white/90'
  },
  dark: {
    navbar: 'bg-slate-900/40',
    sidebar: 'bg-slate-900/50',
    sidebarHover: 'hover:bg-slate-700/90',
    submenuBg: 'bg-slate-800/50',
    submenuHover: 'hover:bg-slate-700/40',
    menuItemBgColor: 'bg-slate-700/20',
    menuItemBgColorHover: 'hover:bg-slate-700/60',
    notificationsBg: 'bg-slate-800/85',
    text: 'text-slate-200/80',
    textSecondary: 'text-gray-400',
    border: 'border-slate-700/50',
    footer: 'bg-slate-900/60',
    footerPopup: 'bg-slate-900/90'
  }
};

export const themeOptions = [
  { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
  { id: 'cyan', name: 'Cyan', color: 'bg-cyan-500' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
  { id: 'slate', name: 'Slate', color: 'bg-slate-500' },
  { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
  { id: 'amber', name: 'Amber', color: 'bg-amber-500' },
  { id: 'teal', name: 'Teal', color: 'bg-teal-500' },
  { id: 'violet', name: 'Violet', color: 'bg-violet-500' },
  { id: 'lime', name: 'Lime', color: 'bg-lime-500' }
];


export const themes = {
  blue: {
    light: {
      primary: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
      accent: 'bg-blue-500',
      accentHover: 'hover:bg-blue-600',
      accentRing: 'ring-blue-500',
      blob1: 'bg-blue-400',
      blob2: 'bg-purple-400',
      blob3: 'bg-indigo-400',
      blob4: 'bg-pink-400'
    },
    dark: {
      primary: 'from-blue-600 to-indigo-700',
      bgGradient: 'from-slate-900 via-blue-900 to-indigo-900',
      accent: 'bg-blue-600',
      accentHover: 'hover:bg-blue-700',
      accentRing: 'ring-blue-500',
      blob1: 'bg-blue-600',
      blob2: 'bg-purple-600',
      blob3: 'bg-indigo-600',
      blob4: 'bg-pink-600'
    }
  },
  cyan: {
    light: {
      primary: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-50 via-blue-50 to-indigo-50',
      accent: 'bg-cyan-500',
      accentHover: 'hover:bg-cyan-600',
      accentRing: 'ring-cyan-500',
      blob1: 'bg-cyan-400',
      blob2: 'bg-blue-400',
      blob3: 'bg-teal-400',
      blob4: 'bg-indigo-400'
    },
    dark: {
      primary: 'from-cyan-600 to-blue-700',
      bgGradient: 'from-slate-00 via-cyan-900 to-sky-800',
      accent: 'bg-cyan-600',
      accentHover: 'hover:bg-cyan-700',
      accentRing: 'ring-cyan-500',
      blob1: 'bg-cyan-600',
      blob2: 'bg-blue-600',
      blob3: 'bg-teal-600',
      blob4: 'bg-indigo-600'
    }
  },
  emerald: {
    light: {
      primary: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
      accent: 'bg-emerald-500',
      accentHover: 'hover:bg-emerald-600',
      accentRing: 'ring-emerald-500',
      blob1: 'bg-emerald-400',
      blob2: 'bg-green-400',
      blob3: 'bg-teal-400',
      blob4: 'bg-lime-400'
    },
    dark: {
      primary: 'from-emerald-600 to-green-700',
      bgGradient: 'from-slate-900 via-emerald-900 to-green-900',
      accent: 'bg-emerald-600',
      accentHover: 'hover:bg-emerald-700',
      accentRing: 'ring-emerald-500',
      blob1: 'bg-emerald-600',
      blob2: 'bg-green-600',
      blob3: 'bg-teal-600',
      blob4: 'bg-lime-600'
    }
  },
  purple: {
    light: {
      primary: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 via-pink-50 to-fuchsia-50',
      accent: 'bg-purple-500',
      accentHover: 'hover:bg-purple-600',
      accentRing: 'ring-purple-500',
      blob1: 'bg-purple-400',
      blob2: 'bg-pink-400',
      blob3: 'bg-fuchsia-400',
      blob4: 'bg-violet-400'
    },
    dark: {
      primary: 'from-purple-600 to-pink-700',
      bgGradient: 'from-slate-900 via-purple-900 to-pink-900',
      accent: 'bg-purple-600',
      accentHover: 'hover:bg-purple-700',
      accentRing: 'ring-purple-500',
      blob1: 'bg-purple-600',
      blob2: 'bg-pink-600',
      blob3: 'bg-fuchsia-600',
      blob4: 'bg-violet-600'
    }
  },
  slate: {
    light: {
      primary: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 via-gray-50 to-zinc-50',
      accent: 'bg-slate-500',
      accentHover: 'hover:bg-slate-600',
      accentRing: 'ring-slate-500',
      blob1: 'bg-slate-400',
      blob2: 'bg-gray-400',
      blob3: 'bg-zinc-400',
      blob4: 'bg-neutral-400'
    },
    dark: {
      primary: 'from-slate-600 to-gray-700',
      bgGradient: 'from-slate-900 via-gray-900 to-zinc-900',
      accent: 'bg-slate-600',
      accentHover: 'hover:bg-slate-700',
      accentRing: 'ring-slate-500',
      blob1: 'bg-slate-600',
      blob2: 'bg-gray-600',
      blob3: 'bg-zinc-600',
      blob4: 'bg-neutral-600'
    }
  },
  rose: {
    light: {
      primary: 'from-rose-500 to-pink-600',
      bgGradient: 'from-rose-50 via-pink-50 to-red-50',
      accent: 'bg-rose-500',
      accentHover: 'hover:bg-rose-600',
      accentRing: 'ring-rose-500',
      blob1: 'bg-rose-400',
      blob2: 'bg-pink-400',
      blob3: 'bg-red-400',
      blob4: 'bg-fuchsia-400'
    },
    dark: {
      primary: 'from-rose-600 to-pink-700',
      bgGradient: 'from-slate-900 via-rose-900 to-pink-900',
      accent: 'bg-rose-600',
      accentHover: 'hover:bg-rose-700',
      accentRing: 'ring-rose-500',
      blob1: 'bg-rose-600',
      blob2: 'bg-pink-600',
      blob3: 'bg-red-600',
      blob4: 'bg-fuchsia-600'
    }
  },
  amber: {
    light: {
      primary: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 via-orange-50 to-yellow-50',
      accent: 'bg-amber-500',
      accentHover: 'hover:bg-amber-600',
      accentRing: 'ring-amber-500',
      blob1: 'bg-amber-400',
      blob2: 'bg-orange-400',
      blob3: 'bg-yellow-400',
      blob4: 'bg-red-400'
    },
    dark: {
      primary: 'from-amber-600 to-orange-700',
      bgGradient: 'from-slate-900 via-amber-900 to-orange-900',
      accent: 'bg-amber-600',
      accentHover: 'hover:bg-amber-700',
      accentRing: 'ring-amber-500',
      blob1: 'bg-amber-600',
      blob2: 'bg-orange-600',
      blob3: 'bg-yellow-600',
      blob4: 'bg-red-600'
    }
  },
  teal: {
    light: {
      primary: 'from-teal-500 to-cyan-600',
      bgGradient: 'from-teal-50 via-cyan-50 to-blue-50',
      accent: 'bg-teal-500',
      accentHover: 'hover:bg-teal-600',
      accentRing: 'ring-teal-500',
      blob1: 'bg-teal-400',
      blob2: 'bg-cyan-400',
      blob3: 'bg-blue-400',
      blob4: 'bg-emerald-400'
    },
    dark: {
      primary: 'from-teal-600 to-cyan-700',
      bgGradient: 'from-slate-900 via-teal-900 to-cyan-900',
      accent: 'bg-teal-600',
      accentHover: 'hover:bg-teal-700',
      accentRing: 'ring-teal-500',
      blob1: 'bg-teal-600',
      blob2: 'bg-cyan-600',
      blob3: 'bg-blue-600',
      blob4: 'bg-emerald-600'
    }
  },
  violet: {
    light: {
      primary: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 via-purple-50 to-indigo-50',
      accent: 'bg-violet-500',
      accentHover: 'hover:bg-violet-600',
      accentRing: 'ring-violet-500',
      blob1: 'bg-violet-400',
      blob2: 'bg-purple-400',
      blob3: 'bg-indigo-400',
      blob4: 'bg-blue-400'
    },
    dark: {
      primary: 'from-violet-600 to-purple-700',
      bgGradient: 'from-slate-900 via-violet-900 to-purple-900',
      accent: 'bg-violet-600',
      accentHover: 'hover:bg-violet-700',
      accentRing: 'ring-violet-500',
      blob1: 'bg-violet-600',
      blob2: 'bg-purple-600',
      blob3: 'bg-indigo-600',
      blob4: 'bg-blue-600'
    }
  },
  lime: {
    light: {
      primary: 'from-lime-500 to-green-600',
      bgGradient: 'from-lime-50 via-green-50 to-emerald-50',
      accent: 'bg-lime-500',
      accentHover: 'hover:bg-lime-600',
      accentRing: 'ring-lime-500',
      blob1: 'bg-lime-400',
      blob2: 'bg-green-400',
      blob3: 'bg-emerald-400',
      blob4: 'bg-teal-400'
    },
    dark: {
      primary: 'from-lime-600 to-green-700',
      bgGradient: 'from-slate-900 via-lime-900 to-green-900',
      accent: 'bg-lime-600',
      accentHover: 'hover:bg-lime-700',
      accentRing: 'ring-lime-500',
      blob1: 'bg-lime-600',
      blob2: 'bg-green-600',
      blob3: 'bg-emerald-600',
      blob4: 'bg-teal-600'
    }
  }
};
