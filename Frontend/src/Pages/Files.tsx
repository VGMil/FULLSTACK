import { useEffect } from "react";
import { useScanState } from "../hooks/useScanState";

function Files() {

  const {stopScan} = useScanState();
  useEffect(() => {
      return () => {
        stopScan();
      }
    }, [])
  return (
    <div>Files</div>
  )
}

export default Files