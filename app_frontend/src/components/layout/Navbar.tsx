import { useState, useRef, useEffect } from "react";
import { getLocalSettings, saveLocalSettings } from "../../utils/localStorageUtils";
import { themes, defaultTheme, type ThemeKey } from "../../data/theme";
import { appConfigs } from "../../data/appConfigs";
import { PanelLeft, ArrowLeftIcon, Sun, Moon, Zap, Bell, UserCircleIcon, Settings, LogOut } from "lucide-react";
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ isDark, setIsDark, theme, setTheme, setIsOpen, onBack, canGoBack, showQuickAccess, setShowQuickAccess, isAtRoot, isExpanded, setIsExpanded } : {
  isDark: boolean,
  setIsDark: (dark: boolean) => void,
  theme: ThemeKey,
  setTheme: (theme: ThemeKey) => void,
  setIsOpen: (open: boolean) => void,
  onBack: () => void,
  canGoBack: boolean,
  showQuickAccess: boolean,
  setShowQuickAccess: (show: boolean) => void,
  isAtRoot: boolean,
  isExpanded: boolean,
  setIsExpanded: (expanded: boolean) => void
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const themeColors = themes[theme][isDark ? 'dark' : 'light'];
  const { logout } = useAuth();
  
  const baseColors = defaultTheme;
   const settings = getLocalSettings(); 

  const colors = isDark ? baseColors.dark : baseColors.light;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notificationList = [
    { id: 1, title: 'New user registered', message: 'John Doe joined the platform', time: '5 mins ago', read: false },
    { id: 2, title: 'Report generated', message: 'Monthly analytics report is ready', time: '1 hour ago', read: false },
    { id: 3, title: 'System update', message: 'New version 2.1.0 available', time: '2 hours ago', read: true },
    { id: 4, title: 'Comment received', message: 'Sarah commented on your post', time: '3 hours ago', read: true },
    { id: 5, title: 'Task completed', message: 'Data import finished successfully', time: '4 hours ago', read: true }
  ];

  const unreadCount = notificationList.filter(n => !n.read).length;

  const handleProfileItemClick = () => {
    setShowProfile(false);
  };

  const handleLogoutClick = () => {
    logout();
  };

  const handleNotificationClick = () => {
    setShowNotifications(false);
  };

  const toggleSidebarExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    const settings = getLocalSettings();
    saveLocalSettings({
      ...settings,
      layout: {
        ...settings.layout,
        sidebar: { ...settings.layout.sidebar, expanded: newExpanded }
      }
    });
  };

  return (
    <nav className={`${colors.navbar} ${colors.border} border-b backdrop-blur-xl sticky top-0 z-30 shadow-lg`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className={`lg:hidden ${colors.text} p-2 rounded-lg ${colors.menuItemBgColorHover} ${colors.menuItemBgColor} transition-all duration-200`}
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <button
            onClick={toggleSidebarExpand}
            className={`hidden lg:flex ${colors.text} p-2 rounded-lg ${colors.menuItemBgColorHover} ${colors.menuItemBgColor} transition-all duration-200 items-center gap-2`}
            title={isExpanded ? "Minimize sidebar" : "Expand sidebar"}
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={`${isAtRoot ? 'opacity-20' : colors.text} p-2 rounded-lg ${!isAtRoot && colors.menuItemBgColorHover} ${colors.menuItemBgColor} disabled:cursor-not-allowed transition-all duration-200`}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          {/*Logo and Appname */}
          <div className="hidden sm:flex items-center gap-3">
            {settings.user?.company?.logo_url && (
              <img src={settings.user.company.logo_url} alt="Company Logo" className="h-8 w-8 rounded-md object-cover shadow-sm" />
            )}
            <h1 className={`${colors.text} font-bold text-lg bg-gradient-to-r ${themeColors.primary} bg-clip-text text-transparent`}>
              {settings.user?.company?.name || appConfigs.appName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsDark(!isDark);
              const settings = getLocalSettings();
              saveLocalSettings({
                ...settings,
                theme: { ...settings.theme, name: !isDark ? 'dark' : 'light' }
              });
            }}
            className={`${colors.text} p-2 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} transition-all duration-200 hover:scale-105`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowQuickAccess(!showQuickAccess)}
            className={`${colors.text} p-2 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} transition-all duration-200 hover:scale-105`}
          >
            <Zap className="w-5 h-5" />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`${colors.text} p-2 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} relative transition-all duration-200 hover:scale-105`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-gradient-to-r ${themeColors.primary} text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg`}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 ${colors.notificationsBg} ${colors.border} border rounded-lg shadow-2xl backdrop-blur-xl overflow-hidden z-50`}>
                <div className="p-4 border-b border-blue-100/20">
                  <h3 className={`${colors.text} font-semibold`}>Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/20">
                  {notificationList.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={handleNotificationClick}
                      className={`w-full text-left px-4 py-3 ${colors.notificationsBg} transition-all duration-200 border-b border-b-blue-200/60 border-blue-100/20 ${!notif.read ? `${themeColors.accent}/5` : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.read ? themeColors.accent : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`${colors.text} text-sm font-medium truncate`}>{notif.title}</p>
                          <p className={`${colors.textSecondary} text-xs mt-0.5`}>{notif.message}</p>
                          <p className={`${colors.textSecondary} text-xs mt-1 opacity-60`}>{notif.time}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className={`p-3 border-t ${colors.border}`}>
                  <button 
                    onClick={handleNotificationClick}
                    className={`w-full text-center text-sm ${colors.text} font-medium ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} py-2 rounded-lg transition-all duration-200`}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`${colors.text} p-2 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} transition-all duration-200 hover:scale-105`}
            >
              <UserCircleIcon className="w-5 h-5" />
            </button>

            {showProfile && (
              <div className={`absolute right-0 mt-2 w-48 ${colors.submenuBg} ${colors.border} border rounded-md shadow-2xl backdrop-blur-xl overflow-hidden z-50`}>
                <button 
                  onClick={handleProfileItemClick}
                  className={`w-full text-left px-4 py-3 ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} ${colors.text} text-sm flex items-center gap-2 transition-all duration-200`}
                >
                  <UserCircleIcon className="w-4 h-4" />
                  Profile
                </button>
                <button 
                  onClick={handleProfileItemClick}
                  className={`w-full text-left px-4 py-3 ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} ${colors.text} text-sm flex items-center gap-2 transition-all duration-200`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className={`${colors.border} border-t`} />
                <button 
                  onClick={handleLogoutClick}
                  className={`w-full text-left px-4 py-3 ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} text-red-500 text-sm flex items-center gap-2 transition-all duration-200`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;