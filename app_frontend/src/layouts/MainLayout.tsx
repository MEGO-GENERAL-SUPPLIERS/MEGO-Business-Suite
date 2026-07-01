import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { themes, type ThemeKey } from '../data/theme';
import { 
  getLocalSettings, 
  ensureLocalStorageUtils
} from '../utils/localStorageUtils';

/*Layout Components*/
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import QuickAccessPanel from '../components/layout/QuickAccessPanel';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { Outlet } from 'react-router-dom';

// Main Dashboard Component
export default function Dashboard() {
  // Initialize localStorage on mount
  useEffect(() => {
    ensureLocalStorageUtils();
  }, []);

  const settings = getLocalSettings();
  const [isDark, setIsDark] = useState(settings.theme.name === 'dark');
  const [theme, setTheme] = useState<ThemeKey>((settings.theme.ui as ThemeKey) || 'cyan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(
    typeof settings.layout.sidebar?.expanded === 'boolean' 
      ? settings.layout.sidebar.expanded 
      : false
  );
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [showFooterPopup, setShowFooterPopup] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [viewHistory, setViewHistory] = useState<string[]>(['overview']);
  const { navigateTo } = useAppNavigation(); 

  const themeColors = themes[theme][isDark ? 'dark' : 'light'];
  const baseColors = {
    light: {
      pageBg: `bg-gradient-to-br ${themeColors.bgGradient}`,
      cardBg: 'bg-white/50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      border: 'border-blue-200/50'
    },
    dark: {
      pageBg: `bg-gradient-to-br ${themeColors.bgGradient}`,
      cardBg: 'bg-slate-800/50',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      border: 'border-slate-700/50'
    }
  };
  
  const colors = isDark ? baseColors.dark : baseColors.light;

  const handleBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop();
      setViewHistory(newHistory);
      setCurrentView(newHistory[newHistory.length - 1]);
    }
  };

  const isAtRoot = viewHistory.length === 1;

  return (
    <div className={`min-h-screen ${colors.pageBg} transition-colors duration-500 relative overflow-hidden`}>
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 -left-40 w-80 h-80 ${themeColors.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}></div>
        <div className={`absolute top-0 -right-40 w-80 h-80 ${themeColors.blob2} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}></div>
        <div className={`absolute -bottom-40 left-20 w-80 h-80 ${themeColors.blob3} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}></div>
        <div className={`absolute bottom-20 right-20 w-80 h-80 ${themeColors.blob4} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000`}></div>
      </div>

      <Sidebar
        isDark={isDark}
        theme={theme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeSubmenu={activeSubmenu}
        setActiveSubmenu={setActiveSubmenu}
        showFooterPopup={showFooterPopup}
        setShowFooterPopup={setShowFooterPopup}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        onNavigate={navigateTo}
      />

      <div className={`transition-all duration-300 relative z-10 min-h-screen flex flex-col ${
        activeSubmenu 
          ? (isExpanded ? 'lg:pl-[484px]' : 'lg:pl-[306px]')
          : (isExpanded ? 'lg:pl-60' : 'lg:pl-16')
      }`}>
        <Navbar
          isDark={isDark}
          setIsDark={setIsDark}
          theme={theme}
          setTheme={setTheme}
          setIsOpen={setIsSidebarOpen}
          onBack={handleBack}
          canGoBack={viewHistory.length > 1}
          showQuickAccess={showQuickAccess}
          setShowQuickAccess={setShowQuickAccess}
          isAtRoot={isAtRoot}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />

        <main className="p-2 sm:p-3 lg:p-2 flex-1 dark:text-white">
          <Outlet />
        </main>

        <Footer isDark={isDark} />
      </div>

      <QuickAccessPanel
        isDark={isDark}
        setIsDark={setIsDark}
        theme={theme}
        setTheme={setTheme}
        isOpen={showQuickAccess}
        setIsOpen={setShowQuickAccess}
      />
    </div>
  );
}
