import { createContext, useContext, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWebSocketContext } from './messageContext';
import { Message } from '../Models/message.model';

type ToastContextType = {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextType>({
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { messageState } = useWebSocketContext();

  useEffect(() => {
    if (!messageState.currentMessage) return;
    
    const { event, status, context } = messageState.currentMessage;
    const message = messageState.currentMessage.payload?.message || '';

    
    switch (status) {
      case 'success':
        toast.success((event?(`Evento :${event} `):'')+(message?(`Mensaje: ${message} `):''));
        break;
      case 'error':
        toast.error((event?(`Evento :${event} `):'')+(message?(`Mensaje: ${message} `):''));
        break;

      case 'info':
        toast.info((event?(`Evento :${event} `):'')+(message?(`Mensaje: ${message} `):''));
        break;
    }
  }, [messageState]);

  const value = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warn(message),
    info: (message: string) => toast.info(message),
  };

  return (
    <ToastContext.Provider value={value}>
      <ToastContainer position="bottom-center" autoClose={5000} />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}