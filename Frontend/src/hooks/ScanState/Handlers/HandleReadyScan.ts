import { Message } from "../../../Models/Message";



export function HandleReadyScan( message: Message, setEsp32Connected: (connected: boolean) => void) {
        
    const { event, payload = {} } = message;
    
    if (event === 'ready_scan') {
        setEsp32Connected(payload.esp32Connected ?? false);
        console.log('Estado ESP32:', payload.esp32Connected);
    }

    return message;
}

export default HandleReadyScan;