import { Message } from "../../../Models/Message";


export function HandleScanRequest(message: Message) {
    const { event, status, payload = {} } = message;

    if (event ==='scan_request') {
        console.log('Estado del escaneo:', status, payload);
    } 
}

export const makeScanRequestMessage = (context:string, user_id?:number
): Message => {
    return {
        event: 'scan_request',
        status: 'info',
        context: context,
        payload: {
            ...(user_id && { user_id }),
        },
        origin: 'client'
      }
};
export default HandleScanRequest;