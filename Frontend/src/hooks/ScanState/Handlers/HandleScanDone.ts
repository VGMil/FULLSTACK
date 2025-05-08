import { Message } from "../../../Models/Message";


export function HandleScanDone(message: Message) {
    const { event, status, payload = {} } = message;
    
    if (event === 'scan_done' && status === 'success') {
        console.log('Resultado del escaneo:', status, payload);
        return {
            user_id: payload.user?.id,
            email: payload.user?.email
        };
    }

    return null;
}

export default HandleScanDone;