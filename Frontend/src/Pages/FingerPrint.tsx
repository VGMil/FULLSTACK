import { Fingerprint } from "lucide-react"
import CustomButton from "../components/CustomButton"
import { useScanState } from "../hooks/useScanState"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function FingerPrint() {

  const {stopScan, scanState} = useScanState();
  const navigate = useNavigate();

  const cancel = () => {
    stopScan();
    navigate('/login');
  }
  
console.log(scanState);
  // Si el estado es success, redirige a la pagina de files
  // Si el estado es error, redirige a la pagina de logi
useEffect(() => {
  if(scanState === 'scan_successful') {
    navigate('/files'); 
  }
  if(scanState ==='ready_scan') {
    navigate('/login');
  }
}, [scanState, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex justify-center items-center gap-3 relative">
        <div className="absolute inset-0 rounded-full border-2 border-primary-400 animate-ping "></div>
        <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center">
          <Fingerprint className="h-20 w-20 text-white animate-spin" />
        </div>
      <h2 className="text-2xl text-primary-400 font-semibold text-center">Esperando</h2>
      </div>

      <CustomButton 
        variant="cancel"
        className="fixed top-10 left-10"
        onClick={cancel}
        >
        Cancelar
      </CustomButton>
    </div>
  )
}

export default FingerPrint