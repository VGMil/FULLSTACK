import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Register from './Pages/Register'
import FingerPrint from './Pages/FingerPrint'
import './App.css'
import Files from './Pages/Files'
import useScanState from './hooks/ScanState/useScanState'


function App() {
  const scanState = useScanState()
  
  return (
    <>
      <Routes>
        <Route 
          path='/' element={<Home {...scanState}/>}
        />
        <Route 
          path='/login'element={<Login {...scanState}/>}
        />
        <Route 
          path='/register'element={<Register {...scanState}/>}
        />
        <Route 
          path='/finger-print'element={<FingerPrint {...scanState}/>}
        />
        <Route 
          path='/files'element={<Files {...scanState}/>}
        />
      </Routes>
    </>
  )
}

export default App
