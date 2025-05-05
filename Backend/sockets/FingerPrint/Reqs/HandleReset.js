import { sendEvent } from '../utils/sendEvent.js';
function handleReset(wss, currentState) {
    
    currentState = {
        event: "ready_scan",
        context: "none",
        payload: {},
        origin: "server",
        timestamp: Date.now(),
      };
    sendEvent(wss, "ready_scan", currentState.context, { message: "Ready to Scan" });
  
    return currentState;
  }

  export default handleReset;