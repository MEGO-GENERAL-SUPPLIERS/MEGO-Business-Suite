import { useState, useRef, useEffect } from 'react';
import { getLocalSettings } from '../../utils/localStorageUtils';
import { type ThemeKey, themes, defaultTheme, type ColorScheme } from '../../data/theme';
import { menuItems, footerMenuItems, type MenuItem } from '../../data/menuData';
import { IoArrowBackOutline } from 'react-icons/io5';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { useAppNavigation } from '../../hooks/useAppNavigation';


const Sidebar = ({ isDark, theme, isOpen, setIsOpen, activeSubmenu, setActiveSubmenu, onNavigate, showFooterPopup, setShowFooterPopup, isExpanded, setIsExpanded } : { 
  isDark: boolean,
  theme: ThemeKey,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  activeSubmenu: string | null,
  setActiveSubmenu: (menu: string | null) => void,
  onNavigate: (id: string) => void,
  showFooterPopup: boolean,
  setShowFooterPopup: (show: boolean) => void,
  isExpanded: boolean,
  setIsExpanded: (expanded: boolean) => void
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [footerPopupPos, setFooterPopupPos] = useState<{ left: number; bottom: number } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const footerPopupRef = useRef<HTMLDivElement>(null);
  const footerButtonRef = useRef<HTMLButtonElement>(null);
  const settings = getLocalSettings();
  const submenuAsColumn = settings.layout.sidebar?.submenuAsColumn ?? true;
  const themeColors = themes[theme][isDark ? 'dark' : 'light'];
  const { navigateTo } = useAppNavigation();
  
  const baseColors = defaultTheme;
  
  const colors = isDark ? baseColors.dark : baseColors.light;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showFooterPopup && !isMobile && footerButtonRef.current) {
      const rect = footerButtonRef.current.getBoundingClientRect();
      setFooterPopupPos({
        left: rect.right + 8,
        bottom: window.innerHeight - rect.bottom + 12,
      });
    }
  }, [showFooterPopup, isMobile, isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      if (showFooterPopup && footerPopupRef.current && !footerPopupRef.current.contains(target)) {
        const footerButton = sidebarRef.current?.querySelector('[data-footer-button]');
        if (footerButton && !footerButton.contains(target)) {
          setShowFooterPopup(false);
        }
      }
      
      // Check if click is outside sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        if (isMobile && isOpen) {
          setIsOpen(false);
          setActiveSubmenu(null);
        } else if (!isMobile && activeSubmenu && submenuAsColumn) {
          if (submenuRef.current) {
            const rect = submenuRef.current.getBoundingClientRect();
            if (e.clientX > rect.right) {
              setActiveSubmenu(null);
            }
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, activeSubmenu, submenuAsColumn, showFooterPopup, setIsOpen, setActiveSubmenu, setShowFooterPopup]);

  const handleMenuClick = (itemId: string) => {
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
  };

  const closeAll = () => {
    setActiveSubmenu(null);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleFooterItemClick = (itemId: string) => {
    navigateTo(itemId);
    setShowFooterPopup(false);
    closeAll();
  };

  const shouldShowExpanded = isExpanded;
  const sidebarWidth = activeSubmenu 
    ? (shouldShowExpanded ? 'w-[484px]' : 'w-[306px]') // expanded: 256px + 256px, mini: 16px + 256px
    : (shouldShowExpanded ? 'w-60' : 'w-16');

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-slate-600/80 z-40 lg:hidden backdrop-blur-sm overflow-x-hidden" onClick={() => setIsOpen(false)} />
      )}
      
      {/* Backdrop for submenu on desktop */}
      {!isMobile && activeSubmenu && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:block hidden" 
          onClick={() => setActiveSubmenu(null)} 
        />
      )}
      
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        } ${sidebarWidth}`}
      >
        <div className={`h-full ${colors.sidebar} ${colors.border} border-r backdrop-blur-xl shadow-2xl flex overflow-hidden`}>
          {/* Main Menu */}
          <div className={`${shouldShowExpanded ? 'w-60' : 'w-16'} flex flex-col transition-all duration-300 flex-shrink-0`}>
            <div className="flex items-center justify-center p-3 border-b border-blue-200/30 dark:border-slate-700/30 h-[60px] overflow-hidden">
              {shouldShowExpanded ? (
                settings.user?.company?.logo_url ? (
                  <img src={settings.user.company.logo_url} alt={settings.user.company.name} className="h-10 w-auto object-contain" />
                ) : (
                  <span className={`${colors.text} font-semibold text-md truncate px-2`}>
                    {settings.user?.company?.name || "MEGO"}
                  </span>
                )
              ) : (
                settings.user?.company?.logo_url ? (
                  <img src={settings.user.company.logo_url} alt={settings.user.company.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className={`w-8 h-8 rounded-lg ${themeColors.accent} flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{settings.user?.company?.name?.charAt(0) || "M"}</span>
                  </div>
                )
              )}
            </div>

            {/*
              overflow-x-hidden added below: when only overflow-y is set, browsers compute
              overflow-x as "auto" too (per spec, you can't have one axis truly "visible"
              while the other scrolls). That made the absolutely-positioned tooltips below
              (which intentionally sit outside the w-16 rail via left-full) register as
              horizontal overflow, producing an unwanted x-scrollbar in mini mode.
              Explicitly hiding x-overflow here stops the scrollbar from appearing.
            */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
              <div className="space-y-1 px-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubmenu === item.id;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  
                  return (
                    <div
                      key={item.id}
                      className="relative group"
                    >
                      <button
                        onClick={() => hasSubmenu ? handleMenuClick(item.id) : onNavigate(item.id)}
                        className={`w-full flex items-center  ${shouldShowExpanded ? 'justify-start' : 'justify-center'} gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} ${colors.text} ${isActive ? `${themeColors.accent}/20 shadow-lg` : ''}`}
                        title={!shouldShowExpanded ? item.label : undefined}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                        {shouldShowExpanded && (
                          <span className="text-sm font-small truncate flex-1 text-left">{item.label}</span>
                        )}
                        {shouldShowExpanded && hasSubmenu && (
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                        )}
                      </button>
                      
                      {/* Tooltip for mini sidebar — fixed positioning escapes the
                          overflow-x-hidden ancestor entirely, so it renders correctly
                          regardless of the scroll container's clipping. */}
                      {!shouldShowExpanded && (
                        <div
                          className="fixed ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]"
                          style={{ left: '4rem', top: 'auto' }}
                          ref={(el) => {
                            if (!el) return;
                            const btn = el.previousElementSibling as HTMLElement | null;
                            if (btn) {
                              const rect = btn.getBoundingClientRect();
                              el.style.top = `${rect.top + rect.height / 2}px`;
                              el.style.transform = 'translateY(-50%)';
                            }
                          }}
                        >
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${colors.footer} ${colors.border} border-t backdrop-blur-xl p-3 relative`}>
              <div className="relative group">
                <button
                  data-footer-button
                  ref={footerButtonRef}
                  onClick={() => setShowFooterPopup(!showFooterPopup)}
                  className={`w-full flex items-center ${shouldShowExpanded ? 'justify-start' : 'justify-center'} gap-3 px-3 py-3 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} ${colors.text} transition-all duration-200 ${showFooterPopup ? `${themeColors.accent}/20` : ''}`}
                  title={!shouldShowExpanded ? "Quick Settings" : undefined}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  {shouldShowExpanded && (
                    <span className="text-sm font-small">Quick Settings</span>
                  )}
                </button>

                {/* Tooltip for footer button in mini mode, consistent with menu item
                    tooltips above. Uses fixed positioning anchored to the button's own
                    rect so it correctly floats outside the w-16 rail instead of being
                    clipped or pushed into the scroll container. */}
                {!shouldShowExpanded && (
                  <div
                    className="fixed ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]"
                    style={{ left: '4rem', top: 'auto' }}
                    ref={(el) => {
                      if (!el) return;
                      const btn = el.previousElementSibling as HTMLElement | null;
                      if (btn) {
                        const rect = btn.getBoundingClientRect();
                        el.style.top = `${rect.top + rect.height / 2}px`;
                        el.style.transform = 'translateY(-50%)';
                      }
                    }}
                  >
                    Quick Settings
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Column-style submenu */}
          {activeSubmenu && (
            <div ref={submenuRef} className={`w-60 ${colors.submenuBg} opacity-70 backdrop-blur-xl border-l ${colors.border} h-full overflow-hidden flex-shrink-0 transition-all duration-300`}>
              <div className="flex items-center space-x-3 p-3 border-b border-blue-200/30 dark:border-slate-700/30">
                <button
                  onClick={() => setActiveSubmenu(null)}
                  className={`${colors.text} p-1.5 rounded-lg ${colors.menuItemBgColor} transition-all duration-200`}
                  aria-label="Close submenu"
                >
                  <IoArrowBackOutline className="w-4 h-4" />
                </button>
                <span className={`${colors.text} font-semibold text-sm`}>
                  {menuItems.find(item => item.id === activeSubmenu)?.label}
                </span>
              </div>
              <SubmenuColumn
                items={menuItems.find(item => item.id === activeSubmenu)?.submenu || []}
                onNavigate={(id: string) => {
                  onNavigate(id);
                  closeAll();
                }}
                colors={colors}
                closeAll={closeAll}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Settings Popup - Desktop (fixed position, flyout beside the button) */}
      {showFooterPopup && !isMobile && footerPopupPos && (
        <div
          ref={footerPopupRef}
          className={`fixed ${colors.footerPopup} ${colors.border} border rounded-xl shadow-xl backdrop-blur-sm py-2 px-2 z-[100] w-60`}
          style={{
            bottom: `${footerPopupPos.bottom}px`,
            left: `${footerPopupPos.left}px`,
          }}
        >
          <div className="space-y-0.5">
            {footerMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleFooterItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} ${colors.text} text-left text-sm transition-all duration-200`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Settings Popup - Mobile (bottom sheet, spans the real viewport width) */}
      {showFooterPopup && isMobile && (
        <div
          ref={footerPopupRef}
          className={`fixed bottom-0 inset-x-0 mb-4 mx-16 ${colors.footerPopup} ${colors.border} border rounded-xl shadow-xl backdrop-blur-sm py-2 px-2 z-[100]`}
        >
          <div className="space-y-0.5">
            {footerMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleFooterItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} ${colors.text} text-left text-sm transition-all duration-200`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};


const SubmenuItem = ({ item, onNavigate, colors, depth = 0 }: { 
  item: MenuItem, 
  onNavigate: (id: string) => void, 
  colors: ColorScheme, 
  depth?: number
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = item.icon;
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const handleClick = () => {
    if (hasSubmenu) {
      setIsExpanded(!isExpanded);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg ${colors.submenuBg} transition-all duration-200 ${colors.text} text-left group/item ${isExpanded ? 'bg-blue-500/10' : ''}`}
        style={{ paddingLeft: `${(depth + 1) * 0.75}rem` }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity" />
          <span className="text-sm truncate">{item.label}</span>
        </div>
        {hasSubmenu && (
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </button>
      
      {hasSubmenu && isExpanded && item.submenu && (
        <div className="mt-1 space-y-0.5">
          {item.submenu.map((subItem) => (
            <SubmenuItem
              key={subItem.id}
              item={subItem}
              onNavigate={onNavigate}
              colors={colors}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};


const SubmenuColumn = ({ items, onNavigate, colors, closeAll } : { 
  items: MenuItem[], 
  onNavigate: (id: string) => void, 
  colors: ColorScheme, 
  closeAll: () => void 
}) => {
  return (
    <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/20 flex-shrink-0">
      <div className="p-3 space-y-0.5">
        {items.map((item) => (
          <SubmenuItem
            key={item.id}
            item={item}
            onNavigate={onNavigate}
            colors={colors}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
export { SubmenuColumn, SubmenuItem };
