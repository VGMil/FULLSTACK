import { sendEvent } from "../utils/sendEvent.js";

export const HandleConnection = (wss, status, origin, esp32Connected) => {
    if (status !== "success") {
        sendEvent(wss, "miss_conection", "error", "none", {
            message: `${origin} not connected`
        }, "server");
    }
    console.log("📨 Connection established");
        sendEvent(wss, "connection", "info", "none", {
            message: `Connection established with ${origin}`,
            esp32Connected: esp32Connected
        }, "server");
        return;
    
}
