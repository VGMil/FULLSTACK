export type MessageStatus = 'info' | 'success' | 'error';

export type MessageEvent = 
  | 'connection'
  | 'ready_scan'
  | 'scan_request' 
  | 'scan_confirm'
  | 'scan_done'
  | 'miss_conection';

export type MessageContext = 'auth' | 'register'|'none';

export interface Message {
  event: MessageEvent;
  status: MessageStatus;
  context: MessageContext;
  origin: 'ESP32' | 'Server' | 'frontend';
  payload: Record<string, any>;
}

// Custom hook state interface
export interface MessageState {
  currentMessage: Message | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state for the message hook
export const initialMessageState: MessageState = {
  currentMessage: null,
  isLoading: false,
  error: null
};




