
import useWebSocket from 'react-use-websocket';
import { Message, MessageState, initialMessageState } from '../Models/message.model';
import { useEffect, useState } from 'react';

const WS_URL = "ws://localhost:3001/";

export const useWebSocketHook = () => {
  const [messageState, setMessageState] = useState<MessageState>(initialMessageState);
  const { sendMessage, lastMessage, readyState } = useWebSocket(WS_URL, 
    {
    onOpen: () => sendWebSocketMessage({
      event: 'connection',
      status: 'info',
      context: 'none',
      origin: 'frontend',
      payload: {}
    }) ,
    onClose: () => console.log('WebSocket connection closed'),
    shouldReconnect: () => true,
    share: true,
  });

  useEffect(() => {
    if (lastMessage) {
      const message: Message = JSON.parse(lastMessage.data);

      setMessageState(prevState => ({
        ...prevState,
        currentMessage: message,
        isLoading: false,
        error: null
      }));
    }
  }, [lastMessage]);

  const sendWebSocketMessage = (message: Message) => {
    console.log('Sended', JSON.stringify(message));
    sendMessage(JSON.stringify(message));
  };

  return {
    messageState,
    sendWebSocketMessage,
  };
};