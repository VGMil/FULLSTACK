import { Fingerprint } from "lucide-react"
import CustomButton from "../components/CustomButton"
import { useNavigate } from "react-router-dom";

import { useCallback, useEffect, useState } from "react";
import { Message } from "../Models/Message";

function FingerPrint({...scanState}) {
  const { makeScanRequestMessage, sendJsonMessage, event, user, esp32Connected, message} = scanState;
  
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

// Navigate to login if esp32 is not connected
useEffect(() => {
  if (!esp32Connected) {
    console.log('[FingerPrint] ESP32 not connected, redirecting to login');
    navigate('/login');
  }
}, [esp32Connected, navigate]);

  // Enviar scan_request solo una vez al montar
  useEffect(() => {
    if (!hasSentRequest && !isProcessing) {
      console.log('[FingerPrint] Enviando scan_request');
      setIsProcessing(true);
      sendJsonMessage({
        ...makeScanRequestMessage('auth'),
        origin: 'client' // Explicitly set origin
      });
      setHasSentRequest(true);
      setIsProcessing(false);
    }
  }, []);

  // Navegar a /files con 1s de retraso solo una vez
  useEffect(() => {
    if (event === 'scan_done') {
      console.log('[FingerPrint] Evento scan_done recibido, esperando 1s antes de navegar');
      const timer = setTimeout(() => {
        console.log('[FingerPrint] Navegando según usuario');
        if (message.status === 'success') {
          navigate('/files');
        } else {
          navigate('/login');
        }
        setHasNavigated(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [event, hasNavigated, navigate, user]);

  // Crear mensaje reset
  const makeResetMessage = useCallback((): Message => ({
    event: 'reset',
    status: 'info',
    context: 'none',
    payload: { message: 'Cancelando escaneo' },
    origin: 'client',
  }), []);
  
const textEvents = {
  scan_request: 'Ingrese su huella',
  scan_confirm: 'Ingrese de nuevo',
  scan_done: 'Escaneo Realizado'
}
const bgEvents = {
  scan_request: 'bg-primary-400',
  scan_confirm: 'bg-yellow-400',
  scan_done: 'bg-success-400'
}

const textColors = {
  scan_request: 'text-primary-400',
  scan_confirm: 'text-yellow-400',
  scan_done: 'text-success-400'
}
const borderColors = {
  scan_request: 'border-primary-400',
  scan_confirm: 'border-yellow-400',
  scan_done: 'border-success-400'
}

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex justify-center items-center gap-3 relative">
        <div className={`absolute inset-0 rounded-full border-2 ${borderColors[event as keyof typeof textEvents]} animate-ping `}></div>
        <div className={`h-32 w-32 rounded-full  flex items-center justify-center ${bgEvents[event as keyof typeof textEvents]}`}>
          <Fingerprint className="h-20 w-20 text-white animate-spin" />
        </div>
      <h2 className={`text-2xl font-semibold text-center ${textColors[event as keyof typeof textEvents]}`}>
        {textEvents[event as keyof typeof textEvents]}
      </h2>
      </div>

      <CustomButton 
        variant="cancel"
        className="fixed top-10 left-10"
        onClick={() => {
          sendJsonMessage(makeResetMessage);
          navigate('/');
        }}
        >
        Cancelar
      </CustomButton>
    </div>
  )
}

export default FingerPrint