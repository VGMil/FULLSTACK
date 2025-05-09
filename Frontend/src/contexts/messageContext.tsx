import { createContext, useContext, ReactNode } from 'react';
import { useWebSocketHook } from '../hooks/useWebSocket';
import { Message, MessageState } from '../Models/message.model';

type WebSocketContextType = {
  messageState: MessageState;
  sendWebSocketMessage: (message: Message) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({} as WebSocketContextType);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { messageState, sendWebSocketMessage } = useWebSocketHook();

  return (
    <WebSocketContext.Provider value={{ messageState, sendWebSocketMessage}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);