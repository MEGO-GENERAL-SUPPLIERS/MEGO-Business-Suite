import toast, { type Toast } from 'react-hot-toast';
import { CheckCircle2, Info, AlertTriangle, XCircle, Bell, Moon, X } from 'lucide-react';
import type { ComponentType } from 'react';

export type ToastVariant = 'success' | 'danger' | 'info' | 'warning' | 'default' | 'dark';

interface ToastOptions {
  title?: string;
  duration?: number;
}

interface VariantConfig {
  icon: ComponentType<{ className?: string }>;
  iconWrapClass: string;
  iconClass: string;
  containerClass: string;
  titleClass: string;
  messageClass: string;
  closeClass: string;
}

const variantConfig: Record<ToastVariant, VariantConfig> = {
  success: {
    icon: CheckCircle2,
    iconWrapClass: 'bg-green-500/15',
    iconClass: 'text-green-600 dark:text-green-400',
    containerClass: 'bg-white dark:bg-slate-800 border-1-4 border-green-500',
    titleClass: 'text-slate-900 dark:text-white',
    messageClass: 'text-slate-600 dark:text-slate-400',
    closeClass: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
  },
  info: {
    icon: Info,
    iconWrapClass: 'bg-sky-500/15',
    iconClass: 'text-sky-600 dark:text-sky-400',
    containerClass: 'bg-white dark:bg-slate-800 border-l-4 border-sky-500',
    titleClass: 'text-slate-900 dark:text-white',
    messageClass: 'text-slate-600 dark:text-slate-300',
    closeClass: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
  },
  warning: {
    icon: AlertTriangle,
    iconWrapClass: 'bg-amber-500/15',
    iconClass: 'text-amber-600 dark:text-amber-400',
    containerClass: 'bg-white dark:bg-slate-800 border-l-4 border-amber-600',
    titleClass: 'text-slate-900 dark:text-white',
    messageClass: 'text-slate-600 dark:text-slate-300',
    closeClass: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
  },
  danger: {
    icon: XCircle,
    iconWrapClass: 'bg-red-500/15',
    iconClass: 'text-red-600 dark:text-red-400',
    containerClass: 'bg-white dark:bg-slate-800 border-l-4 border-red-500',
    titleClass: 'text-slate-900 dark:text-white',
    messageClass: 'text-slate-600 dark:text-slate-300',
    closeClass: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
  },
  default: {
    icon: Bell,
    iconWrapClass: 'bg-slate-500/10',
    iconClass: 'text-slate-500 dark:text-slate-300',
    containerClass: 'bg-white/95 dark:bg-slate-800/95 border-l-4 border-slate-300 dark:border-slate-600',
    titleClass: 'text-slate-900 dark:text-white',
    messageClass: 'text-slate-600 dark:text-slate-300',
    closeClass: 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
  },
  dark: {
    icon: Moon,
    iconWrapClass: 'bg-white/10',
    iconClass: 'text-white',
    containerClass: 'bg-slate-800 border-l-4 border-slate-600',
    titleClass: 'text-white',
    messageClass: 'text-slate-300',
    closeClass: 'text-slate-400 hover:text-white',
  }
};

function ToastCard({ t, variant, message, title }: { t: Toast; variant: ToastVariant; message: string; title?: string }) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`${config.containerClass} transition-all duration-300 ease-out ${
        t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95'
      } flex items-start gap-3 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/30 px-4 py-2.5 w-[380px] max-w-[90vw]`}
    >
      <div className={`${config.iconWrapClass} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${config.iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${config.titleClass}`}>{title}</p>}
        <p className={`text-sm ${title ? 'mt-0.5' : 'font-medium'} ${config.messageClass}`}>{message}</p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className={`flex-shrink-0 ${config.closeClass} transition-colors`}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function showToast(variant: ToastVariant, message: string, options?: ToastOptions) {
  return toast.custom(
    (t) => <ToastCard t={t} variant={variant} message={message} title={options?.title} />,
    { duration: options?.duration ?? 4000 }
  );
}

// Public API — call these anywhere the old ToastAlert was used.
export const toastSuccess = (message: string, options?: ToastOptions) => showToast('success', message, options);
export const toastInfo = (message: string, options?: ToastOptions) => showToast('info', message, options);
export const toastWarning = (message: string, options?: ToastOptions) => showToast('warning', message, options);
export const toastDanger = (message: string, options?: ToastOptions) => showToast('danger', message, options);
export const toastDefault = (message: string, options?: ToastOptions) => showToast('default', message, options);
export const toastDark = (message: string, options?: ToastOptions) => showToast('dark', message, options);

export const dismissToast = (id?: string) => toast.dismiss(id);