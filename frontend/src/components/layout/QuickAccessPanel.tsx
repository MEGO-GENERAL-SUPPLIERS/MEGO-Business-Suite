import { defaultTheme, type ThemeKey, themeOptions } from "../../data/theme";
import { Sun, Moon, X, Palette } from "lucide-react";
import { setUITheme, getLocalSettings, saveLocalSettings } from "../../utils/localStorageUtils";

const QuickAccessPanel = ({ isDark, setIsDark, theme, setTheme, isOpen, setIsOpen }: { 
  isDark: boolean, 
  setIsDark: (dark: boolean) => void, 
  theme: ThemeKey, 
  setTheme: (theme: ThemeKey) => void, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void 
}) => {
  const baseColors = defaultTheme;
  
  const colors = isDark ? baseColors.dark : baseColors.light;

  const handleThemeChange = (newTheme: ThemeKey) => {
    setTheme(newTheme);
    setUITheme(newTheme);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
      
      <div className={`fixed right-0 top-0 h-full w-80 ${colors.sidebar} ${colors.border} border-l backdrop-blur-xl z-50 transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className={`flex items-center justify-between p-4 ${colors.border} border-b`}>
            <h2 className={`${colors.text} font-semibold`}>Quick Access</h2>
            <button onClick={() => setIsOpen(false)} className={`${colors.text} p-1 rounded-lg ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} transition-all duration-200 hover:scale-105`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-blue-500/20">
            <div>
              <h3 className={`${colors.text} text-sm font-semibold mb-3 flex items-center gap-2`}>
                <Palette className="w-4 h-4" />
                Theme Color
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id as ThemeKey)}
                    className={`p-3 rounded-lg ${theme === option.id ? 'ring-2 ring-blue-500' : ''} ${colors.menuItemBgColor} ${colors.menuItemBgColorHover} text-sm flex items-center gap-2 transition-all duration-200 backdrop-blur-lg ${colors.text}`}
                  >
                    <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`${colors.text} text-sm font-semibold mb-3`}>Appearance</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsDark(false);
                    const settings = getLocalSettings();
                    saveLocalSettings({
                      ...settings,
                      theme: { ...settings.theme, name: 'light' }
                    });
                  }}
                  className={`p-3 rounded-lg ${!isDark ? 'bg-blue-500 text-white' : `${colors.submenuBg} ${colors.text}`} ${colors.submenuHover} text-sm flex items-center gap-2 transition-all duration-200 justify-center backdrop-blur-lg`}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </button>
                <button
                  onClick={() => {
                    setIsDark(true);
                    const settings = getLocalSettings();
                    saveLocalSettings({
                      ...settings,
                      theme: { ...settings.theme, name: 'dark' }
                    });
                  }}
                  className={`p-3 rounded-lg ${isDark ? 'bg-blue-500 text-white' : `${colors.submenuBg} ${colors.text}`} ${colors.submenuHover} text-sm flex items-center gap-2 transition-all duration-200 justify-center backdrop-blur-lg`}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickAccessPanel;