import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Register from './Pages/Register'
import FingerPrint from './Pages/FingerPrint'
import './App.css'
import Files from './Pages/Files'
import { WebSocketProvider } from './contexts/messageContext'
import Profile from './Pages/Profile'
import { UserProvider } from './contexts/userContext'


function App() {
  
  
  return (
    <>
      <UserProvider>
      <WebSocketProvider>
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
        <Route 
          path='/profile'element={<Profile/>}
        />
      </Routes>
      </WebSocketProvider>
      </UserProvider>
    </>
  )
}

export default App
