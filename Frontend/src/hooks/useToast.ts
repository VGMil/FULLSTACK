import { useState } from 'react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2);
    const newToast: ToastMessage = {
      id,
      message,
      type,
      duration,
    };

    setToasts((currentToasts) => [...currentToasts, newToast]);

    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  const success = (message: string, duration?: number) => showToast(message, 'success', duration);
  const error = (message: string, duration?: number) => showToast(message, 'error', duration);
  const warning = (message: string, duration?: number) => showToast(message, 'warning', duration);
  const info = (message: string, duration?: number) => showToast(message, 'info', duration);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
