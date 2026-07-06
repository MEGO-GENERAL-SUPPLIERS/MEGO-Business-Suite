import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Sun, Moon, Sparkles, UserCircle2Icon, CloudCogIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppTheme } from '../hooks/useAppTheme';
import { useAuth } from '../hooks/useAuth'; 
import { STORAGE_KEY } from '../utils/localStorageUtils';
import { ApiConfigModal } from '../components/features/ApiConfigModal';
import { authenticateUser } from '../services/authService'; 
import { toastDanger } from '../lib/toast';

export const LoginV1: React.FC = () => {
  const navigate = useNavigate();
  const { login, registerUser } = useAuth(); 
  const { appearance, setAppearanceTheme } = useAppTheme(); 
  const [showPassword, setShowPassword] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const isDark = appearance === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toastDanger("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    let willRedirect = false;

    try {
      const result = await authenticateUser({ username, password });

      if (result.success && result.data) {
        const { token, user, ...restData } = result.data;

        willRedirect = true;
        setIsRedirecting(true);

        setTimeout(() => {
          const loginSuccess = login(token); 

          if (loginSuccess) {
            registerUser({
              id: user?.id || Date.now(),
              username: user?.username || username,
              firstName: user?.person?.first_name,
              lastName: user?.person?.last_name,
              branch: user?.branch, 
              company: user?.branch?.company,
              ...restData 
            });

            navigate('/dashboard', { replace: true });
          } else {
            setIsRedirecting(false);
            toastDanger("Authentication failed");
          }
        }, 800);

      } else {
        const errorMessage = Array.isArray(result.message) 
          ? result.message.join(', ') 
          : (result.message || "Invalid username or password");
        
        toastDanger(errorMessage, { title: 'Login failed' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toastDanger(errorMessage);
    } finally {
      // ✅ Use the local variable instead of the stale React state
      if (!willRedirect) {
        setIsLoading(false); 
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 ${isDark ? 'bg-gradient-to-br from-cyan-900 via-skyblue-900 to-cyan-900' : 'bg-gradient-to-br from-cyan-600 via-skyblue-600 to-cyan-500'} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 mb-4" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center">
            <span className='text-mego-slate-100'>ME</span>
            <span className='text-mego-orange-500'>GO</span>
          </h1>
          <h1 className="text-5xl font-bold mb-4 text-center">Business Suite Pro</h1>
          <p className="text-xl text-center opacity-90 max-w-md">
            Powerful analytics and insights at your fingertips. Join thousands of users worldwide.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">2+</div>
              <div className="text-sm opacity-80 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold">99.9%</div>
              <div className="text-sm opacity-80 mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold">4.7★</div>
              <div className="text-sm opacity-80 mt-1">Rating</div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 20s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
        `}</style>
      </div>

      {/* Right Side - Login Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className="w-full max-w-md">
          <button
            onClick={() => setAppearanceTheme(isDark ? 'light' : 'dark')}
            className={`mb-8 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md hover:scale-110 transition-all`}
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Welcome 
              {localStorage.getItem(STORAGE_KEY) ? ' back': '' }
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to continue to {' '}
              <span className='text-mego-slate-400'>ME</span>
              <span className='text-mego-orange-500'>GO</span> 
              {' '}Business Suite Pro
            </p>
          </div>

          {isRedirecting && (
            <div className="flex flex-col items-center justify-center py-2 mb-6 bg-cyan-50/10 rounded-lg border border-cyan-500/20">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-5 ${isRedirecting ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Username/Email</label>
              <div className="relative">
                <UserCircle2Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all`}
                  placeholder="you@example.com"
                  disabled={isLoading || isRedirecting}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all`}
                  placeholder="••••••••"
                  disabled={isLoading || isRedirecting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                  disabled={isLoading || isRedirecting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                  disabled={isLoading || isRedirecting}
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading || isRedirecting}
              className={`w-full py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 ${
                isLoading || isRedirecting
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-400 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="mt-6 flex justify-center my-3">
                <button
                  type="button"
                  onClick={() => setIsApiModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label="Configure API settings"
                  title="API Configuration"
                  disabled={isLoading || isRedirecting}
                >
                  <CloudCogIcon />
                </button>
              </div>
            </div>
          </form>

          <ApiConfigModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />

          <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-8`}>
          </p>
        </div>
      </div>
    </div>
  );
};