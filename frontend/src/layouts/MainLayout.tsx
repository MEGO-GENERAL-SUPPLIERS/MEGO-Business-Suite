import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { themes, type ThemeKey } from '../data/theme';
import { 
  getLocalSettings, 
  ensureLocalStorageUtils,
  getAdminAuth,
  setAdminAuth
} from '../utils/localStorageUtils';

/*Layout Components*/
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import QuickAccessPanel from '../components/layout/QuickAccessPanel';

// Main Dashboard Component
export default function Dashboard() {
  // Initialize localStorage on mount
  useEffect(() => {
    ensureLocalStorageUtils();
  }, []);

  const settings = getLocalSettings();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loginPageType, setLoginPageType] = useState(1);
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

  const handleNavigation = (view: string) => {
    setCurrentView(view);
    setViewHistory([...viewHistory, view]);
  };

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

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.3);
        }
      `}</style>

      <Sidebar
        isDark={isDark}
        theme={theme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeSubmenu={activeSubmenu}
        setActiveSubmenu={setActiveSubmenu}
        onNavigate={handleNavigation}
        showFooterPopup={showFooterPopup}
        setShowFooterPopup={setShowFooterPopup}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
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

        <main className="p-4 sm:p-6 lg:p-8 flex-1">{/* flex-1 makes it grow to push footer down */}
          <div className={`${colors.cardBg} ${colors.border} border rounded-2xl p-6 backdrop-blur-xl shadow-2xl`}>
            <h2 className={`${colors.text} text-3xl font-bold mb-2 capitalize bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent`}>
              {currentView.replace('-', ' ')}
            </h2>
            <p className={`${colors.textSecondary} mb-6`}>
              This is the {currentView} view. Add your content here.
            </p>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-col-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className={`${colors.cardBg} ${colors.border} border rounded-xl p-5 backdrop-blur-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${themeColors.primary}`}>
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className={`${colors.text} font-semibold text-lg`}>Card {i}</h3>
                  </div>
                  <p className={`${colors.textSecondary} text-xs`}>Sample content for demonstration purposes</p>
                  <div className="mt-2 pt-2 border-t border-blue-100/20">
                    <div className="flex items-center justify-between">
                      <span className={`${colors.textSecondary} text-xs`}>Status</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-xl font-semibold">Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
