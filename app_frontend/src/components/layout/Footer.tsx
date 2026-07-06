import { getLocalSettings } from "../../utils/localStorageUtils";
import { appConfigs } from "../../data/appConfigs";
import { Clock, UserCircle } from "lucide-react";

const Footer = ({ isDark, user = 'John Doe', loginTime = '09:30 AM' } : { 
  isDark: boolean, 
  user?: string, 
  loginTime?: string
}) => {
  const settings = getLocalSettings();
  const isStatic = settings.layout.footer?.sticky ?? true;
  
  const baseColors = {
    light: {
      footer: 'bg-white/60',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      border: 'border-blue-200/50'
    },
    dark: {
      footer: 'bg-slate-900/60',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      border: 'border-slate-700/50'
    }
  };
  
  const colors = isDark ? baseColors.dark : baseColors.light;
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${isStatic ? 'sticky bottom-0' : ''} ${colors.footer} ${colors.border} border-t backdrop-blur-xl shadow-lg`}>
      <div className="px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className={`${colors.textSecondary} flex items-center gap-4 flex-wrap justify-center sm:justify-start`}>
            <div className={`${colors.textSecondary} flex items-center gap-4 flex-wrap justify-center sm:justify-start`}>
              <span>&copy; {currentYear} {settings.user?.company?.name || 'All rights reserved'}</span>
              {settings.user?.company?.slogan && (
                <span className="italic text-xs hidden md:inline opacity-80">| {settings.user.company.slogan}</span>
              )}
              <span className="font-semibold">{appConfigs.appVersion}</span>
            </div>
            <span className="font-semibold">{appConfigs.appVersion}</span>
          </div>
          <div className={`${colors.textSecondary} flex items-center gap-4`}>
            <span className="flex items-center gap-1.5">
              <UserCircle className="w-3 h-3" />
              {user}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {loginTime}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;