
import CustomButton from '../components/CustomButton'
import { Fingerprint } from 'lucide-react'
import { useWebSocketContext } from '../contexts/messageContext'
import { useEffect } from 'react';
import { MessageEvent } from '../Models/message.model';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/userContext';


function FingerPrint() {

  const {messageState} =useWebSocketContext();
  const {setUserId, user_id} = useUserContext();
  const navigate = useNavigate();

  const currentEvent: MessageEvent = messageState.currentMessage?.event || 'scan_request';
  useEffect(() => {
  console.log("Evento", messageState.currentMessage?.event, "tipo", messageState.currentMessage?.context )
    if (messageState.currentMessage?.event === 'scan_done') {
      const { status, context, payload } = messageState.currentMessage;

      if (status === 'info') {
        return;
      }

      if (status === 'success') {

        if (context === 'auth') {
          setUserId(payload.user.id);
          navigate('/files');
        } else if (context === 'register') {
          setUserId(payload.user_id);
          navigate('/profile');
        }
      } else {
        navigate(-1);
      }
    }
  }, [messageState, navigate, setUserId]);
  
  const stateBorder: Record<MessageEvent, string> = {
    scan_request: 'border-primary-400',
    scan_confirm: 'border-yellow-400',
    scan_done: 'border-success',
    connection: '',
    miss_conection: '',
    ready_scan: '',
  }

  const stateColor = {
    scan_request:'color-primary',
    scan_confirm:'color-yellow',
    scan_done:'color-success',
    connection: '',
    miss_conection: '',
    ready_scan: '',
  }

  const stateBg = {
    scan_request:'bg-primary-400',
    scan_confirm:'bg-yellow-400',
    scan_done:'bg-success',
    connection: '',
    miss_conection: '',
    ready_scan: '',
  }

  const stateText = {
    scan_request:'Ingrese Huella',
    scan_confirm:'Ingrese nuevamente',
    scan_done:'Escaneado correctamente',
    connection: '',
    miss_conection: '',
    ready_scan: '',
  }


  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex justify-center items-center gap-3 relative">
        <div className={`absolute inset-0 rounded-full border-8 animate-ping ${stateBorder[currentEvent]} `}></div>
        <div className={`h-28 w-28 rounded-full ${stateBg[currentEvent]} flex items-center justify-center}`}>
          <Fingerprint className="h-28 w-28 text-white animate-spin" />
        </div>
      <h2 className={`text-2xl font-semibold text-center ${stateColor[currentEvent]}`}>
        {stateText[currentEvent]}
      </h2>
      </div>

      <CustomButton 
        variant="cancel"
        className="fixed top-10 left-10"
        onClick={() => {
          navigate(-1);
        }}
        >
        Cancelar
      </CustomButton>
    </div>
  )
}

export default FingerPrint