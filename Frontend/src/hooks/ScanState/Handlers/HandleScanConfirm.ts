import { Message } from "../../../Models/Message";



export const HandleScanConfirm = (message: Message) => {
    const { event, status, payload = {} } = message;

    if (event ==='scan_confirm') {
        console.log('Estado del escaneo:', status, payload);
    } 
}
export default HandleScanConfirm;