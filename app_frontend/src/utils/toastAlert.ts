// src/utils/toastAlert.ts
import { toast, type ToastOptions, type TypeOptions } from 'react-toastify';

export interface ToastConfig {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'loading' | 'default';
  dismissable?: boolean;      // Show close button (default: true)
  autoClose?: number | false; // Duration in ms or false to persist
  description?: string;       // Optional secondary text
  position?: ToastOptions['position'];
  theme?: ToastOptions['theme'];
  [key: string]: any; // Allow additional toast options
}

const DEFAULT_CONFIG = {
  dismissable: true,
  autoClose: 5000,
  position: 'top-center' as const,
  theme: 'light' as const,
};

// Main toast function - accepts clean config object
export function toastAlert(config: ToastConfig) {
  const {
    message,
    type = 'default',
    dismissable = DEFAULT_CONFIG.dismissable,
    autoClose: customAutoClose,
    description,
    position = DEFAULT_CONFIG.position,
    theme = DEFAULT_CONFIG.theme,
    ...rest
  } = config;

  const autoCloseDuration = customAutoClose !== undefined 
    ? customAutoClose 
    : (type === 'success' || type === 'loading' ? 3000 : 5000);

  const content = description 
    ? `${message}\n${description}`
    : message;

  // Build toast options
  const toastOptions: ToastOptions = {
    position,
    autoClose: autoCloseDuration,
    hideProgressBar: false,
    closeOnClick: dismissable,
    closeButton: dismissable,
    pauseOnHover: true,
    draggable: true,
    theme,
    ...rest,
  };

  // Dispatch appropriate toast type
  switch (type) {
    case 'success':
      return toast.success(content, toastOptions);
    case 'error':
      return toast.error(content, toastOptions);
    case 'info':
      return toast.info(content, toastOptions);
    case 'warning':
      return toast.warning(content, toastOptions);
    case 'loading':
      return toast.loading(content, toastOptions);
    default:
      return toast(content, toastOptions);
  }
}

// Shorthand methods for common use cases
export function toastSuccess(message: string, description?: string, options?: Partial<ToastConfig>) {
  return toastAlert({ message, description, type: 'success', ...options });
}

export function toastError(message: string, description?: string, options?: Partial<ToastConfig>) {
  return toastAlert({ message, description, type: 'error', ...options });
}

export function toastInfo(message: string, description?: string, options?: Partial<ToastConfig>) {
  return toastAlert({ message, description, type: 'info', ...options });
}

export function toastWarning(message: string, description?: string, options?: Partial<ToastConfig>) {
  return toastAlert({ message, description, type: 'warning', ...options });
}

export function toastLoading(message: string, options?: Partial<ToastConfig>) {
  return toastAlert({ 
    message, 
    type: 'loading', 
    dismissable: false,
    autoClose: false,
    ...options
  });
}

// Export update/dismiss helpers
export const updateToast = toast.update;
export const dismissToast = toast.dismiss;