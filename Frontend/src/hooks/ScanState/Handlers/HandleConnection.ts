import { Message } from "../../../Models/Message";


export const HandleConnection = (message: Message, setEsp32Connected:(connected:boolean) => void) => {
  const { event, status, payload = {} } = message;

  if (event ==='connection') {
    console.log('Estado de la conexión:', status, payload);
      setEsp32Connected(payload.esp32Connected?? false);
      console.log('Estado ESP32:', payload.esp32Connected);
  }
};

export const makeMessageConnection = (): Message => {
  return {
    event: 'connection',
    status:'success',
    context: 'none',
    payload: {
      message: 'Connection established'
    },
    origin: 'client'
  }
};