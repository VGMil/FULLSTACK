import { sendEvent } from '../utils/sendEvent.js';

export function handleConnection(wss, status, context, payload, origin, currentState) {
    
    currentState = {
        event: "connection",
        context: context,
        status: status,
        payload: payload,
        origin: origin,
        timestamp: Date.now()
    };

    sendEvent(wss, currentState.event, currentState.status, currentState.context, currentState.payload);

    return currentState;
}