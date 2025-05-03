import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Register from './Pages/Register'
import FingerPrint from './Pages/FingerPrint'
import './App.css'
import Files from './Pages/Files'


function App() {
  
  
  return (
    <>
      <Routes>
        <Route 
          path='/'element={<Home/>}
        />
        <Route 
          path='/login'element={<Login/>}
        />
        <Route 
          path='/register'element={<Register/>}
        />
        <Route 
          path='/finger-print'element={<FingerPrint/>}
        />
        <Route 
          path='/files'element={<Files/>}
        />
      </Routes>

    </>
  )
}

export default App
