import { useEffect } from "react";
import Header from "../components/Header"
import Hero from "../components/Hero"
import { useScanState } from "../hooks/useScanState";

function Home() {
    const {stopScan} = useScanState();
    useEffect(() => {
        return () => {
          stopScan();
        }
      }, [])
  return (
    <>
        <Header></Header>
        <Hero></Hero>
        
    </>
  )
}

export default Home